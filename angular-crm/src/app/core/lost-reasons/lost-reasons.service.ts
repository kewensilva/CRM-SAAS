import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiSuccessResponse } from '../../models/auth.model';
import { LostReason } from '../../models/lost-reason.model';

@Injectable({ providedIn: 'root' })
export class LostReasonsService {
  constructor(private readonly http: HttpClient) {}

  list(): Observable<LostReason[]> {
    return this.http
      .get<ApiSuccessResponse<LostReason[]>>(`${environment.apiUrl}/lost-reasons`)
      .pipe(map((response) => response.data));
  }

  create(label: string): Observable<LostReason> {
    return this.http
      .post<ApiSuccessResponse<LostReason>>(`${environment.apiUrl}/lost-reasons`, { label })
      .pipe(map((response) => response.data));
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/lost-reasons/${id}`);
  }
}
