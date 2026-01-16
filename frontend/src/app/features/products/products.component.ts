import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../../core/services/products.service';
import { ExportService } from '../../core/services/export.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { Product, ProductCreate } from '../../models/product.model';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent, EmptyStateComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Produits</h1>
          <p class="text-sm text-gray-600 mt-1">Gestion des produits et alertes de stock</p>
        </div>
        <div class="flex items-center space-x-3">
          @if (authService.isAdmin()) {
            <button
              (click)="exportStock()"
              class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Exporter stock Excel
            </button>
          }
          @if (authService.isAdmin() || authService.isComptable()) {
            <button
              (click)="openCreateModal()"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              + Nouveau produit
            </button>
          }
        </div>
      </div>

      @if (loading()) {
        <app-loading />
      } @else if (products().length === 0) {
        <app-empty-state
          title="Aucun produit"
          message="Commencez par ajouter votre premier produit."
          [actionLabel]="(authService.isAdmin() || authService.isComptable()) ? 'Ajouter un produit' : undefined"
          (onActionClick)="openCreateModal()"
        />
      } @else {
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Désignation
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unité
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock min
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock actuel
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  @if (authService.isAdmin()) {
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  }
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                @for (product of products(); track product.id) {
                  <tr [class.bg-red-50]="product.stockAlert" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <span class="text-sm font-medium text-gray-900">{{ product.designation }}</span>
                        @if (product.stockAlert) {
                          <span class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            Alerte
                          </span>
                        }
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ product.unite }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ product.stockMin }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium" [class.text-red-600]="product.stockAlert">
                      {{ product.stockActuel }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      @if (product.active) {
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Actif
                        </span>
                      } @else {
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Inactif
                        </span>
                      }
                    </td>
                    @if (authService.isAdmin()) {
                      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          (click)="openEditModal(product)"
                          class="text-primary-600 hover:text-primary-900 mr-4"
                        >
                          Modifier
                        </button>
                        <button
                          (click)="deleteProduct(product.id)"
                          class="text-red-600 hover:text-red-900"
                        >
                          Supprimer
                        </button>
                      </td>
                    }
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>

    <!-- Create/Edit Modal -->
    @if (showModal()) {
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">
            {{ editingProduct() ? 'Modifier le produit' : 'Nouveau produit' }}
          </h2>
          <form (ngSubmit)="saveProduct()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Désignation *</label>
              <input
                type="text"
                [(ngModel)]="formData.designation"
                name="designation"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Unité *</label>
              <input
                type="text"
                [(ngModel)]="formData.unite"
                name="unite"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Stock minimum *</label>
              <input
                type="number"
                [(ngModel)]="formData.stockMin"
                name="stockMin"
                required
                min="0"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div class="flex items-center">
              <input
                type="checkbox"
                [(ngModel)]="formData.active"
                name="active"
                id="active"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label for="active" class="ml-2 block text-sm text-gray-700">Actif</label>
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
export class ProductsComponent {
  private productsService = inject(ProductsService);
  private exportService = inject(ExportService);
  authService = inject(AuthService);
  private toastService = inject(ToastService);

  products = signal<Product[]>([]);
  loading = signal(false);
  showModal = signal(false);
  editingProduct = signal<Product | null>(null);
  formData: ProductCreate & { active?: boolean } = {
    designation: '',
    unite: '',
    stockMin: 0,
    active: true,
  };

  constructor() {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading.set(true);
    this.productsService.getAll().subscribe({
      next: (data) => {
        this.products.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.toastService.error('Erreur lors du chargement des produits');
        this.loading.set(false);
      },
    });
  }

  openCreateModal(): void {
    this.editingProduct.set(null);
    this.formData = {
      designation: '',
      unite: '',
      stockMin: 0,
      active: true,
    };
    this.showModal.set(true);
  }

  openEditModal(product: Product): void {
    this.editingProduct.set(product);
    this.formData = {
      designation: product.designation,
      unite: product.unite,
      stockMin: product.stockMin,
      active: product.active,
    };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingProduct.set(null);
  }

  saveProduct(): void {
    const product = this.editingProduct();
    const data = { ...this.formData };

    if (product) {
      this.productsService.update(product.id, data).subscribe({
        next: () => {
          this.toastService.success('Produit modifié avec succès');
          this.closeModal();
          this.loadProducts();
        },
        error: () => {
          this.toastService.error('Erreur lors de la modification');
        },
      });
    } else {
      this.productsService.create(data).subscribe({
        next: () => {
          this.toastService.success('Produit créé avec succès');
          this.closeModal();
          this.loadProducts();
        },
        error: () => {
          this.toastService.error('Erreur lors de la création');
        },
      });
    }
  }

  deleteProduct(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      this.productsService.delete(id).subscribe({
        next: () => {
          this.toastService.success('Produit supprimé avec succès');
          this.loadProducts();
        },
        error: () => {
          this.toastService.error('Erreur lors de la suppression');
        },
      });
    }
  }

  exportStock(): void {
    this.exportService.exportStockExcel().subscribe({
      next: (blob) => {
        const filename = `stock_${new Date().toISOString().split('T')[0]}.xlsx`;
        this.exportService.downloadBlob(blob, filename);
        this.toastService.success('Export réussi');
      },
      error: () => {
        this.toastService.error('Erreur lors de l\'export');
      },
    });
  }
}
