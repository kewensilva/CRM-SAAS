import { prisma } from "../../../shared/database/prisma-client";
import type { CreateSupportTicketDTO } from "../dto/create-support-ticket.dto";
import type { SupportTicket, SupportTicketWithAuthor } from "../types/support-ticket.types";

const LIST_LIMIT = 100;

const create = (tenantId: string, createdByUserId: string, data: CreateSupportTicketDTO): Promise<SupportTicket> => {
    return prisma.supportTicket.create({
        data: { tenantId, createdByUserId, title: data.title, message: data.message },
    });
};

const findByIdAndTenant = (id: string, tenantId: string): Promise<SupportTicket | null> => {
    return prisma.supportTicket.findFirst({ where: { id, tenantId, deletedAt: null } });
};

// createdByUserId informado = só os chamados daquele usuário (Vendedor); sem ele, todos do
// tenant (Tenant Admin / Manager). Mais recentes primeiro.
const listByTenant = (tenantId: string, createdByUserId?: string): Promise<SupportTicketWithAuthor[]> => {
    return prisma.supportTicket.findMany({
        where: { tenantId, deletedAt: null, ...(createdByUserId ? { createdByUserId } : {}) },
        include: { createdBy: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        take: LIST_LIMIT,
    });
};

const markEmailSent = (id: string): Promise<SupportTicket> => {
    return prisma.supportTicket.update({ where: { id }, data: { emailSentAt: new Date(), emailError: null } });
};

const markEmailFailed = (id: string, emailError: string): Promise<SupportTicket> => {
    return prisma.supportTicket.update({ where: { id }, data: { emailError } });
};

export const supportTicketRepository = {
    create,
    findByIdAndTenant,
    listByTenant,
    markEmailSent,
    markEmailFailed,
};
