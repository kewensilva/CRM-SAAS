export type DuplicateLeadStrategy = "IGNORE" | "UPDATE";
export type MetaIntegrationLogStatus = "RECEIVED" | "PROCESSED" | "DUPLICATE" | "FAILED";

export type MetaIntegration = {
    id: string;
    tenantId: string;
    enabled: boolean;
    pageId: string | null;
    pageAccessToken: string | null;
    defaultResponsibleUserId: string | null;
    duplicateStrategy: DuplicateLeadStrategy;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
};

export type MetaIntegrationLog = {
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
    createdAt: Date;
    updatedAt: Date;
};

// Formato oficial do webhook da Meta para o campo "leadgen".
// https://developers.facebook.com/docs/graph-api/webhooks/reference/page/#leadgen
export type MetaWebhookPayload = {
    object: string;
    entry: {
        id: string;
        time: number;
        changes: {
            field: string;
            value: {
                leadgen_id: string;
                page_id: string;
                form_id: string;
                adgroup_id?: string;
                ad_id?: string;
                created_time: number;
            };
        }[];
    }[];
};

// Formato do retorno da Graph API para GET /{leadgen_id}.
export type MetaLeadFieldData = {
    field_data: { name: string; values: string[] }[];
};
