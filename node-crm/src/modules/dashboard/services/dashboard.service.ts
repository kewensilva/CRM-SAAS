import { activityRepository } from "../../activities/repositories/activity.repository";
import { dealRepository } from "../../deals/repositories/deal.repository";
import { leadRepository } from "../../leads/repositories/lead.repository";
import { tenantRepository } from "../../tenants/repositories/tenant.repository";
import { userRepository } from "../../users/repositories/user.repository";
import type {
    DashboardSummary,
    DashboardTrendPoint,
    PlatformDashboardSummary,
    PlatformTrendPoint,
} from "../types/dashboard.types";

const TREND_DAYS = 14;

const dayKey = (date: Date): string => date.toISOString().slice(0, 10);

// Busca leads/deals do tenant uma única vez e conta por dia em memória — evita 14×N
// consultas ao banco. Na escala do projeto (~30-50 tenants, poucos usuários cada) isso é
// perfeitamente aceitável (mesmo raciocínio de simplicidade já usado no heatmap do CRM).
const buildTrends = async (tenantId: string): Promise<DashboardTrendPoint[]> => {
    const [leads, deals] = await Promise.all([
        leadRepository.listByTenant(tenantId),
        dealRepository.listByTenant(tenantId),
    ]);

    const today = new Date();

    return Array.from({ length: TREND_DAYS }, (_, index) => {
        const day = new Date(today);
        day.setDate(today.getDate() - (TREND_DAYS - 1 - index));
        const key = dayKey(day);

        return {
            date: key,
            leadsCount: leads.filter((lead) => dayKey(lead.createdAt) === key).length,
            dealsInProgress: deals.filter(
                (deal) => deal.status === "IN_PROGRESS" && dayKey(deal.createdAt) === key,
            ).length,
            dealsWon: deals.filter((deal) => deal.status === "WON" && dayKey(deal.createdAt) === key)
                .length,
            dealsLost: deals.filter((deal) => deal.status === "LOST" && dayKey(deal.createdAt) === key)
                .length,
        };
    });
};

const getSummary = async (tenantId: string): Promise<DashboardSummary> => {
    const [leadsCount, dealsInProgress, dealsWon, dealsLost, pendingActivities, trends] =
        await Promise.all([
            leadRepository.countByTenant(tenantId),
            dealRepository.countByTenantAndStatus(tenantId, "IN_PROGRESS"),
            dealRepository.countByTenantAndStatus(tenantId, "WON"),
            dealRepository.countByTenantAndStatus(tenantId, "LOST"),
            activityRepository.countByTenantAndStatus(tenantId, "PENDING"),
            buildTrends(tenantId),
        ]);

    return { leadsCount, dealsInProgress, dealsWon, dealsLost, pendingActivities, trends };
};

// Sparkline genérico: conta quantas datas caem em cada um dos últimos 14 dias.
const buildTrendFromDates = (dates: Date[]): PlatformTrendPoint[] => {
    const today = new Date();

    return Array.from({ length: TREND_DAYS }, (_, index) => {
        const day = new Date(today);
        day.setDate(today.getDate() - (TREND_DAYS - 1 - index));
        const key = dayKey(day);

        return { date: key, value: dates.filter((date) => dayKey(date) === key).length };
    });
};

const PERCENT_CHANGE_WINDOW_DAYS = 30;

// Comparação de janelas de 30 dias (atual vs. anterior) — mesmo raciocínio de qualquer
// card de "variação" de produto (ex.: analytics). 0 tenants no período anterior conta
// como 100% de crescimento se houve pelo menos 1 novo tenant agora (evita divisão por
// zero sem esconder que houve crescimento real).
const calculatePercentChange = (tenantCreatedAtDates: Date[]): { current: number; percentChange: number } => {
    const now = new Date();
    const windowStart = new Date(now);
    windowStart.setDate(now.getDate() - PERCENT_CHANGE_WINDOW_DAYS);
    const previousWindowStart = new Date(now);
    previousWindowStart.setDate(now.getDate() - PERCENT_CHANGE_WINDOW_DAYS * 2);

    const current = tenantCreatedAtDates.filter((date) => date >= windowStart && date <= now).length;
    const previous = tenantCreatedAtDates.filter(
        (date) => date >= previousWindowStart && date < windowStart,
    ).length;

    if (previous === 0) {
        return { current, percentChange: current > 0 ? 100 : 0 };
    }

    return { current, percentChange: Math.round(((current - previous) / previous) * 100) };
};

const getPlatformSummary = async (): Promise<PlatformDashboardSummary> => {
    const [tenants, userDates, leadRows] = await Promise.all([
        tenantRepository.list(),
        userRepository.listCreatedAtExcludingPlatformUsers(),
        leadRepository.listCreatedAtAndStatusAll(),
    ]);

    const tenantsCount = tenants.length;
    const usersCount = userDates.length;
    const leadsCount = leadRows.length;
    const qualifiedLeadRows = leadRows.filter((lead) => lead.status === "EM_ANDAMENTO");

    const tenantCreatedAtDates = tenants.map((tenant) => tenant.createdAt);
    const { current: newTenantsLast30Days, percentChange: newTenantsPercentChange } =
        calculatePercentChange(tenantCreatedAtDates);

    const tenantStatusBreakdown = {
        active: tenants.filter((tenant) => tenant.status === "ACTIVE").length,
        inactive: tenants.filter((tenant) => tenant.status === "INACTIVE").length,
    };

    return {
        tenantsCount,
        usersCount,
        leadsCount,
        qualifiedLeadsCount: qualifiedLeadRows.length,
        newTenantsLast30Days,
        newTenantsPercentChange,
        tenantsTrend: buildTrendFromDates(tenantCreatedAtDates),
        usersTrend: buildTrendFromDates(userDates.map((user) => user.createdAt)),
        leadsTrend: buildTrendFromDates(leadRows.map((lead) => lead.createdAt)),
        qualifiedLeadsTrend: buildTrendFromDates(qualifiedLeadRows.map((lead) => lead.createdAt)),
        tenantStatusBreakdown,
    };
};

export const dashboardService = {
    getSummary,
    getPlatformSummary,
};
