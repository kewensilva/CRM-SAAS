export type DealStatus = "IN_PROGRESS" | "WON" | "LOST";

export type Deal = {
    id: string;
    tenantId: string;
    leadId: string;
    companyId: string;
    responsibleUserId: string;
    pipelineId: string;
    stageId: string;
    status: DealStatus;
    value: unknown;
    lostReason: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
};

export type DealStageHistoryEntry = {
    id: string;
    tenantId: string;
    dealId: string;
    fromStageId: string | null;
    toStageId: string;
    changedByUserId: string;
    changedAt: Date;
};
