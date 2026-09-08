import { z } from "zod";

// Conjunto fixo embutido em widget.js — não é upload nem URL livre (ver public/widget.js).
export const WIDGET_BUTTON_ICONS = ["chat", "message", "whatsapp", "help", "phone", "cart"] as const;

// Limite arbitrário mas generoso — o widget é um formulário de captura rápida, não uma
// pesquisa; mais que isso prejudicaria a taxa de conversão do próprio cliente.
export const MAX_WIDGET_MESSAGE_FIELDS = 5;

const webWidgetMessageFieldSchema = z.object({
    // Identificador estável que liga a resposta do visitante (widget.js) à pergunta
    // configurada — não é exibido, só usado internamente.
    key: z
        .string({ error: "Campo obrigatório." })
        .trim()
        .min(1, "Campo obrigatório.")
        .max(60, "Máximo de 60 caracteres.")
        .regex(/^[a-z0-9_]+$/, "Use apenas letras minúsculas, números e _."),
    label: z
        .string({ error: "Campo obrigatório." })
        .trim()
        .min(1, "Campo obrigatório.")
        .max(140, "Máximo de 140 caracteres."),
});

const webWidgetMessageFieldsSchema = z
    .array(webWidgetMessageFieldSchema)
    .max(MAX_WIDGET_MESSAGE_FIELDS, `Máximo de ${MAX_WIDGET_MESSAGE_FIELDS} campos de mensagem.`)
    .refine(
        (fields) => new Set(fields.map((field) => field.key)).size === fields.length,
        "Cada campo de mensagem precisa de uma chave única.",
    );

export const updateWebWidgetIntegrationSchema = z.object({
    enabled: z.boolean().optional(),
    defaultResponsibleUserId: z.string().trim().uuid("Usuário inválido.").optional(),
    duplicateStrategy: z.enum(["IGNORE", "UPDATE"], { error: "Estratégia inválida." }).optional(),
    showEmailField: z.boolean().optional(),
    showPhoneField: z.boolean().optional(),
    messageFields: webWidgetMessageFieldsSchema.optional(),
    buttonLabel: z.string().trim().min(1, "Campo obrigatório.").max(60, "Máximo de 60 caracteres.").optional(),
    buttonContentType: z.enum(["TEXT", "ICON"], { error: "Tipo de conteúdo inválido." }).optional(),
    buttonIcon: z.enum(WIDGET_BUTTON_ICONS, { error: "Ícone inválido." }).optional(),
    buttonColor: z
        .string()
        .trim()
        .regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida — use o formato hexadecimal, ex: #1A2B3C.")
        .optional(),
});
