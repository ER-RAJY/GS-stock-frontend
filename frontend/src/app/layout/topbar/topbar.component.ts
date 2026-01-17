import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
})
export class TopbarComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  logout(): void {
    this.authService.logout();
  }

  getInitials(): string {
    const username = this.authService.currentUser()?.username || '';
    return username
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getRoleLabel(): string {
    if (this.authService.isAdmin()) return 'Administrateur';
    if (this.authService.isComptable()) return 'Comptable';
    return 'Utilisateur';
  }
}
