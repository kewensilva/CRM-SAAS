import type { UserAccessType } from "../../../../generated/prisma/enums";
import { prisma } from "../../../shared/database/prisma-client";

type CreateAccessLogData = {
    userId: string;
    tenantId: string | null;
    type: UserAccessType;
};

export type AnalystActivityRow = {
    analystId: string;
    name: string;
    email: string;
    status: "ACTIVE" | "INACTIVE";
    // Logins + entradas na base de um cliente dentro do período.
    accessCount: number;
    // Mudanças de status de leads feitas pelo analista dentro do período (LeadHistory).
    leadActionsCount: number;
    // Último sinal de vida em qualquer período: acesso ou movimentação de lead.
    lastActivityAt: Date | null;
};

const create = async (data: CreateAccessLogData): Promise<void> => {
    await prisma.userAccessLog.create({ data });
};

const latest = (a: Date | null, b: Date | null): Date | null => {
    if (!a) {
        return b;
    }

    if (!b) {
        return a;
    }

    return a > b ? a : b;
};

// Analistas (perfil ANALYST) com acessos e movimentações de lead desde "since". Usa o id do
// analista como chave: ao trocar de empresa o token carrega sub = id do Analista real (ver
// switchTenant), então LeadHistory.changedByUserId e UserAccessLog.userId apontam para ele.
// 4 agrupamentos no banco em vez de carregar linhas e contar em memória.
const listAnalystActivity = async (since: Date): Promise<AnalystActivityRow[]> => {
    const analysts = await prisma.user.findMany({
        where: { profile: "ANALYST", deletedAt: null },
        select: { id: true, name: true, email: true, status: true },
        orderBy: { name: "asc" },
    });

    if (analysts.length === 0) {
        return [];
    }

    const ids = analysts.map((analyst) => analyst.id);

    const [accessesInPeriod, lastAccesses, actionsInPeriod, lastActions] = await Promise.all([
        prisma.userAccessLog.groupBy({
            by: ["userId"],
            where: { userId: { in: ids }, createdAt: { gte: since } },
            _count: { _all: true },
        }),
        prisma.userAccessLog.groupBy({
            by: ["userId"],
            where: { userId: { in: ids } },
            _max: { createdAt: true },
        }),
        prisma.leadHistory.groupBy({
            by: ["changedByUserId"],
            where: { changedByUserId: { in: ids }, changedAt: { gte: since } },
            _count: { _all: true },
        }),
        prisma.leadHistory.groupBy({
            by: ["changedByUserId"],
            where: { changedByUserId: { in: ids } },
            _max: { changedAt: true },
        }),
    ]);

    return analysts.map((analyst) => ({
        analystId: analyst.id,
        name: analyst.name,
        email: analyst.email,
        status: analyst.status,
        accessCount: accessesInPeriod.find((row) => row.userId === analyst.id)?._count._all ?? 0,
        leadActionsCount:
            actionsInPeriod.find((row) => row.changedByUserId === analyst.id)?._count._all ?? 0,
        lastActivityAt: latest(
            lastAccesses.find((row) => row.userId === analyst.id)?._max.createdAt ?? null,
            lastActions.find((row) => row.changedByUserId === analyst.id)?._max.changedAt ?? null,
        ),
    }));
};

export const accessLogRepository = {
    create,
    listAnalystActivity,
};
