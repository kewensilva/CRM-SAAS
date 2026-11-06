import { z } from "zod";

const SOURCES = ["RD_STATION_MARKETING", "RD_STATION_CRM", "BITRIX24"] as const;
const TRIGGERS = ["NEW_CONVERSION", "OPPORTUNITY", "LIFECYCLE_STAGE", "DEAL_STAGE", "DEAL_WON"] as const;

// "" ou null = apagar o campo opcional.
const optionalText = (max: number) =>
    z
        .string()
        .trim()
        .max(max, `Máximo de ${max} caracteres.`)
        .transform((value) => value || null)
        .nullable()
        .optional();

// ID da conta Google Ads: 10 dígitos, aceita "123-456-7890".
const customerId = z
    .string()
    .trim()
    .transform((value) => value.replace(/-/g, ""))
    .pipe(z.string().regex(/^\d{10}$/, "ID da conta Google Ads inválido — use os 10 dígitos (ex.: 123-456-7890)."))
    .nullable()
    .optional();

const integrationFields = {
    name: z.string().trim().min(2, "Informe um nome para a conexão.").max(120).optional(),
    enabled: z.boolean().optional(),
    googleAdsCustomerId: customerId,
    gclidField: optionalText(120),
    sourceApiUrl: z
        .string()
        .trim()
        .refine((value) => value === "" || /^https:\/\/[^\s]+$/.test(value), "Use a URL https completa do webhook de entrada.")
        .transform((value) => value || null)
        .nullable()
        .optional(),
    sourceApiToken: optionalText(255),
    webhookSecret: optionalText(255),
    currencyCode: z
        .string()
        .trim()
        .regex(/^[A-Z]{3}$/, "Moeda inválida — use o código ISO de 3 letras (ex.: BRL).")
        .optional(),
};

export const createConversionIntegrationSchema = z.object({
    ...integrationFields,
    name: z.string().trim().min(2, "Informe um nome para a conexão.").max(120),
    source: z.enum(SOURCES, { error: "Origem inválida." }),
});

export const updateConversionIntegrationSchema = z.object(integrationFields);

const ruleFields = {
    name: z.string().trim().min(2, "Informe um nome para a regra.").max(120).optional(),
    trigger: z.enum(TRIGGERS, { error: "Gatilho inválido." }).optional(),
    triggerValue: optionalText(200),
    conversionActionId: z.string().trim().regex(/^\d+$/, "ID da ação de conversão inválido — só números.").optional(),
    sendValue: z.boolean().optional(),
    enabled: z.boolean().optional(),
};

export const createConversionRuleSchema = z.object({
    ...ruleFields,
    name: z.string().trim().min(2, "Informe um nome para a regra.").max(120),
    trigger: z.enum(TRIGGERS, { error: "Gatilho inválido." }),
    conversionActionId: z.string().trim().regex(/^\d+$/, "ID da ação de conversão inválido — só números."),
});

export const updateConversionRuleSchema = z.object(ruleFields);
