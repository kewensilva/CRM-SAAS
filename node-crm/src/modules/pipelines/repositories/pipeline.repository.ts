import type { Prisma } from "../../../../generated/prisma/client";
import { prisma } from "../../../shared/database/prisma-client";
import { stripUndefined } from "../../../shared/helpers/nullable-fields";
import type { CreatePipelineDTO, UpdatePipelineDTO } from "../dto/create-pipeline.dto";
import type { Pipeline } from "../types/pipeline.types";

const create = (data: CreatePipelineDTO): Promise<Pipeline> => {
    return prisma.pipeline.create({ data });
};

const findByIdAndTenant = (id: string, tenantId: string): Promise<Pipeline | null> => {
    return prisma.pipeline.findFirst({
        where: { id, tenantId, deletedAt: null },
    });
};

const listByTenant = (tenantId: string): Promise<Pipeline[]> => {
    return prisma.pipeline.findMany({
        where: { tenantId, deletedAt: null },
        orderBy: { createdAt: "asc" },
    });
};

const update = (id: string, data: UpdatePipelineDTO): Promise<Pipeline> => {
    const updateData = stripUndefined(data) as unknown as Prisma.PipelineUpdateInput;

    return prisma.pipeline.update({ where: { id }, data: updateData });
};

const softDelete = (id: string): Promise<Pipeline> => {
    return prisma.pipeline.update({ where: { id }, data: { deletedAt: new Date() } });
};

export const pipelineRepository = {
    create,
    findByIdAndTenant,
    listByTenant,
    update,
    softDelete,
};
