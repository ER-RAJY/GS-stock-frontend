import { Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
})
export class ToastComponent {
  message = input.required<string>();
  type = input<ToastType>('info');
  visible = signal(true);

  dismiss(): void {
    this.visible.set(false);
  }
}
