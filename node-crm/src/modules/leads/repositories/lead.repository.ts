import { prisma } from "../../../shared/database/prisma-client";
import type { CreateLeadDTO } from "../dto/create-lead.dto";
import type { Lead, LeadStatus } from "../types/lead.types";

const create = (data: CreateLeadDTO): Promise<Lead> => {
    return prisma.lead.create({
        data: {
            tenantId: data.tenantId,
            companyId: data.companyId ?? null,
            responsibleUserId: data.responsibleUserId,
            name: data.name,
            email: data.email ?? null,
            phone: data.phone ?? null,
            cpf: data.cpf ?? null,
            location: data.location ?? null,
            referralSource: data.referralSource ?? null,
            notes: data.notes ?? null,
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

// Contagens sem filtro de tenantId — só para o Dashboard do Owner (agregado de plataforma).
const countAll = (): Promise<number> => {
    return prisma.lead.count({ where: { deletedAt: null } });
};

const countAllByStatus = (status: LeadStatus): Promise<number> => {
    return prisma.lead.count({ where: { status, deletedAt: null } });
};

const findByTenantAndEmail = (tenantId: string, email: string): Promise<Lead | null> => {
    return prisma.lead.findFirst({
        where: { tenantId, email, deletedAt: null },
    });
};

const updateContactInfo = (
    id: string,
    data: { name?: string; email?: string; phone?: string },
): Promise<Lead> => {
    return prisma.lead.update({ where: { id }, data });
};

export const leadRepository = {
    create,
    findByIdAndTenant,
    listByTenant,
    countByTenant,
    countAll,
    countAllByStatus,
    findByTenantAndEmail,
    updateContactInfo,
};
