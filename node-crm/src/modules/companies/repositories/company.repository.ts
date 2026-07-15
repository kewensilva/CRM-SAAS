import type { Prisma } from "../../../../generated/prisma/client";
import { prisma } from "../../../shared/database/prisma-client";
import { stripUndefined, undefinedToNull } from "../../../shared/helpers/nullable-fields";
import type { CreateCompanyDTO } from "../dto/create-company.dto";
import type { UpdateCompanyDTO } from "../dto/update-company.dto";
import type { Company } from "../types/company.types";

const create = (data: CreateCompanyDTO): Promise<Company> => {
    const createData = undefinedToNull(data) as unknown as Prisma.CompanyCreateInput;

    return prisma.company.create({ data: createData });
};

const findByIdAndTenant = (id: string, tenantId: string): Promise<Company | null> => {
    return prisma.company.findFirst({
        where: { id, tenantId, deletedAt: null },
    });
};

const listByTenant = (
    tenantId: string,
    params: { page: number; pageSize: number; search?: string | undefined },
): Promise<{ items: Company[]; totalItems: number }> => {
    const where = {
        tenantId,
        deletedAt: null,
        ...(params.search
            ? { name: { contains: params.search, mode: "insensitive" as const } }
            : {}),
    };

    return prisma.$transaction(async (tx) => {
        const [items, totalItems] = await Promise.all([
            tx.company.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip: (params.page - 1) * params.pageSize,
                take: params.pageSize,
            }),
            tx.company.count({ where }),
        ]);

        return { items, totalItems };
    });
};

const update = (id: string, data: UpdateCompanyDTO): Promise<Company> => {
    const updateData = stripUndefined(data) as unknown as Prisma.CompanyUpdateInput;

    return prisma.company.update({ where: { id }, data: updateData });
};

const softDelete = (id: string): Promise<Company> => {
    return prisma.company.update({ where: { id }, data: { deletedAt: new Date() } });
};

export const companyRepository = {
    create,
    findByIdAndTenant,
    listByTenant,
    update,
    softDelete,
};
