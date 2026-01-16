import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { Fournisseur, FournisseurCreate, FournisseurUpdate } from '../../models/fournisseur.model';

@Injectable({
  providedIn: 'root',
})
export class FournisseursService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Fournisseur[]> {
    return this.http.get<Fournisseur[]>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.fournisseurs.base}`);
  }

  getById(id: number): Observable<Fournisseur> {
    return this.http.get<Fournisseur>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.fournisseurs.base}/${id}`);
  }

  search(query: string): Observable<Fournisseur[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<Fournisseur[]>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.fournisseurs.search}`, {
      params,
    });
  }

  create(fournisseur: FournisseurCreate): Observable<Fournisseur> {
    return this.http.post<Fournisseur>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.fournisseurs.base}`, fournisseur);
  }

  update(id: number, fournisseur: FournisseurUpdate): Observable<Fournisseur> {
    return this.http.put<Fournisseur>(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.fournisseurs.base}/${id}`,
      fournisseur
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.fournisseurs.base}/${id}`);
  }
}
