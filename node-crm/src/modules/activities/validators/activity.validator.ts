import { z } from "zod";

export const createActivitySchema = z
    .object({
        dealId: z.string().trim().uuid("Negociação inválida.").optional(),
        leadId: z.string().trim().uuid("Lead inválido.").optional(),
        responsibleUserId: z.string({ error: "Campo obrigatório." }).trim().uuid("Usuário inválido."),
        title: z.string({ error: "Campo obrigatório." }).trim().min(1, "Campo obrigatório."),
        dueDate: z.coerce.date({ error: "Data prevista inválida." }),
    })
    .refine((data) => Boolean(data.dealId) !== Boolean(data.leadId), {
        error: "Informe exatamente um vínculo: dealId ou leadId.",
        path: ["dealId"],
    });

export const updateActivitySchema = z.object({
    title: z.string().trim().min(1, "Campo obrigatório.").optional(),
    dueDate: z.coerce.date({ error: "Data prevista inválida." }).optional(),
    responsibleUserId: z.string().trim().uuid("Usuário inválido.").optional(),
});
