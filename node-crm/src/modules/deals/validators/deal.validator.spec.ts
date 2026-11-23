import { moveLeadStatusSchema } from "./deal.validator";

describe("moveLeadStatusSchema — valor", () => {
    it("aceita Perdido com valor zero (lead perdido sem valor)", () => {
        expect(moveLeadStatusSchema.safeParse({ status: "PERDIDO", value: 0, lostReason: "Preço" }).success).toBe(true);
    });

    it("Perdido continua exigindo motivo", () => {
        expect(moveLeadStatusSchema.safeParse({ status: "PERDIDO", value: 0 }).success).toBe(false);
    });

    it("zero continua inválido em Vendido e Em andamento", () => {
        expect(moveLeadStatusSchema.safeParse({ status: "VENDIDO", value: 0 }).success).toBe(false);
        expect(moveLeadStatusSchema.safeParse({ status: "EM_ANDAMENTO", value: 0 }).success).toBe(false);
    });

    it("valor negativo é sempre inválido", () => {
        expect(moveLeadStatusSchema.safeParse({ status: "PERDIDO", value: -1, lostReason: "Preço" }).success).toBe(false);
    });
});
