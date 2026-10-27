import { z } from "zod";

// Período do ranking de analistas. Limitado a 1 ano para a consulta não varrer a tabela de
// acessos inteira por engano.
export const analystActivityQuerySchema = z.object({
    days: z.coerce
        .number({ error: "Período inválido." })
        .int("Período inválido.")
        .min(1, "Período mínimo de 1 dia.")
        .max(365, "Período máximo de 365 dias.")
        .default(30),
});
