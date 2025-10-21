import { Injectable, inject } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

export interface WebSocketEvent {
  type: 'notification' | 'message' | 'like' | 'comment' | 'follow' | 'user-online' | 'user-offline';
  data: any;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private authService = inject(AuthService);
  private socket: Socket | null = null;
  private eventsSubject = new Subject<WebSocketEvent>();
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);

  // Observables públicos
  public events$ = this.eventsSubject.asObservable();
  public connectionStatus$ = this.connectionStatusSubject.asObservable();

  /**
   * Conectar al servidor WebSocket
   */
  connect(): void {
    if (this.socket?.connected) {
      console.log('✅ WebSocket already connected');
      return;
    }

    const token = this.authService.getAccessToken();
    if (!token) {
      console.warn('⚠️ No auth token available for WebSocket connection');
      return;
    }

    // Crear conexión socket.io
    this.socket = io(`${environment.apiUrl.replace('/api/v1', '')}/events`, {
      auth: {
        token: token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.setupEventListeners();
  }

  /**
   * Configurar listeners de eventos
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Evento de conexión exitosa
    this.socket.on('connect', () => {
      console.log('🚀 WebSocket connected:', this.socket?.id);
      this.connectionStatusSubject.next(true);
    });

    // Evento de desconexión
    this.socket.on('disconnect', (reason) => {
      console.log('🔌 WebSocket disconnected:', reason);
      this.connectionStatusSubject.next(false);
    });

    // Evento de conexión exitosa con datos
    this.socket.on('connected', (data) => {
      console.log('✅ WebSocket authenticated:', data);
    });

    // Eventos de notificaciones
    this.socket.on('notification:new', (data) => {
      console.log('📬 New notification received:', data);
      this.eventsSubject.next({
        type: 'notification',
        data,
        timestamp: new Date(),
      });
    });

    // Eventos de mensajes
    this.socket.on('message:new', (data) => {
      console.log('💬 New message received:', data);
      this.eventsSubject.next({
        type: 'message',
        data,
        timestamp: new Date(),
      });
    });

    // Eventos de likes
    this.socket.on('like:new', (data) => {
      console.log('❤️ New like received:', data);
      this.eventsSubject.next({
        type: 'like',
        data,
        timestamp: new Date(),
      });
    });

    // Eventos de comentarios
    this.socket.on('comment:new', (data) => {
      console.log('💭 New comment received:', data);
      this.eventsSubject.next({
        type: 'comment',
        data,
        timestamp: new Date(),
      });
    });

    // Eventos de follows
    this.socket.on('follow:new', (data) => {
      console.log('👥 New follower received:', data);
      this.eventsSubject.next({
        type: 'follow',
        data,
        timestamp: new Date(),
      });
    });

    // Eventos de usuarios online/offline
    this.socket.on('user:online', (data) => {
      this.eventsSubject.next({
        type: 'user-online',
        data,
        timestamp: new Date(),
      });
    });

    this.socket.on('user:offline', (data) => {
      this.eventsSubject.next({
        type: 'user-offline',
        data,
        timestamp: new Date(),
      });
    });

    // Errores
    this.socket.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
    });

    // Evento de reconexión
    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 WebSocket reconnected after ${attemptNumber} attempts`);
      this.connectionStatusSubject.next(true);
    });

    // Intento de reconexión
    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Attempting to reconnect... (${attemptNumber})`);
    });

    // Error de reconexión
    this.socket.on('reconnect_error', (error) => {
      console.error('❌ Reconnection error:', error);
    });

    // Falló la reconexión
    this.socket.on('reconnect_failed', () => {
      console.error('❌ Failed to reconnect after maximum attempts');
      this.connectionStatusSubject.next(false);
    });
  }

  /**
   * Desconectar del servidor WebSocket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connectionStatusSubject.next(false);
      console.log('🔌 WebSocket disconnected manually');
    }
  }

  /**
   * Enviar ping al servidor
   */
  ping(): void {
    if (this.socket?.connected) {
      this.socket.emit('ping');
    }
  }

  /**
   * Solicitar lista de usuarios online
   */
  getOnlineUsers(): void {
    if (this.socket?.connected) {
      this.socket.emit('users:online');
    }
  }

  /**
   * Verificar si está conectado
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Obtener ID del socket
   */
  getSocketId(): string | undefined {
    return this.socket?.id;
  }
}
