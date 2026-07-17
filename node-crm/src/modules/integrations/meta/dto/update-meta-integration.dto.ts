export type UpdateMetaIntegrationDTO = {
    enabled?: boolean | undefined;
    pageId?: string | undefined;
    pageAccessToken?: string | undefined;
    defaultResponsibleUserId?: string | undefined;
    duplicateStrategy?: "IGNORE" | "UPDATE" | undefined;
};
