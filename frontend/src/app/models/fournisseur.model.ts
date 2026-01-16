export interface Fournisseur {
  id: number;
  nom: string;
  ice?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  active: boolean;
}

export interface FournisseurCreate {
  nom: string;
  ice?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
}

export interface FournisseurUpdate {
  nom?: string;
  ice?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  active?: boolean;
}
