import type { ConversionRule, NormalizedSourceEvent } from "../types/conversion-sync.types";
import { matchRules } from "./rule-matcher";

const rule = (overrides: Partial<ConversionRule>): ConversionRule => ({
    id: "rule-1",
    tenantId: "t",
    integrationId: "i",
    name: "Regra",
    trigger: "DEAL_WON",
    triggerValue: null,
    conversionActionId: "123",
    sendValue: false,
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
});

const event = (overrides: Partial<NormalizedSourceEvent>): NormalizedSourceEvent => ({
    externalId: "deal-9",
    signals: {},
    email: null,
    phone: null,
    gclid: null,
    value: null,
    occurredAt: new Date(),
    eventKey: "k1",
    ...overrides,
});

describe("matchRules", () => {
    it("negócio ganho dispara DEAL_WON uma vez por negócio", () => {
        const [match] = matchRules([rule({})], event({ signals: { dealWon: true } }));

        expect(match.transactionId).toBe("deal-won:deal-9");
        expect(matchRules([rule({})], event({ signals: { dealWon: false } }))).toHaveLength(0);
    });

    it("etapa compara por id ou nome, sem diferenciar maiúsculas", () => {
        const stageRule = rule({ trigger: "DEAL_STAGE", triggerValue: "proposta enviada" });

        expect(matchRules([stageRule], event({ signals: { dealStage: ["C1:PREPARATION", "Proposta Enviada"] } }))).toHaveLength(1);
        expect(matchRules([stageRule], event({ signals: { dealStage: ["Negociação"] } }))).toHaveLength(0);
    });

    it("conversão de formulário: sem valor na regra aceita qualquer identificador", () => {
        const anyForm = rule({ trigger: "NEW_CONVERSION" });
        const onlyBudget = rule({ id: "rule-2", trigger: "NEW_CONVERSION", triggerValue: "orcamento" });
        const signals = { newConversion: { identifier: "newsletter" } };

        expect(matchRules([anyForm, onlyBudget], event({ signals })).map((m) => m.rule.id)).toEqual(["rule-1"]);
        expect(matchRules([anyForm], event({ signals, eventKey: "2026-10-30T10:00" }))[0].transactionId).toBe(
            "conversion:deal-9:2026-10-30T10:00",
        );
    });

    it("oportunidade e estágio do funil (RD Marketing)", () => {
        const signals = { opportunity: true, lifecycleStage: "Lead Qualificado" };

        expect(
            matchRules(
                [rule({ trigger: "OPPORTUNITY" }), rule({ id: "r2", trigger: "LIFECYCLE_STAGE", triggerValue: "lead qualificado" })],
                event({ signals }),
            ).map((m) => m.transactionId),
        ).toEqual(["opportunity:deal-9", "stage:deal-9:lead qualificado"]);
    });

    it("regra desativada nunca dispara", () => {
        expect(matchRules([rule({ enabled: false })], event({ signals: { dealWon: true } }))).toHaveLength(0);
    });
});
