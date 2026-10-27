import { reportPeriodQuerySchema } from "./report.validator";

const issuesOf = (query: Record<string, string>) =>
    reportPeriodQuerySchema.safeParse(query).error?.issues.map((issue) => issue.message) ?? [];

describe("reportPeriodQuerySchema", () => {
    it("aceita período por dias e o mês antigo", () => {
        expect(reportPeriodQuerySchema.safeParse({ startDate: "2026-10-01", endDate: "2026-10-15" }).success).toBe(true);
        expect(reportPeriodQuerySchema.safeParse({ month: "2026-10" }).success).toBe(true);
        expect(reportPeriodQuerySchema.safeParse({}).success).toBe(true);
    });

    it("exige as duas datas juntas", () => {
        expect(issuesOf({ startDate: "2026-10-01" })).toContain("Informe a data inicial e a final.");
    });

    it("recusa início depois do fim", () => {
        expect(issuesOf({ startDate: "2026-10-15", endDate: "2026-10-01" })).toContain(
            "A data inicial deve ser anterior ou igual à final.",
        );
    });

    it("recusa dia inexistente e formato errado", () => {
        expect(issuesOf({ startDate: "2026-02-31", endDate: "2026-03-01" })).toContain("Data inexistente.");
        expect(issuesOf({ startDate: "01/10/2026", endDate: "2026-10-15" })[0]).toMatch(/AAAA-MM-DD/);
    });

    it("limita o período a 366 dias", () => {
        expect(issuesOf({ startDate: "2025-01-01", endDate: "2026-10-15" })).toContain("Período máximo de 366 dias.");
    });
});
