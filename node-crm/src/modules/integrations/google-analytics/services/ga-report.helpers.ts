import type {
    GaRunReportResponse,
    GoogleAnalyticsCityRow,
    GoogleAnalyticsTotals,
} from "../types/google-analytics.types";
import type { GaReportRequest } from "./ga-data-api.client";

export const TOP_CITIES_LIMIT = 10;

// O GA4 marca visitas sem cidade identificada como "(not set)".
const UNKNOWN_CITY = "(not set)";
const UNKNOWN_CITY_LABEL = "Não identificada";

const isoDay = (date: Date): string => date.toISOString().slice(0, 10);

// Período do mês pedido (month = dia 1, UTC) até o último dia — ou até hoje, no mês corrente
// (o GA4 aceita datas futuras, mas devolveria o mês "incompleto" de forma silenciosa). Mês
// ainda não começado devolve null: não há o que consultar. As datas são interpretadas pelo
// GA4 no fuso da propriedade, não em UTC.
export const monthDateRange = (
    month: Date,
    today: Date = new Date(),
): { startDate: string; endDate: string } | null => {
    const start = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), 1));
    const lastDay = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 0));
    const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

    if (start > todayUtc) {
        return null;
    }

    return { startDate: isoDay(start), endDate: isoDay(lastDay < todayUtc ? lastDay : todayUtc) };
};

// 1) totais do mês sem dimensão; 2) usuários ativos por cidade, maiores primeiro.
export const buildMonthlyRequests = (range: { startDate: string; endDate: string }): GaReportRequest[] => [
    {
        dateRanges: [range],
        metrics: [{ name: "activeUsers" }, { name: "newUsers" }, { name: "sessions" }],
    },
    {
        dateRanges: [range],
        dimensions: [{ name: "city" }],
        metrics: [{ name: "activeUsers" }],
        orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
        limit: String(TOP_CITIES_LIMIT),
    },
];

const metricAt = (row: NonNullable<GaRunReportResponse["rows"]>[number] | undefined, index: number): number =>
    Number(row?.metricValues?.[index]?.value ?? 0) || 0;

export const EMPTY_TOTALS: GoogleAnalyticsTotals = { activeUsers: 0, newUsers: 0, sessions: 0 };

// Sem nenhuma visita no período o GA4 devolve o relatório sem "rows" — vira zeros.
export const parseTotals = (report: GaRunReportResponse | undefined): GoogleAnalyticsTotals => {
    const row = report?.rows?.[0];

    return {
        activeUsers: metricAt(row, 0),
        newUsers: metricAt(row, 1),
        sessions: metricAt(row, 2),
    };
};

export const parseCities = (report: GaRunReportResponse | undefined): GoogleAnalyticsCityRow[] =>
    (report?.rows ?? []).map((row) => {
        const city = row.dimensionValues?.[0]?.value || UNKNOWN_CITY;

        return {
            city: city === UNKNOWN_CITY ? UNKNOWN_CITY_LABEL : city,
            activeUsers: metricAt(row, 0),
        };
    });
