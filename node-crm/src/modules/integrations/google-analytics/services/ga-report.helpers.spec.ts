import { buildReportRequests, parseCities, parseTotals, resolveDateRange, todayInBrazil, TOP_CITIES_LIMIT } from "./ga-report.helpers";

const TODAY = "2026-10-27";

describe("resolveDateRange", () => {
    it("usa os dias informados", () => {
        expect(resolveDateRange({ startDate: "2026-10-05", endDate: "2026-10-12" }, TODAY)).toEqual({
            startDate: "2026-10-05",
            endDate: "2026-10-12",
        });
    });

    it("corta o fim do período em hoje", () => {
        expect(resolveDateRange({ startDate: "2026-10-20", endDate: "2026-11-10" }, TODAY)).toEqual({
            startDate: "2026-10-20",
            endDate: TODAY,
        });
    });

    it("mês informado vira o mês inteiro (fevereiro com 28 dias)", () => {
        expect(resolveDateRange({ month: "2026-02" }, TODAY)).toEqual({ startDate: "2026-02-01", endDate: "2026-02-28" });
    });

    it("sem nada, usa o mês corrente até hoje", () => {
        expect(resolveDateRange({}, TODAY)).toEqual({ startDate: "2026-10-01", endDate: TODAY });
    });

    it("período que ainda não começou devolve null", () => {
        expect(resolveDateRange({ startDate: "2026-11-01", endDate: "2026-11-30" }, TODAY)).toBeNull();
    });
});

describe("todayInBrazil", () => {
    it("às 01h UTC ainda é o dia anterior em Brasília", () => {
        expect(todayInBrazil(new Date("2026-10-28T01:00:00Z"))).toBe("2026-10-27");
    });
});

describe("buildReportRequests", () => {
    it("pede totais e o top de cidades por usuários ativos", () => {
        const [totals, cities] = buildReportRequests({ startDate: "2026-10-01", endDate: "2026-10-27" });

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
