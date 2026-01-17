import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatsService } from '../../core/services/stats.service';
import { ExportService } from '../../core/services/export.service';
import { AuthService } from '../../core/services/auth.service';
import { ProductsService } from '../../core/services/products.service';
import { ToastService } from '../../shared/services/toast.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { DepensesStats, TopSortie } from '../../models/stats.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  private statsService = inject(StatsService);
  private exportService = inject(ExportService);
  private productsService = inject(ProductsService);
  authService = inject(AuthService);
  private toastService = inject(ToastService);

  loading = signal(false);
  stats = signal<DepensesStats | null>(null);
  topSorties = signal<TopSortie[]>([]);
  topSortiesLoading = signal(false);
  productsCount = signal(0);
  alertsCount = signal(0);
  selectedPeriod: 'week' | 'month' | 'custom' = 'week';
  customFrom = '';
  customTo = '';

  constructor() {
    this.loadStats();
    this.loadTopSorties();
    this.loadProductsCount();
    this.loadAlertsCount();
  }

  onPeriodChange(): void {
    this.loadStats();
    this.loadTopSorties();
  }

  onDateChange(): void {
    this.loadStats();
    this.loadTopSorties();
  }

  loadStats(): void {
    if (!this.authService.isAdmin()) {
      return; // Only load money stats for ADMIN
    }

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

  loadTopSorties(): void {
    this.topSortiesLoading.set(true);
    const { from, to } = this.getDateRange();

    this.statsService.getTopSorties(from, to, 5).subscribe({
      next: (data) => {
        this.topSorties.set(data);
        this.topSortiesLoading.set(false);
      },
      error: () => {
        this.toastService.error('Erreur lors du chargement des top sorties');
        this.topSortiesLoading.set(false);
      },
    });
  }

  loadProductsCount(): void {
    if (this.authService.isComptable()) {
      this.productsService.getAll().subscribe({
        next: (data) => {
          this.productsCount.set(data.length);
        },
        error: () => {
          // Silent fail for count
        },
      });
    }
  }

  loadAlertsCount(): void {
    this.productsService.getAlerts().subscribe({
      next: (data) => {
        this.alertsCount.set(data.length);
      },
      error: () => {
        // Silent fail for count
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
