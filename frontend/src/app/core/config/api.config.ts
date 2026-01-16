export const API_CONFIG = {
  baseUrl: 'http://localhost:8080',
  endpoints: {
    auth: {
      login: '/api/auth/login',
    },
    products: {
      base: '/api/produits',
      alerts: '/api/produits/alerts',
    },
    movements: {
      entree: '/api/movements/entree',
      sortie: '/api/movements/sortie',
      search: '/api/movements/search/paged',
    },
    achats: {
      base: '/api/achats',
      lines: (id: number) => `/api/achats/${id}/lines`,
      validate: (id: number) => `/api/achats/${id}/validate`,
    },
    fournisseurs: {
      base: '/api/fournisseurs',
      search: '/api/fournisseurs/search',
    },
    stats: {
      depenses: '/api/stats/depenses',
      depensesFournisseurs: '/api/stats/depenses/fournisseurs',
      consommation: '/api/stats/stock/consommation',
      topSorties: '/api/stats/stock/top-sorties',
    },
    export: {
      stockExcel: '/api/export/stock/excel',
      achatsExcel: '/api/export/achats/excel',
    },
  },
} as const;
