import { prisma } from "../../../shared/database/prisma-client";
import type { CreateUserDTO } from "../dto/create-user.dto";
import type { User } from "../types/user.types";

type CreateUserData = Omit<CreateUserDTO, "password"> & { passwordHash: string };

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

export const userRepository = {
    create,
    findByTenantAndEmail,
    findById,
    listByTenant,
};
