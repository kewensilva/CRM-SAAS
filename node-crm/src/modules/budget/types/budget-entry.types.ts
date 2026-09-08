// Parametrização mensal de Budget x Investimento por canal de mídia paga — cadastrado
// pelo Analista em Parâmetros, consumido pela tela de Relatórios (ver reports module).
// channelName é texto livre (não um enum), também usado pra casar com Lead.utmSource ao
// calcular conversão por canal.
export type BudgetEntry = {
    id: string;
    tenantId: string;
    channelName: string;
    month: Date;
    budget: unknown;
    investment: unknown;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
};
