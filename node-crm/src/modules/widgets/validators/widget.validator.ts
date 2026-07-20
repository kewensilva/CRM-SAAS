import { z } from "zod";

const widgetFieldKeySchema = z.enum(
    ["phone", "email", "location", "cpf", "referralSource", "notes"],
    { error: "Campo de widget inválido." },
);

export const updateWidgetSchema = z.object({
    enabled: z.boolean().optional(),
    buttonColor: z.string().trim().optional(),
    icon: z.string().trim().optional(),
    defaultResponsibleUserId: z.string().trim().uuid("Usuário inválido.").optional(),
    requestedFields: z.array(widgetFieldKeySchema).optional(),
});

export const widgetSubmissionSchema = z.object({
    name: z.string({ error: "Campo obrigatório." }).trim().min(1, "Campo obrigatório."),
    email: z.string().trim().email("E-mail inválido.").optional(),
    phone: z.string().trim().optional(),
    location: z.string().trim().optional(),
    cpf: z.string().trim().optional(),
    referralSource: z.string().trim().optional(),
    notes: z.string().trim().optional(),
});
