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
// startDate/endDate nulos: o período ainda não começou (nada a consultar).
export type GoogleAnalyticsReport =
  | { configured: false }
  | {
      configured: true;
      propertyId: string;
      startDate: string | null;
      endDate: string | null;
      totals: GoogleAnalyticsTotals;
      byCity: GoogleAnalyticsCityRow[];
    };
