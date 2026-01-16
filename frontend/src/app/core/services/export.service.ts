import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  constructor(private http: HttpClient) {}

  exportStockExcel(): Observable<Blob> {
    return this.http.get(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.export.stockExcel}`, {
      responseType: 'blob',
    });
  }

  exportAchatsExcel(from?: string, to?: string): Observable<Blob> {
    let httpParams = new HttpParams();
    if (from) httpParams = httpParams.set('from', from);
    if (to) httpParams = httpParams.set('to', to);

    return this.http.get(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.export.achatsExcel}`, {
      params: httpParams,
      responseType: 'blob',
    });
  }

  downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
