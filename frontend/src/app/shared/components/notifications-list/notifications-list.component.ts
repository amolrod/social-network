import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService, Notification, NotificationType } from '../../../core/services/notification.service';

/**
 * Componente de lista de notificaciones
 * Muestra las notificaciones con paginación
 */
@Component({
  selector: 'app-notifications-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notifications-container">
      <!-- Header -->
      <div class="notifications-header">
        <h2>Notificaciones</h2>
        @if (unreadCount() > 0) {
          <button class="btn-mark-all" (click)="markAllAsRead()" type="button">
            Marcar todas como leídas
          </button>
        }
      </div>

      <!-- Loading -->
      @if (isLoading() && notifications().length === 0) {
        <div class="loading-container">
          <div class="spinner"></div>
          <p>Cargando notificaciones...</p>
        </div>
      }

      <!-- Lista de notificaciones -->
      @if (notifications().length > 0) {
        <div class="notifications-list">
          @for (notification of notifications(); track notification.id) {
            <div 
              class="notification-item"
              [class.unread]="!notification.isRead"
              (click)="handleNotificationClick(notification)">
              
              <!-- Avatar del actor -->
              <div class="notification-avatar">
                @if (notification.actor.avatarUrl) {
                  <img [src]="notification.actor.avatarUrl" [alt]="notification.actor.fullName">
                } @else {
                  <div class="avatar-placeholder">
                    {{ notification.actor.fullName.substring(0, 2).toUpperCase() }}
                  </div>
                }
                
                <!-- Ícono del tipo de notificación -->
                <div 
                  class="notification-icon"
                  [style.background-color]="getNotificationColor(notification.type)">
                  {{ getNotificationIcon(notification.type) }}
                </div>
              </div>

              <!-- Contenido -->
              <div class="notification-content">
                <div class="notification-text">
                  <strong>{{ notification.actor.fullName }}</strong>
                  {{ getNotificationMessage(notification) }}
                </div>
                <div class="notification-time">
                  {{ getTimeAgo(notification.createdAt) }}
                </div>
              </div>

              <!-- Indicador no leída -->
              @if (!notification.isRead) {
                <div class="unread-dot"></div>
              }

              <!-- Botón eliminar -->
              <button 
                class="btn-delete" 
                (click)="deleteNotification($event, notification.id)"
                type="button"
                title="Eliminar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
          }
        </div>

        <!-- Paginación -->
        @if (currentPage() < totalPages()) {
          <div class="load-more-container">
            <button 
              class="btn-load-more" 
              (click)="loadMore()"
              [disabled]="isLoading()"
              type="button">
              @if (isLoading()) {
                <span>Cargando...</span>
              } @else {
                <span>Cargar más</span>
              }
            </button>
          </div>
        }
      }

      <!-- Empty state -->
      @if (notifications().length === 0 && !isLoading()) {
        <div class="empty-state">
          <div class="empty-icon">🔔</div>
          <h3>No tienes notificaciones</h3>
          <p>Cuando alguien interactúe contigo, aparecerá aquí</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .notifications-container {
      max-width: 600px;
      margin: 0 auto;
    }

    .notifications-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e5e7eb;
      background: white;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .notifications-header h2 {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1f2937;
      margin: 0;
    }

    .btn-mark-all {
      background: none;
      border: none;
      color: #1da1f2;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      transition: all 0.2s;
    }

    .btn-mark-all:hover {
      background-color: rgba(29, 161, 242, 0.1);
    }

    .notifications-list {
      background: white;
    }

    .notification-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e5e7eb;
      cursor: pointer;
      transition: background-color 0.2s;
      position: relative;
    }

    .notification-item:hover {
      background-color: #f9fafb;
    }

    .notification-item.unread {
      background-color: #eff6ff;
    }

    .notification-item.unread:hover {
      background-color: #dbeafe;
    }

    .notification-avatar {
      position: relative;
      flex-shrink: 0;
    }

    .notification-avatar img,
    .avatar-placeholder {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      object-fit: cover;
    }

    .avatar-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-weight: 600;
      font-size: 1rem;
    }

    .notification-icon {
      position: absolute;
      bottom: -4px;
      right: -4px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .notification-content {
      flex: 1;
      min-width: 0;
    }

    .notification-text {
      color: #1f2937;
      font-size: 0.9375rem;
      line-height: 1.5;
      margin-bottom: 0.25rem;
    }

    .notification-text strong {
      font-weight: 600;
      color: #111827;
    }

    .notification-time {
      color: #6b7280;
      font-size: 0.875rem;
    }

    .unread-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #1da1f2;
      flex-shrink: 0;
      margin-top: 8px;
    }

    .btn-delete {
      opacity: 0;
      background: none;
      border: none;
      color: #6b7280;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 50%;
      transition: all 0.2s;
      flex-shrink: 0;
    }

    .notification-item:hover .btn-delete {
      opacity: 1;
    }

    .btn-delete:hover {
      background-color: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }

    .load-more-container {
      padding: 1rem;
      text-align: center;
      background: white;
    }

    .btn-load-more {
      background: white;
      border: 1px solid #d1d5db;
      color: #1da1f2;
      padding: 0.75rem 2rem;
      border-radius: 24px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-load-more:hover:not(:disabled) {
      background-color: #f9fafb;
      border-color: #1da1f2;
    }

    .btn-load-more:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      background: white;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #e5e7eb;
      border-top-color: #1da1f2;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .loading-container p {
      margin-top: 1rem;
      color: #6b7280;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: white;
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .empty-state h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 0.5rem;
    }

    .empty-state p {
      color: #6b7280;
      font-size: 0.9375rem;
    }

    /* Responsive */
    @media (max-width: 640px) {
      .notifications-header {
        padding: 0.75rem 1rem;
      }

      .notifications-header h2 {
        font-size: 1.125rem;
      }

      .btn-mark-all {
        font-size: 0.8125rem;
        padding: 0.375rem 0.75rem;
      }

      .notification-item {
        padding: 0.75rem 1rem;
        gap: 0.75rem;
      }

      .notification-avatar img,
      .avatar-placeholder {
        width: 40px;
        height: 40px;
      }

      .notification-icon {
        width: 20px;
        height: 20px;
        font-size: 10px;
      }

      .btn-delete {
        opacity: 1;
      }
    }
  `]
})
export class NotificationsListComponent implements OnInit {
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);

  readonly notifications = this.notificationService.notifications;
  readonly unreadCount = this.notificationService.unreadCount;
  readonly isLoading = this.notificationService.isLoading;
  readonly currentPage = this.notificationService.currentPage;
  readonly totalPages = this.notificationService.totalPages;

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    console.log('🔔 Cargando notificaciones...');
    this.notificationService.getNotifications().subscribe({
      next: (response) => {
        console.log('✅ Notificaciones recibidas:', response);
      },
      error: (err) => {
        console.error('❌ Error al cargar notificaciones:', err);
        alert('Error al cargar notificaciones. Revisa la consola para más detalles.');
      }
    });
  }

  loadMore(): void {
    const nextPage = this.currentPage() + 1;
    this.notificationService.getNotifications(nextPage).subscribe({
      error: (err) => {
        console.error('Error al cargar más notificaciones:', err);
      }
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      error: (err) => {
        console.error('Error al marcar todas como leídas:', err);
      }
    });
  }

  handleNotificationClick(notification: Notification): void {
    // Marcar como leída si no lo está
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id).subscribe();
    }

    // Navegar según el tipo
    const link = this.notificationService.getNotificationLink(notification);
    this.router.navigate(link);
  }

  deleteNotification(event: Event, notificationId: string): void {
    event.stopPropagation();
    
    this.notificationService.deleteNotification(notificationId).subscribe({
      error: (err) => {
        console.error('Error al eliminar notificación:', err);
      }
    });
  }

  getNotificationMessage(notification: Notification): string {
    return this.notificationService.getNotificationMessage(notification);
  }

  getNotificationIcon(type: NotificationType): string {
    return this.notificationService.getNotificationIcon(type);
  }

  getNotificationColor(type: NotificationType): string {
    return this.notificationService.getNotificationColor(type);
  }

  getTimeAgo(dateString: string): string {
    return this.notificationService.getTimeAgo(dateString);
  }
}
