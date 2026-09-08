export type DuplicateLeadStrategy = "IGNORE" | "UPDATE";
export type WebWidgetLogStatus = "RECEIVED" | "PROCESSED" | "DUPLICATE" | "FAILED";
export type WidgetButtonContentType = "TEXT" | "ICON";

// key identifica o campo de forma estável (liga a resposta enviada pelo widget.js à
// pergunta configurada) — label é o texto exibido pro visitante do site. Ordem no array =
// ordem de exibição no formulário.
export type WebWidgetMessageField = {
    key: string;
    label: string;
};

export type WebWidgetIntegration = {
    id: string;
    tenantId: string;
    enabled: boolean;
    publicKey: string;
    defaultResponsibleUserId: string | null;
    duplicateStrategy: DuplicateLeadStrategy;
    showEmailField: boolean;
    showPhoneField: boolean;
    messageFields: WebWidgetMessageField[];
    buttonLabel: string;
    buttonContentType: WidgetButtonContentType;
    buttonIcon: string | null;
    buttonColor: string;
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

// Payload enviado pelo widget.js embutido no site do cliente. messageAnswers é um mapa
// key (do WebWidgetMessageField configurado) -> resposta do visitante — substitui o antigo
// campo "message" único.
export type WebWidgetSubmissionPayload = {
    publicKey: string;
    name: string;
    email?: string | undefined;
    phone?: string | undefined;
    messageAnswers?: Record<string, string> | undefined;
    utmSource?: string | undefined;
    utmMedium?: string | undefined;
    utmCampaign?: string | undefined;
    utmTerm?: string | undefined;
    utmContent?: string | undefined;
    pageUrl?: string | undefined;
    referrer?: string | undefined;
    website?: string | undefined; // honeypot — se preenchido, é bot
};
