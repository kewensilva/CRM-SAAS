import { hashPassword } from "../../../shared/auth/password";
import { ConflictError, NotFoundError } from "../../../shared/errors";
import type { CreateUserDTO } from "../dto/create-user.dto";
import { userRepository } from "../repositories/user.repository";
import type { User, UserProfile, UserStatus } from "../types/user.types";

export type UpdateUserDTO = {
    name?: string | undefined;
    email?: string | undefined;
    profile?: UserProfile | undefined;
    status?: UserStatus | undefined;
};

const createUser = async (data: CreateUserDTO): Promise<User> => {
    const existingUser = await userRepository.findByTenantAndEmail(data.tenantId, data.email);

    if (existingUser) {
        throw new ConflictError("Já existe um usuário com este e-mail neste tenant.");
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
    await findUserInTenant(id, tenantId);

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

export const userService = {
    createUser,
    listUsersByTenant,
    updateUserInTenant,
    deleteUserInTenant,
};
