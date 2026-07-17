// O Dashboard não armazena dados próprios — apenas agrega informações dos demais
// módulos (product.md > Dashboard). Os 5 indicadores abaixo são exatamente os listados
// em business-rules.md > Dashboard.
export type DashboardSummary = {
    leadsCount: number;
    dealsInProgress: number;
    dealsWon: number;
    dealsLost: number;
    pendingActivities: number;
};
