export type Pipeline = {
    id: string;
    tenantId: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
};

export type PipelineStageStatus = "ACTIVE" | "INACTIVE";

export type PipelineStage = {
    id: string;
    tenantId: string;
    pipelineId: string;
    name: string;
    order: number;
    color: string | null;
    status: PipelineStageStatus;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
};
