import { prisma } from "../../../shared/database/prisma-client";
import type { Owner } from "../types/owner.types";

type CreateOwnerData = {
    name: string;
    email: string;
    passwordHash: string;
};

// Nunca seleciona passwordHash (nem tenantId/updatedAt/deletedAt, que também não fazem
// parte do shape público Owner) — restringe no próprio select do Prisma, não só no tipo
// de retorno, pra não correr risco de vazar o hash em algum JSON.stringify por engano.
const PUBLIC_SELECT = { id: true, name: true, email: true, status: true, createdAt: true } as const;

// Owner é um User comum com profile OWNER e tenantId nulo — mesma tabela, sem modelo
// próprio (igual ao Analista, ver modules/analysts).
const create = (data: CreateOwnerData): Promise<Owner> => {
    return prisma.user.create({
        data: {
            tenantId: null,
            name: data.name,
            email: data.email,
            passwordHash: data.passwordHash,
            profile: "OWNER",
        },
        select: PUBLIC_SELECT,
    });
};

const list = (): Promise<Owner[]> => {
    return prisma.user.findMany({
        where: { profile: "OWNER", deletedAt: null },
        orderBy: { createdAt: "asc" },
        select: PUBLIC_SELECT,
    });
};

const findById = (id: string): Promise<Owner | null> => {
    return prisma.user.findFirst({
        where: { id, profile: "OWNER", deletedAt: null },
        select: PUBLIC_SELECT,
    });
};

const softDelete = (id: string): Promise<void> => {
    return prisma.user.update({ where: { id }, data: { deletedAt: new Date() } }).then(() => undefined);
};

export const ownerRepository = {
    create,
    list,
    findById,
    softDelete,
};
