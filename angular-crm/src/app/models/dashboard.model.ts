export interface DashboardSummary {
  leadsCount: number;
  dealsInProgress: number;
  dealsWon: number;
  dealsLost: number;
  pendingActivities: number;
}

export interface PlatformDashboardSummary {
  tenantsCount: number;
  usersCount: number;
  leadsCount: number;
  qualifiedLeadsCount: number;
}
