export type GoogleAdsConversionTrigger = 'LEAD_CREATED' | 'LEAD_QUALIFIED' | 'LEAD_WON';
export type GoogleAdsLeadOrigin = 'SITE' | 'META' | 'MANUAL';
export type GoogleAdsUploadStatus = 'PENDING' | 'SENT' | 'FAILED';

// O refresh token nunca volta da API — só se a conta está conectada.
export interface GoogleAdsConnection {
  connected: boolean;
  googleEmail: string | null;
  customerId: string | null;
  customerName: string | null;
  loginCustomerId: string | null;
  oauthConfigured: boolean;
  listingAvailable: boolean;
}

export interface GoogleAdsAccount {
  customerId: string;
  name: string | null;
  loginCustomerId: string;
}

export interface GoogleAdsConversionAction {
  id: string;
  name: string;
}

export interface GoogleAdsRule {
  id: string;
  name: string;
  trigger: GoogleAdsConversionTrigger;
  originFilter: GoogleAdsLeadOrigin | null;
  conversionActionId: string;
  conversionActionName: string | null;
  sendValue: boolean;
  enabled: boolean;
  createdAt: string;
}

export interface SaveGoogleAdsRulePayload {
  name: string;
  trigger: GoogleAdsConversionTrigger;
  originFilter: GoogleAdsLeadOrigin | null;
  conversionActionId: string;
  conversionActionName: string | null;
  sendValue: boolean;
  enabled: boolean;
}

export interface GoogleAdsUpload {
  id: string;
  ruleId: string;
  ruleName: string;
  leadId: string;
  leadName: string;
  status: GoogleAdsUploadStatus;
  hasGclid: boolean;
  hasEmail: boolean;
  hasPhone: boolean;
  conversionValue: number | null;
  errorMessage: string | null;
  createdAt: string;
}
