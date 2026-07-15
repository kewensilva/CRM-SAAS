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
});

export const changeStageSchema = z.object({
    stageId: z.string({ error: "Campo obrigatório." }).trim().uuid("Etapa inválida."),
});

export const changeStatusSchema = z.object({
    status: z.enum(["WON", "LOST"], { error: "Status inválido." }),
});
