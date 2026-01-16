export type MovementType = 'ENTREE' | 'SORTIE';

export interface Movement {
  id?: number;
  type?: MovementType; // Only in response, not in request
  quantite: number;
  commentaire?: string;
  date?: string;
  produitId: number;
}

export interface MovementCreate {
  produitId: number;
  quantite: number;
  commentaire?: string;
}

export interface MovementSearchParams {
  produitId?: number;
  type?: MovementType;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
