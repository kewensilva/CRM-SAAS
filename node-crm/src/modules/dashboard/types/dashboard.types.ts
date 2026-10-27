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

// Um card por empresa no Dashboard do Owner. Contagens por STATUS ATUAL do lead (mesma regra
// do card "Leads Qualificados" da plataforma): qualificado = EM_ANDAMENTO + VENDIDO + PERDIDO
// (quem foi vendido ou perdido continua qualificado), perdido = PERDIDO, ganho = VENDIDO.
export type OwnerTenantCard = {
    tenantId: string;
    name: string;
    domain: string;
    status: "ACTIVE" | "INACTIVE";
    leadsCount: number;
    qualifiedLeadsCount: number;
    lostLeadsCount: number;
    wonLeadsCount: number;
    // Soma dos valores (R$) dos leads ganhos e perdidos. Por lead vale o valor da negociação
    // (definido ao fechar) e, se não houver, o valor orçado no lead.
    wonValue: number;
    lostValue: number;
};

export type AnalystActivityItem = {
    analystId: string;
    name: string;
    email: string;
    status: "ACTIVE" | "INACTIVE";
    accessCount: number;
    leadActionsCount: number;
    lastActivityAt: Date | null;
};

export type AnalystActivitySummary = {
    periodDays: number;
    analysts: AnalystActivityItem[];
};
