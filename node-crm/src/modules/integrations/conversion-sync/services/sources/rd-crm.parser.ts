import type { NormalizedSourceEvent } from "../../types/conversion-sync.types";
import { asDate, asNumber, asRecord, asText } from "./source-helpers";

// Webhook do RD Station CRM (v2): { event_name: "crm_deal_created" | "crm_deal_updated",
// document: <negócio> }. Ganho = document.status "won". O negócio NÃO traz o contato — e-mail
// e telefone vêm depois pela API do RD CRM (rd-crm.client.ts).
// https://developers.rdstation.com/reference/webhooks-payload-crm
const DEAL_EVENTS = ["crm_deal_created", "crm_deal_updated"];

export type RdCrmDealEvent = Omit<NormalizedSourceEvent, "email" | "phone">;

// Campo personalizado do negócio pelo rótulo (o RD CRM identifica campos pelo label).
const customFieldByLabel = (document: Record<string, unknown>, label: string | null): string | null => {
    if (!label || !Array.isArray(document["deal_custom_fields"])) {
        return null;
    }

    const field = (document["deal_custom_fields"] as unknown[])
        .map(asRecord)
        .find((item) => asText(asRecord(item["custom_field"])["label"])?.toLowerCase() === label.trim().toLowerCase());

    return field ? asText(field["value"]) : null;
};

export const parseRdCrmWebhook = (
    payload: unknown,
    gclidField: string | null,
    receivedAt: Date = new Date(),
): RdCrmDealEvent | null => {
    const body = asRecord(payload);
    const document = asRecord(body["document"]);
    const eventName = asText(body["event_name"])?.toLowerCase();
    const externalId = asText(document["id"]);

    if (!externalId || !eventName || !DEAL_EVENTS.includes(eventName)) {
        return null;
    }

    const stage = asRecord(document["deal_stage"]);
    const won = asText(document["status"])?.toLowerCase() === "won";

    return {
        externalId,
        signals: {
            dealWon: won,
            dealStage: [asText(stage["id"]), asText(stage["name"]), asText(stage["nickname"])].filter(
                (value): value is string => Boolean(value),
            ),
        },
        gclid: customFieldByLabel(document, gclidField),
        value: asNumber(document["amount_total"]),
        occurredAt: asDate(won ? document["closed_at"] : (document["updated_at"] ?? body["event_timestamp"]), receivedAt),
        eventKey: externalId,
    };
};
