import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './empty-state.component.html',
  styleUrls: ['./empty-state.component.scss'],
})
export class EmptyStateComponent {
  title = input<string>('Aucun élément');
  message = input<string>('Il n\'y a rien à afficher pour le moment.');
  actionLabel = input<string>();
  onActionClick = output<void>();
}
