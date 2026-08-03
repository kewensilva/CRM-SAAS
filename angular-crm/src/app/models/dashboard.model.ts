export interface DashboardTrendPoint {
  date: string;
  leadsCount: number;
  dealsInProgress: number;
  dealsWon: number;
  dealsLost: number;
}

export interface DashboardSummary {
  leadsCount: number;
  dealsInProgress: number;
  dealsWon: number;
  dealsLost: number;
  pendingActivities: number;
  trends: DashboardTrendPoint[];
}

export interface PlatformTrendPoint {
  date: string;
  value: number;
}

export interface PlatformDashboardSummary {
  tenantsCount: number;
  usersCount: number;
  leadsCount: number;
  qualifiedLeadsCount: number;
  newTenantsLast30Days: number;
  newTenantsPercentChange: number;
  tenantsTrend: PlatformTrendPoint[];
  usersTrend: PlatformTrendPoint[];
  leadsTrend: PlatformTrendPoint[];
  qualifiedLeadsTrend: PlatformTrendPoint[];
  tenantStatusBreakdown: { active: number; inactive: number };
}
