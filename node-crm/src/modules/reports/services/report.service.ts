import { budgetEntryRepository } from "../../budget/repositories/budget-entry.repository";
import { leadRepository } from "../../leads/repositories/lead.repository";
import type { Lead, LeadStatus } from "../../leads/types/lead.types";
import type { BudgetChannelBreakdown, ChannelConversion, ReportFunnel, ReportSummary } from "../types/report.types";

const QUALIFIED_STATUSES: LeadStatus[] = ["EM_ANDAMENTO", "VENDIDO", "PERDIDO"];

const toNumber = (value: unknown): number => Number(value ?? 0);

const firstOfMonth = (date: Date): Date =>
    new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));

const addMonths = (date: Date, delta: number): Date =>
    new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + delta, 1));

const monthLabel = (date: Date): string => date.toISOString().slice(0, 7);

// Só até 2 casas — os cards de "%" desta tela não precisam de mais precisão que isso.
const round2 = (value: number): number => Math.round(value * 100) / 100;

// Atribuição de conversão por canal é best-effort: casa Lead.utmSource (só preenchido
// pelo Web Widget, com UTM da URL) contra o nome do canal cadastrado em Parâmetros,
// ignorando o sufixo " Ads" e maiúsculas/minúsculas ("Google Ads" -> "google"). Leads do
// Meta Lead Ads ou criados manualmente não têm utmSource, então nunca são atribuídos a
// nenhum canal aqui — limitação conhecida do modelo atual (utmSource só existe pra
// origem Site), documentada em vez de forçar uma correspondência que não existe de
// verdade nos dados.
const channelKeyword = (channelName: string): string =>
    channelName.replace(/\s*ads\s*$/i, "").trim().toLowerCase();

const matchesChannel = (lead: Lead, keyword: string): boolean =>
    !!lead.utmSource && lead.utmSource.toLowerCase().includes(keyword) && keyword.length > 0;

const buildConversionsByChannel = (
    channelNames: string[],
    wonLeadsInMonth: Lead[],
): ChannelConversion[] => {
    if (wonLeadsInMonth.length === 0) {
        return channelNames.map((channelName) => ({ channelName, percentage: 0 }));
    }

    return channelNames.map((channelName) => {
        const keyword = channelKeyword(channelName);
        const matched = wonLeadsInMonth.filter((lead) => matchesChannel(lead, keyword));

        return { channelName, percentage: round2((matched.length / wonLeadsInMonth.length) * 100) };
    });
};

const getSummary = async (tenantId: string, requestedMonth?: Date): Promise<ReportSummary> => {
    const month = firstOfMonth(requestedMonth ?? new Date());
    const nextMonth = addMonths(month, 1);
    const previousMonth = addMonths(month, -1);

    const [entries, previousEntries, leadsInMonth] = await Promise.all([
        budgetEntryRepository.listByTenant(tenantId, month),
        budgetEntryRepository.listByTenant(tenantId, previousMonth),
        leadRepository.listCreatedBetween(tenantId, month, nextMonth),
    ]);

    const byChannel: BudgetChannelBreakdown[] = entries.map((entry) => ({
        channelName: entry.channelName,
        budget: toNumber(entry.budget),
        investment: toNumber(entry.investment),
    }));

    const totalBudget = byChannel.reduce((sum, item) => sum + item.budget, 0);
    const totalInvestment = byChannel.reduce((sum, item) => sum + item.investment, 0);
    const previousMonthTotal = previousEntries.reduce((sum, entry) => sum + toNumber(entry.investment), 0);

    const percentChange =
        previousMonthTotal === 0
            ? totalInvestment > 0
                ? 100
                : 0
            : round2(((totalInvestment - previousMonthTotal) / previousMonthTotal) * 100);

    const qualifiedLeads = leadsInMonth.filter((lead) => QUALIFIED_STATUSES.includes(lead.status));
    const wonLeads = leadsInMonth.filter((lead) => lead.status === "VENDIDO");

    const totalLeads = leadsInMonth.length;
    const funnel: ReportFunnel = {
        totalLeads,
        qualifiedLeads: qualifiedLeads.length,
        wonLeads: wonLeads.length,
        qualifiedRate: totalLeads > 0 ? round2((qualifiedLeads.length / totalLeads) * 100) : 0,
        wonRate: totalLeads > 0 ? round2((wonLeads.length / totalLeads) * 100) : 0,
    };

    // SQL (Sales Qualified Lead) = leads da coorte do mês que chegaram a "Em andamento"
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
        month: monthLabel(month),
        budget: { total: round2(totalBudget), byChannel },
        investment: { total: round2(totalInvestment), previousMonthTotal: round2(previousMonthTotal), percentChange },
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
