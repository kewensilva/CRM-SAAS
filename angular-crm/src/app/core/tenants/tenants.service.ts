import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiSuccessResponse } from '../../models/auth.model';
import { Tenant, TenantUser } from '../../models/tenant.model';

type UpdateTenantPayload = Partial<Pick<Tenant, 'name' | 'tradeName' | 'domain' | 'status'>>;

@Injectable({ providedIn: 'root' })
export class TenantsService {
  constructor(private readonly http: HttpClient) {}

  list(): Observable<Tenant[]> {
    return this.http
      .get<ApiSuccessResponse<Tenant[]>>(`${environment.apiUrl}/tenants`)
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
}
