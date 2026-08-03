import { z } from "zod";

const passwordSchema = z
    .string({ error: "Campo obrigatório." })
    .min(8, "A senha deve possuir no mínimo 8 caracteres.")
    .regex(/[A-Z]/, "A senha deve possuir ao menos uma letra maiúscula.")
    .regex(/[a-z]/, "A senha deve possuir ao menos uma letra minúscula.")
    .regex(/[0-9]/, "A senha deve possuir ao menos um número.");

export const createAnalystSchema = z.object({
    name: z.string({ error: "Campo obrigatório." }).trim().min(1, "Campo obrigatório."),
    email: z.string({ error: "Campo obrigatório." }).trim().email("E-mail inválido."),
    password: passwordSchema,
    tenantIds: z
        .array(z.string().trim().uuid("Empresa inválida."))
        .min(1, "Selecione ao menos uma empresa."),
});

export const replaceAnalystAccessSchema = z.object({
    tenantIds: z.array(z.string().trim().uuid("Empresa inválida.")),
});
