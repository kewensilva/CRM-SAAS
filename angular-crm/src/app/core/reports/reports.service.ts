import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiSuccessResponse } from '../../models/auth.model';
import { ReportPeriod, ReportSummary } from '../../models/report.model';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  constructor(private readonly http: HttpClient) {}

  getSummary(period: ReportPeriod): Observable<ReportSummary> {
    const params = new HttpParams().set('startDate', period.startDate).set('endDate', period.endDate);

    return this.http
      .get<ApiSuccessResponse<ReportSummary>>(`${environment.apiUrl}/reports/summary`, { params })
      .pipe(map((response) => response.data));
  }
}
