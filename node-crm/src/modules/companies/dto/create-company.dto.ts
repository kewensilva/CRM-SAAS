export type CreateCompanyDTO = {
    tenantId: string;
    name: string;
    document?: string | undefined;
    phone?: string | undefined;
    email?: string | undefined;
    website?: string | undefined;
    street?: string | undefined;
    number?: string | undefined;
    district?: string | undefined;
    city?: string | undefined;
    state?: string | undefined;
    zipCode?: string | undefined;
    country?: string | undefined;
    notes?: string | undefined;
};
