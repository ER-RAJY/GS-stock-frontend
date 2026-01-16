import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { Achat, AchatCreate, AchatLine } from '../../models/achat.model';

@Injectable({
  providedIn: 'root',
})
export class AchatsService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Achat[]> {
    return this.http.get<Achat[]>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.achats.base}`);
  }

  create(achat: AchatCreate): Observable<Achat> {
    return this.http.post<Achat>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.achats.base}`, achat);
  }

  addLine(achatId: number, line: AchatLine): Observable<AchatLine> {
    return this.http.post<AchatLine>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.achats.lines(achatId)}`, line);
  }

  validate(achatId: number): Observable<Partial<Achat>> {
    return this.http.post<Partial<Achat>>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.achats.validate(achatId)}`, {});
  }
}
