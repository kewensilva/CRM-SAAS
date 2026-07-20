import { z } from "zod";

export const createLeadSchema = z.object({
    name: z.string({ error: "Campo obrigatório." }).trim().min(1, "Campo obrigatório."),
    email: z.string().trim().email("E-mail inválido.").optional(),
    phone: z.string().trim().optional(),
    companyId: z.string().trim().uuid("Empresa inválida.").optional(),
    cpf: z.string().trim().optional(),
    location: z.string().trim().optional(),
    referralSource: z.string().trim().optional(),
    notes: z.string().trim().optional(),
});
