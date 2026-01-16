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
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Achats</h1>
          <p class="text-sm text-gray-600 mt-1">Gestion des achats et commandes</p>
        </div>
        <button
          (click)="createNewAchat()"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          + Nouvel achat
        </button>
      </div>

      @if (loading()) {
        <app-loading />
      } @else if (achats().length === 0) {
        <app-empty-state
          title="Aucun achat"
          message="Créez votre premier achat pour commencer."
          actionLabel="Créer un achat"
          (onActionClick)="createNewAchat()"
        />
      } @else {
        <div class="grid grid-cols-1 gap-6">
          @for (achat of achats(); track achat.id) {
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">
                    {{ achat.referenceFacture || 'Achat #' + achat.id }}
                  </h3>
                  <p class="text-sm text-gray-500">{{ formatDate(achat.date) }}</p>
                  @if (achat.tvaRate) {
                    <p class="text-xs text-gray-400">TVA: {{ achat.tvaRate }}%</p>
                  }
                </div>
                <div class="flex items-center space-x-2">
                  @if (achat.status === 'DRAFT') {
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Brouillon
                    </span>
                    <button
                      (click)="openAddLineModal(achat)"
                      class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
                    >
                      Ajouter ligne
                    </button>
                    <button
                      (click)="validateAchat(achat.id)"
                      class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      Valider
                    </button>
                  } @else {
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Validé
                    </span>
                  }
                </div>
              </div>

              @if (achat.lines && achat.lines.length > 0) {
                <div class="border-t border-gray-200 pt-4 mt-4">
                  <table class="min-w-full">
                    <thead>
                      <tr class="text-left text-sm font-medium text-gray-500">
                        <th class="pb-2">Produit</th>
                        <th class="pb-2">Quantité</th>
                        <th class="pb-2">Prix unitaire</th>
                        <th class="pb-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                      @for (line of achat.lines; track line.id) {
                        <tr>
                          <td class="py-2 text-sm text-gray-900">{{ getProductName(line.produitId) }}</td>
                          <td class="py-2 text-sm text-gray-500">{{ line.quantite }}</td>
                          <td class="py-2 text-sm text-gray-500">{{ formatCurrency(line.prixUnitaireHT) }}</td>
                          <td class="py-2 text-sm text-gray-900 text-right">
                            {{ formatCurrency(line.prixUnitaireHT * line.quantite) }}
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }

              @if (achat.totalHT !== null && achat.totalHT !== undefined) {
                <div class="border-t border-gray-200 pt-4 mt-4 flex justify-end">
                  <div class="text-right space-y-1">
                    <div class="text-sm text-gray-600">
                      HT: <span class="font-medium">{{ formatCurrency(achat.totalHT) }}</span>
                    </div>
                    @if (achat.totalTVA !== null && achat.totalTVA !== undefined) {
                      <div class="text-sm text-gray-600">
                        TVA: <span class="font-medium">{{ formatCurrency(achat.totalTVA) }}</span>
                      </div>
                    }
                    @if (achat.totalTTC !== null && achat.totalTTC !== undefined) {
                      <div class="text-lg font-bold text-gray-900">
                        TTC: {{ formatCurrency(achat.totalTTC) }}
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>

    <!-- Add Line Modal -->
    @if (showLineModal()) {
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Ajouter une ligne</h2>
          <form (ngSubmit)="saveLine()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Produit *</label>
              <select
                [(ngModel)]="lineForm.produitId"
                name="produitId"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option [value]="0">Sélectionner un produit</option>
                @for (product of products(); track product.id) {
                  <option [value]="product.id">{{ product.designation }}</option>
                }
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Quantité *</label>
              <input
                type="number"
                [(ngModel)]="lineForm.quantite"
                name="quantite"
                required
                min="1"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Prix unitaire HT *</label>
              <input
                type="number"
                [(ngModel)]="lineForm.prixUnitaireHT"
                name="prixUnitaireHT"
                required
                min="0"
                step="0.01"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                (click)="closeLineModal()"
                class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Ajouter
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Create Achat Modal -->
    @if (showCreateModal()) {
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Nouvel achat</h2>
          <form (ngSubmit)="saveAchat()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Référence facture *</label>
              <input
                type="text"
                [(ngModel)]="createForm.referenceFacture"
                name="referenceFacture"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Date *</label>
              <input
                type="date"
                [(ngModel)]="createForm.date"
                name="date"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Taux TVA (%) *</label>
              <input
                type="number"
                [(ngModel)]="createForm.tvaRate"
                name="tvaRate"
                required
                min="0"
                max="100"
                step="0.01"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Fournisseur *</label>
              <select
                [(ngModel)]="createForm.fournisseurId"
                name="fournisseurId"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option [value]="0">Sélectionner un fournisseur</option>
                @for (fournisseur of fournisseurs(); track fournisseur.id) {
                  <option [value]="fournisseur.id">{{ fournisseur.nom }}</option>
                }
              </select>
            </div>
            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                (click)="closeCreateModal()"
                class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Créer
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
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
