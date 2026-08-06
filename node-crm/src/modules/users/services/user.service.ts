import { hashPassword } from "../../../shared/auth/password";
import { BusinessRuleError, ConflictError, NotFoundError } from "../../../shared/errors";
import type { CreateUserDTO } from "../dto/create-user.dto";
import { userRepository } from "../repositories/user.repository";
import type { User, UserProfile, UserStatus } from "../types/user.types";

export type UpdateUserDTO = {
    name?: string | undefined;
    email?: string | undefined;
    profile?: UserProfile | undefined;
    status?: UserStatus | undefined;
};

// Limite estrutural por tenant: 1 Tenant Admin (o criado pelo Owner na criação do
// tenant) + 2 Vendedores — vale pra qualquer caminho de criação (tela de Cadastros do
// próprio tenant OU o Owner gerenciando usuários via Empresas), não é só uma trava de UI.
const MAX_USERS_BY_PROFILE: Partial<Record<UserProfile, number>> = {
    TENANT_ADMIN: 1,
    USER: 2,
};

const assertProfileLimit = async (tenantId: string, profile: UserProfile): Promise<void> => {
    const limit = MAX_USERS_BY_PROFILE[profile];

    if (!limit) {
        return;
    }

    const current = await userRepository.countByTenantAndProfile(tenantId, profile);

    if (current >= limit) {
        const label = profile === "TENANT_ADMIN" ? "Administrador" : "Vendedor";
        const plural = limit === 1 ? "" : "es";
        throw new BusinessRuleError(
            `Este tenant já atingiu o limite de ${limit} ${label}${plural}.`,
        );
    }
};

const createUser = async (data: CreateUserDTO): Promise<User> => {
    const existingUser = await userRepository.findByTenantAndEmail(data.tenantId, data.email);

    if (existingUser) {
        throw new ConflictError("Já existe um usuário com este e-mail neste tenant.");
    }

    if (data.tenantId) {
        await assertProfileLimit(data.tenantId, data.profile);
    }

    const passwordHash = await hashPassword(data.password);

    return userRepository.create({
        tenantId: data.tenantId,
        name: data.name,
        email: data.email,
        profile: data.profile,
        passwordHash,
    });
};

const listUsersByTenant = (tenantId: string): Promise<User[]> => {
    return userRepository.listByTenant(tenantId);
};

// Garante que o usuário alvo realmente pertence ao tenant informado (usado tanto pelo
// próprio tenant quanto pelo Owner gerenciando usuários de uma empresa específica) —
// evita que um id de outro tenant seja editado/apagado por engano ou má-fé.
const findUserInTenant = async (id: string, tenantId: string): Promise<User> => {
    const user = await userRepository.findById(id);

    if (!user || user.tenantId !== tenantId) {
        throw new NotFoundError("Usuário não encontrado.");
    }

    return user;
};

const updateUserInTenant = async (id: string, tenantId: string, data: UpdateUserDTO): Promise<User> => {
    const current = await findUserInTenant(id, tenantId);

    // Só valida o limite se o perfil está realmente mudando pra um perfil limitado —
    // reenviar o mesmo perfil (ex.: editando só o nome) não deve contar contra si mesmo.
    if (data.profile && data.profile !== current.profile) {
        await assertProfileLimit(tenantId, data.profile);
    }

    if (data.email) {
        const existing = await userRepository.findByTenantAndEmail(tenantId, data.email);

        if (existing && existing.id !== id) {
            throw new ConflictError("Já existe um usuário com este e-mail neste tenant.");
        }
    }

    return userRepository.update(id, data);
};

const deleteUserInTenant = async (id: string, tenantId: string): Promise<void> => {
    await findUserInTenant(id, tenantId);
    await userRepository.softDelete(id);
};

// Só o Tenant Admin chama isso (authorize na rota) — reset de senha em nome de outro
// usuário do próprio tenant, sem pedir a senha atual (não é o dono da conta).
const changePasswordInTenant = async (id: string, tenantId: string, newPassword: string): Promise<void> => {
    await findUserInTenant(id, tenantId);

    const passwordHash = await hashPassword(newPassword);

    await userRepository.updatePasswordHash(id, passwordHash);
};

export const userService = {
    createUser,
    listUsersByTenant,
    updateUserInTenant,
    deleteUserInTenant,
    changePasswordInTenant,
};
