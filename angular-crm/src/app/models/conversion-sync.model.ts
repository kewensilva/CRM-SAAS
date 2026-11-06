export type ConversionSource = 'RD_STATION_MARKETING' | 'RD_STATION_CRM' | 'BITRIX24';
export type ConversionTrigger = 'NEW_CONVERSION' | 'OPPORTUNITY' | 'LIFECYCLE_STAGE' | 'DEAL_STAGE' | 'DEAL_WON';
export type ConversionWebhookStatus = 'RECEIVED' | 'PROCESSED' | 'IGNORED' | 'FAILED' | 'REJECTED';
export type ConversionUploadStatus = 'PENDING' | 'SENT' | 'FAILED';

export interface ConversionRule {
  id: string;
  integrationId: string;
  name: string;
  trigger: ConversionTrigger;
  triggerValue: string | null;
  conversionActionId: string;
  sendValue: boolean;
  enabled: boolean;
}

// Segredos nunca voltam da API — só se existem (has*).
export interface ConversionIntegration {
  id: string;
  name: string;
  source: ConversionSource;
  enabled: boolean;
  webhookToken: string;
  googleAdsCustomerId: string | null;
  gclidField: string | null;
  currencyCode: string;
  hasSourceApiUrl: boolean;
  hasSourceApiToken: boolean;
  hasWebhookSecret: boolean;
  rules: ConversionRule[];
  createdAt: string;
}

// undefined = não alterar; "" = apagar (segredos e campos opcionais).
export interface SaveConversionIntegrationPayload {
  name?: string;
  source?: ConversionSource;
  enabled?: boolean;
  googleAdsCustomerId?: string;
  gclidField?: string;
  sourceApiUrl?: string;
  sourceApiToken?: string;
  webhookSecret?: string;
}

export interface SaveConversionRulePayload {
  name: string;
  trigger: ConversionTrigger;
  triggerValue: string;
  conversionActionId: string;
  sendValue: boolean;
}

export interface ConversionUploadLog {
  id: string;
  externalId: string;
  transactionId: string;
  gclid: string | null;
  hasEmail: boolean;
  hasPhone: boolean;
  conversionValue: string | null;
  occurredAt: string;
  status: ConversionUploadStatus;
  errorMessage: string | null;
  createdAt: string;
  rule: { name: string };
}

export interface ConversionWebhookLog {
  id: string;
  status: ConversionWebhookStatus;
  errorMessage: string | null;
  createdAt: string;
}

export interface ConversionLogs {
  uploads: ConversionUploadLog[];
  webhooks: ConversionWebhookLog[];
}
