export type Contact = {
    id: string;
    tenantId: string;
    companyId: string;
    name: string;
    position: string | null;
    email: string | null;
    phone: string | null;
    mobile: string | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
};
