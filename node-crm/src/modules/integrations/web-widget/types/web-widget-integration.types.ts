export type DuplicateLeadStrategy = "IGNORE" | "UPDATE";
export type WebWidgetLogStatus = "RECEIVED" | "PROCESSED" | "DUPLICATE" | "FAILED";

export type WebWidgetIntegration = {
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
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
};

export type WebWidgetLog = {
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
    rawPayload: string;
    createdAt: Date;
    updatedAt: Date;
};

// Payload enviado pelo widget.js embutido no site do cliente.
export type WebWidgetSubmissionPayload = {
    publicKey: string;
    name: string;
    email?: string | undefined;
    phone?: string | undefined;
    message?: string | undefined;
    utmSource?: string | undefined;
    utmMedium?: string | undefined;
    utmCampaign?: string | undefined;
    utmTerm?: string | undefined;
    utmContent?: string | undefined;
    pageUrl?: string | undefined;
    referrer?: string | undefined;
    website?: string | undefined; // honeypot — se preenchido, é bot
};
