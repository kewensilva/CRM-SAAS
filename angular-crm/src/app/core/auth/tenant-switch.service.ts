import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiSuccessResponse, LoginResponseData } from '../../models/auth.model';
import { AnalystTenantAccess } from '../../models/analyst.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class TenantSwitchService {
  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
  ) {}

  myTenantAccess(): Observable<AnalystTenantAccess[]> {
    return this.http
      .get<ApiSuccessResponse<AnalystTenantAccess[]>>(`${environment.apiUrl}/auth/my-tenant-access`)
      .pipe(map((response) => response.data));
  }

  switchTenant(tenantId: string): Observable<LoginResponseData> {
    return this.http
      .post<ApiSuccessResponse<LoginResponseData>>(`${environment.apiUrl}/auth/switch-tenant`, { tenantId })
      .pipe(
        map((response) => response.data),
        tap((tokens) => this.authService.storeTokens(tokens)),
      );
  }
}
