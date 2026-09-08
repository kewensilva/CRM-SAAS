import { NotFoundError } from "../../../shared/errors";
import type { CreateBudgetEntryDTO, UpdateBudgetEntryDTO } from "../dto/create-budget-entry.dto";
import { budgetEntryRepository } from "../repositories/budget-entry.repository";
import type { BudgetEntry } from "../types/budget-entry.types";

const list = (tenantId: string, month?: Date): Promise<BudgetEntry[]> => {
    return budgetEntryRepository.listByTenant(tenantId, month);
};

const upsert = (data: CreateBudgetEntryDTO): Promise<BudgetEntry> => {
    return budgetEntryRepository.upsertEntry(data);
};

const update = async (id: string, tenantId: string, data: UpdateBudgetEntryDTO): Promise<BudgetEntry> => {
    const entry = await budgetEntryRepository.findByIdAndTenant(id, tenantId);

    if (!entry) {
        throw new NotFoundError("Entrada de budget não encontrada.");
    }

    return budgetEntryRepository.update(id, data);
};

const remove = async (id: string, tenantId: string): Promise<void> => {
    const entry = await budgetEntryRepository.findByIdAndTenant(id, tenantId);

    if (!entry) {
        throw new NotFoundError("Entrada de budget não encontrada.");
    }

    await budgetEntryRepository.softDelete(id);
};

export const budgetEntryService = {
    list,
    upsert,
    update,
    remove,
};
