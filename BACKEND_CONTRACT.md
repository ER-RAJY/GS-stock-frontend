# SMART STOCK MANAGEMENT SYSTEM – BACKEND CONTRACT

Base URL:
http://localhost:8080

====================================
AUTHENTICATION
====================================
POST /api/auth/login
Request:
{
  "username": "admin",
  "password": "admin123"
}

Response:
{
  "token": "JWT_TOKEN",
  "username": "admin",
  "roles": ["ROLE_ADMIN"]
}

All secured requests require:
Authorization: Bearer JWT_TOKEN

====================================
ROLES
====================================
ROLE_ADMIN:
- Full access

ROLE_COMPTABLE:
- Read-only (no achats, no exports)

====================================
PRODUCTS
====================================
GET /api/produits

Response:
[
  {
    "id": 1,
    "designation": "Ciment CPJ",
    "unite": "KG",
    "stockMin": 100,
    "stockActuel": 80,
    "stockAlert": true,
    "active": true
  }
]

POST /api/produits (ADMIN)
PUT /api/produits/{id} (ADMIN)
DELETE /api/produits/{id} (ADMIN)

GET /api/produits/alerts

====================================
STOCK MOVEMENTS
====================================
POST /api/movements/entree
POST /api/movements/sortie

GET /api/movements/search/paged
Query params:
- produitId
- type (ENTREE | SORTIE)
- from
- to
- page
- size
- sort

====================================
ACHATS (ADMIN ONLY)
====================================
GET /api/achats

POST /api/achats (create DRAFT)
POST /api/achats/{id}/lines
POST /api/achats/{id}/validate

====================================
STATS
====================================
GET /api/stats/depenses
GET /api/stats/depenses/fournisseurs
GET /api/stats/stock/consommation

====================================
EXPORT
====================================
GET /api/export/stock/excel
GET /api/export/achats/excel
