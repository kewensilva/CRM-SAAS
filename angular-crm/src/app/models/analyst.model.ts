export interface AnalystTenantAccess {
  tenantId: string;
  tenantName: string;
}

export interface Analyst {
  id: string;
  name: string;
  email: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  tenantAccess: AnalystTenantAccess[];
}

export interface CreateAnalystPayload {
  name: string;
  email: string;
  password: string;
  tenantIds: string[];
}
