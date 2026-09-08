export type DealStatus = "IN_PROGRESS" | "WON" | "LOST";

// Só relevante quando o Deal é fechado como Vendido — ver moveLeadStatus em
// deal.service.ts. UNICO é o default (inclusive pra negociações fechadas antes desta
// feature, via backfill de migration).
export type DealPaymentType = "UNICO" | "RECORRENTE";

export type Deal = {
    id: string;
    tenantId: string;
    leadId: string;
    companyId: string;
    responsibleUserId: string;
    pipelineId: string;
    stageId: string;
    status: DealStatus;
    value: unknown;
    lostReason: string | null;
    paymentType: DealPaymentType;
    installments: number | null;
    productId: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
};

export type DealStageHistoryEntry = {
    id: string;
    tenantId: string;
    dealId: string;
    fromStageId: string | null;
    toStageId: string;
    changedByUserId: string;
    changedAt: Date;
};
