import type { NormalizedSourceEvent } from "../../types/conversion-sync.types";
import { asDate, asNumber, asRecord, asText } from "./source-helpers";
import type { UnknownRecord } from "./source-helpers";

// Webhook de saída do Bitrix24 (form-urlencoded): event=ONCRMDEALADD|ONCRMDEALUPDATE,
// data[FIELDS][ID]=<id do negócio>, auth[application_token]=<token de verificação>.
const DEAL_EVENTS = ["ONCRMDEALADD", "ONCRMDEALUPDATE"];
const WON_SEMANTIC = "S";

export const parseBitrixWebhook = (payload: unknown): { dealId: string; applicationToken: string | null } | null => {
    const body = asRecord(payload);
    const event = asText(body["event"])?.toUpperCase();
    const dealId = asText(asRecord(asRecord(body["data"])["FIELDS"])["ID"]);

    if (!event || !DEAL_EVENTS.includes(event) || !dealId) {
        return null;
    }

    return { dealId, applicationToken: asText(asRecord(body["auth"])["application_token"]) };
};

// Bitrix guarda e-mail/telefone como lista de { VALUE, VALUE_TYPE }.
const firstMultiField = (value: unknown): string | null =>
    Array.isArray(value) ? asText(asRecord(value[0])["VALUE"]) : null;

// Negócio + contato principal → evento. Ganho = STAGE_SEMANTIC_ID "S" (nunca pelo nome da
// etapa). GCLID: campo personalizado do negócio (UF_CRM_...) ou, se vazio, do contato.
export const mapBitrixDeal = (
    deal: UnknownRecord,
    contact: UnknownRecord,
    gclidField: string | null,
    receivedAt: Date = new Date(),
): NormalizedSourceEvent | null => {
    const externalId = asText(deal["ID"]);

    if (!externalId) {
        return null;
    }

    const won = asText(deal["STAGE_SEMANTIC_ID"]) === WON_SEMANTIC;

    return {
        externalId,
        signals: {
            dealWon: won,
            dealStage: [asText(deal["STAGE_ID"])].filter((value): value is string => Boolean(value)),
        },
        email: firstMultiField(contact["EMAIL"]),
        phone: firstMultiField(contact["PHONE"]),
        gclid: gclidField ? (asText(deal[gclidField]) ?? asText(contact[gclidField])) : null,
        value: asNumber(deal["OPPORTUNITY"]),
        occurredAt: asDate(won ? (deal["CLOSEDATE"] ?? deal["MOVED_TIME"]) : (deal["MOVED_TIME"] ?? deal["DATE_MODIFY"]), receivedAt),
        eventKey: externalId,
    };
};
