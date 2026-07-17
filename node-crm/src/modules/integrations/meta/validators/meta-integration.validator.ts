import { z } from "zod";

export const updateMetaIntegrationSchema = z.object({
    enabled: z.boolean().optional(),
    pageId: z.string().trim().min(1, "Campo obrigatório.").optional(),
    pageAccessToken: z.string().trim().min(1, "Campo obrigatório.").optional(),
    defaultResponsibleUserId: z.string().trim().uuid("Usuário inválido.").optional(),
    duplicateStrategy: z.enum(["IGNORE", "UPDATE"], { error: "Estratégia inválida." }).optional(),
});
