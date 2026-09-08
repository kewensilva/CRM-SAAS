import { NotFoundError } from "../../../shared/errors";
import type { CreateProductDTO, UpdateProductDTO } from "../dto/create-product.dto";
import { productRepository } from "../repositories/product.repository";
import type { Product } from "../types/product.types";

const list = (tenantId: string): Promise<Product[]> => {
    return productRepository.listByTenant(tenantId);
};

const create = (data: CreateProductDTO): Promise<Product> => {
    return productRepository.create(data);
};

const update = async (id: string, tenantId: string, data: UpdateProductDTO): Promise<Product> => {
    const product = await productRepository.findByIdAndTenant(id, tenantId);

    if (!product) {
        throw new NotFoundError("Produto não encontrado.");
    }

    return productRepository.update(id, data);
};

const remove = async (id: string, tenantId: string): Promise<void> => {
    const product = await productRepository.findByIdAndTenant(id, tenantId);

    if (!product) {
        throw new NotFoundError("Produto não encontrado.");
    }

    await productRepository.softDelete(id);
};

export const productService = {
    list,
    create,
    update,
    remove,
};
