import { z } from "zod";

export const loginSchema = z.object({
    tenantSlug: z.string().trim().optional(),
    email: z.string({ error: "Campo obrigatório." }).trim().email("E-mail inválido."),
    password: z.string({ error: "Campo obrigatório." }).min(1, "Campo obrigatório."),
});

export const refreshTokenSchema = z.object({
    refreshToken: z.string({ error: "Campo obrigatório." }).min(1, "Campo obrigatório."),
});
