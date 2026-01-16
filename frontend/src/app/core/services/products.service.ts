import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { Product, ProductCreate, ProductUpdate } from '../../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.products.base}`);
  }

  getAlerts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.products.alerts}`);
  }

  create(product: ProductCreate): Observable<Product> {
    return this.http.post<Product>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.products.base}`, product);
  }

  update(id: number, product: ProductUpdate): Observable<Product> {
    return this.http.put<Product>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.products.base}/${id}`, product);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.products.base}/${id}`);
  }
}
