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
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
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
