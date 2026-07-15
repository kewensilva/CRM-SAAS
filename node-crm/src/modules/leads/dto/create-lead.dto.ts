export type CreateLeadDTO = {
    tenantId: string;
    responsibleUserId: string;
    name: string;
    email?: string | undefined;
    phone?: string | undefined;
};
