import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { DepensesStats, DepensesFournisseurs, ConsommationStats, TopSortie } from '../../models/stats.model';

@Injectable({
  providedIn: 'root',
})
export class StatsService {
  constructor(private http: HttpClient) {}

  getDepenses(from?: string, to?: string): Observable<DepensesStats> {
    let httpParams = new HttpParams();
    if (from) httpParams = httpParams.set('from', from);
    if (to) httpParams = httpParams.set('to', to);

    return this.http.get<DepensesStats>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.stats.depenses}`, {
      params: httpParams,
    });
  }

  getDepensesFournisseurs(from?: string, to?: string): Observable<DepensesFournisseurs[]> {
    let httpParams = new HttpParams();
    if (from) httpParams = httpParams.set('from', from);
    if (to) httpParams = httpParams.set('to', to);

    return this.http.get<DepensesFournisseurs[]>(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.stats.depensesFournisseurs}`,
      { params: httpParams }
    );
  }

  getConsommation(from?: string, to?: string): Observable<ConsommationStats[]> {
    let httpParams = new HttpParams();
    if (from) httpParams = httpParams.set('from', from);
    if (to) httpParams = httpParams.set('to', to);

    return this.http.get<ConsommationStats[]>(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.stats.consommation}`,
      { params: httpParams }
    );
  }

  getTopSorties(from?: string, to?: string, limit: number = 5): Observable<TopSortie[]> {
    let httpParams = new HttpParams().set('limit', limit.toString());
    if (from) httpParams = httpParams.set('from', from);
    if (to) httpParams = httpParams.set('to', to);

    return this.http.get<TopSortie[]>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.stats.topSorties}`, {
      params: httpParams,
    });
  }
}
