export type DuplicateLeadStrategy = 'IGNORE' | 'UPDATE';
export type MetaIntegrationLogStatus = 'RECEIVED' | 'PROCESSED' | 'DUPLICATE' | 'FAILED';

export interface MetaIntegration {
  id: string;
  tenantId: string;
  enabled: boolean;
  pageId: string | null;
    pageName: string | null;
  // A API nunca devolve o token da Página — só informa se ele existe.
  hasPageToken: boolean;
  defaultResponsibleUserId: string | null;
  duplicateStrategy: DuplicateLeadStrategy;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface MetaIntegrationLog {
  id: string;
  tenantId: string | null;
  leadId: string | null;
  leadgenId: string;
  pageId: string | null;
  formId: string | null;
  adId: string | null;
  status: MetaIntegrationLogStatus;
  errorMessage: string | null;
  rawPayload: string;
  createdAt: string;
  updatedAt: string;
}

// Página do Facebook que o usuário autorizou no "Conectar com o Facebook".
export interface MetaOAuthPage {
  id: string;
  name: string;
}

export interface MetaOAuthExchangeResult {
  sessionId: string;
  pages: MetaOAuthPage[];
}
// Checklist da conexão: cada item traz o valor ou o motivo de não ter conseguido verificar.
export type MetaHealthCheck<T> = { value: T; error: null } | { value: null; error: string };

export interface MetaConnectionHealth {
  connected: boolean;
  page: { id: string; name: string | null } | null;
  instagram: MetaHealthCheck<{ id: string; username: string | null } | null>;
  webhookSubscribed: MetaHealthCheck<boolean>;
  forms: MetaHealthCheck<{ id: string; name: string; status: string }[]>;
  hasDefaultResponsible: boolean;
  enabled: boolean;
  lastLead: { receivedAt: string; status: MetaIntegrationLogStatus } | null;
}
