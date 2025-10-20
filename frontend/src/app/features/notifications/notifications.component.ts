import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationsListComponent } from '../../shared/components/notifications-list/notifications-list.component';

/**
 * Página de notificaciones
 */
@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, NotificationsListComponent],
  template: `
    <div class="notifications-page">
      <app-notifications-list></app-notifications-list>
    </div>
  `,
  styles: [`
    .notifications-page {
      min-height: 100vh;
      background-color: #f3f4f6;
    }
  `]
})
export class NotificationsComponent {}
