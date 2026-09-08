export type ProductStatus = 'ACTIVE' | 'INACTIVE';

export interface Product {
  id: string;
  tenantId: string;
  name: string;
  price: string | null;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateProductPayload {
  name: string;
  price?: number;
}

export interface UpdateProductPayload {
  name?: string;
  price?: number;
  status?: ProductStatus;
}
