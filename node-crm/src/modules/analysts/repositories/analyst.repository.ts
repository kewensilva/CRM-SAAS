import { prisma } from "../../../shared/database/prisma-client";
import type { AnalystWithAccess } from "../types/analyst.types";

type CreateAnalystData = {
    name: string;
    email: string;
    passwordHash: string;
    tenantIds: string[];
};

const toAnalystWithAccess = (user: {
    id: string;
    name: string;
    email: string;
    status: "ACTIVE" | "INACTIVE";
    createdAt: Date;
    tenantAccess: { tenant: { id: string; name: string } }[];
}): AnalystWithAccess => ({
    id: user.id,
    name: user.name,
    email: user.email,
    status: user.status,
    createdAt: user.createdAt,
    tenantAccess: user.tenantAccess.map((access) => ({
        tenantId: access.tenant.id,
        tenantName: access.tenant.name,
    })),
});

// Cria o usuário Analista (tenantId nulo, como o Owner) e já vincula o acesso inicial às
// empresas escolhidas — tudo numa transação (ver AnalystTenantAccess no schema).
const createWithAccess = (data: CreateAnalystData): Promise<AnalystWithAccess> => {
    return prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                tenantId: null,
                name: data.name,
                email: data.email,
                passwordHash: data.passwordHash,
                profile: "ANALYST",
            },
        });

        await tx.analystTenantAccess.createMany({
            data: data.tenantIds.map((tenantId) => ({ analystId: user.id, tenantId })),
        });

        const withAccess = await tx.user.findFirstOrThrow({
            where: { id: user.id },
            include: { tenantAccess: { include: { tenant: { select: { id: true, name: true } } } } },
        });

        return toAnalystWithAccess(withAccess);
    });
};

const findByIdWithAccess = async (id: string): Promise<AnalystWithAccess | null> => {
    const user = await prisma.user.findFirst({
        where: { id, profile: "ANALYST", deletedAt: null },
        include: { tenantAccess: { include: { tenant: { select: { id: true, name: true } } } } },
    });

    return user ? toAnalystWithAccess(user) : null;
};

const listAnalysts = async (): Promise<AnalystWithAccess[]> => {
    const users = await prisma.user.findMany({
        where: { profile: "ANALYST", deletedAt: null },
        include: { tenantAccess: { include: { tenant: { select: { id: true, name: true } } } } },
        orderBy: { createdAt: "asc" },
    });

    return users.map(toAnalystWithAccess);
};

// Lista os tenants que um Analista pode acessar — usada pelo fluxo de troca de contexto
// (POST /auth/switch-tenant) para validar se ele realmente tem vínculo com o tenant pedido.
const listAccessibleTenantIds = async (analystId: string): Promise<string[]> => {
    const access = await prisma.analystTenantAccess.findMany({
        where: { analystId },
        select: { tenantId: true },
    });

    return access.map((entry) => entry.tenantId);
};

// Substitui a lista de vínculos por completo (remove os antigos, cria os novos) —
// mais simples que calcular diff, e a lista costuma ser pequena (poucos tenants por analista).
const replaceAccess = (analystId: string, tenantIds: string[]): Promise<void> => {
    return prisma.$transaction(async (tx) => {
        await tx.analystTenantAccess.deleteMany({ where: { analystId } });

        if (tenantIds.length > 0) {
            await tx.analystTenantAccess.createMany({
                data: tenantIds.map((tenantId) => ({ analystId, tenantId })),
            });
        }
    });
};

const softDelete = (id: string): Promise<void> => {
    return prisma.user.update({ where: { id }, data: { deletedAt: new Date() } }).then(() => undefined);
};

export const analystRepository = {
    createWithAccess,
    findByIdWithAccess,
    listAnalysts,
    listAccessibleTenantIds,
    replaceAccess,
    softDelete,
};
