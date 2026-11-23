export type GoogleAdsConversionTrigger = "LEAD_CREATED" | "LEAD_QUALIFIED" | "LEAD_WON";
export type GoogleAdsLeadOrigin = "SITE" | "META" | "MANUAL";
export type GoogleAdsUploadStatus = "PENDING" | "SENT" | "FAILED";

export type GoogleAdsConnection = {
    id: string;
    tenantId: string;
    googleEmail: string | null;
    // Já descriptografado pelo repositório.
    refreshToken: string | null;
    customerId: string | null;
    customerName: string | null;
    loginCustomerId: string | null;
    currencyCode: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
};

// O que vai ao navegador: nunca o refresh token, só se a conta está conectada.
export type GoogleAdsConnectionPublic = {
    connected: boolean;
    googleEmail: string | null;
    customerId: string | null;
    customerName: string | null;
    loginCustomerId: string | null;
    // O servidor tem o cliente OAuth configurado (botão "Conectar" funciona)?
    oauthConfigured: boolean;
    // Com developer token, contas e ações de conversão vêm em listas.
    listingAvailable: boolean;
};

export type GoogleAdsConversionRule = {
    id: string;
    tenantId: string;
    connectionId: string;
    name: string;
    trigger: GoogleAdsConversionTrigger;
    originFilter: GoogleAdsLeadOrigin | null;
    conversionActionId: string;
    conversionActionName: string | null;
    sendValue: boolean;
    enabled: boolean;
    createdAt: Date;
    updatedAt: Date;
};

export type GoogleAdsConversionUpload = {
    id: string;
    tenantId: string;
    connectionId: string;
    ruleId: string;
    leadId: string;
    gclid: string | null;
    hasEmail: boolean;
    hasPhone: boolean;
    userIdentifiers: unknown;
    conversionValue: unknown;
    occurredAt: Date;
    status: GoogleAdsUploadStatus;
    googleRequestId: string | null;
    errorMessage: string | null;
    createdAt: Date;
    updatedAt: Date;
};

// loginCustomerId: conta por onde o usuário chega a esta (ele mesmo, ou o MCC acima dela).
export type GoogleAdsAccount = { customerId: string; name: string | null; loginCustomerId: string };
export type GoogleAdsConversionAction = { id: string; name: string };
