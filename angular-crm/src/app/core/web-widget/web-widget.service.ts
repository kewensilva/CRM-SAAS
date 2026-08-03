import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiSuccessResponse } from '../../models/auth.model';
import { WebWidgetIntegration, WebWidgetLog } from '../../models/web-widget.model';

type UpdateWebWidgetPayload = Partial<
  Omit<WebWidgetIntegration, 'id' | 'tenantId' | 'publicKey' | 'createdAt' | 'updatedAt' | 'deletedAt'>
>;

@Injectable({ providedIn: 'root' })
export class WebWidgetService {
  constructor(private readonly http: HttpClient) {}

  get(): Observable<WebWidgetIntegration | null> {
    return this.http
      .get<ApiSuccessResponse<WebWidgetIntegration>>(`${environment.apiUrl}/integrations/web-widget`)
      .pipe(
        map((response) => response.data),
        catchError((error: HttpErrorResponse) => {
          if (error.status === 404) {
            return of(null);
          }

          return throwError(() => error);
        }),
      );
  }

  update(data: UpdateWebWidgetPayload): Observable<WebWidgetIntegration> {
    return this.http
      .put<ApiSuccessResponse<WebWidgetIntegration>>(`${environment.apiUrl}/integrations/web-widget`, data)
      .pipe(map((response) => response.data));
  }

  regenerateKey(): Observable<WebWidgetIntegration> {
    return this.http
      .post<ApiSuccessResponse<WebWidgetIntegration>>(
        `${environment.apiUrl}/integrations/web-widget/regenerate-key`,
        {},
      )
      .pipe(map((response) => response.data));
  }

  listLogs(): Observable<WebWidgetLog[]> {
    return this.http
      .get<ApiSuccessResponse<WebWidgetLog[]>>(`${environment.apiUrl}/integrations/web-widget/logs`)
      .pipe(map((response) => response.data));
  }

  // Contrapartes do Owner: configurar o widget de um tenant específico (tela "Empresas"),
  // não o próprio tenant do usuário autenticado — mesma API, prefixo /tenants/:tenantId/*.
  getForTenant(tenantId: string): Observable<WebWidgetIntegration | null> {
    return this.http
      .get<ApiSuccessResponse<WebWidgetIntegration>>(
        `${environment.apiUrl}/tenants/${tenantId}/web-widget`,
      )
      .pipe(
        map((response) => response.data),
        catchError((error: HttpErrorResponse) => {
          if (error.status === 404) {
            return of(null);
          }

          return throwError(() => error);
        }),
      );
  }

  updateForTenant(
    tenantId: string,
    data: UpdateWebWidgetPayload,
  ): Observable<WebWidgetIntegration> {
    return this.http
      .put<ApiSuccessResponse<WebWidgetIntegration>>(
        `${environment.apiUrl}/tenants/${tenantId}/web-widget`,
        data,
      )
      .pipe(map((response) => response.data));
  }

  regenerateKeyForTenant(tenantId: string): Observable<WebWidgetIntegration> {
    return this.http
      .post<ApiSuccessResponse<WebWidgetIntegration>>(
        `${environment.apiUrl}/tenants/${tenantId}/web-widget/regenerate-key`,
        {},
      )
      .pipe(map((response) => response.data));
  }

  listLogsForTenant(tenantId: string): Observable<WebWidgetLog[]> {
    return this.http
      .get<ApiSuccessResponse<WebWidgetLog[]>>(
        `${environment.apiUrl}/tenants/${tenantId}/web-widget/logs`,
      )
      .pipe(map((response) => response.data));
  }
}
