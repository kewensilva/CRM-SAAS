// tenantId nulo = motivo global cadastrado pelo Owner (baseline comum a todos os
// tenants); preenchido = motivo extra do próprio Tenant Admin, visível só no seu tenant.
export type LostReason = {
    id: string;
    tenantId: string | null;
    label: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
};
