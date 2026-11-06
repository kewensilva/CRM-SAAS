import type {
    ConversionSource,
    ConversionTrigger,
    ConversionUploadStatus,
    ConversionWebhookStatus,
} from "../../../../../generated/prisma/enums";

export type { ConversionSource, ConversionTrigger, ConversionUploadStatus, ConversionWebhookStatus };

export type ConversionIntegration = {
    id: string;
    tenantId: string;
    name: string;
    source: ConversionSource;
    enabled: boolean;
    webhookToken: string;
    googleAdsCustomerId: string | null;
    gclidField: string | null;
    sourceApiUrl: string | null;
    sourceApiToken: string | null;
    webhookSecret: string | null;
    currencyCode: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
};

export type ConversionRule = {
    id: string;
    tenantId: string;
    integrationId: string;
    name: string;
    trigger: ConversionTrigger;
    triggerValue: string | null;
    conversionActionId: string;
    sendValue: boolean;
    enabled: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
};

// O que o navegador recebe: nunca os segredos, só se existem.
export type ConversionIntegrationPublic = Omit<
    ConversionIntegration,
    "sourceApiUrl" | "sourceApiToken" | "webhookSecret" | "deletedAt"
> & {
    hasSourceApiUrl: boolean;
    hasSourceApiToken: boolean;
    hasWebhookSecret: boolean;
    rules: ConversionRule[];
};

// O que cada origem informa sobre o evento recebido — a regra decide se vira conversão.
export type SourceSignals = {
    // RD Marketing: conversão em formulário/LP, com o identificador da conversão.
    newConversion?: { identifier: string };
    opportunity?: boolean;
    lifecycleStage?: string;
    // RD CRM / Bitrix24: etapa atual do negócio (id e nome, quando houver) e se foi ganho.
    dealStage?: string[];
    dealWon?: boolean;
};

// Evento da origem já traduzido para um formato único. Dados de contato em texto puro — só
// viram hash na hora do envio ao Google.
export type NormalizedSourceEvent = {
    externalId: string;
    signals: SourceSignals;
    email: string | null;
    phone: string | null;
    gclid: string | null;
    value: number | null;
    occurredAt: Date;
    // Diferencia duas conversões do mesmo contato (ex.: duas conversões de formulário).
    eventKey: string;
};
