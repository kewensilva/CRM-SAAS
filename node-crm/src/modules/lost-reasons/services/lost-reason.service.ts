import { NotFoundError } from "../../../shared/errors";
import { lostReasonRepository } from "../repositories/lost-reason.repository";
import type { LostReason } from "../types/lost-reason.types";

const list = (tenantId: string | null): Promise<LostReason[]> => {
    return tenantId ? lostReasonRepository.listForTenant(tenantId) : lostReasonRepository.listGlobal();
};

const create = (tenantId: string | null, label: string): Promise<LostReason> => {
    return lostReasonRepository.create({ tenantId, label });
};

const remove = async (id: string, tenantId: string | null): Promise<void> => {
    const reason = await lostReasonRepository.findByIdAndScope(id, tenantId);

    if (!reason) {
        throw new NotFoundError("Motivo não encontrado.");
    }

    await lostReasonRepository.softDelete(id);
};

export const lostReasonService = {
    list,
    create,
    remove,
};
