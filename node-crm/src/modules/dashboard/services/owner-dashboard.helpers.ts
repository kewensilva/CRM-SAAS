import { isQualifiedLeadStatus } from "../../leads/constants/lead-qualification";
import type { AnalystActivityItem, OwnerTenantCard } from "../types/dashboard.types";

type TenantRow = {
    id: string;
    name: string;
    domain: string;
    status: "ACTIVE" | "INACTIVE";
};

type LeadCountRow = {
    tenantId: string;
    status: string;
    count: number;
};

type ClosedLeadValueRow = {
    tenantId: string;
    status: string;
    dealValue: number | null;
    budgetValue: number | null;
};

// Valor de um lead fechado, em centavos: o da negociação quando existe (inclusive R$ 0,00
// informado de propósito) e, se não houver, o orçado no lead. Em centavos inteiros para a
// soma de muitos leads não acumular erro de ponto flutuante (0,1 + 0,2).
const closedLeadValueInCents = (row: ClosedLeadValueRow): number =>
    Math.round((row.dealValue ?? row.budgetValue ?? 0) * 100);

// Total (em centavos) de ganhos e perdas por empresa.
const sumClosedValuesByTenant = (
    rows: ClosedLeadValueRow[],
): Map<string, { wonCents: number; lostCents: number }> => {
    const totals = new Map<string, { wonCents: number; lostCents: number }>();

    for (const row of rows) {
        const current = totals.get(row.tenantId) ?? { wonCents: 0, lostCents: 0 };

        if (row.status === "VENDIDO") {
            current.wonCents += closedLeadValueInCents(row);
        } else if (row.status === "PERDIDO") {
            current.lostCents += closedLeadValueInCents(row);
        }

        totals.set(row.tenantId, current);
    }

    return totals;
};

// Monta um card por empresa a partir da contagem agrupada (empresa x status). Empresas sem
// nenhum lead aparecem com zeros — o Owner precisa ver também quem ainda não recebeu nada.
// Ordenado por total de leads (maior primeiro) e, em empate, por nome.
export const buildTenantCards = (
    tenants: TenantRow[],
    counts: LeadCountRow[],
    closedLeads: ClosedLeadValueRow[] = [],
): OwnerTenantCard[] => {
    const closedValues = sumClosedValuesByTenant(closedLeads);

    return tenants
        .map((tenant) => {
            const tenantCounts = counts.filter((row) => row.tenantId === tenant.id);
            const tenantValues = closedValues.get(tenant.id);
            const countOf = (status: string): number =>
                tenantCounts.find((row) => row.status === status)?.count ?? 0;

            return {
                tenantId: tenant.id,
                name: tenant.name,
                domain: tenant.domain,
                status: tenant.status,
                leadsCount: tenantCounts.reduce((sum, row) => sum + row.count, 0),
                // Qualificado inclui quem já virou Vendido ou Perdido.
                qualifiedLeadsCount: tenantCounts
                    .filter((row) => isQualifiedLeadStatus(row.status))
                    .reduce((sum, row) => sum + row.count, 0),
                lostLeadsCount: countOf("PERDIDO"),
                wonLeadsCount: countOf("VENDIDO"),
                wonValue: (tenantValues?.wonCents ?? 0) / 100,
                lostValue: (tenantValues?.lostCents ?? 0) / 100,
            };
        })
        .sort((a, b) => b.leadsCount - a.leadsCount || a.name.localeCompare(b.name, "pt-BR"));
};

// Ranking de frequência: mais acessos primeiro; empate decide por movimentações de lead e
// depois por nome. Analistas sem nenhuma atividade ficam no fim, em ordem alfabética.
export const sortAnalystsByActivity = (analysts: AnalystActivityItem[]): AnalystActivityItem[] => {
    return [...analysts].sort(
        (a, b) =>
            b.accessCount - a.accessCount ||
            b.leadActionsCount - a.leadActionsCount ||
            a.name.localeCompare(b.name, "pt-BR"),
    );
};
