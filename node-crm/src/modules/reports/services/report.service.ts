import { budgetEntryRepository } from "../../budget/repositories/budget-entry.repository";
import { leadRepository } from "../../leads/repositories/lead.repository";
import { QUALIFIED_LEAD_STATUSES } from "../../leads/constants/lead-qualification";
import type { Lead } from "../../leads/types/lead.types";
import type { BudgetChannelBreakdown, ChannelConversion, ReportFunnel, ReportSummary } from "../types/report.types";
import { addMonths, monthLabel } from "./report-period";
import type { ReportPeriod } from "./report-period";

const toNumber = (value: unknown): number => Number(value ?? 0);

// Só até 2 casas — os cards de "%" desta tela não precisam de mais precisão que isso.
const round2 = (value: number): number => Math.round(value * 100) / 100;

// Atribuição de conversão por canal é best-effort: casa a Fonte do Lead (utmSource) contra o
// nome do canal cadastrado em Parâmetros, ignorando o sufixo " Ads" e maiúsculas/minúsculas
// ("Instagram Ads" -> "instagram"). A Fonte vem da UTM da URL (leads do site) ou da
// plataforma do Meta Lead Ads (instagram/facebook); leads manuais não têm Fonte e nunca são
// atribuídos a nenhum canal.
const channelKeyword = (channelName: string): string =>
    channelName.replace(/\s*ads\s*$/i, "").trim().toLowerCase();

const matchesChannel = (lead: Lead, keyword: string): boolean =>
    !!lead.utmSource && lead.utmSource.toLowerCase().includes(keyword) && keyword.length > 0;

const buildConversionsByChannel = (
    channelNames: string[],
    wonLeads: Lead[],
): ChannelConversion[] => {
    if (wonLeads.length === 0) {
        return channelNames.map((channelName) => ({ channelName, percentage: 0 }));
    }

    return channelNames.map((channelName) => {
        const keyword = channelKeyword(channelName);
        const matched = wonLeads.filter((lead) => matchesChannel(lead, keyword));

        return { channelName, percentage: round2((matched.length / wonLeads.length) * 100) };
    });
};

// Mesmo canal em vários meses do período vira uma linha só, somando budget e investimento.
const sumByChannel = (entries: { channelName: string; budget: unknown; investment: unknown }[]): BudgetChannelBreakdown[] => {
    const totals = new Map<string, BudgetChannelBreakdown>();

    for (const entry of entries) {
        const current = totals.get(entry.channelName) ?? { channelName: entry.channelName, budget: 0, investment: 0 };

        current.budget += toNumber(entry.budget);
        current.investment += toNumber(entry.investment);
        totals.set(entry.channelName, current);
    }

    return [...totals.values()].map((item) => ({
        ...item,
        budget: round2(item.budget),
        investment: round2(item.investment),
    }));
};

const listMonthLabels = (period: ReportPeriod): string[] =>
    Array.from({ length: period.monthCount }, (_, index) => monthLabel(addMonths(period.firstMonth, index)));

// Leads filtrados pelos dias do período; budget/investimento entram com os meses cheios
// tocados pelo período (decisão de produto: o cadastro é mensal e não é rateado por dia).
// A comparação usa o mesmo número de meses imediatamente anterior.
const getSummary = async (tenantId: string, period: ReportPeriod): Promise<ReportSummary> => {
    const previousFirstMonth = addMonths(period.firstMonth, -period.monthCount);
    const previousLastMonth = addMonths(period.firstMonth, -1);

    const [entries, previousEntries, leadsInPeriod] = await Promise.all([
        budgetEntryRepository.listByTenantBetweenMonths(tenantId, period.firstMonth, period.lastMonth),
        budgetEntryRepository.listByTenantBetweenMonths(tenantId, previousFirstMonth, previousLastMonth),
        leadRepository.listCreatedBetween(tenantId, period.start, period.endExclusive),
    ]);

    const byChannel = sumByChannel(entries);

    const totalBudget = byChannel.reduce((sum, item) => sum + item.budget, 0);
    const totalInvestment = byChannel.reduce((sum, item) => sum + item.investment, 0);
    const previousPeriodTotal = previousEntries.reduce((sum, entry) => sum + toNumber(entry.investment), 0);

    const percentChange =
        previousPeriodTotal === 0
            ? totalInvestment > 0
                ? 100
                : 0
            : round2(((totalInvestment - previousPeriodTotal) / previousPeriodTotal) * 100);

    const qualifiedLeads = leadsInPeriod.filter((lead) => QUALIFIED_LEAD_STATUSES.includes(lead.status));
    const wonLeads = leadsInPeriod.filter((lead) => lead.status === "VENDIDO");

    const totalLeads = leadsInPeriod.length;
    const funnel: ReportFunnel = {
        totalLeads,
        qualifiedLeads: qualifiedLeads.length,
        wonLeads: wonLeads.length,
        qualifiedRate: totalLeads > 0 ? round2((qualifiedLeads.length / totalLeads) * 100) : 0,
        wonRate: totalLeads > 0 ? round2((wonLeads.length / totalLeads) * 100) : 0,
    };

    // SQL (Sales Qualified Lead) = leads da coorte do período que chegaram a "Em andamento"
    // ou além — mesmo critério do funil acima, business-rules.md não define esse termo
    // formalmente, então usei o que já é "qualificado" no resto do produto (Painel).
    const sql = qualifiedLeads.length;
    const cpa = totalLeads > 0 ? round2(totalInvestment / totalLeads) : null;
    const cpv = wonLeads.length > 0 ? round2(totalInvestment / wonLeads.length) : null;

    const conversionsByChannel = buildConversionsByChannel(
        byChannel.map((item) => item.channelName),
        wonLeads,
    );

    return {
        startDate: period.startDate,
        endDate: period.endDate,
        budgetMonths: listMonthLabels(period),
        budget: { total: round2(totalBudget), byChannel },
        investment: { total: round2(totalInvestment), previousPeriodTotal: round2(previousPeriodTotal), percentChange },
        conversionsByChannel,
        cpa,
        sql,
        cpv,
        funnel,
    };
};

export const reportService = {
    getSummary,
};
