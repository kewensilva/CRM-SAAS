import { createRuleSchema, selectAccountSchema } from "./google-ads.validator";

const rule = { name: "Venda", trigger: "LEAD_WON", originFilter: null, conversionActionId: "7012345678", sendValue: true };

describe("createRuleSchema", () => {
    it("aceita regra de Lead vendido com valor", () => {
        expect(createRuleSchema.safeParse(rule).success).toBe(true);
    });

    it("enviar valor só no Lead vendido", () => {
        expect(createRuleSchema.safeParse({ ...rule, trigger: "LEAD_CREATED" }).success).toBe(false);
    });

    it("ID da ação de conversão só com números", () => {
        expect(createRuleSchema.safeParse({ ...rule, conversionActionId: "abc" }).success).toBe(false);
    });
});

describe("selectAccountSchema", () => {
    it("aceita o ID com hífens e normaliza para 10 dígitos", () => {
        expect(selectAccountSchema.parse({ customerId: "123-456-7890" }).customerId).toBe("1234567890");
    });

    it("recusa ID incompleto", () => {
        expect(selectAccountSchema.safeParse({ customerId: "123" }).success).toBe(false);
    });
});
