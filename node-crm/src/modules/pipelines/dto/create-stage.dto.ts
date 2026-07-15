export type CreateStageDTO = {
    tenantId: string;
    pipelineId: string;
    name: string;
    order: number;
    color?: string | undefined;
};

export type UpdateStageDTO = {
    name?: string | undefined;
    color?: string | undefined;
    status?: "ACTIVE" | "INACTIVE" | undefined;
};

export type ReorderStagesDTO = {
    id: string;
    order: number;
}[];
