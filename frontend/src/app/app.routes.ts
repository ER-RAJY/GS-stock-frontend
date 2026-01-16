import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () => import('./layout/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'products',
        loadComponent: () => import('./features/products/products.component').then((m) => m.ProductsComponent),
      },
      {
        path: 'movements',
        loadComponent: () => import('./features/movements/movements.component').then((m) => m.MovementsComponent),
      },
      {
        path: 'achats',
        loadComponent: () => import('./features/achats/achats.component').then((m) => m.AchatsComponent),
        canActivate: [adminGuard],
      },
      {
        path: 'fournisseurs',
        loadComponent: () => import('./features/fournisseurs/fournisseurs.component').then((m) => m.FournisseursComponent),
      },
      {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '**',
    redirectTo: '/dashboard',
  },
];
