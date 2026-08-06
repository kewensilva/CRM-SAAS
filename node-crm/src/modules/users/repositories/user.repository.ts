import type { Prisma } from "../../../../generated/prisma/client";
import { prisma } from "../../../shared/database/prisma-client";
import { stripUndefined } from "../../../shared/helpers/nullable-fields";
import type { CreateUserDTO } from "../dto/create-user.dto";
import type { User, UserProfile, UserStatus } from "../types/user.types";

type CreateUserData = Omit<CreateUserDTO, "password"> & { passwordHash: string };

type UpdateUserData = {
    name?: string | undefined;
    email?: string | undefined;
    profile?: UserProfile | undefined;
    status?: UserStatus | undefined;
};

const create = (data: CreateUserData): Promise<User> => {
    return prisma.user.create({
        data: {
            tenantId: data.tenantId,
            name: data.name,
            email: data.email,
            passwordHash: data.passwordHash,
            profile: data.profile,
        },
    });
};

const findByTenantAndEmail = (tenantId: string | null, email: string): Promise<User | null> => {
    return prisma.user.findFirst({
        where: { tenantId, email, deletedAt: null },
    });
};

const findById = (id: string): Promise<User | null> => {
    return prisma.user.findFirst({
        where: { id, deletedAt: null },
    });
};

const listByTenant = (tenantId: string): Promise<User[]> => {
    return prisma.user.findMany({
        where: { tenantId, deletedAt: null },
        orderBy: { createdAt: "asc" },
    });
};

// Exclui contas do Owner (tenantId nulo) — métrica de plataforma conta só usuários clientes.
const countAll = (): Promise<number> => {
    return prisma.user.count({ where: { deletedAt: null, tenantId: { not: null } } });
};

// Só o dado necessário pro gráfico de crescimento da plataforma (ver dashboard.service.ts) —
// exclui Owner/Analista pelo mesmo motivo de countAll acima.
const listCreatedAtExcludingPlatformUsers = (): Promise<{ createdAt: Date }[]> => {
    return prisma.user.findMany({
        where: { deletedAt: null, tenantId: { not: null } },
        select: { createdAt: true },
    });
};

// BRANCH "static-domain": sem subdomínio por tenant, o login não tem como saber de
// antemão a qual tenant o e-mail pertence (e-mail só é único DENTRO do tenant, não
// globalmente — business-rules.md). authService.login tenta a senha em cada candidato
// ativo até achar o certo — aqui só filtramos os plausíveis (usuário ativo, tenant ativo,
// exclui Owner/Analista que já são checados à parte).
const findActiveByEmailAcrossTenants = (email: string): Promise<User[]> => {
    return prisma.user.findMany({
        where: {
            email,
            deletedAt: null,
            status: "ACTIVE",
            tenantId: { not: null },
            tenant: { status: "ACTIVE", deletedAt: null },
        },
    });
};

const update = (id: string, data: UpdateUserData): Promise<User> => {
    const updateData = stripUndefined(data) as unknown as Prisma.UserUpdateInput;

    return prisma.user.update({ where: { id }, data: updateData });
};

const softDelete = (id: string): Promise<User> => {
    return prisma.user.update({ where: { id }, data: { deletedAt: new Date() } });
};

// Reset de senha pelo Tenant Admin — só o hash muda, nenhum outro campo do usuário.
const updatePasswordHash = (id: string, passwordHash: string): Promise<User> => {
    return prisma.user.update({ where: { id }, data: { passwordHash } });
};

export const userRepository = {
    create,
    findByTenantAndEmail,
    findById,
    listByTenant,
    countAll,
    listCreatedAtExcludingPlatformUsers,
    findActiveByEmailAcrossTenants,
    update,
    softDelete,
    updatePasswordHash,
};
