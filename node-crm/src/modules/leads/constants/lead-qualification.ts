import type { LeadStatus } from "../types/lead.types";

// Regra ÚNICA de "lead qualificado" do sistema (Dashboard da plataforma, cards por empresa do
// Owner e Relatórios). Qualificado é quem chegou a "Em andamento" — e continua qualificado
// depois de virar Vendido ou Perdido. Não precisamos olhar o histórico: o Kanban só permite
// Vendido/Perdido a partir de "Em andamento" (ver moveLeadStatus), e esses dois status são
// finais, então todo lead vendido ou perdido já foi qualificado.
export const QUALIFIED_LEAD_STATUSES: LeadStatus[] = ["EM_ANDAMENTO", "VENDIDO", "PERDIDO"];

export const isQualifiedLeadStatus = (status: string): boolean =>
    (QUALIFIED_LEAD_STATUSES as string[]).includes(status);
