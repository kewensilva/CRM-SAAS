export type UpdateTenantDTO = {
    name?: string | undefined;
    tradeName?: string | undefined;
    domain?: string | undefined;
    status?: "ACTIVE" | "INACTIVE" | undefined;
};
