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

// Um card por empresa no Dashboard do Owner. Contagens pelo STATUS ATUAL do lead:
// qualificado = Em andamento + Vendido + Perdido (quem foi vendido ou perdido continua
// qualificado), perdido = Perdido, ganho = Vendido.
export interface OwnerTenantCard {
  tenantId: string;
  name: string;
  domain: string;
  status: 'ACTIVE' | 'INACTIVE';
  leadsCount: number;
  qualifiedLeadsCount: number;
  lostLeadsCount: number;
  wonLeadsCount: number;
  // Soma (R$) dos valores dos leads ganhos e perdidos: valor da negociação ou, se não houver,
  // o valor orçado no lead.
  wonValue: number;
  lostValue: number;
}

export interface AnalystActivityItem {
  analystId: string;
  name: string;
  email: string;
  status: 'ACTIVE' | 'INACTIVE';
  // Logins + entradas na base de um cliente no período.
  accessCount: number;
  // Mudanças de status de leads feitas pelo analista no período.
  leadActionsCount: number;
  lastActivityAt: string | null;
}

export interface AnalystActivitySummary {
  periodDays: number;
  analysts: AnalystActivityItem[];
}
