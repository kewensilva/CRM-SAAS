import { BusinessRuleError, NotFoundError } from "../../../shared/errors";
import type { ActivityStatus } from "../../../../generated/prisma/enums";
import { dealService } from "../../deals/services/deal.service";
import { leadRepository } from "../../leads/repositories/lead.repository";
import { userRepository } from "../../users/repositories/user.repository";
import type { CreateActivityDTO, UpdateActivityDTO } from "../dto/create-activity.dto";
import { activityRepository } from "../repositories/activity.repository";
import type { Activity } from "../types/activity.types";

const OPEN_STATUSES: ActivityStatus[] = ["PENDING", "IN_PROGRESS"];

const assertResponsibleExists = async (userId: string, tenantId: string) => {
    const responsible = await userRepository.findById(userId);

    if (!responsible || responsible.tenantId !== tenantId || responsible.status !== "ACTIVE") {
        throw new NotFoundError("Usuário responsável não encontrado.");
    }
};

const createActivity = async (data: CreateActivityDTO): Promise<Activity> => {
    if (data.dealId) {
        await dealService.getDeal(data.dealId, data.tenantId);
    }

    if (data.leadId) {
        const lead = await leadRepository.findByIdAndTenant(data.leadId, data.tenantId);

        if (!lead) {
            throw new NotFoundError("Lead não encontrado.");
        }
    }

    await assertResponsibleExists(data.responsibleUserId, data.tenantId);

    return activityRepository.create(data);
};

const getActivity = async (id: string, tenantId: string): Promise<Activity> => {
    const activity = await activityRepository.findByIdAndTenant(id, tenantId);

    if (!activity) {
        throw new NotFoundError("Atividade não encontrada.");
    }

    return activity;
};

const listActivities = (
    tenantId: string,
    dealId?: string | undefined,
    leadId?: string | undefined,
    status?: ActivityStatus | undefined,
): Promise<Activity[]> => {
    return activityRepository.listByTenant(tenantId, { dealId, leadId, status });
};

const updateActivity = async (
    id: string,
    tenantId: string,
    data: UpdateActivityDTO,
): Promise<Activity> => {
    await getActivity(id, tenantId);

    if (data.responsibleUserId) {
        await assertResponsibleExists(data.responsibleUserId, tenantId);
    }

    return activityRepository.update(id, data);
};

const deleteActivity = async (id: string, tenantId: string): Promise<void> => {
    await getActivity(id, tenantId);
    await activityRepository.softDelete(id);
};

const completeActivity = async (id: string, tenantId: string): Promise<Activity> => {
    const activity = await getActivity(id, tenantId);

    if (!OPEN_STATUSES.includes(activity.status)) {
        throw new BusinessRuleError("Atividade já encerrada.");
    }

    return activityRepository.updateStatus(id, "COMPLETED");
};

const cancelActivity = async (id: string, tenantId: string): Promise<Activity> => {
    const activity = await getActivity(id, tenantId);

    if (!OPEN_STATUSES.includes(activity.status)) {
        throw new BusinessRuleError("Atividade já encerrada.");
    }

    return activityRepository.updateStatus(id, "CANCELLED");
};

export const activityService = {
    createActivity,
    getActivity,
    listActivities,
    updateActivity,
    deleteActivity,
    completeActivity,
    cancelActivity,
};
