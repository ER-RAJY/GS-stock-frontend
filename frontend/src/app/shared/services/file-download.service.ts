import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileDownloadService {

  constructor(private http: HttpClient) {}

  /**
   * Generic file downloader
   */
  download(url: string): Observable<Blob> {
    return this.http.get(url, {
      responseType: 'blob'
    });
  }

  /**
   * Trigger browser download
   */
  triggerDownload(blob: Blob, filename: string): void {
    const objectUrl = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename;
    a.click();

    window.URL.revokeObjectURL(objectUrl);
  }
}
