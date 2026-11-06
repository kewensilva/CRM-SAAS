import { IntegrationError } from "../../../../../shared/errors";
import { logger } from "../../../../../shared/logger/logger";
import { asRecord, asText } from "./source-helpers";

// Contatos do negócio pela API v1 do RD Station CRM (token do usuário na query) — o webhook
// v2 não traz e-mail/telefone. Usa o primeiro contato com e-mail ou telefone.
// https://developers.rdstation.com/reference/crm-v1-list-contacts-from-deal
const RD_CRM_API_URL = "https://crm.rdstation.com/api/v1";

export const fetchRdCrmDealContact = async (
    dealId: string,
    apiToken: string,
): Promise<{ email: string | null; phone: string | null }> => {
    const url = `${RD_CRM_API_URL}/deals/${encodeURIComponent(dealId)}/contacts?token=${encodeURIComponent(apiToken)}`;
    let response: Response;

    try {
        response = await fetch(url);
    } catch (error) {
        throw new IntegrationError(`Falha ao conectar com o RD Station CRM: ${error instanceof Error ? error.message : ""}`);
    }

    if (!response.ok) {
        logger.warn({ dealId, status: response.status }, "[conversion-sync] RD CRM recusou a busca de contatos.");
        throw new IntegrationError(`RD Station CRM retornou ${response.status} ao buscar os contatos do negócio.`);
    }

    const contacts = (asRecord(await response.json())["contacts"] as unknown[] | undefined) ?? [];

    for (const contact of contacts.map(asRecord)) {
        const emails = Array.isArray(contact["emails"]) ? (contact["emails"] as unknown[]).map(asRecord) : [];
        const phones = Array.isArray(contact["phones"]) ? (contact["phones"] as unknown[]).map(asRecord) : [];
        const email = asText(emails[0]?.["email"]);
        const phone = asText(phones[0]?.["phone"]);

        if (email || phone) {
            return { email, phone };
        }
    }

    return { email: null, phone: null };
};
