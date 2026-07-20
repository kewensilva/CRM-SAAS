import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiSuccessResponse } from '../../models/auth.model';
import { TenantWidget } from '../../models/widget.model';

type UpdateWidgetPayload = Partial<
  Omit<TenantWidget, 'id' | 'tenantId' | 'createdAt' | 'updatedAt' | 'deletedAt'>
>;

@Injectable({ providedIn: 'root' })
export class WidgetsService {
  constructor(private readonly http: HttpClient) {}

  get(tenantId: string): Observable<TenantWidget | null> {
    return this.http
      .get<ApiSuccessResponse<TenantWidget>>(`${environment.apiUrl}/tenants/${tenantId}/widget`)
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

  update(tenantId: string, data: UpdateWidgetPayload): Observable<TenantWidget> {
    return this.http
      .put<ApiSuccessResponse<TenantWidget>>(`${environment.apiUrl}/tenants/${tenantId}/widget`, data)
      .pipe(map((response) => response.data));
  }
}
