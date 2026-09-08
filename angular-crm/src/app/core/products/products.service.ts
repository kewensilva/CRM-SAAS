import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiSuccessResponse } from '../../models/auth.model';
import { CreateProductPayload, Product, UpdateProductPayload } from '../../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  constructor(private readonly http: HttpClient) {}

  list(): Observable<Product[]> {
    return this.http
      .get<ApiSuccessResponse<Product[]>>(`${environment.apiUrl}/products`)
      .pipe(map((response) => response.data));
  }

  create(payload: CreateProductPayload): Observable<Product> {
    return this.http
      .post<ApiSuccessResponse<Product>>(`${environment.apiUrl}/products`, payload)
      .pipe(map((response) => response.data));
  }

  update(id: string, payload: UpdateProductPayload): Observable<Product> {
    return this.http
      .put<ApiSuccessResponse<Product>>(`${environment.apiUrl}/products/${id}`, payload)
      .pipe(map((response) => response.data));
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/products/${id}`);
  }
}
