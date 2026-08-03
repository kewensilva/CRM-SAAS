export type DuplicateLeadStrategy = 'IGNORE' | 'UPDATE';
export type MetaIntegrationLogStatus = 'RECEIVED' | 'PROCESSED' | 'DUPLICATE' | 'FAILED';

export interface MetaIntegration {
  id: string;
  tenantId: string;
  enabled: boolean;
  pageId: string | null;
  pageAccessToken: string | null;
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
