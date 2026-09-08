export type ProductStatus = "ACTIVE" | "INACTIVE";

// Catálogo de produtos por tenant — cadastrado pelo Analista em Parâmetros, selecionado
// opcionalmente ao fechar um Deal como Vendido (ver products module e deal.service.ts).
export type Product = {
    id: string;
    tenantId: string;
    name: string;
    price: unknown;
    status: ProductStatus;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
};
