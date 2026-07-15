import { hashPassword } from "../../../shared/auth/password";
import { ConflictError } from "../../../shared/errors";
import type { CreateUserDTO } from "../dto/create-user.dto";
import { userRepository } from "../repositories/user.repository";
import type { User } from "../types/user.types";

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

export const userService = {
    createUser,
    listUsersByTenant,
};
