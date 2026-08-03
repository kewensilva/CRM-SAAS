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
    value?: number | undefined;
    lostReason?: string | undefined;
};

export type ChangeStageDTO = {
    stageId: string;
};

export type ChangeStatusDTO = {
    status: "WON" | "LOST";
};

// Kanban de Leads — mover um card pra Vendido/Perdido (ver deal.service.ts > moveLeadStatus).
export type MoveLeadStatusDTO = {
    status: "SEM_CONTATO" | "NAO_ATENDE" | "EM_ANDAMENTO" | "VENDIDO" | "PERDIDO";
    value?: number | undefined;
    lostReason?: string | undefined;
};
