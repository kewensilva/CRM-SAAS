import { z } from "zod";

// Mesmo formato/normalização de budget-entry.validator.ts (dia 1 do mês, UTC) — sem
// "month" na query, o service usa o mês corrente.
export const monthQuerySchema = z.object({
    month: z
        .string()
        .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Mês inválido — use o formato AAAA-MM.")
        .transform((value) => new Date(`${value}-01T00:00:00.000Z`))
        .optional(),
});
