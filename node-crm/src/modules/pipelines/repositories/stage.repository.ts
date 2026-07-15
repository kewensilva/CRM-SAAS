import type { Prisma } from "../../../../generated/prisma/client";
import { prisma } from "../../../shared/database/prisma-client";
import { stripUndefined, undefinedToNull } from "../../../shared/helpers/nullable-fields";
import type { CreateStageDTO, ReorderStagesDTO, UpdateStageDTO } from "../dto/create-stage.dto";
import type { PipelineStage } from "../types/pipeline.types";

// Deslocamento usado para "estacionar" as ordens temporariamente durante o reorder,
// evitando colisão com a constraint única (pipelineId, order) no meio da transação.
const REORDER_OFFSET = 1_000_000;

const create = (data: CreateStageDTO): Promise<PipelineStage> => {
    const createData = undefinedToNull(data) as unknown as Prisma.PipelineStageCreateInput;

    return prisma.pipelineStage.create({ data: createData });
};

const findByIdAndTenant = (id: string, tenantId: string): Promise<PipelineStage | null> => {
    return prisma.pipelineStage.findFirst({
        where: { id, tenantId, deletedAt: null },
    });
};

const listByPipeline = (pipelineId: string, tenantId: string): Promise<PipelineStage[]> => {
    return prisma.pipelineStage.findMany({
        where: { pipelineId, tenantId, deletedAt: null },
        orderBy: { order: "asc" },
    });
};

const findByOrder = (pipelineId: string, order: number): Promise<PipelineStage | null> => {
    return prisma.pipelineStage.findFirst({
        where: { pipelineId, order, deletedAt: null },
    });
};

const update = (id: string, data: UpdateStageDTO): Promise<PipelineStage> => {
    const updateData = stripUndefined(data) as unknown as Prisma.PipelineStageUpdateInput;

    return prisma.pipelineStage.update({ where: { id }, data: updateData });
};

const softDelete = (id: string): Promise<PipelineStage> => {
    return prisma.pipelineStage.update({ where: { id }, data: { deletedAt: new Date() } });
};

const reorder = (items: ReorderStagesDTO): Promise<PipelineStage[]> => {
    return prisma.$transaction(async (tx) => {
        for (const item of items) {
            await tx.pipelineStage.update({
                where: { id: item.id },
                data: { order: item.order + REORDER_OFFSET },
            });
        }

        const updated: PipelineStage[] = [];

        for (const item of items) {
            const stage = await tx.pipelineStage.update({
                where: { id: item.id },
                data: { order: item.order },
            });

            updated.push(stage);
        }

        return updated;
    });
};

export const stageRepository = {
    create,
    findByIdAndTenant,
    listByPipeline,
    findByOrder,
    update,
    softDelete,
    reorder,
};
