import { z } from "zod";

// Conjunto fixo embutido em widget.js — não é upload nem URL livre (ver public/widget.js).
export const WIDGET_BUTTON_ICONS = ["chat", "message", "whatsapp", "help", "phone", "cart"] as const;

export const updateWebWidgetIntegrationSchema = z.object({
    enabled: z.boolean().optional(),
    defaultResponsibleUserId: z.string().trim().uuid("Usuário inválido.").optional(),
    duplicateStrategy: z.enum(["IGNORE", "UPDATE"], { error: "Estratégia inválida." }).optional(),
    showEmailField: z.boolean().optional(),
    showPhoneField: z.boolean().optional(),
    showMessageField: z.boolean().optional(),
    buttonLabel: z.string().trim().min(1, "Campo obrigatório.").max(60, "Máximo de 60 caracteres.").optional(),
    buttonContentType: z.enum(["TEXT", "ICON"], { error: "Tipo de conteúdo inválido." }).optional(),
    buttonIcon: z.enum(WIDGET_BUTTON_ICONS, { error: "Ícone inválido." }).optional(),
    buttonColor: z
        .string()
        .trim()
        .regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida — use o formato hexadecimal, ex: #1A2B3C.")
        .optional(),
});
