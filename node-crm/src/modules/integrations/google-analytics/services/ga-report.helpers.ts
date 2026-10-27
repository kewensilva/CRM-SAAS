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

const BRAZIL_UTC_OFFSET_HOURS = 3;

const isoDay = (date: Date): string => date.toISOString().slice(0, 10);

// "Hoje" em Brasília — mesma referência de dia dos demais Relatórios.
export const todayInBrazil = (now: Date = new Date()): string =>
    isoDay(new Date(now.getTime() - BRAZIL_UTC_OFFSET_HOURS * 60 * 60 * 1000));

const lastDayOfMonth = (isoMonthStart: string): string => {
    const date = new Date(`${isoMonthStart}T00:00:00.000Z`);

    return isoDay(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)));
};

// Período pedido (dias informados > mês informado > mês corrente), cortado em hoje: o GA4
// aceita datas futuras, mas devolveria o período "incompleto" de forma silenciosa. Período
// que ainda não começou devolve null — não há o que consultar. As datas são interpretadas
// pelo GA4 no fuso da propriedade.
export const resolveDateRange = (
    query: { startDate?: string | undefined; endDate?: string | undefined; month?: string | undefined },
    today: string = todayInBrazil(),
): { startDate: string; endDate: string } | null => {
    const startDate = query.startDate ?? (query.month ? `${query.month}-01` : `${today.slice(0, 7)}-01`);
    const requestedEnd = query.endDate ?? (query.month ? lastDayOfMonth(`${query.month}-01`) : today);

    if (startDate > today) {
        return null;
    }

    return { startDate, endDate: requestedEnd < today ? requestedEnd : today };
};

// 1) totais do período sem dimensão; 2) usuários ativos por cidade, maiores primeiro.
export const buildReportRequests = (range: { startDate: string; endDate: string }): GaReportRequest[] => [
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
