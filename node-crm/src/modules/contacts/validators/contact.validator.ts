import { z } from "zod";

export const createContactSchema = z.object({
    companyId: z.string({ error: "Campo obrigatório." }).trim().uuid("Empresa inválida."),
    name: z.string({ error: "Campo obrigatório." }).trim().min(1, "Campo obrigatório."),
    position: z.string().trim().optional(),
    email: z.string().trim().email("E-mail inválido.").optional(),
    phone: z.string().trim().optional(),
    mobile: z.string().trim().optional(),
    notes: z.string().trim().optional(),
});

export const updateContactSchema = z.object({
    name: z.string().trim().min(1, "Campo obrigatório.").optional(),
    position: z.string().trim().optional(),
    email: z.string().trim().email("E-mail inválido.").optional(),
    phone: z.string().trim().optional(),
    mobile: z.string().trim().optional(),
    notes: z.string().trim().optional(),
});
