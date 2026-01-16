import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';
import { ToastService } from '../../shared/services/toast.service';
import { ToastComponent } from '../../shared/components/toast/toast.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, TopbarComponent, ToastComponent],
  template: `
    <div class="flex h-screen bg-gray-50">
      <app-sidebar />
      <div class="flex-1 ml-64">
        <app-topbar />
        <main class="pt-16 p-6">
          <router-outlet />
        </main>
      </div>
    </div>
    @for (toast of toastService.toasts(); track toast.id) {
      <app-toast [message]="toast.message" [type]="toast.type" />
    }
  `,
})
export class MainLayoutComponent {
  toastService = inject(ToastService);
}
