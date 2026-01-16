import { Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (visible()) {
      <div
        class="fixed top-4 right-4 z-50 max-w-md w-full shadow-lg rounded-lg p-4 transform transition-all duration-300"
        [ngClass]="{
          'bg-green-50 border border-green-200 text-green-800': type() === 'success',
          'bg-red-50 border border-red-200 text-red-800': type() === 'error',
          'bg-blue-50 border border-blue-200 text-blue-800': type() === 'info',
          'bg-yellow-50 border border-yellow-200 text-yellow-800': type() === 'warning'
        }"
      >
        <div class="flex items-center justify-between">
          <p class="text-sm font-medium">{{ message() }}</p>
          <button
            (click)="dismiss()"
            class="ml-4 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    }
  `,
})
export class ToastComponent {
  message = input.required<string>();
  type = input<ToastType>('info');
  visible = signal(true);

  dismiss(): void {
    this.visible.set(false);
  }
}
