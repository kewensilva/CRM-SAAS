import type { Prisma } from "../../../../generated/prisma/client";
import { prisma } from "../../../shared/database/prisma-client";
import { stripUndefined } from "../../../shared/helpers/nullable-fields";
import type { CreateProductDTO, UpdateProductDTO } from "../dto/create-product.dto";
import type { Product } from "../types/product.types";

const create = (data: CreateProductDTO): Promise<Product> => {
    const createData = stripUndefined(data) as unknown as Prisma.ProductUncheckedCreateInput;

    return prisma.product.create({ data: createData });
};

// Única listagem — serve tanto a tela de gestão (Analista, mostra status) quanto o
// seletor de produto ao fechar Vendido (frontend filtra ACTIVE ali, ver value-dialog).
const listByTenant = (tenantId: string): Promise<Product[]> => {
    return prisma.product.findMany({
        where: { tenantId, deletedAt: null },
        orderBy: { name: "asc" },
    });
};

const findByIdAndTenant = (id: string, tenantId: string): Promise<Product | null> => {
    return prisma.product.findFirst({ where: { id, tenantId, deletedAt: null } });
};

const update = (id: string, data: UpdateProductDTO): Promise<Product> => {
    const updateData = stripUndefined(data) as unknown as Prisma.ProductUpdateInput;

    return prisma.product.update({ where: { id }, data: updateData });
};

const softDelete = (id: string): Promise<Product> => {
    return prisma.product.update({ where: { id }, data: { deletedAt: new Date() } });
};

export const productRepository = {
    create,
    listByTenant,
    findByIdAndTenant,
    update,
    softDelete,
};
