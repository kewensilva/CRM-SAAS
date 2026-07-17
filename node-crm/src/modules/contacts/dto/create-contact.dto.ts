export type CreateContactDTO = {
    tenantId: string;
    companyId: string;
    name: string;
    position?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    mobile?: string | undefined;
    notes?: string | undefined;
};
