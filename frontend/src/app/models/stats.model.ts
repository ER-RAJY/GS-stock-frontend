export interface DepensesStats {
  totalHT?: number;
  totalTVA?: number;
  totalTTC?: number;
  period?: string;
}

export interface DepensesFournisseurs {
  fournisseurId: number;
  totalHT: number;
  totalTVA: number;
  totalTTC: number;
}

export interface ConsommationStats {
  produitId: number;
  designation: string;
  totalEntree: number;
  totalSortie: number;
  stockActuel: number;
}

export interface TopSortie {
  produitId: number;
  designation: string;
  totalSortie: number;
}