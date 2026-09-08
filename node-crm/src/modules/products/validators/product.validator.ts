import { z } from "zod";

export const createProductSchema = z.object({
    name: z.string({ error: "Campo obrigatório." }).trim().min(1, "Campo obrigatório.").max(140, "Máximo de 140 caracteres."),
    price: z.number().positive("Valor inválido.").optional(),
});

export const updateProductSchema = z.object({
    name: z.string().trim().min(1, "Campo obrigatório.").max(140, "Máximo de 140 caracteres.").optional(),
    price: z.number().positive("Valor inválido.").optional(),
    status: z.enum(["ACTIVE", "INACTIVE"], { error: "Status inválido." }).optional(),
});
