import { prisma } from "../../../shared/database/prisma-client";
import type { CreateLostReasonDTO } from "../dto/create-lost-reason.dto";
import type { LostReason } from "../types/lost-reason.types";

const create = (data: CreateLostReasonDTO): Promise<LostReason> => {
    return prisma.lostReason.create({ data });
};

// Lista exibida para um tenant: os motivos globais (cadastrados pelo Owner) + os
// próprios do tenant, mesclados numa única lista ordenada alfabeticamente.
const listForTenant = (tenantId: string): Promise<LostReason[]> => {
    return prisma.lostReason.findMany({
        where: { deletedAt: null, OR: [{ tenantId: null }, { tenantId }] },
        orderBy: { label: "asc" },
    });
};

// Lista exibida para o Owner: só o baseline global (Owner não opera dentro de tenants,
// ver multi-tenant.md).
const listGlobal = (): Promise<LostReason[]> => {
    return prisma.lostReason.findMany({
        where: { deletedAt: null, tenantId: null },
        orderBy: { label: "asc" },
    });
};

// tenantId aqui é o escopo de quem está pedindo (null = Owner, string = Tenant Admin) —
// garante que cada um só enxergue/apague motivos que ele mesmo cadastrou.
const findByIdAndScope = (id: string, tenantId: string | null): Promise<LostReason | null> => {
    return prisma.lostReason.findFirst({ where: { id, tenantId, deletedAt: null } });
};

const softDelete = (id: string): Promise<LostReason> => {
    return prisma.lostReason.update({ where: { id }, data: { deletedAt: new Date() } });
};

export const lostReasonRepository = {
    create,
    listForTenant,
    listGlobal,
    findByIdAndScope,
    softDelete,
};
