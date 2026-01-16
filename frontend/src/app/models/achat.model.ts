export interface Achat {
  id: number;
  referenceFacture?: string;
  date?: string;
  tvaRate?: number;
  fournisseurId?: number;
  status?: string;
  totalHT?: number | null;
  totalTVA?: number | null;
  totalTTC?: number | null;
  lines?: AchatLine[];
}

export interface AchatLine {
  id?: number;
  produitId: number;
  quantite: number;
  prixUnitaireHT: number;
}

export interface AchatCreate {
  referenceFacture: string;
  date: string;
  tvaRate: number;
  fournisseurId: number;
}
