export type UpdateCompanyDTO = {
    name?: string | undefined;
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
    status?: "ACTIVE" | "INACTIVE" | undefined;
};
