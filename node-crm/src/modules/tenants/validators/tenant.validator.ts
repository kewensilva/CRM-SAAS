import { z } from "zod";

const passwordSchema = z
    .string({ error: "Campo obrigatório." })
    .min(8, "A senha deve possuir no mínimo 8 caracteres.")
    .regex(/[A-Z]/, "A senha deve possuir ao menos uma letra maiúscula.")
    .regex(/[a-z]/, "A senha deve possuir ao menos uma letra minúscula.")
    .regex(/[0-9]/, "A senha deve possuir ao menos um número.");

export const createTenantSchema = z.object({
    name: z.string({ error: "Campo obrigatório." }).trim().min(1, "Campo obrigatório."),
    tradeName: z.string().trim().optional(),
    domain: z.string({ error: "Campo obrigatório." }).trim().min(1, "Campo obrigatório."),
    adminName: z.string({ error: "Campo obrigatório." }).trim().min(1, "Campo obrigatório."),
    adminEmail: z.string({ error: "Campo obrigatório." }).trim().email("E-mail inválido."),
    adminPassword: passwordSchema,
});
