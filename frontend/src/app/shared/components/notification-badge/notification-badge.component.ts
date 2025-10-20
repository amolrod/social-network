import { Component, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Badge de notificaciones para la navbar
 * Muestra el contador de notificaciones no leídas
 */
@Component({
  selector: 'app-notification-badge',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <a 
      routerLink="/notifications" 
      class="notification-badge-container"
      [class.has-unread]="unreadCount() > 0">
      <!-- Ícono de campana -->
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
      </svg>
      
      <!-- Badge con contador -->
      @if (unreadCount() > 0) {
        <span class="badge">
          {{ unreadCount() > 99 ? '99+' : unreadCount() }}
        </span>
      }
    </a>
  `,
  styles: [`
    .notification-badge-container {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.2s ease;
      color: #657786;
      text-decoration: none;
    }

    .notification-badge-container:hover {
      background-color: rgba(29, 161, 242, 0.1);
      color: #1da1f2;
    }

    .notification-badge-container.has-unread svg {
      color: #1da1f2;
    }

    .badge {
      position: absolute;
      top: 0;
      right: 0;
      background: #e0245e;
      color: white;
      font-size: 11px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 10px;
      min-width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid white;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.1);
      }
    }

    /* Responsive */
    @media (max-width: 640px) {
      .notification-badge-container {
        width: 36px;
        height: 36px;
      }
      
      svg {
        width: 22px;
        height: 22px;
      }

      .badge {
        font-size: 10px;
        min-width: 16px;
        height: 16px;
        padding: 1px 4px;
      }
    }
  `]
})
export class NotificationBadgeComponent implements OnInit {
  private readonly notificationService = inject(NotificationService);
  private readonly authService = inject(AuthService);

  readonly unreadCount = this.notificationService.unreadCount;
  readonly currentUser = this.authService.currentUser;

  constructor() {
    // Recargar contador cuando el usuario cambie
    effect(() => {
      const user = this.currentUser();
      if (user) {
        this.loadUnreadCount();
      }
    });
  }

  ngOnInit(): void {
    // Cargar contador inicial
    if (this.currentUser()) {
      this.loadUnreadCount();
    }

    // Actualizar cada 30 segundos
    setInterval(() => {
      if (this.currentUser()) {
        this.loadUnreadCount();
      }
    }, 30000);
  }

  private loadUnreadCount(): void {
    this.notificationService.getUnreadCount().subscribe({
      error: (err) => {
        console.error('Error al cargar contador de notificaciones:', err);
      }
    });
  }
}
