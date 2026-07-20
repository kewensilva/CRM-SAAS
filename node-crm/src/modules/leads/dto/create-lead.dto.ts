export type CreateLeadDTO = {
    tenantId: string;
    companyId?: string | undefined;
    responsibleUserId: string;
    name: string;
    email?: string | undefined;
    phone?: string | undefined;
    cpf?: string | undefined;
    location?: string | undefined;
    referralSource?: string | undefined;
    notes?: string | undefined;
};
