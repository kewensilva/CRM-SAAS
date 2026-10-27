import { buildReportPeriod, monthPeriod, resolveReportPeriod } from "./report-period";

describe("buildReportPeriod", () => {
    it("converte os dias de Brasília em instantes UTC (fim exclusivo)", () => {
        const period = buildReportPeriod("2026-10-01", "2026-10-15");

        expect(period.start.toISOString()).toBe("2026-10-01T03:00:00.000Z");
        expect(period.endExclusive.toISOString()).toBe("2026-10-16T03:00:00.000Z");
    });

    it("lead das 22h do último dia (01h UTC do dia seguinte) fica dentro do período", () => {
        const period = buildReportPeriod("2026-10-01", "2026-10-31");
        const createdAt = new Date("2026-11-01T01:00:00.000Z");

        expect(createdAt >= period.start && createdAt < period.endExclusive).toBe(true);
    });

    it("um período dentro do mês toca só aquele mês", () => {
        const period = buildReportPeriod("2026-10-05", "2026-10-12");

        expect(period.firstMonth.toISOString()).toBe("2026-10-01T00:00:00.000Z");
        expect(period.lastMonth.toISOString()).toBe("2026-10-01T00:00:00.000Z");
        expect(period.monthCount).toBe(1);
    });

    it("período que cruza a virada do ano conta os meses tocados", () => {
        const period = buildReportPeriod("2026-11-20", "2027-01-10");

        expect(period.firstMonth.toISOString()).toBe("2026-11-01T00:00:00.000Z");
        expect(period.lastMonth.toISOString()).toBe("2027-01-01T00:00:00.000Z");
        expect(period.monthCount).toBe(3);
    });
});

describe("resolveReportPeriod", () => {
    it("prioriza os dias informados", () => {
        expect(resolveReportPeriod({ startDate: "2026-10-05", endDate: "2026-10-12" })).toMatchObject({
            startDate: "2026-10-05",
            endDate: "2026-10-12",
        });
    });

    it("mês informado (compatibilidade) vira o mês inteiro", () => {
        expect(monthPeriod(new Date("2026-02-01T00:00:00.000Z"))).toMatchObject({
            startDate: "2026-02-01",
            endDate: "2026-02-28",
        });
    });

    it("sem nada, começa no dia 1 do mês corrente", () => {
        expect(resolveReportPeriod({}).startDate).toMatch(/^\d{4}-\d{2}-01$/);
    });
});
