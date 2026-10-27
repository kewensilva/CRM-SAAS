export interface BudgetChannelBreakdown {
  channelName: string;
  budget: number;
  investment: number;
}

export interface ChannelConversion {
  channelName: string;
  percentage: number;
}

export interface ReportFunnel {
  totalLeads: number;
  qualifiedLeads: number;
  wonLeads: number;
  qualifiedRate: number;
  wonRate: number;
}

// Período do Relatório: dias inclusive, "AAAA-MM-DD" (mesmo formato do <input type="date">).
export interface ReportPeriod {
  startDate: string;
  endDate: string;
}

// Leads seguem os dias do período; budget/investimento, os meses cheios de budgetMonths
// ("AAAA-MM") — o cadastro de budget é mensal.
export interface ReportSummary {
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
}
