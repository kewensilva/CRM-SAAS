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
    utmSource: string | null;
    utmMedium: string | null;
    utmCampaign: string | null;
    utmTerm: string | null;
    utmContent: string | null;
    gclid: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
};

// "Origem" do Lead — calculada (não é coluna própria): Site (Web Widget), Meta ou
// Manual (criado direto pela API/usuário). Ver lead.service.ts > withSource.
export type LeadSource = "Site" | "Meta" | "Manual";

// O que o Integrador Google Ads precisa de um Lead para montar a conversão offline.
export type LeadConversionData = {
    id: string;
    tenantId: string;
    email: string | null;
    phone: string | null;
    gclid: string | null;
    source: LeadSource;
    dealValue: number | null;
};

export type LeadDeal = {
    id: string;
    status: "IN_PROGRESS" | "WON" | "LOST";
    value: unknown;
    lostReason: string | null;
    paymentType: "UNICO" | "RECORRENTE";
    installments: number | null;
    productId: string | null;
};

// Shape usado pelo Kanban de Leads (GET /leads) — Lead + Deal associado (se já
// finalizado) + origem calculada, tudo numa única resposta.
export type LeadWithDetails = Lead & {
    deal: LeadDeal | null;
    source: LeadSource;
};

// Uma entrada por evento do ciclo de vida do Lead: criação (fromStatus null) e cada
// mudança de status depois. changedByUserId nulo = mudança automática de integração
// (Meta Lead Ads, Web Widget), sem usuário autenticado por trás.
export type LeadHistoryEntry = {
    id: string;
    tenantId: string;
    leadId: string;
    fromStatus: LeadStatus | null;
    toStatus: LeadStatus;
    changedByUserId: string | null;
    changedAt: Date;
    changedByUser: { name: string } | null;
};
