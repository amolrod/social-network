import { Injectable, inject, OnDestroy } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, Subscription, filter } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  Message,
  Conversation,
  CreateMessageDto,
  MessagesResponse,
} from '../../models/message.model';
import { WebSocketService } from './websocket.service';

@Injectable({
  providedIn: 'root',
})
export class MessageService implements OnDestroy {
  private http = inject(HttpClient);
  private webSocketService = inject(WebSocketService);
  private apiUrl = `${environment.apiUrl}/messages`;
  private subscriptions = new Subscription();

  // Estado reactivo para el contador de mensajes no leídos
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor() {
    // Suscribirse a eventos de WebSocket para mensajes en tiempo real
    this.subscribeToWebSocketEvents();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  /**
   * Suscribirse a eventos de WebSocket para mensajes
   */
  private subscribeToWebSocketEvents() {
    const messagesSub = this.webSocketService.events$
      .pipe(filter(event => event.type === 'message'))
      .subscribe(event => {
        console.log('💬 Mensaje en tiempo real recibido:', event);
        
        // Incrementar contador de mensajes no leídos
        this.incrementUnreadCount();
      });

    this.subscriptions.add(messagesSub);
  }

  /**
   * Enviar un nuevo mensaje
   */
  sendMessage(createMessageDto: CreateMessageDto): Observable<{ message: string; data: Message }> {
    return this.http.post<{ message: string; data: Message }>(this.apiUrl, createMessageDto);
  }

  /**
   * Obtener lista de conversaciones
   */
  getConversations(): Observable<{ data: Conversation[] }> {
    return this.http.get<{ data: Conversation[] }>(`${this.apiUrl}/conversations`);
  }

  /**
   * Obtener mensajes con un usuario específico
   */
  getMessagesWithUser(
    userId: string,
    page: number = 1,
    limit: number = 50
  ): Observable<MessagesResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<MessagesResponse>(`${this.apiUrl}/with/${userId}`, { params });
  }

  /**
   * Marcar todos los mensajes de un usuario como leídos
   */
  markAsRead(userId: string): Observable<{ message: string }> {
    return this.http
      .patch<{ message: string }>(`${this.apiUrl}/mark-read/${userId}`, {})
      .pipe(tap(() => this.updateUnreadCount()));
  }

  /**
   * Marcar un mensaje específico como leído
   */
  markMessageAsRead(messageId: string): Observable<{ message: string; data: Message }> {
    return this.http
      .patch<{ message: string; data: Message }>(`${this.apiUrl}/${messageId}/read`, {})
      .pipe(tap(() => this.updateUnreadCount()));
  }

  /**
   * Obtener cantidad de mensajes no leídos
   */
  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/unread-count`).pipe(
      tap((response) => this.unreadCountSubject.next(response.count))
    );
  }

  /**
   * Actualizar el contador de mensajes no leídos
   */
  updateUnreadCount(): void {
    this.getUnreadCount().subscribe();
  }

  /**
   * Eliminar un mensaje
   */
  deleteMessage(messageId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${messageId}`);
  }

  /**
   * Incrementar contador de mensajes no leídos (para WebSocket)
   */
  incrementUnreadCount(): void {
    this.unreadCountSubject.next(this.unreadCountSubject.value + 1);
  }

  /**
   * Decrementar contador de mensajes no leídos
   */
  decrementUnreadCount(amount: number = 1): void {
    const current = this.unreadCountSubject.value;
    this.unreadCountSubject.next(Math.max(0, current - amount));
  }
}
