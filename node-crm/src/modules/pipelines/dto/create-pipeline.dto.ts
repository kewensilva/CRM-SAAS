export type CreatePipelineDTO = {
    tenantId: string;
    name: string;
};

export type UpdatePipelineDTO = {
    name?: string | undefined;
};
