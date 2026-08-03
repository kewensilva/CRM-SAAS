import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiSuccessResponse } from '../../models/auth.model';
import { CreateOwnerPayload, Owner } from '../../models/owner.model';

@Injectable({ providedIn: 'root' })
export class OwnersService {
  constructor(private readonly http: HttpClient) {}

  list(): Observable<Owner[]> {
    return this.http
      .get<ApiSuccessResponse<Owner[]>>(`${environment.apiUrl}/owners`)
      .pipe(map((response) => response.data));
  }

  create(payload: CreateOwnerPayload): Observable<Owner> {
    return this.http
      .post<ApiSuccessResponse<Owner>>(`${environment.apiUrl}/owners`, payload)
      .pipe(map((response) => response.data));
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/owners/${id}`);
  }
}
