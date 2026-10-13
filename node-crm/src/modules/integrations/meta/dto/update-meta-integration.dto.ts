export type UpdateMetaIntegrationDTO = {
    enabled?: boolean | undefined;
    // null = limpar o campo (usado ao desconectar a Página).
    pageId?: string | null | undefined;
    pageName?: string | null | undefined;
    pageAccessToken?: string | null | undefined;
    defaultResponsibleUserId?: string | undefined;
    duplicateStrategy?: "IGNORE" | "UPDATE" | undefined;
};