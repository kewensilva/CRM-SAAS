import { prisma } from "../../../shared/database/prisma-client";
import type { CreateLeadDTO } from "../dto/create-lead.dto";
import type { Lead } from "../types/lead.types";

const create = (data: CreateLeadDTO): Promise<Lead> => {
    return prisma.lead.create({
        data: {
            tenantId: data.tenantId,
            companyId: data.companyId ?? null,
            responsibleUserId: data.responsibleUserId,
            name: data.name,
            email: data.email ?? null,
            phone: data.phone ?? null,
        },
    });
};

const findByIdAndTenant = (id: string, tenantId: string): Promise<Lead | null> => {
    return prisma.lead.findFirst({
        where: { id, tenantId, deletedAt: null },
    });
};

const listByTenant = (tenantId: string): Promise<Lead[]> => {
    return prisma.lead.findMany({
        where: { tenantId, deletedAt: null },
        orderBy: { createdAt: "desc" },
    });
};

const countByTenant = (tenantId: string): Promise<number> => {
    return prisma.lead.count({ where: { tenantId, deletedAt: null } });
};

export const leadRepository = {
    create,
    findByIdAndTenant,
    listByTenant,
    countByTenant,
};
