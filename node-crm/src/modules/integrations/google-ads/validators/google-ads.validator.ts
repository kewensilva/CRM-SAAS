import { z } from "zod";

const accountId = (label: string) =>
    z
        .string({ error: "Campo obrigatório." })
        .trim()
        .transform((value) => value.replace(/-/g, ""))
        .pipe(z.string().regex(/^\d{10}$/, `${label} inválido — use os 10 dígitos (ex.: 123-456-7890).`));

export const oauthExchangeSchema = z.object({
    code: z.string({ error: "Campo obrigatório." }).trim().min(1, "Campo obrigatório."),
    state: z.string({ error: "Campo obrigatório." }).trim().min(1, "Campo obrigatório."),
});

export const selectAccountSchema = z.object({
    customerId: accountId("ID da conta"),
    loginCustomerId: accountId("ID da conta gerenciadora").nullable().optional(),
    customerName: z.string().trim().max(200).nullable().optional(),
});

const ruleFields = {
    name: z.string({ error: "Campo obrigatório." }).trim().min(2, "Informe um nome para a integração.").max(120),
    trigger: z.enum(["LEAD_CREATED", "LEAD_QUALIFIED", "LEAD_WON"], { error: "Escolha quando a conversão acontece." }),
    originFilter: z.enum(["SITE", "META", "MANUAL"], { error: "Origem inválida." }).nullable(),
    conversionActionId: z
        .string({ error: "Campo obrigatório." })
        .trim()
        .regex(/^\d{1,20}$/, "ID da ação de conversão inválido — só números (Google Ads → Metas → Conversões)."),
    conversionActionName: z.string().trim().max(200).nullable().optional(),
    sendValue: z.boolean().default(false),
    enabled: z.boolean().optional(),
};

// Valor da venda só existe quando o Lead é Vendido.
export const createRuleSchema = z
    .object(ruleFields)
    .refine((data) => !data.sendValue || data.trigger === "LEAD_WON", {
        message: "Enviar o valor só vale para \"Lead vendido\".",
        path: ["sendValue"],
    });

export const updateRuleSchema = z.object({
    name: ruleFields.name.optional(),
    trigger: ruleFields.trigger.optional(),
    originFilter: ruleFields.originFilter.optional(),
    conversionActionId: ruleFields.conversionActionId.optional(),
    conversionActionName: ruleFields.conversionActionName,
    sendValue: z.boolean().optional(),
    enabled: z.boolean().optional(),
});
