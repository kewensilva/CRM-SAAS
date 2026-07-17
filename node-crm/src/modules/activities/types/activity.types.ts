export type ActivityStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export type Activity = {
    id: string;
    tenantId: string;
    dealId: string | null;
    leadId: string | null;
    responsibleUserId: string;
    title: string;
    dueDate: Date;
    status: ActivityStatus;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
};
