import { Injectable, inject, signal, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, Subscription, filter } from 'rxjs';
import { environment } from '../../../environments/environment';
import { WebSocketService } from './websocket.service';

/**
 * Tipos de notificaciones
 */
export enum NotificationType {
  LIKE = 'like',
  COMMENT = 'comment',
  FOLLOW = 'follow',
  MENTION = 'mention',
  MESSAGE = 'message',
}

/**
 * Interfaz de Notificación
 */
export interface Notification {
  id: string;
  userId: string;
  actorId: string;
  actor: {
    id: string;
    username: string;
    fullName: string;
    avatarUrl?: string;
  };
  type: NotificationType;
  entityType: string | null;
  entityId: string | null;
  isRead: boolean;
  createdAt: string;
}

/**
 * Respuesta de la API con paginación
 */
interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  page: number;
  totalPages: number;
  unreadCount: number;
}

/**
 * Service para gestionar notificaciones
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService implements OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly webSocketService = inject(WebSocketService);
  private readonly apiUrl = `${environment.apiUrl}/notifications`;
  private subscriptions = new Subscription();

  // Signals para estado reactivo
  readonly notifications = signal<Notification[]>([]);
  readonly unreadCount = signal<number>(0);
  readonly isLoading = signal<boolean>(false);
  readonly currentPage = signal<number>(1);
  readonly totalPages = signal<number>(1);

  constructor() {
    // Suscribirse a eventos de WebSocket para notificaciones en tiempo real
    this.subscribeToWebSocketEvents();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  /**
   * Suscribirse a eventos de WebSocket
   */
  private subscribeToWebSocketEvents() {
    const eventsSub = this.webSocketService.events$
      .pipe(
        filter(event => 
          event.type === 'notification' || 
          event.type === 'like' || 
          event.type === 'comment' || 
          event.type === 'follow'
        )
      )
      .subscribe(event => {
        console.log('🔔 Notificación en tiempo real recibida:', event);
        
        // Incrementar contador de notificaciones no leídas
        this.unreadCount.update(count => count + 1);
        
        // Opcional: recargar notificaciones si estamos en la página 1
        if (this.currentPage() === 1) {
          this.getNotifications(1).subscribe();
        }
      });

    this.subscriptions.add(eventsSub);
  }

  /**
   * Obtener notificaciones con paginación
   */
  getNotifications(page: number = 1, limit: number = 20): Observable<any> {
    this.isLoading.set(true);
    
    return this.http.get<any>(`${this.apiUrl}?page=${page}&limit=${limit}`).pipe(
      tap({
        next: (response) => {
          // Manejar double-wrapped response
          let data = response;
          if (response.success && response.data) {
            data = response.data;
          }

          const result = data as NotificationsResponse;
          
          if (page === 1) {
            this.notifications.set(result.notifications);
          } else {
            this.notifications.update((current) => [...current, ...result.notifications]);
          }
          
          this.currentPage.set(result.page);
          this.totalPages.set(result.totalPages);
          this.unreadCount.set(result.unreadCount);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error al cargar notificaciones:', err);
          this.isLoading.set(false);
        }
      })
    );
  }

  /**
   * Obtener solo el contador de no leídas
   */
  getUnreadCount(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/unread/count`).pipe(
      tap((response) => {
        // Manejar double-wrapped response
        let data = response;
        if (response.success && response.data) {
          data = response.data;
        }

        this.unreadCount.set(data.count || 0);
      })
    );
  }

  /**
   * Marcar una notificación como leída
   */
  markAsRead(notificationId: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${notificationId}/read`, {}).pipe(
      tap(() => {
        // Actualizar localmente
        this.notifications.update((notifications) =>
          notifications.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        );
        
        // Decrementar contador
        this.unreadCount.update((count) => Math.max(0, count - 1));
      })
    );
  }

  /**
   * Marcar todas como leídas
   */
  markAllAsRead(): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/read-all`, {}).pipe(
      tap(() => {
        // Actualizar localmente
        this.notifications.update((notifications) =>
          notifications.map((n) => ({ ...n, isRead: true }))
        );
        
        this.unreadCount.set(0);
      })
    );
  }

  /**
   * Eliminar una notificación
   */
  deleteNotification(notificationId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${notificationId}`).pipe(
      tap(() => {
        // Remover localmente
        const wasUnread = this.notifications().find((n) => n.id === notificationId)?.isRead === false;
        
        this.notifications.update((notifications) =>
          notifications.filter((n) => n.id !== notificationId)
        );
        
        if (wasUnread) {
          this.unreadCount.update((count) => Math.max(0, count - 1));
        }
      })
    );
  }

  /**
   * Eliminar todas las notificaciones leídas
   */
  deleteReadNotifications(): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/read`).pipe(
      tap(() => {
        // Remover leídas localmente
        this.notifications.update((notifications) =>
          notifications.filter((n) => !n.isRead)
        );
      })
    );
  }

  /**
   * Formatear el tiempo relativo (Ahora, 5m, 2h, 3d)
   */
  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Ahora';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d`;
    } else {
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    }
  }

  /**
   * Obtener el mensaje de la notificación
   */
  getNotificationMessage(notification: Notification): string {
    const actorName = notification.actor.fullName;
    
    switch (notification.type) {
      case NotificationType.LIKE:
        return `le dio me gusta a tu publicación`;
      case NotificationType.COMMENT:
        return `comentó en tu publicación`;
      case NotificationType.FOLLOW:
        return `comenzó a seguirte`;
      case NotificationType.MENTION:
        return `te mencionó en una publicación`;
      case NotificationType.MESSAGE:
        return `te envió un mensaje`;
      default:
        return `interactuó contigo`;
    }
  }

  /**
   * Obtener el ícono de la notificación
   */
  getNotificationIcon(type: NotificationType): string {
    switch (type) {
      case NotificationType.LIKE:
        return '❤️';
      case NotificationType.COMMENT:
        return '💬';
      case NotificationType.FOLLOW:
        return '👤';
      case NotificationType.MENTION:
        return '@';
      case NotificationType.MESSAGE:
        return '✉️';
      default:
        return '🔔';
    }
  }

  /**
   * Obtener el color del ícono
   */
  getNotificationColor(type: NotificationType): string {
    switch (type) {
      case NotificationType.LIKE:
        return '#e0245e'; // Rojo
      case NotificationType.COMMENT:
        return '#1da1f2'; // Azul
      case NotificationType.FOLLOW:
        return '#17bf63'; // Verde
      case NotificationType.MENTION:
        return '#794bc4'; // Morado
      case NotificationType.MESSAGE:
        return '#f45d22'; // Naranja
      default:
        return '#657786'; // Gris
    }
  }

  /**
   * Obtiene el link de navegación según el tipo de notificación
   */
  getNotificationLink(notification: Notification): string[] {
    switch (notification.type) {
      case NotificationType.LIKE:
      case NotificationType.COMMENT:
        return notification.entityId ? ['/post', notification.entityId] : ['/home'];
      case NotificationType.FOLLOW:
        return ['/profile', notification.actor?.username || ''];
      default:
        return ['/home'];
    }
  }
}
