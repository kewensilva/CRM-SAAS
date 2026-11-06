import type { NormalizedSourceEvent } from "../../types/conversion-sync.types";
import { asDate, asRecord, asText } from "./source-helpers";

// Webhook do RD Station Marketing: um objeto por evento, com o contato completo.
// event_type WEBHOOK.CONVERTED (conversão em formulário/LP) ou WEBHOOK.MARKED_OPPORTUNITY.
// O payload não traz GCLID nativamente — só se o cliente o capturar num campo personalizado
// (gclidField, ex.: "cf_gclid").
// https://developers.rdstation.com/reference/webhooks-payload-mkt
const CONVERTED = "WEBHOOK.CONVERTED";
const MARKED_OPPORTUNITY = "WEBHOOK.MARKED_OPPORTUNITY";

export const parseRdMarketingWebhook = (
    payload: unknown,
    gclidField: string | null,
    receivedAt: Date = new Date(),
): NormalizedSourceEvent | null => {
    const body = asRecord(payload);
    const contact = asRecord(body["contact"]);
    const funnel = asRecord(contact["funnel"]);
    const eventType = asText(body["event_type"]);
    const externalId = asText(contact["uuid"]) ?? asText(contact["email"]);

    if (!externalId || (eventType !== CONVERTED && eventType !== MARKED_OPPORTUNITY)) {
        return null;
    }

    const occurredAt = asDate(body["event_timestamp"] ?? body["timestamp"], receivedAt);
    const identifier = asText(body["event_identifier"]) ?? "default";

    return {
        externalId,
        signals: {
            ...(eventType === CONVERTED ? { newConversion: { identifier } } : {}),
            opportunity: eventType === MARKED_OPPORTUNITY || funnel["opportunity"] === true,
            ...(asText(funnel["lifecycle_stage"]) ? { lifecycleStage: asText(funnel["lifecycle_stage"]) as string } : {}),
        },
        email: asText(contact["email"]),
        phone: asText(contact["mobile_phone"]) ?? asText(contact["personal_phone"]),
        gclid: gclidField ? asText(contact[gclidField]) : null,
        value: null,
        occurredAt,
        eventKey: occurredAt.toISOString(),
    };
};
