import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatsService } from '../../core/services/stats.service';
import { ExportService } from '../../core/services/export.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { DepensesStats } from '../../models/stats.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <div class="flex items-center space-x-4">
          @if (authService.isAdmin()) {
            <button
              (click)="exportAchats()"
              class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Exporter achats Excel
            </button>
          }
          <select
            [(ngModel)]="selectedPeriod"
            (ngModelChange)="onPeriodChange()"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="custom">Période personnalisée</option>
          </select>
          @if (selectedPeriod === 'custom') {
            <div class="flex items-center space-x-2">
              <input
                type="date"
                [(ngModel)]="customFrom"
                (ngModelChange)="loadStats()"
                class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
              <span class="text-gray-500">à</span>
              <input
                type="date"
                [(ngModel)]="customTo"
                (ngModelChange)="loadStats()"
                class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          }
        </div>
      </div>

      @if (loading()) {
        <app-loading />
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Total HT</p>
                <p class="text-2xl font-bold text-gray-900 mt-2">
                  {{ formatCurrency(stats()?.totalHT || 0) }}
                </p>
              </div>
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Total TVA</p>
                <p class="text-2xl font-bold text-gray-900 mt-2">
                  {{ formatCurrency(stats()?.totalTVA || 0) }}
                </p>
              </div>
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Total TTC</p>
                <p class="text-2xl font-bold text-gray-900 mt-2">
                  {{ formatCurrency(stats()?.totalTTC || 0) }}
                </p>
              </div>
              <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class DashboardComponent {
  private statsService = inject(StatsService);
  private exportService = inject(ExportService);
  authService = inject(AuthService);
  private toastService = inject(ToastService);

  loading = signal(false);
  stats = signal<DepensesStats | null>(null);
  selectedPeriod: 'week' | 'month' | 'custom' = 'week';
  customFrom = '';
  customTo = '';

  constructor() {
    this.loadStats();
  }

  onPeriodChange(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading.set(true);
    const { from, to } = this.getDateRange();

    this.statsService.getDepenses(from, to).subscribe({
      next: (data) => {
        this.stats.set(data);
        this.loading.set(false);
      },
      error: (error) => {
        this.toastService.error('Erreur lors du chargement des statistiques');
        this.loading.set(false);
      },
    });
  }

  private getDateRange(): { from?: string; to?: string } {
    const period = this.selectedPeriod;
    const today = new Date();
    let from: string | undefined;
    let to: string | undefined;

    if (period === 'week') {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      weekStart.setHours(0, 0, 0, 0);
      from = weekStart.toISOString().split('T')[0];
      to = today.toISOString().split('T')[0];
    } else if (period === 'month') {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      from = monthStart.toISOString().split('T')[0];
      to = today.toISOString().split('T')[0];
    } else if (period === 'custom') {
      from = this.customFrom || undefined;
      to = this.customTo || undefined;
    }

    return { from, to };
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  }

  exportAchats(): void {
    const { from, to } = this.getDateRange();
    this.exportService.exportAchatsExcel(from, to).subscribe({
      next: (blob) => {
        const filename = `achats_${from || 'all'}_${to || 'all'}.xlsx`;
        this.exportService.downloadBlob(blob, filename);
        this.toastService.success('Export réussi');
      },
      error: () => {
        this.toastService.error('Erreur lors de l\'export');
      },
    });
  }
}
