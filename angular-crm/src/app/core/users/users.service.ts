import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiSuccessResponse } from '../../models/auth.model';
import { TenantUser } from '../../models/tenant.model';

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  profile: 'TENANT_ADMIN' | 'MANAGER' | 'USER';
}

// Diferente de TenantsService.listUsers(tenantId) (rota de Owner, /tenants/:id/users),
// esta bate em /users — escopada ao tenant do próprio usuário autenticado via JWT.
@Injectable({ providedIn: 'root' })
export class UsersService {
  constructor(private readonly http: HttpClient) {}

  list(): Observable<TenantUser[]> {
    return this.http
      .get<ApiSuccessResponse<TenantUser[]>>(`${environment.apiUrl}/users`)
      .pipe(map((response) => response.data));
  }

  create(payload: CreateUserPayload): Observable<TenantUser> {
    return this.http
      .post<ApiSuccessResponse<TenantUser>>(`${environment.apiUrl}/users`, payload)
      .pipe(map((response) => response.data));
  }
}
