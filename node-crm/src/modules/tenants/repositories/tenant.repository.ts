import { prisma } from "../../../shared/database/prisma-client";
import type { Tenant } from "../types/tenant.types";

type CreateTenantData = {
    name: string;
    tradeName?: string | undefined;
    domain: string;
};

type CreateAdminData = {
    name: string;
    email: string;
    passwordHash: string;
};

const create = (tenantData: CreateTenantData, adminData: CreateAdminData): Promise<Tenant> => {
    return prisma.$transaction(async (tx) => {
        const tenant = await tx.tenant.create({
            data: {
                name: tenantData.name,
                tradeName: tenantData.tradeName ?? null,
                domain: tenantData.domain,
            },
        });

        await tx.user.create({
            data: {
                tenantId: tenant.id,
                name: adminData.name,
                email: adminData.email,
                passwordHash: adminData.passwordHash,
                profile: "TENANT_ADMIN",
            },
        });

        return tenant;
    });
};

const findByDomain = (domain: string): Promise<Tenant | null> => {
    return prisma.tenant.findFirst({
        where: { domain, deletedAt: null },
    });
};

const findById = (id: string): Promise<Tenant | null> => {
    return prisma.tenant.findFirst({
        where: { id, deletedAt: null },
    });
};

const list = (): Promise<Tenant[]> => {
    return prisma.tenant.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "asc" },
    });
};

export const tenantRepository = {
    create,
    findByDomain,
    findById,
    list,
};
