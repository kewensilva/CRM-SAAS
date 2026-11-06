import { assertRuleFitsSource } from "./conversion-rule-policy";

describe("assertRuleFitsSource", () => {
    it("aceita combinações válidas", () => {
        expect(() => assertRuleFitsSource("RD_STATION_CRM", { trigger: "DEAL_WON", triggerValue: null, sendValue: true })).not.toThrow();
        expect(() => assertRuleFitsSource("BITRIX24", { trigger: "DEAL_STAGE", triggerValue: "C1:PREPAYMENT_INVOICE", sendValue: false })).not.toThrow();
        expect(() => assertRuleFitsSource("RD_STATION_MARKETING", { trigger: "NEW_CONVERSION", triggerValue: null, sendValue: false })).not.toThrow();
    });

    it("recusa gatilho de outra origem", () => {
        expect(() => assertRuleFitsSource("RD_STATION_MARKETING", { trigger: "DEAL_WON", triggerValue: null, sendValue: false })).toThrow(
            "Regra inválida",
        );
    });

    it("etapa sem valor, ganho com valor e valor de venda no RD Marketing são recusados", () => {
        expect(() => assertRuleFitsSource("BITRIX24", { trigger: "DEAL_STAGE", triggerValue: null, sendValue: false })).toThrow();
        expect(() => assertRuleFitsSource("BITRIX24", { trigger: "DEAL_WON", triggerValue: "x", sendValue: false })).toThrow();
        expect(() => assertRuleFitsSource("RD_STATION_MARKETING", { trigger: "OPPORTUNITY", triggerValue: null, sendValue: true })).toThrow();
    });
});
