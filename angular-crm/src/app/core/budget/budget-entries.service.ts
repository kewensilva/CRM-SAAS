import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiSuccessResponse } from '../../models/auth.model';
import {
  BudgetEntry,
  UpdateBudgetEntryPayload,
  UpsertBudgetEntryPayload,
} from '../../models/budget-entry.model';

@Injectable({ providedIn: 'root' })
export class BudgetEntriesService {
  constructor(private readonly http: HttpClient) {}

  list(month?: string): Observable<BudgetEntry[]> {
    const params = month ? new HttpParams().set('month', month) : undefined;

    return this.http
      .get<ApiSuccessResponse<BudgetEntry[]>>(`${environment.apiUrl}/budget-entries`, { params })
      .pipe(map((response) => response.data));
  }

  upsert(payload: UpsertBudgetEntryPayload): Observable<BudgetEntry> {
    return this.http
      .post<ApiSuccessResponse<BudgetEntry>>(`${environment.apiUrl}/budget-entries`, payload)
      .pipe(map((response) => response.data));
  }

  update(id: string, payload: UpdateBudgetEntryPayload): Observable<BudgetEntry> {
    return this.http
      .put<ApiSuccessResponse<BudgetEntry>>(`${environment.apiUrl}/budget-entries/${id}`, payload)
      .pipe(map((response) => response.data));
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/budget-entries/${id}`);
  }
}
