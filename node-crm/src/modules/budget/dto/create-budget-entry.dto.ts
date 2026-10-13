export type CreateBudgetEntryDTO = {
    tenantId: string;
    channelName: string;
    month: Date;
    budget?: number | undefined;
    investment?: number | undefined;
};

export type UpdateBudgetEntryDTO = {
    channelName?: string | undefined;
    budget?: number | undefined;
    investment?: number | undefined;
};

export type CreateBudgetPeriodDTO = {
    tenantId: string;
    channelName: string;
    startMonth: Date;
    months: number;
    budget: number;
};