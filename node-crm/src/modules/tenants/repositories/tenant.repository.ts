import type { Prisma } from "../../../../generated/prisma/client";
import { prisma } from "../../../shared/database/prisma-client";
import { stripUndefined } from "../../../shared/helpers/nullable-fields";
import type { UpdateTenantDTO } from "../dto/update-tenant.dto";
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

        await tx.settings.create({
            data: { tenantId: tenant.id },
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

const count = (): Promise<number> => {
    return prisma.tenant.count({ where: { deletedAt: null } });
};

const update = (id: string, data: UpdateTenantDTO): Promise<Tenant> => {
    const updateData = stripUndefined(data) as unknown as Prisma.TenantUpdateInput;

    return prisma.tenant.update({ where: { id }, data: updateData });
};

const softDelete = (id: string): Promise<Tenant> => {
    return prisma.tenant.update({ where: { id }, data: { deletedAt: new Date() } });
};

export const tenantRepository = {
    create,
    findByDomain,
    findById,
    list,
    count,
    update,
    softDelete,
};
