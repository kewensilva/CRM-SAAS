import { z } from "zod";

const addressFields = {
    street: z.string().trim().optional(),
    number: z.string().trim().optional(),
    district: z.string().trim().optional(),
    city: z.string().trim().optional(),
    state: z.string().trim().optional(),
    zipCode: z.string().trim().optional(),
    country: z.string().trim().optional(),
};

export const createCompanySchema = z.object({
    name: z.string({ error: "Campo obrigatório." }).trim().min(1, "Campo obrigatório."),
    document: z.string().trim().optional(),
    phone: z.string().trim().optional(),
    email: z.string().trim().email("E-mail inválido.").optional(),
    website: z.string().trim().url("URL inválida.").optional(),
    notes: z.string().trim().optional(),
    ...addressFields,
});

export const updateCompanySchema = z.object({
    name: z.string().trim().min(1, "Campo obrigatório.").optional(),
    document: z.string().trim().optional(),
    phone: z.string().trim().optional(),
    email: z.string().trim().email("E-mail inválido.").optional(),
    website: z.string().trim().url("URL inválida.").optional(),
    notes: z.string().trim().optional(),
    status: z.enum(["ACTIVE", "INACTIVE"], { error: "Status inválido." }).optional(),
    ...addressFields,
});
