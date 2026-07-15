export type CreateActivityDTO = {
    tenantId: string;
    dealId?: string | undefined;
    leadId?: string | undefined;
    responsibleUserId: string;
    title: string;
    dueDate: Date;
};

export type UpdateActivityDTO = {
    title?: string | undefined;
    dueDate?: Date | undefined;
    responsibleUserId?: string | undefined;
};
