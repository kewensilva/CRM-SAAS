import { z } from "zod";

// Opções fixas de parcelamento — não é um número livre, evita valores fora do padrão de
// cobrança da CMB (ex.: "vendido em 7x").
export const DEAL_INSTALLMENT_OPTIONS = [3, 6, 12, 24, 36] as const;

export const createDealSchema = z.object({
    leadId: z.string({ error: "Campo obrigatório." }).trim().uuid("Lead inválido."),
    companyId: z.string({ error: "Campo obrigatório." }).trim().uuid("Empresa inválida."),
    responsibleUserId: z.string({ error: "Campo obrigatório." }).trim().uuid("Usuário inválido."),
    pipelineId: z.string({ error: "Campo obrigatório." }).trim().uuid("Pipeline inválido."),
    stageId: z.string({ error: "Campo obrigatório." }).trim().uuid("Etapa inválida."),
});

export const updateDealSchema = z.object({
    responsibleUserId: z.string().trim().uuid("Usuário inválido.").optional(),
    value: z.number().positive("Valor inválido.").optional(),
    lostReason: z.string().trim().min(1, "Campo obrigatório.").optional(),
});

export const changeStageSchema = z.object({
    stageId: z.string({ error: "Campo obrigatório." }).trim().uuid("Etapa inválida."),
});

export const changeStatusSchema = z.object({
    status: z.enum(["WON", "LOST"], { error: "Status inválido." }),
});

// Kanban de Leads — mover um card entre as 5 colunas (ver deal.service.ts > moveLeadStatus).
// Perdido exige motivo e valor; Vendido aceita valor opcional + forma de pagamento
// (único ou recorrente — recorrente exige installments); os demais status não usam
// nenhum desses campos.
export const moveLeadStatusSchema = z
    .object({
        status: z.enum(["SEM_CONTATO", "NAO_ATENDE", "EM_ANDAMENTO", "VENDIDO", "PERDIDO"], {
            error: "Status inválido.",
        }),
        value: z.number().positive("Valor inválido.").optional(),
        lostReason: z.string().trim().min(1, "Campo obrigatório.").optional(),
        paymentType: z.enum(["UNICO", "RECORRENTE"], { error: "Forma de pagamento inválida." }).optional(),
        installments: z
            .number()
            .refine((value) => (DEAL_INSTALLMENT_OPTIONS as readonly number[]).includes(value), {
                error: "Número de parcelas inválido.",
            })
            .optional(),
        // Existência/pertencimento ao tenant é checado no service (validator não fala
        // com o banco) — ver deal.service.ts > moveLeadStatus.
        productId: z.string().trim().uuid("Produto inválido.").optional(),
    })
    .refine(
        (data) => {
            if (data.status === "PERDIDO") {
                return (
                    data.value !== undefined &&
                    data.lostReason !== undefined &&
                    data.paymentType === undefined &&
                    data.installments === undefined &&
                    data.productId === undefined
                );
            }

            if (data.status === "VENDIDO") {
                return data.lostReason === undefined;
            }

            if (data.status === "EM_ANDAMENTO") {
                return (
                    data.lostReason === undefined &&
                    data.paymentType === undefined &&
                    data.installments === undefined &&
                    data.productId === undefined
                );
            }

            return (
                data.value === undefined &&
                data.lostReason === undefined &&
                data.paymentType === undefined &&
                data.installments === undefined &&
                data.productId === undefined
            );
        },
        {
            message:
                "Perdido exige motivo e valor; Vendido aceita valor, forma de pagamento e produto opcionais; Em andamento aceita valor opcional; os demais status não usam nenhum desses campos.",
            path: ["status"],
        },
    )
    .refine(
        (data) => data.paymentType !== "RECORRENTE" || data.installments !== undefined,
        {
            message: "Recorrência exige o número de parcelas.",
            path: ["installments"],
        },
    )
    .refine(
        (data) => data.paymentType === "RECORRENTE" || data.installments === undefined,
        {
            message: "Parcelas só fazem sentido com forma de pagamento recorrente.",
            path: ["installments"],
        },
    );
