import { BusinessRuleError, ConflictError, NotFoundError } from "../../../shared/errors";
import type { CreateStageDTO, ReorderStagesDTO, UpdateStageDTO } from "../dto/create-stage.dto";
import { stageRepository } from "../repositories/stage.repository";
import type { PipelineStage } from "../types/pipeline.types";
import { pipelineService } from "./pipeline.service";

const createStage = async (
    pipelineId: string,
    tenantId: string,
    data: Omit<CreateStageDTO, "tenantId" | "pipelineId">,
): Promise<PipelineStage> => {
    await pipelineService.getPipeline(pipelineId, tenantId);

    const existing = await stageRepository.findByOrder(pipelineId, data.order);

    if (existing) {
        throw new ConflictError("Já existe uma etapa com esta ordem neste Pipeline.");
    }

    return stageRepository.create({ ...data, tenantId, pipelineId });
};

const getStage = async (id: string, tenantId: string): Promise<PipelineStage> => {
    const stage = await stageRepository.findByIdAndTenant(id, tenantId);

    if (!stage) {
        throw new NotFoundError("Etapa não encontrada.");
    }

    return stage;
};

const listStages = async (pipelineId: string, tenantId: string): Promise<PipelineStage[]> => {
    await pipelineService.getPipeline(pipelineId, tenantId);

    return stageRepository.listByPipeline(pipelineId, tenantId);
};

const updateStage = async (
    id: string,
    tenantId: string,
    data: UpdateStageDTO,
): Promise<PipelineStage> => {
    await getStage(id, tenantId);

    return stageRepository.update(id, data);
};

const deleteStage = async (id: string, tenantId: string): Promise<void> => {
    await getStage(id, tenantId);
    await stageRepository.softDelete(id);
};

const reorderStages = async (
    pipelineId: string,
    tenantId: string,
    items: ReorderStagesDTO,
): Promise<PipelineStage[]> => {
    await pipelineService.getPipeline(pipelineId, tenantId);

    const currentStages = await stageRepository.listByPipeline(pipelineId, tenantId);
    const currentIds = new Set(currentStages.map((stage) => stage.id));
    const providedIds = new Set(items.map((item) => item.id));

    const sameSize = currentIds.size === providedIds.size;
    const allBelong = items.every((item) => currentIds.has(item.id));

    if (!sameSize || !allBelong) {
        throw new BusinessRuleError(
            "A reordenação deve informar exatamente todas as etapas ativas do Pipeline.",
        );
    }

    return stageRepository.reorder(items);
};

export const stageService = {
    createStage,
    getStage,
    listStages,
    updateStage,
    deleteStage,
    reorderStages,
};
