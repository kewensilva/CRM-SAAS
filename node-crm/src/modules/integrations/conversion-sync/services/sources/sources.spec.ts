import { mapBitrixDeal, parseBitrixWebhook } from "./bitrix24.parser";
import { parseRdCrmWebhook } from "./rd-crm.parser";
import { parseRdMarketingWebhook } from "./rd-marketing.parser";

const NOW = new Date("2026-10-30T12:00:00Z");

describe("RD Station Marketing", () => {
    const payload = {
        event_type: "WEBHOOK.CONVERTED",
        entity_type: "CONTACT",
        event_identifier: "orcamento-site",
        event_timestamp: "2026-10-30T10:15:00.000Z",
        contact: {
            uuid: "c-123",
            email: "Ana@Empresa.com",
            name: "Ana",
            personal_phone: "1133334444",
            mobile_phone: "(11) 98888-7777",
            cf_gclid: ["EAIaIQobChMI"],
            funnel: { lifecycle_stage: "Lead Qualificado", opportunity: false },
        },
    };

    it("conversão de formulário com GCLID do campo personalizado e celular", () => {
        expect(parseRdMarketingWebhook(payload, "cf_gclid", NOW)).toEqual({
            externalId: "c-123",
            signals: { newConversion: { identifier: "orcamento-site" }, opportunity: false, lifecycleStage: "Lead Qualificado" },
            email: "Ana@Empresa.com",
            phone: "(11) 98888-7777",
            gclid: "EAIaIQobChMI",
            value: null,
            occurredAt: new Date("2026-10-30T10:15:00.000Z"),
            eventKey: "2026-10-30T10:15:00.000Z",
        });
    });

    it("marcado como oportunidade", () => {
        const event = parseRdMarketingWebhook({ ...payload, event_type: "WEBHOOK.MARKED_OPPORTUNITY" }, null, NOW);

        expect(event?.signals.opportunity).toBe(true);
        expect(event?.signals.newConversion).toBeUndefined();
        expect(event?.gclid).toBeNull();
    });

    it("evento desconhecido ou sem contato é ignorado", () => {
        expect(parseRdMarketingWebhook({ event_type: "OUTRO", contact: { uuid: "x" } }, null)).toBeNull();
        expect(parseRdMarketingWebhook({ event_type: "WEBHOOK.CONVERTED" }, null)).toBeNull();
    });
});

describe("RD Station CRM", () => {
    const payload = {
        event_name: "crm_deal_updated",
        document: {
            id: "deal-77",
            status: "won",
            closed_at: "2026-10-29T18:00:00Z",
            updated_at: "2026-10-29T18:00:01Z",
            amount_total: 15000.5,
            deal_stage: { id: "st-1", name: "Fechamento", nickname: "FCH" },
            deal_custom_fields: [{ value: "Cj0KCQ", custom_field: { label: "GCLID" } }],
        },
    };

    it("negócio ganho com valor, etapa e GCLID pelo rótulo do campo", () => {
        expect(parseRdCrmWebhook(payload, "gclid", NOW)).toEqual({
            externalId: "deal-77",
            signals: { dealWon: true, dealStage: ["st-1", "Fechamento", "FCH"] },
            gclid: "Cj0KCQ",
            value: 15000.5,
            occurredAt: new Date("2026-10-29T18:00:00Z"),
            eventKey: "deal-77",
        });
    });

    it("negócio em andamento não é ganho e usa updated_at", () => {
        const event = parseRdCrmWebhook({ ...payload, document: { ...payload.document, status: "ongoing" } }, null, NOW);

        expect(event?.signals.dealWon).toBe(false);
        expect(event?.occurredAt).toEqual(new Date("2026-10-29T18:00:01Z"));
        expect(event?.gclid).toBeNull();
    });

    it("negócio excluído é ignorado", () => {
        expect(parseRdCrmWebhook({ event_name: "crm_deal_deleted", document: { id: "1" } }, null)).toBeNull();
    });
});

describe("Bitrix24", () => {
    it("lê o formulário do webhook de saída (já parseado pelo express.urlencoded)", () => {
        expect(
            parseBitrixWebhook({ event: "ONCRMDEALUPDATE", data: { FIELDS: { ID: "410" } }, auth: { application_token: "tok" } }),
        ).toEqual({ dealId: "410", applicationToken: "tok" });
        expect(parseBitrixWebhook({ event: "ONCRMLEADADD", data: { FIELDS: { ID: "1" } } })).toBeNull();
    });

    it("negócio ganho (STAGE_SEMANTIC_ID S) com contato e GCLID do campo UF_CRM", () => {
        const deal = {
            ID: "410",
            STAGE_ID: "C1:WON",
            STAGE_SEMANTIC_ID: "S",
            OPPORTUNITY: "2500.00",
            CLOSEDATE: "2026-10-28T15:00:00+03:00",
            UF_CRM_GCLID: "abc",
        };
        const contact = { EMAIL: [{ VALUE: "joao@x.com", VALUE_TYPE: "WORK" }], PHONE: [{ VALUE: "+5521999998888" }] };

        expect(mapBitrixDeal(deal, contact, "UF_CRM_GCLID", NOW)).toEqual({
            externalId: "410",
            signals: { dealWon: true, dealStage: ["C1:WON"] },
            email: "joao@x.com",
            phone: "+5521999998888",
            gclid: "abc",
            value: 2500,
            occurredAt: new Date("2026-10-28T15:00:00+03:00"),
            eventKey: "410",
        });
    });

    it("negócio em andamento não é ganho", () => {
        expect(mapBitrixDeal({ ID: "1", STAGE_SEMANTIC_ID: "P", STAGE_ID: "NEW" }, {}, null, NOW)?.signals.dealWon).toBe(false);
    });
});
