export type CreateLeadDTO = {
    tenantId: string;
    companyId?: string | undefined;
    responsibleUserId: string;
    name: string;
    email?: string | undefined;
    phone?: string | undefined;
    utmSource?: string | undefined;
    utmMedium?: string | undefined;
    utmCampaign?: string | undefined;
    utmTerm?: string | undefined;
    utmContent?: string | undefined;
    // Observações iniciais — ex.: mensagem que o visitante escreveu no formulário do site.
    notes?: string | undefined;
};

// Origem não é editável (é calculada, não uma coluna) — só os dados de contato do Lead.
export type UpdateLeadDTO = {
    name?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    notes?: string | undefined;
};
