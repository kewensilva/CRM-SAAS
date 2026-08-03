// O Dashboard não armazena dados próprios — apenas agrega informações dos demais
// módulos (product.md > Dashboard). Os 5 indicadores abaixo são exatamente os listados
// em business-rules.md > Dashboard.
// Um ponto por dia dos últimos 14 dias (mais antigo → mais recente) — alimenta os
// gráficos de tendência de cada card do Dashboard. Contagem de criação naquele dia
// (createdAt), não um snapshot histórico do status.
export type DashboardTrendPoint = {
    date: string;
    leadsCount: number;
    dealsInProgress: number;
    dealsWon: number;
    dealsLost: number;
};

export type DashboardSummary = {
    leadsCount: number;
    dealsInProgress: number;
    dealsWon: number;
    dealsLost: number;
    pendingActivities: number;
    trends: DashboardTrendPoint[];
};

// Um ponto por dia — usado pelos sparklines dos cards do Dashboard do Owner (contagem
// de criação naquele dia, mesmo princípio do DashboardTrendPoint por tenant).
export type PlatformTrendPoint = {
    date: string;
    value: number;
};

// Agregado de toda a plataforma (todos os tenants) — só para o Dashboard do Owner.
export type PlatformDashboardSummary = {
    tenantsCount: number;
    usersCount: number;
    leadsCount: number;
    qualifiedLeadsCount: number;
    // % de variação de novos tenants nos últimos 30 dias vs. os 30 dias anteriores.
    newTenantsLast30Days: number;
    newTenantsPercentChange: number;
    tenantsTrend: PlatformTrendPoint[];
    usersTrend: PlatformTrendPoint[];
    leadsTrend: PlatformTrendPoint[];
    qualifiedLeadsTrend: PlatformTrendPoint[];
    tenantStatusBreakdown: { active: number; inactive: number };
};
