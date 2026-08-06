import type { Prisma } from "../../../../generated/prisma/client";
import { prisma } from "../../../shared/database/prisma-client";
import { stripUndefined } from "../../../shared/helpers/nullable-fields";
import type { CreateLeadDTO, UpdateLeadDTO } from "../dto/create-lead.dto";
import type { Lead, LeadStatus } from "../types/lead.types";

// Shape bruto retornado por listByTenantWithDetails — leadService.listWithDetails
// converte isso em LeadWithDetails (calcula "source" a partir de webWidgetLogs/metaLogs).
export type LeadRawWithLogs = Lead & {
    deal: { id: string; status: "IN_PROGRESS" | "WON" | "LOST"; value: unknown; lostReason: string | null } | null;
    webWidgetLogs: { id: string }[];
    metaLogs: { id: string }[];
};

// Shape usado só pela exportação — igual ao acima, mas com o que a planilha precisa e o
// resto não usa no Kanban (data da negociação, nome do responsável), pra não pesar a
// listagem comum com campos extras.
export type LeadRawForExport = Lead & {
    deal: { value: unknown; createdAt: Date } | null;
    webWidgetLogs: { id: string }[];
    metaLogs: { id: string }[];
    responsible: { name: string };
};

const create = (data: CreateLeadDTO): Promise<Lead> => {
    return prisma.lead.create({
        data: {
            tenantId: data.tenantId,
            companyId: data.companyId ?? null,
            responsibleUserId: data.responsibleUserId,
            name: data.name,
            email: data.email ?? null,
            phone: data.phone ?? null,
            utmSource: data.utmSource ?? null,
            utmMedium: data.utmMedium ?? null,
            utmCampaign: data.utmCampaign ?? null,
            utmTerm: data.utmTerm ?? null,
            utmContent: data.utmContent ?? null,
        },
    });
};

const findByIdAndTenant = (id: string, tenantId: string): Promise<Lead | null> => {
    return prisma.lead.findFirst({
        where: { id, tenantId, deletedAt: null },
    });
};

const listByTenant = (tenantId: string): Promise<Lead[]> => {
    return prisma.lead.findMany({
        where: { tenantId, deletedAt: null },
        orderBy: { createdAt: "desc" },
    });
};

const countByTenant = (tenantId: string): Promise<number> => {
    return prisma.lead.count({ where: { tenantId, deletedAt: null } });
};

// Contagens sem filtro de tenantId — só para o Dashboard do Owner (agregado de plataforma).
const countAll = (): Promise<number> => {
    return prisma.lead.count({ where: { deletedAt: null } });
};

const countAllByStatus = (status: LeadStatus): Promise<number> => {
    return prisma.lead.count({ where: { status, deletedAt: null } });
};

// Só o necessário pro gráfico de tendência do Dashboard do Owner (agregado de
// plataforma) — sem tenantId, o resto do Lead não interessa pra esse gráfico.
const listCreatedAtAndStatusAll = (): Promise<{ createdAt: Date; status: LeadStatus }[]> => {
    return prisma.lead.findMany({
        where: { deletedAt: null },
        select: { createdAt: true, status: true },
    });
};

const findByTenantAndEmail = (tenantId: string, email: string): Promise<Lead | null> => {
    return prisma.lead.findFirst({
        where: { tenantId, email, deletedAt: null },
    });
};

// Edição geral do Lead (tela "ver detalhes") — nome/e-mail/telefone/observações. Origem
// não passa por aqui: é calculada, nunca uma coluna editável.
const update = (id: string, data: UpdateLeadDTO): Promise<Lead> => {
    const updateData = stripUndefined(data) as unknown as Prisma.LeadUpdateInput;

    return prisma.lead.update({ where: { id }, data: updateData });
};

const updateContactInfo = (
    id: string,
    data: { name?: string; email?: string; phone?: string },
): Promise<Lead> => {
    return prisma.lead.update({ where: { id }, data });
};

// Usado só ao fechar um Lead sem empresa conhecida como Vendido/Perdido — o Deal exige
// companyId, então deal.service.ts cria uma Empresa automática a partir dos dados do
// próprio Lead e vincula aqui, pra não repetir a criação a cada novo Deal desse Lead.
const linkCompany = (id: string, companyId: string): Promise<Lead> => {
    return prisma.lead.update({ where: { id }, data: { companyId } });
};

// Transições simples de Kanban (SEM_CONTATO/NAO_ATENDE/EM_ANDAMENTO) — mover pra
// VENDIDO/PERDIDO passa pela transação de Deal em deal.repository.ts, não por aqui.
// budgetValue só é relevante ao mover pra EM_ANDAMENTO (valor orçado antes de existir
// negociação de fato); demais status nunca chamam com esse parâmetro preenchido.
const updateStatus = (id: string, status: LeadStatus, budgetValue?: number | null): Promise<Lead> => {
    return prisma.lead.update({
        where: { id },
        data: budgetValue === undefined ? { status } : { status, budgetValue },
    });
};

// Kanban de Leads (GET /leads): traz o Deal associado (se já Vendido/Perdido) e a
// presença de logs de integração, pra leadService calcular a "origem" do Lead — tudo
// numa única query, sem N+1.
const listByTenantWithLogs = (tenantId: string): Promise<LeadRawWithLogs[]> => {
    return prisma.lead.findMany({
        where: { tenantId, deletedAt: null },
        orderBy: { createdAt: "desc" },
        include: {
            deal: { select: { id: true, status: true, value: true, lostReason: true } },
            webWidgetLogs: { take: 1, select: { id: true } },
            metaLogs: { take: 1, select: { id: true } },
        },
    }) as unknown as Promise<LeadRawWithLogs[]>;
};

// Exportação: só os leads pedidos (respeitando o filtro já aplicado no front-end),
// com o nome do responsável e a data da negociação (Vendido/Perdido) já resolvidos.
const listByIdsAndTenantForExport = (tenantId: string, ids: string[]): Promise<LeadRawForExport[]> => {
    return prisma.lead.findMany({
        where: { tenantId, id: { in: ids }, deletedAt: null },
        orderBy: { createdAt: "desc" },
        include: {
            deal: { select: { value: true, createdAt: true } },
            webWidgetLogs: { take: 1, select: { id: true } },
            metaLogs: { take: 1, select: { id: true } },
            responsible: { select: { name: true } },
        },
    }) as unknown as Promise<LeadRawForExport[]>;
};

export const leadRepository = {
    create,
    findByIdAndTenant,
    listByTenant,
    listByTenantWithLogs,
    listByIdsAndTenantForExport,
    countByTenant,
    countAll,
    countAllByStatus,
    listCreatedAtAndStatusAll,
    findByTenantAndEmail,
    update,
    updateContactInfo,
    updateStatus,
    linkCompany,
};
