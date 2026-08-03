import type { Prisma } from "../../../../generated/prisma/client";
import type { DealStatus } from "../../../../generated/prisma/enums";
import { prisma } from "../../../shared/database/prisma-client";
import { stripUndefined } from "../../../shared/helpers/nullable-fields";
import { BusinessRuleError } from "../../../shared/errors";
import type { CreateDealDTO, UpdateDealDTO } from "../dto/create-deal.dto";
import type { Deal, DealStageHistoryEntry } from "../types/deal.types";

// Cria a negociação (aberta, IN_PROGRESS) e marca o Lead como EM_ANDAMENTO, registrando a
// primeira entrada do histórico de etapas — tudo em uma transação. O guard real contra
// duplicidade é `deal: null` no updateMany (Deal.leadId também é @unique no schema, uma
// segunda camada de proteção a nível de banco): se o Lead já tem uma negociação (criada por
// este fluxo OU pelo Kanban via createFinal), `count` vem 0 e a transação é desfeita.
const create = (data: CreateDealDTO, changedByUserId: string): Promise<Deal> => {
    return prisma.$transaction(async (tx) => {
        const conversion = await tx.lead.updateMany({
            where: { id: data.leadId, deal: null },
            data: { status: "EM_ANDAMENTO" },
        });

        if (conversion.count === 0) {
            throw new BusinessRuleError("Lead já possui uma negociação.");
        }

        const deal = await tx.deal.create({ data });

        await tx.dealStageHistory.create({
            data: {
                tenantId: data.tenantId,
                dealId: deal.id,
                fromStageId: null,
                toStageId: data.stageId,
                changedByUserId,
            },
        });

        return deal;
    });
};

// Kanban de Leads: mover um card pra Vendido/Perdido cria a negociação já finalizada
// (WON/LOST, com value/lostReason) em vez de nascer IN_PROGRESS — sem etapa/pipeline
// escolhida manualmente (auto-resolvidos pelo service), sem histórico de etapa inicial
// (a negociação nunca esteve "em andamento" numa etapa visível do Kanban de Pipeline).
// Mesmo guard atômico `deal: null` do `create` acima.
const createFinal = (
    data: CreateDealDTO & { status: "WON" | "LOST"; value: number | null; lostReason: string | null },
): Promise<Deal> => {
    return prisma.$transaction(async (tx) => {
        const conversion = await tx.lead.updateMany({
            where: { id: data.leadId, deal: null },
            data: { status: data.status === "WON" ? "VENDIDO" : "PERDIDO" },
        });

        if (conversion.count === 0) {
            throw new BusinessRuleError("Lead já finalizado.");
        }

        return tx.deal.create({ data });
    });
};

const findByIdAndTenant = (id: string, tenantId: string): Promise<Deal | null> => {
    return prisma.deal.findFirst({
        where: { id, tenantId, deletedAt: null },
    });
};

const listByTenant = (tenantId: string): Promise<Deal[]> => {
    return prisma.deal.findMany({
        where: { tenantId, deletedAt: null },
        orderBy: { createdAt: "desc" },
    });
};

const update = (id: string, data: UpdateDealDTO): Promise<Deal> => {
    const updateData = stripUndefined(data) as unknown as Prisma.DealUpdateInput;

    return prisma.deal.update({ where: { id }, data: updateData });
};

const softDelete = (id: string): Promise<Deal> => {
    return prisma.deal.update({ where: { id }, data: { deletedAt: new Date() } });
};

const updateStatus = (id: string, status: "WON" | "LOST"): Promise<Deal> => {
    return prisma.deal.update({ where: { id }, data: { status } });
};

// Move a negociação para uma nova etapa e registra a mudança no histórico — atômico:
// ou os dois acontecem, ou nenhum.
const changeStage = (
    dealId: string,
    tenantId: string,
    fromStageId: string,
    toStageId: string,
    changedByUserId: string,
): Promise<Deal> => {
    return prisma.$transaction(async (tx) => {
        const deal = await tx.deal.update({
            where: { id: dealId },
            data: { stageId: toStageId },
        });

        await tx.dealStageHistory.create({
            data: { tenantId, dealId, fromStageId, toStageId, changedByUserId },
        });

        return deal;
    });
};

const listHistoryByDeal = (dealId: string, tenantId: string): Promise<DealStageHistoryEntry[]> => {
    return prisma.dealStageHistory.findMany({
        where: { dealId, tenantId },
        orderBy: { changedAt: "asc" },
    });
};

const countByTenantAndStatus = (tenantId: string, status: DealStatus): Promise<number> => {
    return prisma.deal.count({ where: { tenantId, status, deletedAt: null } });
};

export const dealRepository = {
    create,
    createFinal,
    findByIdAndTenant,
    listByTenant,
    update,
    softDelete,
    updateStatus,
    changeStage,
    listHistoryByDeal,
    countByTenantAndStatus,
};
