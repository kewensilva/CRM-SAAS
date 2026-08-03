import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiSuccessResponse } from '../../models/auth.model';
import { Analyst, CreateAnalystPayload } from '../../models/analyst.model';

@Injectable({ providedIn: 'root' })
export class AnalystsService {
  constructor(private readonly http: HttpClient) {}

  list(): Observable<Analyst[]> {
    return this.http
      .get<ApiSuccessResponse<Analyst[]>>(`${environment.apiUrl}/analysts`)
      .pipe(map((response) => response.data));
  }

  create(payload: CreateAnalystPayload): Observable<Analyst> {
    return this.http
      .post<ApiSuccessResponse<Analyst>>(`${environment.apiUrl}/analysts`, payload)
      .pipe(map((response) => response.data));
  }

  replaceAccess(id: string, tenantIds: string[]): Observable<Analyst> {
    return this.http
      .put<ApiSuccessResponse<Analyst>>(`${environment.apiUrl}/analysts/${id}/access`, { tenantIds })
      .pipe(map((response) => response.data));
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/analysts/${id}`);
  }
}
