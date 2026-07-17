import type { Prisma } from "../../../../generated/prisma/client";
import { prisma } from "../../../shared/database/prisma-client";
import { stripUndefined, undefinedToNull } from "../../../shared/helpers/nullable-fields";
import type { ActivityStatus } from "../../../../generated/prisma/enums";
import type { CreateActivityDTO, UpdateActivityDTO } from "../dto/create-activity.dto";
import type { Activity } from "../types/activity.types";

const create = (data: CreateActivityDTO): Promise<Activity> => {
    const createData = undefinedToNull(data) as unknown as Prisma.ActivityCreateInput;

    return prisma.activity.create({ data: createData });
};

const findByIdAndTenant = (id: string, tenantId: string): Promise<Activity | null> => {
    return prisma.activity.findFirst({
        where: { id, tenantId, deletedAt: null },
    });
};

const listByTenant = (
    tenantId: string,
    params: {
        dealId?: string | undefined;
        leadId?: string | undefined;
        status?: ActivityStatus | undefined;
    },
): Promise<Activity[]> => {
    return prisma.activity.findMany({
        where: {
            tenantId,
            deletedAt: null,
            ...(params.dealId ? { dealId: params.dealId } : {}),
            ...(params.leadId ? { leadId: params.leadId } : {}),
            ...(params.status ? { status: params.status } : {}),
        },
        orderBy: { dueDate: "asc" },
    });
};

const update = (id: string, data: UpdateActivityDTO): Promise<Activity> => {
    const updateData = stripUndefined(data) as unknown as Prisma.ActivityUpdateInput;

    return prisma.activity.update({ where: { id }, data: updateData });
};

const updateStatus = (id: string, status: ActivityStatus): Promise<Activity> => {
    return prisma.activity.update({ where: { id }, data: { status } });
};

const softDelete = (id: string): Promise<Activity> => {
    return prisma.activity.update({ where: { id }, data: { deletedAt: new Date() } });
};

const countByTenantAndStatus = (tenantId: string, status: ActivityStatus): Promise<number> => {
    return prisma.activity.count({ where: { tenantId, status, deletedAt: null } });
};

export const activityRepository = {
    create,
    findByIdAndTenant,
    listByTenant,
    update,
    updateStatus,
    softDelete,
    countByTenantAndStatus,
};
