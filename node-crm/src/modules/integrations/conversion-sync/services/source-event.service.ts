import { BusinessRuleError } from "../../../../shared/errors";
import type { ConversionIntegration, NormalizedSourceEvent } from "../types/conversion-sync.types";
import { fetchBitrixContact, fetchBitrixDeal } from "./sources/bitrix24.client";
import { mapBitrixDeal, parseBitrixWebhook } from "./sources/bitrix24.parser";
import { fetchRdCrmDealContact } from "./sources/rd-crm.client";
import { parseRdCrmWebhook } from "./sources/rd-crm.parser";
import { parseRdMarketingWebhook } from "./sources/rd-marketing.parser";
import { asText } from "./sources/source-helpers";

// Traduz o webhook de cada origem para NormalizedSourceEvent. null = evento que o integrador
// não trata (ex.: negócio excluído). loadContact: RD CRM só busca e-mail/telefone na API
// quando alguma regra disparou (evita uma chamada a cada atualização de negócio).
export type ResolvedSourceEvent = {
    event: NormalizedSourceEvent;
    loadContact: (() => Promise<NormalizedSourceEvent>) | null;
};

// Segredo opcional de cada origem: Bitrix24 manda auth[application_token] no corpo; no RD CRM
// o cliente configura o cabeçalho X-CRM-Token no webhook. RD Marketing não tem — vale o token
// aleatório da URL. Sem segredo configurado na conexão, aceita.
export const isWebhookAuthentic = (
    integration: ConversionIntegration,
    payload: unknown,
    headers: Record<string, string | undefined>,
): boolean => {
    if (!integration.webhookSecret) {
        return true;
    }

    switch (integration.source) {
        case "BITRIX24":
            return parseBitrixWebhook(payload)?.applicationToken === integration.webhookSecret;
        case "RD_STATION_CRM":
            return headers["x-crm-token"] === integration.webhookSecret;
        default:
            return true;
    }
};

const resolveBitrix = async (integration: ConversionIntegration, payload: unknown): Promise<ResolvedSourceEvent | null> => {
    const webhook = parseBitrixWebhook(payload);

    if (!webhook) {
        return null;
    }

    if (!integration.sourceApiUrl) {
        throw new BusinessRuleError("Informe a URL de webhook de entrada do Bitrix24 para o CRM buscar o negócio.");
    }

    const deal = await fetchBitrixDeal(integration.sourceApiUrl, webhook.dealId);
    const contactId = asText(deal["CONTACT_ID"]);
    const contact = contactId ? await fetchBitrixContact(integration.sourceApiUrl, contactId) : {};
    const event = mapBitrixDeal(deal, contact, integration.gclidField);

    return event ? { event, loadContact: null } : null;
};

const resolveRdCrm = (integration: ConversionIntegration, payload: unknown): ResolvedSourceEvent | null => {
    const deal = parseRdCrmWebhook(payload, integration.gclidField);

    if (!deal) {
        return null;
    }

    const event: NormalizedSourceEvent = { ...deal, email: null, phone: null };
    const apiToken = integration.sourceApiToken;

    return {
        event,
        loadContact: apiToken
            ? async () => ({ ...event, ...(await fetchRdCrmDealContact(deal.externalId, apiToken)) })
            : null,
    };
};

export const resolveSourceEvent = async (
    integration: ConversionIntegration,
    payload: unknown,
): Promise<ResolvedSourceEvent | null> => {
    switch (integration.source) {
        case "RD_STATION_MARKETING": {
            const event = parseRdMarketingWebhook(payload, integration.gclidField);

            return event ? { event, loadContact: null } : null;
        }
        case "RD_STATION_CRM":
            return resolveRdCrm(integration, payload);
        case "BITRIX24":
            return resolveBitrix(integration, payload);
        default:
            return null;
    }
};
