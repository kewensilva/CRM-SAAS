import { NotFoundError } from "../../../shared/errors";
import type { CreatePipelineDTO, UpdatePipelineDTO } from "../dto/create-pipeline.dto";
import { pipelineRepository } from "../repositories/pipeline.repository";
import type { Pipeline } from "../types/pipeline.types";

const createPipeline = (data: CreatePipelineDTO): Promise<Pipeline> => {
    return pipelineRepository.create(data);
};

const getPipeline = async (id: string, tenantId: string): Promise<Pipeline> => {
    const pipeline = await pipelineRepository.findByIdAndTenant(id, tenantId);

    if (!pipeline) {
        throw new NotFoundError("Pipeline não encontrado.");
    }

    return pipeline;
};

const listPipelines = (tenantId: string): Promise<Pipeline[]> => {
    return pipelineRepository.listByTenant(tenantId);
};

const updatePipeline = async (
    id: string,
    tenantId: string,
    data: UpdatePipelineDTO,
): Promise<Pipeline> => {
    await getPipeline(id, tenantId);

    return pipelineRepository.update(id, data);
};

const deletePipeline = async (id: string, tenantId: string): Promise<void> => {
    await getPipeline(id, tenantId);
    await pipelineRepository.softDelete(id);
};

export const pipelineService = {
    createPipeline,
    getPipeline,
    listPipelines,
    updatePipeline,
    deletePipeline,
};
