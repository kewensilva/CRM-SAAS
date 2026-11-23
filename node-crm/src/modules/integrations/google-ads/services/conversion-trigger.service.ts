import type { LeadEvent } from "../../../../shared/events/lead-events";
import { leadService } from "../../../leads/services/lead.service";
import type { LeadSource } from "../../../leads/types/lead.types";
import { googleAdsConnectionRepository } from "../repositories/google-ads-connection.repository";
import { googleAdsRuleRepository } from "../repositories/google-ads-rule.repository";
import { googleAdsUploadRepository } from "../repositories/google-ads-upload.repository";
import type { GoogleAdsConversionTrigger, GoogleAdsLeadOrigin } from "../types/google-ads.types";
import { sendUpload } from "./conversion-dispatch.service";
import { buildUserIdentifiers } from "./data-manager.client";

// Qual momento do Lead cada evento representa. Status que não estão aqui (Não atende,
// Perdido...) não viram conversão.
const TRIGGER_BY_STATUS: Record<string, GoogleAdsConversionTrigger> = {
    EM_ANDAMENTO: "LEAD_QUALIFIED",
    VENDIDO: "LEAD_WON",
};

const ORIGIN_BY_SOURCE: Record<LeadSource, GoogleAdsLeadOrigin> = { Site: "SITE", Meta: "META", Manual: "MANUAL" };

export const triggerOf = (event: LeadEvent): GoogleAdsConversionTrigger | null =>
    event.type === "LeadCreated" ? "LEAD_CREATED" : (TRIGGER_BY_STATUS[event.status] ?? null);

// Valor só quando a regra pede e há um valor positivo (Perdido/Vendido sem valor = sem valor).
const conversionValueOf = (sendValue: boolean, eventValue: number | null, dealValue: number | null): number | null => {
    const value = eventValue ?? dealValue;

    return sendValue && value !== null && value > 0 ? value : null;
};

// Consumidor dos eventos de Lead: para cada regra ligada que casa com o momento e a Origem do
// Lead, cria o registro de envio (único por regra + Lead) e envia ao Google Ads.
const handleLeadEvent = async (event: LeadEvent): Promise<void> => {
    const trigger = triggerOf(event);

    if (!trigger) {
        return;
    }

    const rules = await googleAdsRuleRepository.listEnabledByTrigger(event.tenantId, trigger);
    const connection = rules.length > 0 ? await googleAdsConnectionRepository.findByTenant(event.tenantId) : null;
    const lead = connection ? await leadService.getConversionData(event.leadId, event.tenantId) : null;

    if (!connection || !lead) {
        return;
    }

    const origin = ORIGIN_BY_SOURCE[lead.source];
    const userIdentifiers = buildUserIdentifiers(lead.email, lead.phone);
    const eventValue = event.type === "LeadStatusChanged" ? event.value : null;

    for (const rule of rules.filter((candidate) => !candidate.originFilter || candidate.originFilter === origin)) {
        const upload = await googleAdsUploadRepository.createPending({
            tenantId: event.tenantId,
            connectionId: connection.id,
            ruleId: rule.id,
            leadId: lead.id,
            gclid: lead.gclid,
            hasEmail: userIdentifiers.some((identifier) => "emailAddress" in identifier),
            hasPhone: userIdentifiers.some((identifier) => "phoneNumber" in identifier),
            userIdentifiers,
            conversionValue: conversionValueOf(rule.sendValue, eventValue, lead.dealValue),
            occurredAt: new Date(),
        });

        if (upload) {
            await sendUpload(upload, rule.conversionActionId);
        }
    }
};

export const conversionTriggerService = { handleLeadEvent };
