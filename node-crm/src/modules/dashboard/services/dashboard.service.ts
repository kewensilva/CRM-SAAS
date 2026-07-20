import { activityRepository } from "../../activities/repositories/activity.repository";
import { dealRepository } from "../../deals/repositories/deal.repository";
import { leadRepository } from "../../leads/repositories/lead.repository";
import { tenantRepository } from "../../tenants/repositories/tenant.repository";
import { userRepository } from "../../users/repositories/user.repository";
import type { DashboardSummary, PlatformDashboardSummary } from "../types/dashboard.types";

const getSummary = async (tenantId: string): Promise<DashboardSummary> => {
    const [leadsCount, dealsInProgress, dealsWon, dealsLost, pendingActivities] = await Promise.all([
        leadRepository.countByTenant(tenantId),
        dealRepository.countByTenantAndStatus(tenantId, "IN_PROGRESS"),
        dealRepository.countByTenantAndStatus(tenantId, "WON"),
        dealRepository.countByTenantAndStatus(tenantId, "LOST"),
        activityRepository.countByTenantAndStatus(tenantId, "PENDING"),
    ]);

    return { leadsCount, dealsInProgress, dealsWon, dealsLost, pendingActivities };
};

const getPlatformSummary = async (): Promise<PlatformDashboardSummary> => {
    const [tenantsCount, usersCount, leadsCount, qualifiedLeadsCount] = await Promise.all([
        tenantRepository.count(),
        userRepository.countAll(),
        leadRepository.countAll(),
        leadRepository.countAllByStatus("IN_PROGRESS"),
    ]);

    return { tenantsCount, usersCount, leadsCount, qualifiedLeadsCount };
};

export const dashboardService = {
    getSummary,
    getPlatformSummary,
};
