import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiSuccessResponse } from '../../models/auth.model';

export interface DealValue {
  id: string;
  value: string | null;
  lostReason: string | null;
}

@Injectable({ providedIn: 'root' })
export class DealsService {
  constructor(private readonly http: HttpClient) {}

  updateValue(id: string, value: number): Observable<DealValue> {
    return this.http
      .put<ApiSuccessResponse<DealValue>>(`${environment.apiUrl}/deals/${id}`, { value })
      .pipe(map((response) => response.data));
  }

  updateLostReason(id: string, lostReason: string): Observable<DealValue> {
    return this.http
      .put<ApiSuccessResponse<DealValue>>(`${environment.apiUrl}/deals/${id}`, { lostReason })
      .pipe(map((response) => response.data));
  }
}
