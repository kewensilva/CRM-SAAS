export type BudgetChannelBreakdown = {
    channelName: string;
    budget: number;
    investment: number;
};

export type ChannelConversion = {
    channelName: string;
    // % das negociações Vendidas no período atribuídas a este canal (por Lead.utmSource) —
    // ver ATTRIBUTION_LIMITATION em reports.service.ts.
    percentage: number;
};

export type ReportFunnel = {
    totalLeads: number;
    qualifiedLeads: number;
    wonLeads: number;
    qualifiedRate: number;
    wonRate: number;
};

// Resposta única de GET /reports/summary — alimenta as features 5, 6 e 7 (Budget x
// Investimento, cards CPA/SQL/CPV, funil de conversão) num só request. Leads seguem os dias
// do período; budget/investimento, os meses cheios listados em budgetMonths.
export type ReportSummary = {
    startDate: string;
    endDate: string;
    budgetMonths: string[];
    budget: {
        total: number;
        byChannel: BudgetChannelBreakdown[];
    };
    investment: {
        total: number;
        // Investimento do mesmo número de meses imediatamente anterior.
        previousPeriodTotal: number;
        percentChange: number;
    };
    conversionsByChannel: ChannelConversion[];
    cpa: number | null;
    sql: number;
    cpv: number | null;
    funnel: ReportFunnel;
};
