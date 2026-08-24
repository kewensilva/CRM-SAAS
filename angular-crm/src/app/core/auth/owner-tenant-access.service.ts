import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiSuccessResponse, LoginResponseData } from '../../models/auth.model';
import { AuthService } from './auth.service';

// Owner acessando/saindo diretamente da base de um cliente — mesmo mecanismo de troca de
// tokens do TenantSwitchService (Analista), endpoints próprios porque o Owner não passa
// por uma tabela de acesso (ver auth.service.ts > enterTenant no backend).
@Injectable({ providedIn: 'root' })
export class OwnerTenantAccessService {
  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
  ) {}

  enterTenant(tenantId: string): Observable<LoginResponseData> {
    return this.http
      .post<ApiSuccessResponse<LoginResponseData>>(`${environment.apiUrl}/auth/enter-tenant`, { tenantId })
      .pipe(
        map((response) => response.data),
        tap((tokens) => this.authService.storeTokens(tokens)),
      );
  }

  exitTenant(): Observable<LoginResponseData> {
    return this.http
      .post<ApiSuccessResponse<LoginResponseData>>(`${environment.apiUrl}/auth/exit-tenant`, {})
      .pipe(
        map((response) => response.data),
        tap((tokens) => this.authService.storeTokens(tokens)),
      );
  }
}
