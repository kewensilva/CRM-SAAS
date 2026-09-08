export type BudgetChannelBreakdown = {
    channelName: string;
    budget: number;
    investment: number;
};

export type ChannelConversion = {
    channelName: string;
    // % das negociações Vendidas no mês atribuídas a este canal (por Lead.utmSource) —
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
// Investimento, cards CPA/SQL/CPV, funil de conversão) num só request, tudo escopado ao
// mesmo mês selecionado.
export type ReportSummary = {
    month: string;
    budget: {
        total: number;
        byChannel: BudgetChannelBreakdown[];
    };
    investment: {
        total: number;
        previousMonthTotal: number;
        percentChange: number;
    };
    conversionsByChannel: ChannelConversion[];
    cpa: number | null;
    sql: number;
    cpv: number | null;
    funnel: ReportFunnel;
};
