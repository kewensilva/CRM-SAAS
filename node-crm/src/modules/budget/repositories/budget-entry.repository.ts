import type { Prisma } from "../../../../generated/prisma/client";
import { prisma } from "../../../shared/database/prisma-client";
import { stripUndefined } from "../../../shared/helpers/nullable-fields";
import type { CreateBudgetEntryDTO, CreateBudgetPeriodDTO, UpdateBudgetEntryDTO, } from "../dto/create-budget-entry.dto";
import type { BudgetEntry } from "../types/budget-entry.types";

// Upsert por (tenantId, channelName, month) — o Analista tende a reabrir o mesmo canal
// no mesmo mês pra ajustar o valor, então "criar" com uma combinação já existente
// atualiza em vez de dar conflito (mais natural que forçar edição por id nesse fluxo).
const upsertEntry = (data: CreateBudgetEntryDTO): Promise<BudgetEntry> => {
    const createData = stripUndefined(data) as unknown as Prisma.BudgetEntryUncheckedCreateInput;

    return prisma.budgetEntry.upsert({
        where: {
            tenantId_channelName_month: {
                tenantId: data.tenantId,
                channelName: data.channelName,
                month: data.month,
            },
        },
        // deletedAt: null reativa o registro se o Analista excluiu esse canal/mês e depois
        // recadastrou o mesmo canal+mês — sem isso o upsert só atualizava budget/investment
        // e o registro continuava invisível pra listByTenant (que filtra deletedAt: null).
        update: stripUndefined({
            budget: data.budget,
            investment: data.investment,
            deletedAt: null,
        }) as unknown as Prisma.BudgetEntryUpdateInput,
        create: createData,
    }) as unknown as Promise<BudgetEntry>;
};
// Define o mesmo budget mensal para N meses consecutivos (startMonth, startMonth+1, ...).
// Só budget (e deletedAt: null) é gravado no update — o investment já lançado em cada mês
// não é tocado; meses novos nascem com investment = 0 (default da coluna). Tudo numa
// transação: ou o período inteiro é gravado, ou nada.
const upsertPeriod = (data: CreateBudgetPeriodDTO): Promise<BudgetEntry[]> => {
    const startYear = data.startMonth.getUTCFullYear();
    const startMonthIndex = data.startMonth.getUTCMonth();

    const operations = Array.from({ length: data.months }, (_, offset) => {
        // Date.UTC normaliza o estouro de mês (ex.: mês 13 -> janeiro do ano seguinte).
        const month = new Date(Date.UTC(startYear, startMonthIndex + offset, 1));

        return prisma.budgetEntry.upsert({
            where: {
                tenantId_channelName_month: {
                    tenantId: data.tenantId,
                    channelName: data.channelName,
                    month,
                },
            },
            update: { budget: data.budget, deletedAt: null },
            create: {
                tenantId: data.tenantId,
                channelName: data.channelName,
                month,
                budget: data.budget,
            },
        });
    });

    return prisma.$transaction(operations) as unknown as Promise<BudgetEntry[]>;
};
// month opcional: sem filtro, lista todas as entradas do tenant (histórico completo,
// usado pra construir o seletor "mês a mês"); com filtro, só as do mês pedido.
const listByTenant = (tenantId: string, month?: Date): Promise<BudgetEntry[]> => {
    return prisma.budgetEntry.findMany({
        where: { tenantId, deletedAt: null, ...(month ? { month } : {}) },
        orderBy: [{ month: "desc" }, { channelName: "asc" }],
    }) as unknown as Promise<BudgetEntry[]>;
};

const findByIdAndTenant = (id: string, tenantId: string): Promise<BudgetEntry | null> => {
    return prisma.budgetEntry.findFirst({
        where: { id, tenantId, deletedAt: null },
    }) as unknown as Promise<BudgetEntry | null>;
};

const update = (id: string, data: UpdateBudgetEntryDTO): Promise<BudgetEntry> => {
    const updateData = stripUndefined(data) as unknown as Prisma.BudgetEntryUpdateInput;

    return prisma.budgetEntry.update({ where: { id }, data: updateData }) as unknown as Promise<BudgetEntry>;
};

const softDelete = (id: string): Promise<BudgetEntry> => {
    return prisma.budgetEntry.update({
        where: { id },
        data: { deletedAt: new Date() },
    }) as unknown as Promise<BudgetEntry>;
};

export const budgetEntryRepository = {
    upsertEntry,
    upsertPeriod,
    listByTenant,
    findByIdAndTenant,
    update,
    softDelete,
};
