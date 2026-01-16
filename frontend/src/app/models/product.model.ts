export interface Product {
  id: number;
  designation: string;
  unite: string;
  stockMin: number;
  stockActuel: number;
  stockAlert: boolean;
  active: boolean;
}

export interface ProductCreate {
  designation: string;
  unite: string;
  stockMin: number;
  active?: boolean;
}

export interface ProductUpdate {
  designation?: string;
  unite?: string;
  stockMin?: number;
  active?: boolean;
}
