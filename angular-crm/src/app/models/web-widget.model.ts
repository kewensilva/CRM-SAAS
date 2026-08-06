export type DuplicateLeadStrategy = 'IGNORE' | 'UPDATE';
export type WebWidgetLogStatus = 'RECEIVED' | 'PROCESSED' | 'DUPLICATE' | 'FAILED';
export type WidgetButtonContentType = 'TEXT' | 'ICON';

// Conjunto fixo embutido no próprio widget.js — não é upload nem URL livre.
export const WIDGET_BUTTON_ICONS = ['chat', 'message', 'whatsapp', 'help', 'phone', 'cart'] as const;
export type WidgetButtonIcon = (typeof WIDGET_BUTTON_ICONS)[number];

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
  buttonContentType: WidgetButtonContentType;
  buttonIcon: WidgetButtonIcon | null;
  buttonColor: string;
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
