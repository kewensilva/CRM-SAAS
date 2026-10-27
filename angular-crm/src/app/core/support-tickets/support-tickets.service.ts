import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiSuccessResponse } from '../../models/auth.model';
import { SupportTicket, SupportTicketWithAuthor } from '../../models/support-ticket.model';

@Injectable({ providedIn: 'root' })
export class SupportTicketsService {
  constructor(private readonly http: HttpClient) {}

  list(): Observable<SupportTicketWithAuthor[]> {
    return this.http
      .get<ApiSuccessResponse<SupportTicketWithAuthor[]>>(`${environment.apiUrl}/support-tickets`)
      .pipe(map((response) => response.data));
  }

  create(data: { title: string; message: string }): Observable<SupportTicket> {
    return this.http
      .post<ApiSuccessResponse<SupportTicket>>(`${environment.apiUrl}/support-tickets`, data)
      .pipe(map((response) => response.data));
  }

  resend(id: string): Observable<SupportTicket> {
    return this.http
      .post<ApiSuccessResponse<SupportTicket>>(`${environment.apiUrl}/support-tickets/${id}/resend`, {})
      .pipe(map((response) => response.data));
  }
}
