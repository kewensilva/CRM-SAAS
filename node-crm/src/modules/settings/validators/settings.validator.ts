import { z } from "zod";

const hexColor = z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida — use o formato hexadecimal, ex: #1A2B3C.");

export const updateSettingsSchema = z.object({
    logoUrl: z.string().trim().url("URL inválida.").optional(),
    primaryColor: hexColor.optional(),
    secondaryColor: hexColor.optional(),
});
