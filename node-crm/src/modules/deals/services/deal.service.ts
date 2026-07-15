import { BusinessRuleError, NotFoundError } from "../../../shared/errors";
import { companyRepository } from "../../companies/repositories/company.repository";
import { leadRepository } from "../../leads/repositories/lead.repository";
import { pipelineService } from "../../pipelines/services/pipeline.service";
import { stageService } from "../../pipelines/services/stage.service";
import { userRepository } from "../../users/repositories/user.repository";
import type {
    ChangeStageDTO,
    ChangeStatusDTO,
    CreateDealDTO,
    UpdateDealDTO,
} from "../dto/create-deal.dto";
import { dealRepository } from "../repositories/deal.repository";
import type { Deal, DealStageHistoryEntry } from "../types/deal.types";

const assertStageBelongsToPipeline = async (stageId: string, pipelineId: string, tenantId: string) => {
    const stage = await stageService.getStage(stageId, tenantId);

    if (stage.pipelineId !== pipelineId) {
        throw new BusinessRuleError("A etapa informada não pertence a este Pipeline.");
    }

    return stage;
};

const createDeal = async (data: CreateDealDTO, changedByUserId: string): Promise<Deal> => {
    const lead = await leadRepository.findByIdAndTenant(data.leadId, data.tenantId);

    if (!lead) {
        throw new NotFoundError("Lead não encontrado.");
    }

    if (lead.status === "CONVERTED") {
        throw new BusinessRuleError("Lead já convertido.");
    }

    const company = await companyRepository.findByIdAndTenant(data.companyId, data.tenantId);

    if (!company) {
        throw new NotFoundError("Empresa não encontrada.");
    }

    const responsible = await userRepository.findById(data.responsibleUserId);

    if (!responsible || responsible.tenantId !== data.tenantId || responsible.status !== "ACTIVE") {
        throw new NotFoundError("Usuário responsável não encontrado.");
    }

    await pipelineService.getPipeline(data.pipelineId, data.tenantId);
    await assertStageBelongsToPipeline(data.stageId, data.pipelineId, data.tenantId);

    return dealRepository.create(data, changedByUserId);
};

const getDeal = async (id: string, tenantId: string): Promise<Deal> => {
    const deal = await dealRepository.findByIdAndTenant(id, tenantId);

    if (!deal) {
        throw new NotFoundError("Negociação não encontrada.");
    }

    return deal;
};

const listDeals = (tenantId: string): Promise<Deal[]> => {
    return dealRepository.listByTenant(tenantId);
};

const updateDeal = async (id: string, tenantId: string, data: UpdateDealDTO): Promise<Deal> => {
    await getDeal(id, tenantId);

    if (data.responsibleUserId) {
        const responsible = await userRepository.findById(data.responsibleUserId);

        if (!responsible || responsible.tenantId !== tenantId || responsible.status !== "ACTIVE") {
            throw new NotFoundError("Usuário responsável não encontrado.");
        }
    }

    return dealRepository.update(id, data);
};

const deleteDeal = async (id: string, tenantId: string): Promise<void> => {
    await getDeal(id, tenantId);
    await dealRepository.softDelete(id);
};

const changeStage = async (
    id: string,
    tenantId: string,
    data: ChangeStageDTO,
    changedByUserId: string,
): Promise<Deal> => {
    const deal = await getDeal(id, tenantId);

    if (deal.status !== "IN_PROGRESS") {
        throw new BusinessRuleError("Negociação já encerrada.");
    }

    await assertStageBelongsToPipeline(data.stageId, deal.pipelineId, tenantId);

    if (data.stageId === deal.stageId) {
        return deal;
    }

    return dealRepository.changeStage(id, tenantId, deal.stageId, data.stageId, changedByUserId);
};

const changeStatus = async (
    id: string,
    tenantId: string,
    data: ChangeStatusDTO,
): Promise<Deal> => {
    const deal = await getDeal(id, tenantId);

    if (deal.status !== "IN_PROGRESS") {
        throw new BusinessRuleError("Negociação já encerrada.");
    }

    return dealRepository.updateStatus(id, data.status);
};

const listHistory = async (id: string, tenantId: string): Promise<DealStageHistoryEntry[]> => {
    await getDeal(id, tenantId);

    return dealRepository.listHistoryByDeal(id, tenantId);
};

export const dealService = {
    createDeal,
    getDeal,
    listDeals,
    updateDeal,
    deleteDeal,
    changeStage,
    changeStatus,
    listHistory,
};
