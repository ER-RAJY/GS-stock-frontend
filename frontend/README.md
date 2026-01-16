# Smart Stock Management System - Frontend

Enterprise-grade Angular frontend for the Smart Stock Management System.

## Tech Stack

- **Angular 21** (Standalone Components)
- **Tailwind CSS** (Styling)
- **TypeScript** (Type Safety)
- **RxJS** (Reactive Programming)

## Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (ROLE_ADMIN, ROLE_COMPTABLE)
- Protected routes with guards
- Auto-redirect on token expiration

### Modules

1. **Dashboard**
   - KPI cards (Total HT, TVA, TTC)
   - Date filters (This week, This month, Custom range)
   - Export achats to Excel (Admin only)

2. **Products**
   - Product list with stock alerts
   - Create/Update/Delete (Admin only)
   - Read-only for Comptable
   - Export stock to Excel (Admin only)

3. **Stock Movements**
   - Paginated table with filters
   - Filter by product, type (ENTREE/SORTIE), date range
   - Create movements (Admin only)
   - View-only for Comptable

4. **Achats** (Admin only)
   - Create draft achats
   - Add lines to achats
   - Validate achats
   - Display totals from backend

5. **Exports** (Admin only)
   - Export stock to Excel
   - Export achats to Excel

## Setup

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:4200`

### Build

```bash
npm run build
```

## Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── config/          # API configuration
│   │   ├── guards/          # Route guards
│   │   ├── interceptors/   # HTTP interceptors
│   │   └── services/        # Core services
│   ├── features/           # Feature modules
│   │   ├── login/
│   │   ├── dashboard/
│   │   ├── products/
│   │   ├── movements/
│   │   └── achats/
│   ├── layout/             # Layout components
│   │   ├── sidebar/
│   │   ├── topbar/
│   │   └── main-layout/
│   ├── models/            # TypeScript interfaces
│   └── shared/            # Shared components & services
│       ├── components/
│       └── services/
```

## Backend Integration

The frontend consumes the backend API at `http://localhost:8080`.

All API endpoints are defined in `src/app/core/config/api.config.ts` and follow the backend contract strictly.

## Key Principles

1. **No Business Logic on Frontend**: All calculations, validations, and business rules are handled by the backend
2. **Trust Backend Responses**: Frontend displays data as received from backend
3. **Role-Based UI**: UI elements are hidden/shown based on user roles
4. **Clean Architecture**: Separation of concerns with services, components, and models

## Development

### Adding a New Feature

1. Create models in `src/app/models/`
2. Create service in `src/app/core/services/`
3. Create component in `src/app/features/`
4. Add route in `src/app/app.routes.ts`
5. Update sidebar navigation if needed

### Styling

- Use Tailwind CSS utility classes
- Follow the existing design system
- Maintain consistent spacing and colors

## License

Private - Internal Use Only
