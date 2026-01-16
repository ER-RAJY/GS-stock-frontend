import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { Movement, MovementCreate, MovementSearchParams, PagedResponse } from '../../models/movement.model';

@Injectable({
  providedIn: 'root',
})
export class MovementsService {
  constructor(private http: HttpClient) {}

  createEntree(movement: MovementCreate): Observable<Movement> {
    return this.http.post<Movement>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.movements.entree}`, movement);
  }

  createSortie(movement: MovementCreate): Observable<Movement> {
    return this.http.post<Movement>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.movements.sortie}`, movement);
  }

  search(params: MovementSearchParams): Observable<PagedResponse<Movement>> {
    let httpParams = new HttpParams();
    if (params.produitId) httpParams = httpParams.set('produitId', params.produitId.toString());
    if (params.type) httpParams = httpParams.set('type', params.type);
    if (params.from) httpParams = httpParams.set('from', params.from);
    if (params.to) httpParams = httpParams.set('to', params.to);
    if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
    if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
    if (params.sort) httpParams = httpParams.set('sort', params.sort);

    return this.http.get<PagedResponse<Movement>>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.movements.search}`, {
      params: httpParams,
    });
  }
}
