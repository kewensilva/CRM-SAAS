import type { AnalystActivityItem } from "../types/dashboard.types";
import { buildTenantCards, sortAnalystsByActivity } from "./owner-dashboard.helpers";

const tenant = (id: string, name: string) => ({
    id,
    name,
    domain: `${id}.cmb.dev`,
    status: "ACTIVE" as const,
});

const analyst = (overrides: Partial<AnalystActivityItem>): AnalystActivityItem => ({
    analystId: "a",
    name: "A",
    email: "a@cmb.dev",
    status: "ACTIVE",
    accessCount: 0,
    leadActionsCount: 0,
    lastActivityAt: null,
    ...overrides,
});

describe("buildTenantCards", () => {
    it("conta qualificados incluindo Vendido e Perdido, e separa ganhos e perdidos", () => {
        const [card] = buildTenantCards(
            [tenant("t1", "Delta")],
            [
                { tenantId: "t1", status: "NOVO", count: 4 },
                { tenantId: "t1", status: "EM_ANDAMENTO", count: 3 },
                { tenantId: "t1", status: "VENDIDO", count: 2 },
                { tenantId: "t1", status: "PERDIDO", count: 1 },
            ],
        );

        expect(card).toMatchObject({
            leadsCount: 10,
            qualifiedLeadsCount: 6,
            wonLeadsCount: 2,
            lostLeadsCount: 1,
        });
    });

    it("usa o valor da negociação e, na falta dele, o valor orçado do lead", () => {
        const [card] = buildTenantCards(
            [tenant("t1", "Delta")],
            [],
            [
                { tenantId: "t1", status: "VENDIDO", dealValue: 0.1, budgetValue: 999 },
                { tenantId: "t1", status: "VENDIDO", dealValue: null, budgetValue: 0.2 },
                { tenantId: "t1", status: "VENDIDO", dealValue: 0, budgetValue: 50 },
                { tenantId: "t1", status: "PERDIDO", dealValue: null, budgetValue: null },
                { tenantId: "t1", status: "PERDIDO", dealValue: 150.5, budgetValue: null },
            ],
        );

        expect(card.wonValue).toBe(0.3);
        expect(card.lostValue).toBe(150.5);
    });

    it("não mistura empresas e inclui empresa sem leads com zeros", () => {
        const cards = buildTenantCards(
            [tenant("t1", "Zeta"), tenant("t2", "Alfa"), tenant("t3", "Beta")],
            [
                { tenantId: "t1", status: "NOVO", count: 5 },
                { tenantId: "t3", status: "NOVO", count: 5 },
            ],
            [{ tenantId: "t1", status: "VENDIDO", dealValue: 100, budgetValue: null }],
        );

        expect(cards.map((card) => card.name)).toEqual(["Beta", "Zeta", "Alfa"]);
        expect(cards[0].wonValue).toBe(0);
        expect(cards[1].wonValue).toBe(100);
        expect(cards[2]).toMatchObject({ leadsCount: 0, qualifiedLeadsCount: 0, wonValue: 0, lostValue: 0 });
    });
});

describe("sortAnalystsByActivity", () => {
    it("ordena por acessos, depois movimentações, depois nome", () => {
        const sorted = sortAnalystsByActivity([
            analyst({ analystId: "1", name: "Carla", accessCount: 2, leadActionsCount: 1 }),
            analyst({ analystId: "2", name: "Bruno", accessCount: 5 }),
            analyst({ analystId: "3", name: "Ana", accessCount: 2, leadActionsCount: 1 }),
            analyst({ analystId: "4", name: "Davi", accessCount: 2, leadActionsCount: 7 }),
            analyst({ analystId: "5", name: "Eva" }),
        ]);

        expect(sorted.map((item) => item.name)).toEqual(["Bruno", "Davi", "Ana", "Carla", "Eva"]);
    });

    it("não altera o array recebido", () => {
        const input = [analyst({ name: "B" }), analyst({ name: "A", accessCount: 1 })];

        sortAnalystsByActivity(input);

        expect(input.map((item) => item.name)).toEqual(["B", "A"]);
    });
});
