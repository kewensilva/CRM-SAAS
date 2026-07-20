import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiSuccessResponse, LoginRequest, LoginResponseData } from '../../models/auth.model';
import { SessionService } from './session.service';

export const ACCESS_TOKEN_KEY = 'crm_access_token';
const REFRESH_TOKEN_KEY = 'crm_refresh_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(
    private readonly http: HttpClient,
    private readonly session: SessionService,
  ) {}

  login(credentials: LoginRequest): Observable<ApiSuccessResponse<LoginResponseData>> {
    return this.http
      .post<ApiSuccessResponse<LoginResponseData>>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(tap((response) => this.storeTokens(response.data)));
  }

  private storeTokens(tokens: LoginResponseData): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    this.session.loadFromAccessToken(tokens.accessToken);
  }
}
