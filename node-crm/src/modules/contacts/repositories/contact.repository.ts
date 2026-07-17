import type { Prisma } from "../../../../generated/prisma/client";
import { prisma } from "../../../shared/database/prisma-client";
import { stripUndefined, undefinedToNull } from "../../../shared/helpers/nullable-fields";
import type { CreateContactDTO } from "../dto/create-contact.dto";
import type { UpdateContactDTO } from "../dto/update-contact.dto";
import type { Contact } from "../types/contact.types";

const create = (data: CreateContactDTO): Promise<Contact> => {
    const createData = undefinedToNull(data) as unknown as Prisma.ContactCreateInput;

    return prisma.contact.create({ data: createData });
};

const findByIdAndTenant = (id: string, tenantId: string): Promise<Contact | null> => {
    return prisma.contact.findFirst({
        where: { id, tenantId, deletedAt: null },
    });
};

const listByTenant = (
    tenantId: string,
    params: { page: number; pageSize: number; companyId?: string | undefined; search?: string | undefined },
): Promise<{ items: Contact[]; totalItems: number }> => {
    const where = {
        tenantId,
        deletedAt: null,
        ...(params.companyId ? { companyId: params.companyId } : {}),
        ...(params.search
            ? { name: { contains: params.search, mode: "insensitive" as const } }
            : {}),
    };

    return prisma.$transaction(async (tx) => {
        const [items, totalItems] = await Promise.all([
            tx.contact.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip: (params.page - 1) * params.pageSize,
                take: params.pageSize,
            }),
            tx.contact.count({ where }),
        ]);

        return { items, totalItems };
    });
};

const update = (id: string, data: UpdateContactDTO): Promise<Contact> => {
    const updateData = stripUndefined(data) as unknown as Prisma.ContactUpdateInput;

    return prisma.contact.update({ where: { id }, data: updateData });
};

const softDelete = (id: string): Promise<Contact> => {
    return prisma.contact.update({ where: { id }, data: { deletedAt: new Date() } });
};

export const contactRepository = {
    create,
    findByIdAndTenant,
    listByTenant,
    update,
    softDelete,
};
