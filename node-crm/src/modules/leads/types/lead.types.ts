export type LeadStatus = "SEM_CONTATO" | "NAO_ATENDE" | "EM_ANDAMENTO" | "VENDIDO" | "PERDIDO";

export type Lead = {
    id: string;
    tenantId: string;
    companyId: string | null;
    responsibleUserId: string;
    name: string;
    email: string | null;
    phone: string | null;
    status: LeadStatus;
    budgetValue: unknown;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
};

// "Origem" do Lead — calculada (não é coluna própria): Site (Web Widget), Meta ou
// Manual (criado direto pela API/usuário). Ver lead.service.ts > withSource.
export type LeadSource = "Site" | "Meta" | "Manual";

export type LeadDeal = {
    id: string;
    status: "IN_PROGRESS" | "WON" | "LOST";
    value: unknown;
    lostReason: string | null;
};

// Shape usado pelo Kanban de Leads (GET /leads) — Lead + Deal associado (se já
// finalizado) + origem calculada, tudo numa única resposta.
export type LeadWithDetails = Lead & {
    deal: LeadDeal | null;
    source: LeadSource;
};
