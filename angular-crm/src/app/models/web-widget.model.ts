export type DuplicateLeadStrategy = 'IGNORE' | 'UPDATE';
export type WebWidgetLogStatus = 'RECEIVED' | 'PROCESSED' | 'DUPLICATE' | 'FAILED';

export interface WebWidgetIntegration {
  id: string;
  tenantId: string;
  enabled: boolean;
  publicKey: string;
  defaultResponsibleUserId: string | null;
  duplicateStrategy: DuplicateLeadStrategy;
  showEmailField: boolean;
  showPhoneField: boolean;
  showMessageField: boolean;
  buttonLabel: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface WebWidgetLog {
  id: string;
  tenantId: string | null;
  leadId: string | null;
  status: WebWidgetLogStatus;
  errorMessage: string | null;
  pageUrl: string | null;
  referrer: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  message: string | null;
  createdAt: string;
  updatedAt: string;
}
