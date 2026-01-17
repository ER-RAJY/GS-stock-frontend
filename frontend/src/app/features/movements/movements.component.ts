import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MovementsService } from '../../core/services/movements.service';
import { ProductsService } from '../../core/services/products.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { Movement, MovementCreate, MovementType, PagedResponse } from '../../models/movement.model';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-movements',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent, EmptyStateComponent],
  templateUrl: './movements.component.html',
  styleUrls: ['./movements.component.scss'],
})
export class MovementsComponent {
  private movementsService = inject(MovementsService);
  private productsService = inject(ProductsService);
  authService = inject(AuthService);
  private toastService = inject(ToastService);

  movements = signal<PagedResponse<Movement>>({
    content: [],
    totalElements: 0,
    totalPages: 0,
    size: 20,
    number: 0,
  });
  products = signal<Product[]>([]);
  loading = signal(false);
  showModal = signal(false);
  filters: {
    produitId?: number;
    type?: MovementType;
    from?: string;
    to?: string;
    page: number;
    size: number;
  } = {
    page: 0,
    size: 20,
  };
  formData: MovementCreate & { type: MovementType } = {
    produitId: 0,
    type: 'ENTREE',
    quantite: 0,
    commentaire: '',
  };

  constructor() {
    this.loadProducts();
    this.loadMovements();
  }

  loadProducts(): void {
    this.productsService.getAll().subscribe({
      next: (data) => this.products.set(data),
      error: () => this.toastService.error('Erreur lors du chargement des produits'),
    });
  }

  loadMovements(): void {
    this.loading.set(true);
    this.movementsService.search(this.filters).subscribe({
      next: (data) => {
        this.movements.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.toastService.error('Erreur lors du chargement des mouvements');
        this.loading.set(false);
      },
    });
  }

  openCreateModal(): void {
    this.formData = {
      produitId: 0,
      type: 'ENTREE',
      quantite: 0,
      commentaire: '',
    };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  saveMovement(): void {
    const { type, ...movementData } = this.formData; // Remove type from request body
    const service =
      type === 'ENTREE'
        ? this.movementsService.createEntree(movementData)
        : this.movementsService.createSortie(movementData);

    service.subscribe({
      next: () => {
        this.toastService.success('Mouvement créé avec succès');
        this.closeModal();
        this.loadMovements();
      },
      error: () => {
        this.toastService.error('Erreur lors de la création');
      },
    });
  }

  previousPage(): void {
    if (this.filters.page > 0) {
      this.filters = { ...this.filters, page: this.filters.page - 1 };
      this.loadMovements();
    }
  }

  nextPage(): void {
    if (this.filters.page < this.movements().totalPages - 1) {
      this.filters = { ...this.filters, page: this.filters.page + 1 };
      this.loadMovements();
    }
  }

  getProductName(id: number): string {
    return this.products().find((p) => p.id === id)?.designation || `Produit #${id}`;
  }

  formatDate(date?: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR');
  }
}
