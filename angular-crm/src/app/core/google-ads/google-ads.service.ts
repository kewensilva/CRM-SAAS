import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiSuccessResponse } from '../../models/auth.model';
import {
  GoogleAdsAccount,
  GoogleAdsConnection,
  GoogleAdsConversionAction,
  GoogleAdsRule,
  GoogleAdsUpload,
  SaveGoogleAdsRulePayload,
} from '../../models/google-ads.model';

const BASE = `${environment.apiUrl}/integrations/google-ads`;

@Injectable({ providedIn: 'root' })
export class GoogleAdsService {
  constructor(private readonly http: HttpClient) {}

  private get<T>(path: string): Observable<T> {
    return this.http.get<ApiSuccessResponse<T>>(`${BASE}${path}`).pipe(map((response) => response.data));
  }

  private send<T>(method: 'post' | 'put' | 'delete', path: string, body: unknown = {}): Observable<T> {
    const url = `${BASE}${path}`;
    let request: Observable<ApiSuccessResponse<T>>;

    if (method === 'delete') {
      request = this.http.delete<ApiSuccessResponse<T>>(url);
    } else if (method === 'put') {
      request = this.http.put<ApiSuccessResponse<T>>(url, body);
    } else {
      request = this.http.post<ApiSuccessResponse<T>>(url, body);
    }

    return request.pipe(map((response) => response.data));
  }

  getConnection(): Observable<GoogleAdsConnection> {
    return this.get('');
  }

  // "Conectar com o Google Ads": 1) URL de autorização; 2) troca o code devolvido pelo Google.
  getAuthorizationUrl(): Observable<string> {
    return this.get<{ url: string }>('/oauth/url').pipe(map((data) => data.url));
  }

  exchangeCode(code: string, state: string): Observable<GoogleAdsConnection> {
    return this.send('post', '/oauth/exchange', { code, state });
  }

  disconnect(): Observable<GoogleAdsConnection> {
    return this.send('post', '/disconnect');
  }

  listAccounts(): Observable<GoogleAdsAccount[]> {
    return this.get('/accounts');
  }

  selectAccount(customerId: string, loginCustomerId: string | null, customerName: string | null): Observable<GoogleAdsConnection> {
    return this.send('put', '/account', { customerId, loginCustomerId, customerName });
  }

  listConversionActions(): Observable<GoogleAdsConversionAction[]> {
    return this.get('/conversion-actions');
  }

  listRules(): Observable<GoogleAdsRule[]> {
    return this.get('/rules');
  }

  createRule(payload: SaveGoogleAdsRulePayload): Observable<GoogleAdsRule> {
    return this.send('post', '/rules', payload);
  }

  updateRule(id: string, payload: Partial<SaveGoogleAdsRulePayload>): Observable<GoogleAdsRule> {
    return this.send('put', `/rules/${id}`, payload);
  }

  removeRule(id: string): Observable<unknown> {
    return this.send('delete', `/rules/${id}`);
  }

  testRule(id: string): Observable<unknown> {
    return this.send('post', `/rules/${id}/test`);
  }

  listHistory(ruleId?: string): Observable<GoogleAdsUpload[]> {
    return this.get(ruleId ? `/uploads?ruleId=${encodeURIComponent(ruleId)}` : '/uploads');
  }

  retryUpload(id: string): Observable<unknown> {
    return this.send('post', `/uploads/${id}/retry`);
  }
}
