import { z } from "zod";

// Limite do período para a consulta não varrer anos de leads por engano.
const MAX_PERIOD_DAYS = 366;
const DAY_MS = 24 * 60 * 60 * 1000;

// O refine pega dias que não existem no mês (ex.: 2026-02-31, que o Date "rola" para 03/03).
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

// Período por dias (startDate/endDate, inclusive) ou, por compatibilidade, um mês inteiro
// (?month=AAAA-MM). Sem nada, o service usa o mês corrente até hoje.
export const reportPeriodQuerySchema = z
    .object({
        startDate: isoDate.optional(),
        endDate: isoDate.optional(),
        month: z
            .string()
            .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Mês inválido — use o formato AAAA-MM.")
            .transform((value) => new Date(`${value}-01T00:00:00.000Z`))
            .optional(),
    })
    .refine((query) => Boolean(query.startDate) === Boolean(query.endDate), {
        message: "Informe a data inicial e a final.",
        path: ["startDate"],
    })
    .refine((query) => !query.startDate || !query.endDate || query.startDate <= query.endDate, {
        message: "A data inicial deve ser anterior ou igual à final.",
        path: ["endDate"],
    })
    .refine(
        (query) =>
            !query.startDate ||
            !query.endDate ||
            (Date.parse(query.endDate) - Date.parse(query.startDate)) / DAY_MS < MAX_PERIOD_DAYS,
        { message: `Período máximo de ${MAX_PERIOD_DAYS} dias.`, path: ["endDate"] },
    );

export type ReportPeriodQuery = z.infer<typeof reportPeriodQuerySchema>;
