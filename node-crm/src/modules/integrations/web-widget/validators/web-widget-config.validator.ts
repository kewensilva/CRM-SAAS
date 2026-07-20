import { z } from "zod";

export const updateWebWidgetIntegrationSchema = z.object({
    enabled: z.boolean().optional(),
    defaultResponsibleUserId: z.string().trim().uuid("Usuário inválido.").optional(),
    duplicateStrategy: z.enum(["IGNORE", "UPDATE"], { error: "Estratégia inválida." }).optional(),
    showEmailField: z.boolean().optional(),
    showPhoneField: z.boolean().optional(),
    showMessageField: z.boolean().optional(),
    buttonLabel: z.string().trim().min(1, "Campo obrigatório.").max(60, "Máximo de 60 caracteres.").optional(),
});
