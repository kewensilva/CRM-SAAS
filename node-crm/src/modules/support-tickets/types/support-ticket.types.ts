export type SupportTicket = {
    id: string;
    tenantId: string;
    createdByUserId: string;
    title: string;
    message: string;
    emailSentAt: Date | null;
    emailError: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
};

// Listagem da aba Chamados: o chamado + quem abriu.
export type SupportTicketWithAuthor = SupportTicket & {
    createdBy: { name: string; email: string };
};
