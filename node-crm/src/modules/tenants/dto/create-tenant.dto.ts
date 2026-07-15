export type CreateTenantDTO = {
    name: string;
    tradeName?: string | undefined;
    domain: string;
    adminName: string;
    adminEmail: string;
    adminPassword: string;
};
