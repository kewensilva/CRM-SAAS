export type GoogleAnalyticsIntegration = {
    id: string;
    tenantId: string;
    enabled: boolean;
    propertyId: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
};

// O que a tela de Configurações recebe: a integração (se existir) e o e-mail da conta de
// serviço que o cliente precisa adicionar como Leitor na propriedade GA4.
export type GoogleAnalyticsSettings = {
    enabled: boolean;
    propertyId: string | null;
    serviceAccountEmail: string | null;
    credentialsConfigured: boolean;
};

export type GoogleAnalyticsCityRow = {
    city: string;
    activeUsers: number;
};

export type GoogleAnalyticsTotals = {
    activeUsers: number;
    newUsers: number;
    sessions: number;
};

// Sem integração ativa o Relatório não é erro: a página só mostra como configurar.
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

// Formato de resposta do runReport da Data API — só o que o CRM lê.
// https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/RunReportResponse
export type GaRunReportResponse = {
    rows?: {
        dimensionValues?: { value?: string }[];
        metricValues?: { value?: string }[];
    }[];
};
