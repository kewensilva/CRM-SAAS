import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiSuccessResponse } from '../../models/auth.model';
import {
  CreateLeadPayload,
  ImportLeadsResult,
  Lead,
  LeadHistoryEntry,
  MoveLeadStatusPayload,
  MoveLeadStatusResult,
  UpdateLeadPayload,
} from '../../models/lead.model';

@Injectable({ providedIn: 'root' })
export class LeadsService {
  constructor(private readonly http: HttpClient) {}

  list(): Observable<Lead[]> {
    return this.http
      .get<ApiSuccessResponse<Lead[]>>(`${environment.apiUrl}/leads`)
      .pipe(map((response) => response.data));
  }

  create(payload: CreateLeadPayload): Observable<Lead> {
    return this.http
      .post<ApiSuccessResponse<Lead>>(`${environment.apiUrl}/leads`, payload)
      .pipe(map((response) => response.data));
  }

  moveStatus(id: string, payload: MoveLeadStatusPayload): Observable<MoveLeadStatusResult> {
    return this.http
      .put<ApiSuccessResponse<MoveLeadStatusResult>>(`${environment.apiUrl}/leads/${id}/status`, payload)
      .pipe(map((response) => response.data));
  }

  update(id: string, payload: UpdateLeadPayload): Observable<Lead> {
    return this.http
      .put<ApiSuccessResponse<Lead>>(`${environment.apiUrl}/leads/${id}`, payload)
      .pipe(map((response) => response.data));
  }

  history(id: string): Observable<LeadHistoryEntry[]> {
    return this.http
      .get<ApiSuccessResponse<LeadHistoryEntry[]>>(`${environment.apiUrl}/leads/${id}/history`)
      .pipe(map((response) => response.data));
  }

  importFile(file: File): Observable<ImportLeadsResult> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http
      .post<ApiSuccessResponse<ImportLeadsResult>>(`${environment.apiUrl}/leads/import`, formData)
      .pipe(map((response) => response.data));
  }

  downloadTemplate(): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/leads/import-template`, { responseType: 'blob' });
  }

  export(leadIds: string[], filterSummary: string): Observable<Blob> {
    return this.http.post(
      `${environment.apiUrl}/leads/export`,
      { leadIds, filterSummary },
      { responseType: 'blob' },
    );
  }
}
