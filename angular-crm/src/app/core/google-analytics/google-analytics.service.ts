import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiSuccessResponse } from '../../models/auth.model';
import { GoogleAnalyticsMonthlyReport, GoogleAnalyticsSettings } from '../../models/google-analytics.model';

@Injectable({ providedIn: 'root' })
export class GoogleAnalyticsService {
  constructor(private readonly http: HttpClient) {}

  getSettings(): Observable<GoogleAnalyticsSettings> {
    return this.http
      .get<ApiSuccessResponse<GoogleAnalyticsSettings>>(`${environment.apiUrl}/integrations/google-analytics`)
      .pipe(map((response) => response.data));
  }

  updateSettings(data: { enabled?: boolean; propertyId?: string }): Observable<GoogleAnalyticsSettings> {
    return this.http
      .put<ApiSuccessResponse<GoogleAnalyticsSettings>>(`${environment.apiUrl}/integrations/google-analytics`, data)
      .pipe(map((response) => response.data));
  }

  getMonthlyReport(month: string): Observable<GoogleAnalyticsMonthlyReport> {
    return this.http
      .get<ApiSuccessResponse<GoogleAnalyticsMonthlyReport>>(`${environment.apiUrl}/reports/google-analytics`, {
        params: new HttpParams().set('month', month),
      })
      .pipe(map((response) => response.data));
  }
}
