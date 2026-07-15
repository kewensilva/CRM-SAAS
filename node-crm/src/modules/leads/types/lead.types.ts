export type LeadStatus = "NEW" | "IN_PROGRESS" | "CONVERTED" | "LOST";

export type Lead = {
    id: string;
    name: string;
    email?: string | undefined;
    phone?: string | undefined;
    status: LeadStatus;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
};
