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
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Mouvements de stock</h1>
          <p class="text-sm text-gray-600 mt-1">Historique des entrées et sorties</p>
        </div>
        @if (authService.isAdmin() || authService.isComptable()) {
          <button
            (click)="openCreateModal()"
            class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            + Nouveau mouvement
          </button>
        }
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Produit</label>
            <select
              [(ngModel)]="filters.produitId"
              (ngModelChange)="loadMovements()"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option [value]="undefined">Tous</option>
              @for (product of products(); track product.id) {
                <option [value]="product.id">{{ product.designation }}</option>
              }
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              [(ngModel)]="filters.type"
              (ngModelChange)="loadMovements()"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option [value]="undefined">Tous</option>
              <option value="ENTREE">Entrée</option>
              <option value="SORTIE">Sortie</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Du</label>
            <input
              type="date"
              [(ngModel)]="filters.from"
              (ngModelChange)="loadMovements()"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Au</label>
            <input
              type="date"
              [(ngModel)]="filters.to"
              (ngModelChange)="loadMovements()"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      @if (loading()) {
        <app-loading />
      } @else if (movements().content.length === 0) {
        <app-empty-state
          title="Aucun mouvement"
          message="Aucun mouvement de stock trouvé pour les critères sélectionnés."
        />
      } @else {
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantité</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commentaire</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                @for (movement of movements().content; track movement.id) {
                  <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ formatDate(movement.date) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ getProductName(movement.produitId) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      @if (movement.type === 'ENTREE') {
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Entrée
                        </span>
                      } @else {
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Sortie
                        </span>
                      }
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {{ movement.quantite }}
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-500">{{ movement.commentaire || '-' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          @if (movements().totalPages > 1) {
            <div class="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div class="text-sm text-gray-700">
                Page {{ movements().number + 1 }} sur {{ movements().totalPages }}
              </div>
              <div class="flex space-x-2">
                <button
                  (click)="previousPage()"
                  [disabled]="movements().number === 0"
                  class="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Précédent
                </button>
                <button
                  (click)="nextPage()"
                  [disabled]="movements().number >= movements().totalPages - 1"
                  class="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Suivant
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>

    <!-- Create Modal -->
    @if (showModal()) {
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Nouveau mouvement</h2>
          <form (ngSubmit)="saveMovement()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Type *</label>
              <select
                [(ngModel)]="formData.type"
                name="type"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="ENTREE">Entrée</option>
                <option value="SORTIE">Sortie</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Produit *</label>
              <select
                [(ngModel)]="formData.produitId"
                name="produitId"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option [value]="undefined">Sélectionner un produit</option>
                @for (product of products(); track product.id) {
                  <option [value]="product.id">{{ product.designation }}</option>
                }
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Quantité *</label>
              <input
                type="number"
                [(ngModel)]="formData.quantite"
                name="quantite"
                required
                min="1"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Commentaire</label>
              <textarea
                [(ngModel)]="formData.commentaire"
                name="commentaire"
                rows="3"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              ></textarea>
            </div>
            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                (click)="closeModal()"
                class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
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
