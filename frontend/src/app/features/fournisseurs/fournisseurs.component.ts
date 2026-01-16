import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FournisseursService } from '../../core/services/fournisseurs.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { Fournisseur, FournisseurCreate, FournisseurUpdate } from '../../models/fournisseur.model';

@Component({
  selector: 'app-fournisseurs',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingComponent, EmptyStateComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Fournisseurs</h1>
          <p class="text-sm text-gray-600 mt-1">Gestion des fournisseurs</p>
        </div>
        @if (authService.isAdmin()) {
          <button
            (click)="openCreateModal()"
            class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            + Nouveau fournisseur
          </button>
        }
      </div>

      @if (loading()) {
        <app-loading />
      } @else if (fournisseurs().length === 0) {
        <app-empty-state
          title="Aucun fournisseur"
          message="Commencez par ajouter votre premier fournisseur."
          [actionLabel]="authService.isAdmin() ? 'Ajouter un fournisseur' : undefined"
          (onActionClick)="openCreateModal()"
        />
      } @else {
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nom
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ICE
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Téléphone
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Adresse
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
                @for (fournisseur of fournisseurs(); track fournisseur.id) {
                  <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {{ fournisseur.nom }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ fournisseur.ice || '-' }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ fournisseur.telephone || '-' }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ fournisseur.email || '-' }}
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-500">
                      {{ fournisseur.adresse || '-' }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      @if (fournisseur.active) {
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
                          (click)="openEditModal(fournisseur)"
                          class="text-primary-600 hover:text-primary-900 mr-4"
                        >
                          Modifier
                        </button>
                        <button
                          (click)="deleteFournisseur(fournisseur.id)"
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
            {{ editingFournisseur() ? 'Modifier le fournisseur' : 'Nouveau fournisseur' }}
          </h2>
          <form [formGroup]="fournisseurForm" (ngSubmit)="saveFournisseur()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
              <input
                type="text"
                formControlName="nom"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
              @if (fournisseurForm.get('nom')?.invalid && fournisseurForm.get('nom')?.touched) {
                <p class="mt-1 text-sm text-red-600">Le nom est requis</p>
              }
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">ICE</label>
              <input
                type="text"
                formControlName="ice"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
              <input
                type="text"
                formControlName="telephone"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                formControlName="email"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
              <textarea
                formControlName="adresse"
                rows="3"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              ></textarea>
            </div>
            @if (editingFournisseur()) {
              <div class="flex items-center">
                <input
                  type="checkbox"
                  formControlName="active"
                  id="active"
                  class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label for="active" class="ml-2 block text-sm text-gray-700">Actif</label>
              </div>
            }
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
                [disabled]="fournisseurForm.invalid"
                class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
export class FournisseursComponent {
  private fournisseursService = inject(FournisseursService);
  authService = inject(AuthService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  fournisseurs = signal<Fournisseur[]>([]);
  loading = signal(false);
  showModal = signal(false);
  editingFournisseur = signal<Fournisseur | null>(null);

  fournisseurForm: FormGroup = this.fb.group({
    nom: ['', Validators.required],
    ice: [''],
    telephone: [''],
    email: [''],
    adresse: [''],
    active: [true],
  });

  constructor() {
    this.loadFournisseurs();
  }

  loadFournisseurs(): void {
    this.loading.set(true);
    this.fournisseursService.getAll().subscribe({
      next: (data) => {
        this.fournisseurs.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.toastService.error('Erreur lors du chargement des fournisseurs');
        this.loading.set(false);
      },
    });
  }

  openCreateModal(): void {
    this.editingFournisseur.set(null);
    this.fournisseurForm.reset({
      nom: '',
      ice: '',
      telephone: '',
      email: '',
      adresse: '',
      active: true,
    });
    this.showModal.set(true);
  }

  openEditModal(fournisseur: Fournisseur): void {
    this.editingFournisseur.set(fournisseur);
    this.fournisseurForm.patchValue({
      nom: fournisseur.nom,
      ice: fournisseur.ice || '',
      telephone: fournisseur.telephone || '',
      email: fournisseur.email || '',
      adresse: fournisseur.adresse || '',
      active: fournisseur.active,
    });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingFournisseur.set(null);
    this.fournisseurForm.reset();
  }

  saveFournisseur(): void {
    if (this.fournisseurForm.invalid) {
      this.fournisseurForm.markAllAsTouched();
      return;
    }

    const formValue = this.fournisseurForm.value;
    const editing = this.editingFournisseur();

    if (editing) {
      const updateData: FournisseurUpdate = {
        nom: formValue.nom,
        ice: formValue.ice || undefined,
        telephone: formValue.telephone || undefined,
        email: formValue.email || undefined,
        adresse: formValue.adresse || undefined,
        active: formValue.active,
      };

      this.fournisseursService.update(editing.id, updateData).subscribe({
        next: () => {
          this.toastService.success('Fournisseur modifié avec succès');
          this.closeModal();
          this.loadFournisseurs();
        },
        error: () => {
          this.toastService.error('Erreur lors de la modification');
        },
      });
    } else {
      const createData: FournisseurCreate = {
        nom: formValue.nom,
        ice: formValue.ice || undefined,
        telephone: formValue.telephone || undefined,
        email: formValue.email || undefined,
        adresse: formValue.adresse || undefined,
      };

      this.fournisseursService.create(createData).subscribe({
        next: () => {
          this.toastService.success('Fournisseur créé avec succès');
          this.closeModal();
          this.loadFournisseurs();
        },
        error: () => {
          this.toastService.error('Erreur lors de la création');
        },
      });
    }
  }

  deleteFournisseur(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) {
      this.fournisseursService.delete(id).subscribe({
        next: () => {
          this.toastService.success('Fournisseur supprimé avec succès');
          this.loadFournisseurs();
        },
        error: () => {
          this.toastService.error('Erreur lors de la suppression');
        },
      });
    }
  }
}
