export type LeadStatus = "NEW" | "IN_PROGRESS" | "CONVERTED" | "LOST";

export type Lead = {
    id: string;
    tenantId: string;
    responsibleUserId: string;
    name: string;
    email: string | null;
    phone: string | null;
    status: LeadStatus;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
};
