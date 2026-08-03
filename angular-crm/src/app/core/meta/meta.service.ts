import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiSuccessResponse } from '../../models/auth.model';
import { MetaIntegration, MetaIntegrationLog } from '../../models/meta-integration.model';

type UpdateMetaIntegrationPayload = Partial<
  Omit<MetaIntegration, 'id' | 'tenantId' | 'createdAt' | 'updatedAt' | 'deletedAt'>
>;

@Injectable({ providedIn: 'root' })
export class MetaService {
  constructor(private readonly http: HttpClient) {}

  get(): Observable<MetaIntegration | null> {
    return this.http
      .get<ApiSuccessResponse<MetaIntegration>>(`${environment.apiUrl}/integrations/meta`)
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

  update(data: UpdateMetaIntegrationPayload): Observable<MetaIntegration> {
    return this.http
      .put<ApiSuccessResponse<MetaIntegration>>(`${environment.apiUrl}/integrations/meta`, data)
      .pipe(map((response) => response.data));
  }

  listLogs(): Observable<MetaIntegrationLog[]> {
    return this.http
      .get<ApiSuccessResponse<MetaIntegrationLog[]>>(`${environment.apiUrl}/integrations/meta/logs`)
      .pipe(map((response) => response.data));
  }
}
