import { buildMonthlyRequests, monthDateRange, parseCities, parseTotals, TOP_CITIES_LIMIT } from "./ga-report.helpers";

const month = (value: string) => new Date(`${value}-01T00:00:00.000Z`);

describe("monthDateRange", () => {
    it("usa o mês inteiro quando o mês já terminou", () => {
        expect(monthDateRange(month("2026-02"), new Date("2026-10-27T15:00:00Z"))).toEqual({
            startDate: "2026-02-01",
            endDate: "2026-02-28",
        });
    });

    it("para em hoje no mês corrente", () => {
        expect(monthDateRange(month("2026-10"), new Date("2026-10-27T15:00:00Z"))).toEqual({
            startDate: "2026-10-01",
            endDate: "2026-10-27",
        });
    });

    it("devolve null para mês que ainda não começou", () => {
        expect(monthDateRange(month("2026-11"), new Date("2026-10-27T15:00:00Z"))).toBeNull();
    });
});

describe("buildMonthlyRequests", () => {
    it("pede totais e o top de cidades por usuários ativos", () => {
        const [totals, cities] = buildMonthlyRequests({ startDate: "2026-10-01", endDate: "2026-10-27" });

        expect(totals.metrics.map((metric) => metric.name)).toEqual(["activeUsers", "newUsers", "sessions"]);
        expect(totals.dimensions).toBeUndefined();
        expect(cities.dimensions).toEqual([{ name: "city" }]);
        expect(cities.orderBys).toEqual([{ metric: { metricName: "activeUsers" }, desc: true }]);
        expect(cities.limit).toBe(String(TOP_CITIES_LIMIT));
    });
});

describe("parseTotals", () => {
    it("lê as três métricas na ordem pedida", () => {
        expect(
            parseTotals({ rows: [{ metricValues: [{ value: "120" }, { value: "80" }, { value: "310" }] }] }),
        ).toEqual({ activeUsers: 120, newUsers: 80, sessions: 310 });
    });

    it("relatório sem linhas (nenhuma visita) vira zeros", () => {
        expect(parseTotals({})).toEqual({ activeUsers: 0, newUsers: 0, sessions: 0 });
        expect(parseTotals(undefined)).toEqual({ activeUsers: 0, newUsers: 0, sessions: 0 });
    });
});

describe("parseCities", () => {
    it("mapeia cidades e traduz '(not set)'", () => {
        expect(
            parseCities({
                rows: [
                    { dimensionValues: [{ value: "São Paulo" }], metricValues: [{ value: "50" }] },
                    { dimensionValues: [{ value: "(not set)" }], metricValues: [{ value: "7" }] },
                ],
            }),
        ).toEqual([
            { city: "São Paulo", activeUsers: 50 },
            { city: "Não identificada", activeUsers: 7 },
        ]);
    });
});
