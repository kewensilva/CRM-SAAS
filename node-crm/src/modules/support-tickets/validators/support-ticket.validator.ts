import { z } from "zod";

export const TITLE_MAX_LENGTH = 150;
export const MESSAGE_MAX_LENGTH = 5000;

// A data do chamado é a de abertura (createdAt) — não vem do formulário.
export const createSupportTicketSchema = z.object({
    title: z
        .string({ error: "Campo obrigatório." })
        .trim()
        .min(3, "Informe um título com pelo menos 3 caracteres.")
        .max(TITLE_MAX_LENGTH, `O título pode ter até ${TITLE_MAX_LENGTH} caracteres.`),
    message: z
        .string({ error: "Campo obrigatório." })
        .trim()
        .min(10, "Descreva o chamado com pelo menos 10 caracteres.")
        .max(MESSAGE_MAX_LENGTH, `A mensagem pode ter até ${MESSAGE_MAX_LENGTH} caracteres.`),
});
