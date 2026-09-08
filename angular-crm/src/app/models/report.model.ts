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

export interface ReportSummary {
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
}
