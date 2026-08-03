import { z } from "zod";

export const createDealSchema = z.object({
    leadId: z.string({ error: "Campo obrigatório." }).trim().uuid("Lead inválido."),
    companyId: z.string({ error: "Campo obrigatório." }).trim().uuid("Empresa inválida."),
    responsibleUserId: z.string({ error: "Campo obrigatório." }).trim().uuid("Usuário inválido."),
    pipelineId: z.string({ error: "Campo obrigatório." }).trim().uuid("Pipeline inválido."),
    stageId: z.string({ error: "Campo obrigatório." }).trim().uuid("Etapa inválida."),
});

export const updateDealSchema = z.object({
    responsibleUserId: z.string().trim().uuid("Usuário inválido.").optional(),
    value: z.number().positive("Valor inválido.").optional(),
    lostReason: z.string().trim().min(1, "Campo obrigatório.").optional(),
});

export const changeStageSchema = z.object({
    stageId: z.string({ error: "Campo obrigatório." }).trim().uuid("Etapa inválida."),
});

export const changeStatusSchema = z.object({
    status: z.enum(["WON", "LOST"], { error: "Status inválido." }),
});

// Kanban de Leads — mover um card entre as 5 colunas (ver deal.service.ts > moveLeadStatus).
// Perdido exige motivo e valor; Vendido aceita valor opcional; os demais status não usam
// nenhum dos dois campos.
export const moveLeadStatusSchema = z
    .object({
        status: z.enum(["SEM_CONTATO", "NAO_ATENDE", "EM_ANDAMENTO", "VENDIDO", "PERDIDO"], {
            error: "Status inválido.",
        }),
        value: z.number().positive("Valor inválido.").optional(),
        lostReason: z.string().trim().min(1, "Campo obrigatório.").optional(),
    })
    .refine(
        (data) => {
            if (data.status === "PERDIDO") {
                return data.value !== undefined && data.lostReason !== undefined;
            }

            if (data.status === "VENDIDO" || data.status === "EM_ANDAMENTO") {
                return data.lostReason === undefined;
            }

            return data.value === undefined && data.lostReason === undefined;
        },
        {
            message:
                "Perdido exige motivo e valor; Vendido e Em andamento aceitam valor opcional; os demais status não usam nenhum dos dois.",
            path: ["status"],
        },
    );
