import { z } from "zod";

// Property ID do GA4 é numérico ("Administrador > Detalhes da propriedade"). Aceita também
// o formato "properties/123456789" que aparece em algumas telas do Google e normaliza.
export const updateGoogleAnalyticsIntegrationSchema = z.object({
    enabled: z.boolean().optional(),
    propertyId: z
        .string()
        .trim()
        .transform((value) => value.replace(/^properties\//, ""))
        .pipe(z.string().regex(/^\d+$/, "Property ID inválido — use só os números da propriedade GA4."))
        .optional(),
});

// Mesmo formato de mês dos demais Relatórios (dia 1, UTC); sem "month", usa o mês corrente.
export const googleAnalyticsReportQuerySchema = z.object({
    month: z
        .string()
        .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Mês inválido — use o formato AAAA-MM.")
        .transform((value) => new Date(`${value}-01T00:00:00.000Z`))
        .optional(),
});
