import { z } from "zod";

export const createLeadSchema = z.object({
    name: z.string({ error: "Campo obrigatório." }).trim().min(1, "Campo obrigatório."),
    email: z.string().trim().email("E-mail inválido.").optional(),
    phone: z.string().trim().optional(),
    companyId: z.string().trim().uuid("Empresa inválida.").optional(),
});

// Origem não entra aqui — não é editável (calculada, não é coluna do Lead).
export const updateLeadSchema = z.object({
    name: z.string().trim().min(1, "Campo obrigatório.").optional(),
    email: z.string().trim().email("E-mail inválido.").optional(),
    phone: z.string().trim().optional(),
    notes: z.string().trim().optional(),
});

// Exportação: a lista de leads já filtrada no front-end (mesmo filtro do Kanban) — o
// backend só busca e formata, não reaplica regra de filtro nenhuma.
export const exportLeadsSchema = z.object({
    leadIds: z.array(z.string().trim().uuid("Lead inválido.")),
    filterSummary: z.string().trim().optional(),
});
