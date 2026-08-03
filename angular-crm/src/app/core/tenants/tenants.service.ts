import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiSuccessResponse } from '../../models/auth.model';
import { Tenant, TenantUser } from '../../models/tenant.model';

type UpdateTenantPayload = Partial<Pick<Tenant, 'name' | 'tradeName' | 'domain' | 'status'>>;

export interface CreateTenantPayload {
  name: string;
  tradeName?: string;
  domain: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
}

export type TenantUserProfile = 'TENANT_ADMIN' | 'MANAGER' | 'USER';

export interface CreateTenantUserPayload {
  name: string;
  email: string;
  password: string;
  profile: TenantUserProfile;
}

export interface UpdateTenantUserPayload {
  name?: string;
  email?: string;
  profile?: TenantUserProfile;
  status?: 'ACTIVE' | 'INACTIVE';
}

@Injectable({ providedIn: 'root' })
export class TenantsService {
  constructor(private readonly http: HttpClient) {}

  list(): Observable<Tenant[]> {
    return this.http
      .get<ApiSuccessResponse<Tenant[]>>(`${environment.apiUrl}/tenants`)
      .pipe(map((response) => response.data));
  }

  create(data: CreateTenantPayload): Observable<Tenant> {
    return this.http
      .post<ApiSuccessResponse<Tenant>>(`${environment.apiUrl}/tenants`, data)
      .pipe(map((response) => response.data));
  }

  update(id: string, data: UpdateTenantPayload): Observable<Tenant> {
    return this.http
      .put<ApiSuccessResponse<Tenant>>(`${environment.apiUrl}/tenants/${id}`, data)
      .pipe(map((response) => response.data));
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/tenants/${id}`);
  }

  listUsers(tenantId: string): Observable<TenantUser[]> {
    return this.http
      .get<ApiSuccessResponse<TenantUser[]>>(`${environment.apiUrl}/tenants/${tenantId}/users`)
      .pipe(map((response) => response.data));
  }

  createUser(tenantId: string, data: CreateTenantUserPayload): Observable<TenantUser> {
    return this.http
      .post<ApiSuccessResponse<TenantUser>>(`${environment.apiUrl}/tenants/${tenantId}/users`, data)
      .pipe(map((response) => response.data));
  }

  updateUser(tenantId: string, userId: string, data: UpdateTenantUserPayload): Observable<TenantUser> {
    return this.http
      .put<ApiSuccessResponse<TenantUser>>(
        `${environment.apiUrl}/tenants/${tenantId}/users/${userId}`,
        data,
      )
      .pipe(map((response) => response.data));
  }

  removeUser(tenantId: string, userId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/tenants/${tenantId}/users/${userId}`);
  }
}
