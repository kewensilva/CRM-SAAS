import { activityRepository } from "../../activities/repositories/activity.repository";
import { dealRepository } from "../../deals/repositories/deal.repository";
import { leadRepository } from "../../leads/repositories/lead.repository";
import type { DashboardSummary } from "../types/dashboard.types";

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

export const dashboardService = {
    getSummary,
};
