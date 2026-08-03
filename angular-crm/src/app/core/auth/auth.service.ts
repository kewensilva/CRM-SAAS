import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiSuccessResponse, LoginRequest, LoginResponseData } from '../../models/auth.model';
import { SessionService } from './session.service';
import { resolveTenantSlug } from './tenant-slug.util';

export const ACCESS_TOKEN_KEY = 'crm_access_token';
export const REFRESH_TOKEN_KEY = 'crm_refresh_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(
    private readonly http: HttpClient,
    private readonly session: SessionService,
    private readonly router: Router,
  ) {}

  // Sem campo de domínio pro usuário preencher: o tenant vem do próprio subdomínio que ele
  // está acessando (crm.cmb.<slug>.com) — resolvido aqui a partir de window.location, nunca
  // digitado. No domínio base (sem slug), só Owner/Analista conseguem entrar (backend).
  login(credentials: Pick<LoginRequest, 'email' | 'password'>): Observable<ApiSuccessResponse<LoginResponseData>> {
    const tenantSlug = resolveTenantSlug(window.location.hostname, environment.baseDomain);
    const payload: LoginRequest = tenantSlug ? { ...credentials, tenantSlug } : credentials;

    return this.http
      .post<ApiSuccessResponse<LoginResponseData>>(`${environment.apiUrl}/auth/login`, payload)
      .pipe(tap((response) => this.storeTokens(response.data)));
  }

  storeTokens(tokens: LoginResponseData): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    this.session.loadFromAccessToken(tokens.accessToken);
  }

  // Usado tanto pelo clique manual em "Sair" quanto pelo interceptor de erro (sessão
  // expirada) — sempre volta para /login, em todos os níveis de acesso (Owner/Tenant/Analista).
  logout(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    this.session.clear();
    this.router.navigateByUrl('/login');
  }
}
