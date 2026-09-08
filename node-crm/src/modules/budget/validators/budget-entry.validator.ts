import { z } from "zod";

// "2026-09" -> 2026-09-01T00:00:00.000Z — normaliza pro dia 1 do mês em UTC, mesmo valor
// não importa a hora que o Analista salvou (mês é a unidade real do dado, não o dia).
const monthSchema = z
    .string({ error: "Campo obrigatório." })
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Mês inválido — use o formato AAAA-MM.")
    .transform((value) => new Date(`${value}-01T00:00:00.000Z`));

export const createBudgetEntrySchema = z.object({
    channelName: z
        .string({ error: "Campo obrigatório." })
        .trim()
        .min(1, "Campo obrigatório.")
        .max(80, "Máximo de 80 caracteres."),
    month: monthSchema,
    budget: z.number().min(0, "Valor inválido.").optional(),
    investment: z.number().min(0, "Valor inválido.").optional(),
});

export const updateBudgetEntrySchema = z.object({
    channelName: z.string().trim().min(1, "Campo obrigatório.").max(80, "Máximo de 80 caracteres.").optional(),
    budget: z.number().min(0, "Valor inválido.").optional(),
    investment: z.number().min(0, "Valor inválido.").optional(),
});

export const monthQuerySchema = z.object({
    month: monthSchema.optional(),
});
