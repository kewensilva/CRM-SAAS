import { prisma } from "../../../shared/database/prisma-client";

// Distribuição rotativa de Leads recebidos por integração (Web Widget / Meta Lead Ads)
// entre os Vendedores (profile USER) ativos do tenant, em ordem sequencial (mais antigo
// cadastrado primeiro) — feature "parâmetros" do Analista. Não se aplica à criação manual
// de Lead pela API (o próprio usuário autenticado já é o responsável, ver
// lead.controller.ts).
//
// Atômico numa única transação: lê o último vendedor atendido (LeadRoundRobinState),
// calcula o próximo da fila e já grava esse novo estado antes de devolver — evita que
// duas submissões simultâneas (ex.: dois leads do widget no mesmo segundo) calculem o
// mesmo "próximo" a partir do mesmo estado desatualizado.
//
// Sem vendedor ativo cadastrado, cai no fallbackUserId (defaultResponsibleUserId da
// integração) — mesmo comportamento de antes desta feature, pra não travar a criação do
// Lead (business-rules.md: "nenhum Lead deverá ser descartado sem registro").
const getNextResponsibleUserId = (tenantId: string, fallbackUserId: string): Promise<string> => {
    return prisma.$transaction(async (tx) => {
        const salespeople = await tx.user.findMany({
            where: { tenantId, profile: "USER", status: "ACTIVE", deletedAt: null },
            orderBy: { createdAt: "asc" },
            select: { id: true },
        });

        if (salespeople.length === 0) {
            return fallbackUserId;
        }

        const state = await tx.leadRoundRobinState.findUnique({ where: { tenantId } });
        const lastIndex = state
            ? salespeople.findIndex((salesperson) => salesperson.id === state.lastAssignedUserId)
            : -1;
        const nextIndex = (lastIndex + 1) % salespeople.length;
        const nextUserId = salespeople[nextIndex]!.id;

        await tx.leadRoundRobinState.upsert({
            where: { tenantId },
            update: { lastAssignedUserId: nextUserId },
            create: { tenantId, lastAssignedUserId: nextUserId },
        });

        return nextUserId;
    });
};

export const leadAssignmentRepository = {
    getNextResponsibleUserId,
};
