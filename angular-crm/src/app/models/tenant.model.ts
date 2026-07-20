export interface Tenant {
  id: string;
  name: string;
  tradeName: string | null;
  domain: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface TenantUser {
  id: string;
  name: string;
  email: string;
  profile: 'OWNER' | 'TENANT_ADMIN' | 'MANAGER' | 'USER';
  status: 'ACTIVE' | 'INACTIVE';
}
