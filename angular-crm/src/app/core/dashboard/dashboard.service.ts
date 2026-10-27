import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiSuccessResponse } from '../../models/auth.model';
import {
  AnalystActivitySummary,
  DashboardSummary,
  OwnerTenantCard,
  PlatformDashboardSummary,
} from '../../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private readonly http: HttpClient) {}

  getSummary(): Observable<DashboardSummary> {
    return this.http
      .get<ApiSuccessResponse<DashboardSummary>>(`${environment.apiUrl}/dashboard`)
      .pipe(map((response) => response.data));
  }

  getPlatformSummary(): Observable<PlatformDashboardSummary> {
    return this.http
      .get<ApiSuccessResponse<PlatformDashboardSummary>>(`${environment.apiUrl}/dashboard/owner`)
      .pipe(map((response) => response.data));
  }

  getOwnerTenantCards(): Observable<OwnerTenantCard[]> {
    return this.http
      .get<ApiSuccessResponse<OwnerTenantCard[]>>(`${environment.apiUrl}/dashboard/owner/tenants`)
      .pipe(map((response) => response.data));
  }

  getAnalystActivity(days: number): Observable<AnalystActivitySummary> {
    return this.http
      .get<ApiSuccessResponse<AnalystActivitySummary>>(`${environment.apiUrl}/dashboard/owner/analysts`, {
        params: { days },
      })
      .pipe(map((response) => response.data));
  }
}
