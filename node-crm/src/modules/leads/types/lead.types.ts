export type LeadStatus = "NEW" | "IN_PROGRESS" | "CONVERTED" | "LOST";

export type Lead = {
    id: string;
    tenantId: string;
    companyId: string | null;
    responsibleUserId: string;
    name: string;
    email: string | null;
    phone: string | null;
    cpf: string | null;
    location: string | null;
    referralSource: string | null;
    notes: string | null;
    status: LeadStatus;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
};
