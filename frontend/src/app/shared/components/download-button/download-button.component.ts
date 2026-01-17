import { Component, Input } from '@angular/core';
import { FileDownloadService } from '../../services/file-download.service';

@Component({
  selector: 'app-download-button',
  templateUrl: './download-button.component.html',
  styleUrls: ['./download-button.component.scss'],
})
export class DownloadButtonComponent {

  @Input() url!: string;
  @Input() filename!: string;
  @Input() label = 'Télécharger';
  @Input() visible = true;

  loading = false;

  constructor(private downloader: FileDownloadService) {}

  download(): void {
    if (!this.url) return;

    this.loading = true;

    this.downloader.download(this.url).subscribe({
      next: (blob) => {
        this.downloader.triggerDownload(blob, this.filename);
        this.loading = false;
      },
      error: () => {
        alert('Erreur lors du téléchargement');
        this.loading = false;
      }
    });
  }
}
