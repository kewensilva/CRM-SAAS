export type TenantStatus = "ACTIVE" | "INACTIVE";

export type Tenant = {
    id: string;
    name: string;
    tradeName: string | null;
    domain: string;
    status: TenantStatus;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
};
