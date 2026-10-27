// Chamado aberto na aba Chamados. A data do chamado é createdAt (abertura). emailSentAt nulo =
// o e-mail para o atendimento ainda não saiu (emailError diz o motivo; dá para reenviar).
export interface SupportTicket {
  id: string;
  tenantId: string;
  createdByUserId: string;
  title: string;
  message: string;
  emailSentAt: string | null;
  emailError: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SupportTicketWithAuthor extends SupportTicket {
  createdBy: { name: string; email: string };
}

// Mesmos limites do validator do backend (support-ticket.validator.ts).
export const SUPPORT_TICKET_TITLE_MAX_LENGTH = 150;
export const SUPPORT_TICKET_MESSAGE_MAX_LENGTH = 5000;
