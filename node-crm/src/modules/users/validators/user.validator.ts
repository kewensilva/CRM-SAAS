import { z } from "zod";

const passwordSchema = z
    .string({ error: "Campo obrigatório." })
    .min(8, "A senha deve possuir no mínimo 8 caracteres.")
    .regex(/[A-Z]/, "A senha deve possuir ao menos uma letra maiúscula.")
    .regex(/[a-z]/, "A senha deve possuir ao menos uma letra minúscula.")
    .regex(/[0-9]/, "A senha deve possuir ao menos um número.");

export const createUserSchema = z.object({
    name: z.string({ error: "Campo obrigatório." }).trim().min(1, "Campo obrigatório."),
    email: z.string({ error: "Campo obrigatório." }).trim().email("E-mail inválido."),
    password: passwordSchema,
    profile: z.enum(["TENANT_ADMIN", "MANAGER", "USER"], {
        error: "Perfil inválido.",
    }),
});

// Edição por um Tenant Admin ou pelo Owner (gerenciando os usuários de uma empresa) —
// sem senha aqui, troca de senha é um fluxo à parte (ver changePasswordSchema) — e sem
// permitir virar OWNER/ANALYST por essa via.
export const updateUserSchema = z.object({
    name: z.string().trim().min(1, "Campo obrigatório.").optional(),
    email: z.string().trim().email("E-mail inválido.").optional(),
    profile: z.enum(["TENANT_ADMIN", "MANAGER", "USER"], { error: "Perfil inválido." }).optional(),
    status: z.enum(["ACTIVE", "INACTIVE"], { error: "Status inválido." }).optional(),
});

// Reset de senha feito pelo Tenant Admin em nome de outro usuário do próprio tenant —
// não pede a senha atual (ele não é o dono da conta), diferente de uma troca de senha
// feita pelo próprio usuário autenticado (fluxo que não existe ainda).
export const changePasswordSchema = z.object({
    newPassword: passwordSchema,
});
