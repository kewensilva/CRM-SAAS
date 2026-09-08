import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiSuccessResponse } from '../../models/auth.model';
import { ReportSummary } from '../../models/report.model';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  constructor(private readonly http: HttpClient) {}

  getSummary(month?: string): Observable<ReportSummary> {
    const params = month ? new HttpParams().set('month', month) : undefined;

    return this.http
      .get<ApiSuccessResponse<ReportSummary>>(`${environment.apiUrl}/reports/summary`, { params })
      .pipe(map((response) => response.data));
  }
}
