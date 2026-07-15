export type CompanyStatus = "ACTIVE" | "INACTIVE";

export type Company = {
    id: string;
    tenantId: string;
    name: string;
    document: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    street: string | null;
    number: string | null;
    district: string | null;
    city: string | null;
    state: string | null;
    zipCode: string | null;
    country: string | null;
    notes: string | null;
    status: CompanyStatus;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
};
