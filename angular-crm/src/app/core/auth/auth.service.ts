import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  ApiSuccessResponse,
  ForgotPasswordResponseData,
  LoginRequest,
  LoginResponseData,
} from '../../models/auth.model';
import { SessionService } from './session.service';
import { resolveTenantSlug } from './tenant-slug.util';

export const ACCESS_TOKEN_KEY = 'crm_access_token';
export const REFRESH_TOKEN_KEY = 'crm_refresh_token';
export const MUST_CHANGE_PASSWORD_KEY = 'crm_must_change_password';

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
    localStorage.setItem(MUST_CHANGE_PASSWORD_KEY, String(tokens.mustChangePassword));
    this.session.loadFromAccessToken(tokens.accessToken);
    this.session.setMustChangePassword(tokens.mustChangePassword);
  }

  // Primeiro acesso (qualquer perfil) ou depois de um reset de senha feito por um Tenant
  // Admin — pede a senha atual por segurança, mesmo sendo obrigatório (ver
  // auth.service.ts > changeOwnPassword no backend).
  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.http
      .put<void>(`${environment.apiUrl}/auth/change-password`, { currentPassword, newPassword })
      .pipe(
        tap(() => {
          localStorage.setItem(MUST_CHANGE_PASSWORD_KEY, 'false');
          this.session.setMustChangePassword(false);
        }),
      );
  }

  // Sempre "sucesso" na resposta, exista ou não o e-mail (o backend nunca revela isso) —
  // a tela sempre mostra a mesma mensagem genérica.
  forgotPassword(email: string): Observable<ApiSuccessResponse<ForgotPasswordResponseData>> {
    return this.http.post<ApiSuccessResponse<ForgotPasswordResponseData>>(
      `${environment.apiUrl}/auth/forgot-password`,
      { email },
    );
  }

  resetPassword(token: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/auth/reset-password`, { token, newPassword });
  }

  // Usado tanto pelo clique manual em "Sair" quanto pelo interceptor de erro (sessão
  // expirada) — sempre volta para /login, em todos os níveis de acesso (Owner/Tenant/Analista).
  logout(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(MUST_CHANGE_PASSWORD_KEY);
    this.session.clear();
    this.router.navigateByUrl('/login');
  }
}
