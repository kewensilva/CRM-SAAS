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

// No Zod 4 o refine roda mesmo quando o regex já falhou — sem o teste do padrão, o
// toISOString de uma data inválida lançaria RangeError (500 em vez de 422).
const ISO_DATE_PATTERN = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

// Formato errado já é reportado pelo regex — aqui só o dia inexistente, sem erro duplicado.
const isRealDate = (value: string): boolean => {
    if (!ISO_DATE_PATTERN.test(value)) {
        return true;
    }

    return new Date(`${value}T00:00:00.000Z`).toISOString().slice(0, 10) === value;
};

const isoDate = z
    .string()
    .regex(ISO_DATE_PATTERN, "Data inválida — use o formato AAAA-MM-DD.")
    .refine(isRealDate, "Data inexistente.");

// Mesmo período dos demais Relatórios: dias (startDate/endDate, inclusive) ou um mês inteiro
// (?month=AAAA-MM); sem nada, o mês corrente até hoje.
export const googleAnalyticsReportQuerySchema = z
    .object({
        startDate: isoDate.optional(),
        endDate: isoDate.optional(),
        month: z
            .string()
            .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Mês inválido — use o formato AAAA-MM.")
            .optional(),
    })
    .refine((query) => Boolean(query.startDate) === Boolean(query.endDate), {
        message: "Informe a data inicial e a final.",
        path: ["startDate"],
    })
    .refine((query) => !query.startDate || !query.endDate || query.startDate <= query.endDate, {
        message: "A data inicial deve ser anterior ou igual à final.",
        path: ["endDate"],
    });
