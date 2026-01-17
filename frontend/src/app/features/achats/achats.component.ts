import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AchatsService } from '../../core/services/achats.service';
import { ProductsService } from '../../core/services/products.service';
import { FournisseursService } from '../../core/services/fournisseurs.service';
import { ToastService } from '../../shared/services/toast.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { Achat, AchatLine, AchatCreate } from '../../models/achat.model';
import { Product } from '../../models/product.model';
import { Fournisseur } from '../../models/fournisseur.model';

@Component({
  selector: 'app-achats',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent, EmptyStateComponent],
  templateUrl: './achats.component.html',
  styleUrls: ['./achats.component.scss'],
})
export class AchatsComponent {
  private achatsService = inject(AchatsService);
  private productsService = inject(ProductsService);
  private fournisseursService = inject(FournisseursService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  achats = signal<Achat[]>([]);
  products = signal<Product[]>([]);
  fournisseurs = signal<Fournisseur[]>([]);
  loading = signal(false);
  showLineModal = signal(false);
  showCreateModal = signal(false);
  currentAchatId = signal<number | null>(null);
  lineForm: AchatLine = {
    produitId: 0,
    quantite: 0,
    prixUnitaireHT: 0,
  };
  createForm: AchatCreate = {
    referenceFacture: '',
    date: new Date().toISOString().split('T')[0],
    tvaRate: 20,
    fournisseurId: 0,
  };

  constructor() {
    this.loadAchats();
    this.loadProducts();
    this.loadFournisseurs();
  }

  loadAchats(): void {
    this.loading.set(true);
    this.achatsService.getAll().subscribe({
      next: (data) => {
        this.achats.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.toastService.error('Erreur lors du chargement des achats');
        this.loading.set(false);
      },
    });
  }

  loadProducts(): void {
    this.productsService.getAll().subscribe({
      next: (data) => this.products.set(data),
      error: () => this.toastService.error('Erreur lors du chargement des produits'),
    });
  }

  loadFournisseurs(): void {
    this.fournisseursService.getAll().subscribe({
      next: (data) => this.fournisseurs.set(data),
      error: () => this.toastService.error('Erreur lors du chargement des fournisseurs'),
    });
  }

  createNewAchat(): void {
    this.createForm = {
      referenceFacture: '',
      date: new Date().toISOString().split('T')[0],
      tvaRate: 20,
      fournisseurId: 0,
    };
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  saveAchat(): void {
    if (!this.createForm.referenceFacture || !this.createForm.date || this.createForm.fournisseurId === 0) {
      this.toastService.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.achatsService.create(this.createForm).subscribe({
      next: () => {
        this.toastService.success('Achat créé avec succès');
        this.closeCreateModal();
        this.loadAchats();
      },
      error: () => {
        this.toastService.error('Erreur lors de la création');
      },
    });
  }

  openAddLineModal(achat: Achat): void {
    this.currentAchatId.set(achat.id);
    this.lineForm = {
      produitId: 0,
      quantite: 0,
      prixUnitaireHT: 0,
    };
    this.showLineModal.set(true);
  }

  closeLineModal(): void {
    this.showLineModal.set(false);
    this.currentAchatId.set(null);
  }

  saveLine(): void {
    const achatId = this.currentAchatId();
    if (!achatId) return;

    this.achatsService.addLine(achatId, this.lineForm).subscribe({
      next: () => {
        this.toastService.success('Ligne ajoutée avec succès');
        this.closeLineModal();
        this.loadAchats();
      },
      error: () => {
        this.toastService.error('Erreur lors de l\'ajout de la ligne');
      },
    });
  }

  validateAchat(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir valider cet achat ?')) {
      this.achatsService.validate(id).subscribe({
        next: (response) => {
          this.toastService.success('Achat validé avec succès');
          // Update the achat with validation response
          this.achats.update((achats) =>
            achats.map((a) =>
              a.id === id
                ? {
                    ...a,
                    status: response.status || 'VALIDATED',
                    totalHT: response.totalHT ?? null,
                    totalTVA: response.totalTVA ?? null,
                    totalTTC: response.totalTTC ?? null,
                  }
                : a
            )
          );
        },
        error: () => {
          this.toastService.error('Erreur lors de la validation');
        },
      });
    }
  }

  getProductName(id: number): string {
    return this.products().find((p) => p.id === id)?.designation || `Produit #${id}`;
  }

  formatDate(date?: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR');
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  }
}
