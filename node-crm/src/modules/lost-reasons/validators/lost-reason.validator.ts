import { z } from "zod";

export const createLostReasonSchema = z.object({
    label: z.string({ error: "Campo obrigatório." }).trim().min(1, "Campo obrigatório."),
});
