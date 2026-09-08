export type CreateProductDTO = {
    tenantId: string;
    name: string;
    price?: number | undefined;
};

export type UpdateProductDTO = {
    name?: string | undefined;
    price?: number | undefined;
    status?: "ACTIVE" | "INACTIVE" | undefined;
};
