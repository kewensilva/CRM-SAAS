import { z } from "zod";

export const updateMetaIntegrationSchema = z.object({
    enabled: z.boolean().optional(),
    pageId: z.string().trim().min(1, "Campo obrigatório.").optional(),
    pageAccessToken: z.string().trim().min(1, "Campo obrigatório.").optional(),
    defaultResponsibleUserId: z.string().trim().uuid("Usuário inválido.").optional(),
    duplicateStrategy: z.enum(["IGNORE", "UPDATE"], { error: "Estratégia inválida." }).optional(),
});



// Passo 1 do "Conectar com o Facebook": o front devolve o code e o state que a Meta
// anexou na URL de retorno.
export const metaOAuthExchangeSchema = z.object({
    code: z.string().trim().min(1, "Campo obrigatório."),
    state: z.string().trim().min(1, "Campo obrigatório."),
});

// Passo 2: o usuário escolheu qual Página conectar.
export const metaOAuthConnectSchema = z.object({
    sessionId: z.string().trim().min(1, "Campo obrigatório."),
    pageId: z.string().trim().min(1, "Campo obrigatório."),
});