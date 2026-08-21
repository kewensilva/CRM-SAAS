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

// Aplica o limite de usuários por tenant (1 Tenant Admin + 2 Vendedores) — ver
// createUser em user.service.ts. Não conta soft-deleted, um usuário removido libera vaga.
const countByTenantAndProfile = (tenantId: string, profile: UserProfile): Promise<number> => {
    return prisma.user.count({ where: { tenantId, profile, deletedAt: null } });
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

// Reset de senha (pelo Tenant Admin em nome de outro usuário, ou pelo próprio usuário
// trocando a própria senha) — mustChangePassword opcional: quando o próprio usuário
// troca a senha, zera a flag (ver auth.service.ts > changeOwnPassword); quando é um
// Tenant Admin resetando a senha de outra pessoa, deixa true de novo (ver
// user.service.ts > changePasswordInTenant), pra forçar a pessoa a trocar de novo no
// próximo login já que o Admin passou a conhecer a senha temporária.
const updatePasswordHash = (
    id: string,
    passwordHash: string,
    options?: { mustChangePassword?: boolean },
): Promise<User> => {
    return prisma.user.update({
        where: { id },
        data:
            options?.mustChangePassword === undefined
                ? { passwordHash }
                : { passwordHash, mustChangePassword: options.mustChangePassword },
    });
};

// "Esqueci minha senha" — grava o hash do token (nunca o valor cru, ver
// auth.service.ts > forgotPassword) e a expiração. Um novo pedido sobrescreve
// qualquer token anterior ainda pendente (só um válido por vez).
const setResetToken = (id: string, tokenHash: string, expiresAt: Date): Promise<User> => {
    return prisma.user.update({
        where: { id },
        data: { resetPasswordTokenHash: tokenHash, resetPasswordExpiresAt: expiresAt },
    });
};

// Filtra expiração aqui mesmo na query (não em código) — evita a corrida de "token
// existe mas já venceu" precisar de uma segunda checagem em memória.
const findByValidResetTokenHash = (tokenHash: string): Promise<User | null> => {
    return prisma.user.findFirst({
        where: {
            resetPasswordTokenHash: tokenHash,
            resetPasswordExpiresAt: { gt: new Date() },
            deletedAt: null,
        },
    });
};

// Troca a senha via link de "esqueci minha senha" — limpa o token no mesmo update
// (usado uma vez só, mesmo que a expiração ainda não tenha chegado) e zera
// mustChangePassword: a pessoa acabou de escolher a própria senha, não precisa
// trocar de novo no próximo login.
const completePasswordReset = (id: string, passwordHash: string): Promise<User> => {
    return prisma.user.update({
        where: { id },
        data: {
            passwordHash,
            mustChangePassword: false,
            resetPasswordTokenHash: null,
            resetPasswordExpiresAt: null,
        },
    });
};

export const userRepository = {
    create,
    findByTenantAndEmail,
    findById,
    listByTenant,
    countByTenantAndProfile,
    countAll,
    listCreatedAtExcludingPlatformUsers,
    findActiveByEmailAcrossTenants,
    update,
    softDelete,
    updatePasswordHash,
    setResetToken,
    findByValidResetTokenHash,
    completePasswordReset,
};
