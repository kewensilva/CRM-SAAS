// serviceAccountEmail: e-mail que o cliente adiciona como Leitor na propriedade GA4.
export interface GoogleAnalyticsSettings {
  enabled: boolean;
  propertyId: string | null;
  serviceAccountEmail: string | null;
  credentialsConfigured: boolean;
}

export interface GoogleAnalyticsCityRow {
  city: string;
  activeUsers: number;
}

export interface GoogleAnalyticsTotals {
  activeUsers: number;
  newUsers: number;
  sessions: number;
}

// Sem integração ativa a API responde { configured: false } — a página só orienta a configurar.
export type GoogleAnalyticsMonthlyReport =
  | { configured: false }
  | {
      configured: true;
      propertyId: string;
      month: string;
      startDate: string;
      endDate: string;
      totals: GoogleAnalyticsTotals;
      byCity: GoogleAnalyticsCityRow[];
    };
