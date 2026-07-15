import type { Prisma } from "../../../../generated/prisma/client";
import { prisma } from "../../../shared/database/prisma-client";
import { stripUndefined } from "../../../shared/helpers/nullable-fields";
import { BusinessRuleError } from "../../../shared/errors";
import type { CreateDealDTO, UpdateDealDTO } from "../dto/create-deal.dto";
import type { Deal, DealStageHistoryEntry } from "../types/deal.types";

// Cria a negociação, converte o Lead (única e não-reversível — business-rules.md > Leads >
// Conversão) e registra a primeira entrada do histórico de etapas, tudo em uma transação.
// O `updateMany` com filtro de status é o que garante atomicidade real contra conversão
// duplicada em requisições concorrentes: se o Lead já foi convertido por outra requisição
// entre a validação do service e este ponto, `count` vem 0 e a transação inteira é desfeita.
const create = (data: CreateDealDTO, changedByUserId: string): Promise<Deal> => {
    return prisma.$transaction(async (tx) => {
        const conversion = await tx.lead.updateMany({
            where: { id: data.leadId, status: { not: "CONVERTED" } },
            data: { status: "CONVERTED" },
        });

        if (conversion.count === 0) {
            throw new BusinessRuleError("Lead já convertido.");
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

export const dealRepository = {
    create,
    findByIdAndTenant,
    listByTenant,
    update,
    softDelete,
    updateStatus,
    changeStage,
    listHistoryByDeal,
};
