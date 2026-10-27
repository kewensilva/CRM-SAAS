import { emailService } from "../../../shared/email/email.service";
import { AuthorizationError, BusinessRuleError, NotFoundError } from "../../../shared/errors";
import { logger } from "../../../shared/logger/logger";
import { tenantRepository } from "../../tenants/repositories/tenant.repository";
import { userRepository } from "../../users/repositories/user.repository";
import type { CreateSupportTicketDTO } from "../dto/create-support-ticket.dto";
import { supportTicketRepository } from "../repositories/support-ticket.repository";
import type { SupportTicket, SupportTicketWithAuthor } from "../types/support-ticket.types";

// Vendedor (USER) só vê e reenvia os próprios chamados; Tenant Admin/Manager, os do tenant.
const OWN_TICKETS_ONLY_PROFILES = ["USER"];

type Requester = { userId: string; tenantId: string; profile: string };

// Envia o e-mail do chamado e registra o resultado. Nunca lança: o chamado já está salvo, e
// falha no envio fica em emailError (visível na aba, com opção de reenviar).
const deliver = async (ticket: SupportTicket, requester: Requester): Promise<SupportTicket> => {
    const [tenant, user] = await Promise.all([
        tenantRepository.findById(requester.tenantId),
        userRepository.findById(ticket.createdByUserId),
    ]);

    try {
        await emailService.sendSupportTicketEmail({
            ticketId: ticket.id,
            title: ticket.title,
            message: ticket.message,
            createdAt: ticket.createdAt,
            tenantName: tenant?.name ?? "Empresa não identificada",
            userName: user?.name ?? "Usuário não identificado",
            userEmail: user?.email ?? "",
        });

        return await supportTicketRepository.markEmailSent(ticket.id);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Falha desconhecida ao enviar o e-mail.";

        logger.warn({ ticketId: ticket.id, error: message }, "[support-tickets] E-mail do chamado não enviado.");

        return supportTicketRepository.markEmailFailed(ticket.id, message);
    }
};

const create = async (requester: Requester, data: CreateSupportTicketDTO): Promise<SupportTicket> => {
    const ticket = await supportTicketRepository.create(requester.tenantId, requester.userId, data);

    return deliver(ticket, requester);
};

const list = (requester: Requester): Promise<SupportTicketWithAuthor[]> => {
    const onlyOwn = OWN_TICKETS_ONLY_PROFILES.includes(requester.profile);

    return supportTicketRepository.listByTenant(requester.tenantId, onlyOwn ? requester.userId : undefined);
};

const resend = async (requester: Requester, id: string): Promise<SupportTicket> => {
    const ticket = await supportTicketRepository.findByIdAndTenant(id, requester.tenantId);

    if (!ticket) {
        throw new NotFoundError("Chamado não encontrado.");
    }

    if (OWN_TICKETS_ONLY_PROFILES.includes(requester.profile) && ticket.createdByUserId !== requester.userId) {
        throw new AuthorizationError("Você só pode reenviar os chamados que abriu.");
    }

    if (ticket.emailSentAt) {
        throw new BusinessRuleError("Este chamado já foi enviado ao atendimento.");
    }

    return deliver(ticket, requester);
};

export const supportTicketService = {
    create,
    list,
    resend,
};
