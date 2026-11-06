import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiSuccessResponse } from '../../models/auth.model';
import {
  ConversionIntegration,
  ConversionLogs,
  ConversionRule,
  SaveConversionIntegrationPayload,
  SaveConversionRulePayload,
} from '../../models/conversion-sync.model';

const BASE = `${environment.apiUrl}/integrations/conversions`;

@Injectable({ providedIn: 'root' })
export class ConversionSyncService {
  constructor(private readonly http: HttpClient) {}

  // URL pública que o cliente cola no RD Station / Bitrix24.
  webhookUrl(token: string): string {
    return `${environment.apiUrl}/webhooks/conversions/${token}`;
  }

  list(): Observable<ConversionIntegration[]> {
    return this.http.get<ApiSuccessResponse<ConversionIntegration[]>>(BASE).pipe(map((response) => response.data));
  }

  create(payload: SaveConversionIntegrationPayload): Observable<ConversionIntegration> {
    return this.http.post<ApiSuccessResponse<ConversionIntegration>>(BASE, payload).pipe(map((response) => response.data));
  }

  update(id: string, payload: SaveConversionIntegrationPayload): Observable<ConversionIntegration> {
    return this.http
      .put<ApiSuccessResponse<ConversionIntegration>>(`${BASE}/${id}`, payload)
      .pipe(map((response) => response.data));
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${BASE}/${id}`);
  }

  regenerateToken(id: string): Observable<ConversionIntegration> {
    return this.http
      .post<ApiSuccessResponse<ConversionIntegration>>(`${BASE}/${id}/regenerate-token`, {})
      .pipe(map((response) => response.data));
  }

  createRule(integrationId: string, payload: SaveConversionRulePayload): Observable<ConversionRule> {
    return this.http
      .post<ApiSuccessResponse<ConversionRule>>(`${BASE}/${integrationId}/rules`, payload)
      .pipe(map((response) => response.data));
  }

  updateRule(integrationId: string, ruleId: string, payload: Partial<SaveConversionRulePayload> & { enabled?: boolean }) {
    return this.http
      .put<ApiSuccessResponse<ConversionRule>>(`${BASE}/${integrationId}/rules/${ruleId}`, payload)
      .pipe(map((response) => response.data));
  }

  removeRule(integrationId: string, ruleId: string): Observable<void> {
    return this.http.delete<void>(`${BASE}/${integrationId}/rules/${ruleId}`);
  }

  testRule(integrationId: string, ruleId: string): Observable<{ ok: true }> {
    return this.http
      .post<ApiSuccessResponse<{ ok: true }>>(`${BASE}/${integrationId}/rules/${ruleId}/test`, {})
      .pipe(map((response) => response.data));
  }

  logs(integrationId: string): Observable<ConversionLogs> {
    return this.http
      .get<ApiSuccessResponse<ConversionLogs>>(`${BASE}/${integrationId}/logs`)
      .pipe(map((response) => response.data));
  }

  retryUpload(uploadId: string): Observable<{ sent: boolean }> {
    return this.http
      .post<ApiSuccessResponse<{ sent: boolean }>>(`${BASE}/uploads/${uploadId}/retry`, {})
      .pipe(map((response) => response.data));
  }

  reprocessWebhook(integrationId: string, logId: string): Observable<{ status: string }> {
    return this.http
      .post<ApiSuccessResponse<{ status: string }>>(`${BASE}/${integrationId}/webhooks/${logId}/reprocess`, {})
      .pipe(map((response) => response.data));
  }
}
