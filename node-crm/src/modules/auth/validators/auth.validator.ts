import { z } from "zod";

export const loginSchema = z.object({
    tenantSlug: z.string().trim().optional(),
    email: z.string({ error: "Campo obrigatório." }).trim().email("E-mail inválido."),
    password: z.string({ error: "Campo obrigatório." }).min(1, "Campo obrigatório."),
});

export const refreshTokenSchema = z.object({
    refreshToken: z.string({ error: "Campo obrigatório." }).min(1, "Campo obrigatório."),
});

export const switchTenantSchema = z.object({
    tenantId: z.string({ error: "Campo obrigatório." }).trim().uuid("Empresa inválida."),
});

export const forgotPasswordSchema = z.object({
    email: z.string({ error: "Campo obrigatório." }).trim().email("E-mail inválido."),
});

export const resetPasswordSchema = z.object({
    token: z.string({ error: "Campo obrigatório." }).min(1, "Campo obrigatório."),
    newPassword: z
        .string({ error: "Campo obrigatório." })
        .min(8, "A senha deve possuir no mínimo 8 caracteres.")
        .regex(/[A-Z]/, "A senha deve possuir ao menos uma letra maiúscula.")
        .regex(/[a-z]/, "A senha deve possuir ao menos uma letra minúscula.")
        .regex(/[0-9]/, "A senha deve possuir ao menos um número."),
});

export const changeOwnPasswordSchema = z.object({
    currentPassword: z.string({ error: "Campo obrigatório." }).min(1, "Campo obrigatório."),
    newPassword: z
        .string({ error: "Campo obrigatório." })
        .min(8, "A senha deve possuir no mínimo 8 caracteres.")
        .regex(/[A-Z]/, "A senha deve possuir ao menos uma letra maiúscula.")
        .regex(/[a-z]/, "A senha deve possuir ao menos uma letra minúscula.")
        .regex(/[0-9]/, "A senha deve possuir ao menos um número."),
});
