import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiSuccessResponse } from '../../models/auth.model';
import {
  MetaIntegration,
  MetaIntegrationLog,
  MetaOAuthExchangeResult,
} from '../../models/meta-integration.model';

// pageAccessToken só existe no envio (configuração manual): a API nunca o devolve.
type UpdateMetaIntegrationPayload = Partial<
  Pick<MetaIntegration, 'enabled' | 'pageId' | 'defaultResponsibleUserId' | 'duplicateStrategy'>
> & { pageAccessToken?: string };

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
  // "Conectar com o Facebook": 1) pede a URL de autorização; 2) troca o code devolvido pela
  // Meta por uma lista de Páginas; 3) conecta a Página escolhida.
  getAuthorizationUrl(): Observable<string> {
    return this.http
      .get<ApiSuccessResponse<{ url: string }>>(`${environment.apiUrl}/integrations/meta/oauth/url`)
      .pipe(map((response) => response.data.url));
  }

  exchangeCode(code: string, state: string): Observable<MetaOAuthExchangeResult> {
    return this.http
      .post<ApiSuccessResponse<MetaOAuthExchangeResult>>(
        `${environment.apiUrl}/integrations/meta/oauth/exchange`,
        { code, state },
      )
      .pipe(map((response) => response.data));
  }

  connectPage(sessionId: string, pageId: string): Observable<MetaIntegration> {
    return this.http
      .post<ApiSuccessResponse<MetaIntegration>>(
        `${environment.apiUrl}/integrations/meta/oauth/connect`,
        { sessionId, pageId },
      )
      .pipe(map((response) => response.data));
  }

  disconnect(): Observable<MetaIntegration> {
    return this.http
      .post<ApiSuccessResponse<MetaIntegration>>(`${environment.apiUrl}/integrations/meta/disconnect`, {})
      .pipe(map((response) => response.data));
  }
  listLogs(): Observable<MetaIntegrationLog[]> {
    return this.http
      .get<ApiSuccessResponse<MetaIntegrationLog[]>>(`${environment.apiUrl}/integrations/meta/logs`)
      .pipe(map((response) => response.data));
  }
}
