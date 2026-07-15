import { leadRepository } from "../../../leads/repositories/lead.repository";
import { metaIntegrationRepository } from "../repositories/meta-integration.repository";
import { metaLogRepository } from "../repositories/meta-log.repository";
import type { MetaWebhookPayload } from "../types/meta-integration.types";
import { metaGraphApiClient } from "./meta-graph-api.client";

type LeadgenChange = MetaWebhookPayload["entry"][number]["changes"][number]["value"];

const mapFieldData = (fieldData: { name: string; values: string[] }[]) => {
    const get = (fieldName: string) =>
        fieldData.find((field) => field.name === fieldName)?.values[0];

    return {
        name: get("full_name") ?? get("name") ?? "Lead sem nome",
        email: get("email"),
        phone: get("phone_number") ?? get("phone"),
    };
};

// Processa um único evento "leadgen" do webhook. Nunca lança — toda falha vira um
// MetaIntegrationLog com status FAILED em vez de derrubar a requisição (business-rules.md:
// "Nenhum Lead deverá ser descartado sem registro").
const processLeadgenChange = async (change: LeadgenChange, rawPayload: MetaWebhookPayload) => {
    const integration = await metaIntegrationRepository.findByPageId(change.page_id);

    const log = await metaLogRepository.createReceived({
        tenantId: integration?.tenantId ?? null,
        leadgenId: change.leadgen_id,
        pageId: change.page_id,
        formId: change.form_id,
        adId: change.ad_id ?? null,
        rawPayload,
    });

    if (!integration) {
        await metaLogRepository.markFailed(
            log.id,
            `Nenhuma integração habilitada encontrada para a página ${change.page_id}.`,
        );

        return;
    }

    if (!integration.pageAccessToken || !integration.defaultResponsibleUserId) {
        await metaLogRepository.markFailed(
            log.id,
            "Integração habilitada, mas incompleta: faltam pageAccessToken ou defaultResponsibleUserId.",
        );

        return;
    }

    let mappedLead: { name: string; email: string | undefined; phone: string | undefined };

    try {
        const { field_data: fieldData } = await metaGraphApiClient.fetchLeadFieldData(
            change.leadgen_id,
            integration.pageAccessToken,
        );

        mappedLead = mapFieldData(fieldData);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Erro desconhecido ao buscar o lead na Graph API.";

        await metaLogRepository.markFailed(log.id, message);

        return;
    }

    const existingLead = mappedLead.email
        ? await leadRepository.findByTenantAndEmail(integration.tenantId, mappedLead.email)
        : null;

    if (existingLead) {
        if (integration.duplicateStrategy === "UPDATE") {
            await leadRepository.updateContactInfo(existingLead.id, {
                name: mappedLead.name,
                ...(mappedLead.email ? { email: mappedLead.email } : {}),
                ...(mappedLead.phone ? { phone: mappedLead.phone } : {}),
            });
        }

        await metaLogRepository.markDuplicate(log.id, existingLead.id);

        return;
    }

    const lead = await leadRepository.create({
        tenantId: integration.tenantId,
        responsibleUserId: integration.defaultResponsibleUserId,
        name: mappedLead.name,
        email: mappedLead.email,
        phone: mappedLead.phone,
    });

    await metaLogRepository.markProcessed(log.id, lead.id);
};

const processWebhookPayload = async (payload: MetaWebhookPayload): Promise<void> => {
    for (const entry of payload.entry ?? []) {
        for (const change of entry.changes ?? []) {
            if (change.field !== "leadgen") {
                continue;
            }

            await processLeadgenChange(change.value, payload);
        }
    }
};

export const metaWebhookService = {
    processWebhookPayload,
};
