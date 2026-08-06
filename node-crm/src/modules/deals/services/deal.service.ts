import { BusinessRuleError, NotFoundError } from "../../../shared/errors";
import { companyRepository } from "../../companies/repositories/company.repository";
import { leadRepository } from "../../leads/repositories/lead.repository";
import type { LeadStatus } from "../../leads/types/lead.types";
import { pipelineRepository } from "../../pipelines/repositories/pipeline.repository";
import { stageRepository } from "../../pipelines/repositories/stage.repository";
import { pipelineService } from "../../pipelines/services/pipeline.service";
import { stageService } from "../../pipelines/services/stage.service";
import { userRepository } from "../../users/repositories/user.repository";
import type {
    ChangeStageDTO,
    ChangeStatusDTO,
    CreateDealDTO,
    MoveLeadStatusDTO,
    UpdateDealDTO,
} from "../dto/create-deal.dto";
import { dealRepository } from "../repositories/deal.repository";
import type { Deal, DealStageHistoryEntry } from "../types/deal.types";

const TERMINAL_LEAD_STATUSES: LeadStatus[] = ["VENDIDO", "PERDIDO"];
const SIMPLE_LEAD_STATUSES: LeadStatus[] = ["SEM_CONTATO", "NAO_ATENDE", "EM_ANDAMENTO"];

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

    // Guard definitivo (Lead já tem negociação) é o `deal: null` atômico dentro da
    // transação em dealRepository.create — aqui é só a validação amigável de empresa/
    // responsável/pipeline/etapa antes de chegar lá.
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

// Kanban de Leads: move o card entre as 5 colunas. SEM_CONTATO/NAO_ATENDE/EM_ANDAMENTO são
// só uma troca de status; VENDIDO/PERDIDO fecham uma negociação (ver plano da tela de
// Leads) — Pipeline/Etapa são resolvidos automaticamente (primeiro Pipeline do tenant,
// primeira Etapa dele), já que o Kanban não pede pro usuário escolher isso a cada card.
const moveLeadStatus = async (
    leadId: string,
    tenantId: string,
    data: MoveLeadStatusDTO,
): Promise<{ leadStatus: LeadStatus; budgetValue: unknown; deal: Deal | null }> => {
    const lead = await leadRepository.findByIdAndTenant(leadId, tenantId);

    if (!lead) {
        throw new NotFoundError("Lead não encontrado.");
    }

    if (TERMINAL_LEAD_STATUSES.includes(lead.status)) {
        throw new BusinessRuleError("Lead já finalizado.");
    }

    if (SIMPLE_LEAD_STATUSES.includes(data.status)) {
        const updated = await leadRepository.updateStatus(
            leadId,
            data.status,
            data.status === "EM_ANDAMENTO" ? (data.value ?? null) : undefined,
        );

        return { leadStatus: updated.status, budgetValue: updated.budgetValue, deal: null };
    }

    // Vendido/Perdido exigem passar por Em andamento primeiro — não é permitido pular
    // direto de Sem contato/Não atende pra uma negociação fechada.
    if (lead.status !== "EM_ANDAMENTO") {
        throw new BusinessRuleError(
            "Mova o Lead para \"Em andamento\" antes de marcar como Vendido ou Perdido.",
        );
    }

    // Leads sem empresa conhecida (ex.: vindos do widget do site, onde só se coleta a
    // pessoa) não têm como o sistema adivinhar a empresa — em vez de travar o vendedor
    // pedindo uma escolha manual, cria uma Empresa automática a partir dos próprios
    // dados do Lead. Fica vinculada ao Lead daí em diante (não repete a cada novo Deal).
    let companyId = lead.companyId;

    if (!companyId) {
        const autoCompany = await companyRepository.create({
            tenantId,
            name: lead.name,
            email: lead.email ?? undefined,
            phone: lead.phone ?? undefined,
        });

        await leadRepository.linkCompany(leadId, autoCompany.id);
        companyId = autoCompany.id;
    }

    const [pipeline] = await pipelineRepository.listByTenant(tenantId);

    if (!pipeline) {
        throw new BusinessRuleError("Configure um Pipeline antes de mover Leads para Vendido ou Perdido.");
    }

    const [stage] = await stageRepository.listByPipeline(pipeline.id, tenantId);

    if (!stage) {
        throw new BusinessRuleError("Configure ao menos uma Etapa no Pipeline antes de finalizar Leads.");
    }

    const deal = await dealRepository.createFinal({
        tenantId,
        leadId,
        companyId,
        responsibleUserId: lead.responsibleUserId,
        pipelineId: pipeline.id,
        stageId: stage.id,
        status: data.status === "VENDIDO" ? "WON" : "LOST",
        value: data.value ?? null,
        lostReason: data.lostReason ?? null,
    });

    return { leadStatus: data.status, budgetValue: lead.budgetValue, deal };
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
    moveLeadStatus,
};
