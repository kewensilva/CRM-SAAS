import { z } from "zod";

export const createPipelineSchema = z.object({
    name: z.string({ error: "Campo obrigatório." }).trim().min(1, "Campo obrigatório."),
});

export const updatePipelineSchema = z.object({
    name: z.string().trim().min(1, "Campo obrigatório.").optional(),
});

const hexColor = z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida — use o formato hexadecimal, ex: #1A2B3C.");

export const createStageSchema = z.object({
    name: z.string({ error: "Campo obrigatório." }).trim().min(1, "Campo obrigatório."),
    order: z.number({ error: "Campo obrigatório." }).int().min(1, "A ordem deve ser maior que zero."),
    color: hexColor.optional(),
});

export const updateStageSchema = z.object({
    name: z.string().trim().min(1, "Campo obrigatório.").optional(),
    color: hexColor.optional(),
    status: z.enum(["ACTIVE", "INACTIVE"], { error: "Status inválido." }).optional(),
});

export const reorderStagesSchema = z
    .array(
        z.object({
            id: z.string({ error: "Campo obrigatório." }).trim().uuid("Etapa inválida."),
            order: z.number({ error: "Campo obrigatório." }).int().min(1, "A ordem deve ser maior que zero."),
        }),
    )
    .min(1, "Informe ao menos uma etapa.")
    .refine(
        (items) => new Set(items.map((item) => item.order)).size === items.length,
        { error: "A ordem das etapas não pode conter valores duplicados." },
    );
