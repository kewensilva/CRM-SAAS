export type CreateDealDTO = {
    tenantId: string;
    leadId: string;
    companyId: string;
    responsibleUserId: string;
    pipelineId: string;
    stageId: string;
};

export type UpdateDealDTO = {
    responsibleUserId?: string | undefined;
};

export type ChangeStageDTO = {
    stageId: string;
};

export type ChangeStatusDTO = {
    status: "WON" | "LOST";
};
