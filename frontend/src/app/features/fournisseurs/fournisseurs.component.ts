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
  templateUrl: './fournisseurs.component.html',
  styleUrls: ['./fournisseurs.component.scss'],
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
