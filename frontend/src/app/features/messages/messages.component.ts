import { Component, OnInit, OnDestroy, signal, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService } from '../../core/services/message.service';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { Conversation, Message, CreateMessageDto } from '../../models/message.model';
import { Subject, interval } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss'
})
export class MessagesComponent implements OnInit, OnDestroy {
  private messageService = inject(MessageService);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  router = inject(Router); // Public para acceso desde template
  private route = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();

  // Signals
  conversations = signal<Conversation[]>([]);
  selectedConversation = signal<Conversation | null>(null);
  messages = signal<Message[]>([]);
  newMessage = signal<string>('');
  isLoading = signal<boolean>(false);
  isLoadingMessages = signal<boolean>(false);
  isSending = signal<boolean>(false);
  currentPage = signal<number>(1);
  hasMore = signal<boolean>(true);
  searchQuery = signal<string>('');

  // Computed
  filteredConversations = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.conversations();
    
    return this.conversations().filter(conv =>
      conv.otherUser.fullName.toLowerCase().includes(query) ||
      conv.otherUser.username.toLowerCase().includes(query) ||
      conv.content.toLowerCase().includes(query)
    );
  });

  totalUnreadCount = computed(() => {
    return this.conversations().reduce((sum, conv) => sum + conv.unreadCount, 0);
  });

  currentUserId = computed(() => this.authService.currentUser()?.id);

  ngOnInit(): void {
    this.loadConversations();
    this.setupAutoRefresh();
    this.messageService.updateUnreadCount();

    // Verificar si hay un usuario en los queryParams para iniciar conversación
    this.route.queryParams.subscribe(params => {
      if (params['userId'] && params['username']) {
        this.startNewConversation(params['userId'], params['username']);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Cargar lista de conversaciones
   */
  loadConversations(): void {
    this.isLoading.set(true);
    this.messageService.getConversations()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.conversations.set(response.data);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading conversations:', error);
          this.isLoading.set(false);
        }
      });
  }

  /**
   * Seleccionar una conversación
   */
  selectConversation(conversation: Conversation): void {
    this.selectedConversation.set(conversation);
    this.messages.set([]);
    this.currentPage.set(1);
    this.hasMore.set(true);
    this.loadMessages(conversation.otherUser.id);
    this.markConversationAsRead(conversation);
  }

  /**
   * Cargar mensajes de una conversación
   */
  loadMessages(userId: string, page: number = 1): void {
    this.isLoadingMessages.set(true);
    this.messageService.getMessagesWithUser(userId, page)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (page === 1) {
            this.messages.set(response.data);
          } else {
            this.messages.update(msgs => [...response.data, ...msgs]);
          }
          this.hasMore.set(response.meta.page < response.meta.totalPages);
          this.isLoadingMessages.set(false);
          
          // Scroll al final si es la primera página
          if (page === 1) {
            setTimeout(() => this.scrollToBottom(), 100);
          }
        },
        error: (error) => {
          console.error('Error loading messages:', error);
          this.isLoadingMessages.set(false);
        }
      });
  }

  /**
   * Enviar un mensaje
   */
  sendMessage(): void {
    const content = this.newMessage().trim();
    const selected = this.selectedConversation();
    
    if (!content || !selected || this.isSending()) return;

    const messageDto: CreateMessageDto = {
      receiverId: selected.otherUser.id,
      content: content
    };

    this.isSending.set(true);
    this.messageService.sendMessage(messageDto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.messages.update(msgs => [...msgs, response.data]);
          this.newMessage.set('');
          this.isSending.set(false);
          this.scrollToBottom();
          this.updateConversationList();
        },
        error: (error) => {
          console.error('Error sending message:', error);
          this.isSending.set(false);
        }
      });
  }

  /**
   * Marcar conversación como leída
   */
  markConversationAsRead(conversation: Conversation): void {
    if (conversation.unreadCount > 0) {
      this.messageService.markAsRead(conversation.otherUser.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            // Actualizar contador local
            this.conversations.update(convs =>
              convs.map(c =>
                c.otherUser.id === conversation.otherUser.id
                  ? { ...c, unreadCount: 0 }
                  : c
              )
            );
          }
        });
    }
  }

  /**
   * Actualizar lista de conversaciones después de enviar mensaje
   */
  updateConversationList(): void {
    this.loadConversations();
  }

  /**
   * Configurar auto-refresh cada 30 segundos
   */
  setupAutoRefresh(): void {
    interval(30000)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.messageService.getConversations())
      )
      .subscribe({
        next: (response) => {
          this.conversations.set(response.data);
        }
      });
  }

  /**
   * Scroll al final del chat
   */
  scrollToBottom(): void {
    const messagesContainer = document.querySelector('.messages-list');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  /**
   * Cargar más mensajes (scroll infinito hacia arriba)
   */
  loadMoreMessages(): void {
    const selected = this.selectedConversation();
    if (!selected || !this.hasMore() || this.isLoadingMessages()) return;
    
    const nextPage = this.currentPage() + 1;
    this.currentPage.set(nextPage);
    this.loadMessages(selected.otherUser.id, nextPage);
  }

  /**
   * Formatear timestamp
   */
  formatTime(date: Date | string): string {
    const messageDate = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - messageDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    
    return messageDate.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short' 
    });
  }

  /**
   * Manejar Enter para enviar
   */
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  /**
   * Verificar si el mensaje es del usuario actual
   */
  isMyMessage(message: Message): boolean {
    return message.senderId === this.currentUserId();
  }

  /**
   * Volver a la lista de conversaciones (mobile)
   */
  backToConversations(): void {
    this.selectedConversation.set(null);
  }

  /**
   * Ir al perfil del usuario
   */
  goToProfile(username: string): void {
    this.router.navigate(['/profile', username]);
  }

  /**
   * Iniciar una nueva conversación desde query params
   */
  startNewConversation(userId: string, username: string): void {
    // Buscar si ya existe una conversación con este usuario
    const existingConv = this.conversations().find(c => c.otherUser.id === userId);
    
    if (existingConv) {
      // Si ya existe, seleccionarla
      this.selectConversation(existingConv);
    } else {
      // Si no existe, crear una conversación temporal
      this.userService.getUserById(userId).subscribe({
        next: (user) => {
          const tempConversation: Conversation = {
            id: `temp-${Date.now()}`,
            content: '',
            isRead: true,
            createdAt: new Date(),
            otherUser: {
              id: user.id,
              username: user.username,
              fullName: user.fullName || user.username,
              avatarUrl: user.avatarUrl,
              isVerified: user.isVerified || false
            },
            unreadCount: 0
          };
          
          this.selectedConversation.set(tempConversation);
          this.messages.set([]);
        },
        error: (error) => {
          console.error('Error loading user for conversation:', error);
        }
      });
    }

    // Limpiar los query params
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      queryParamsHandling: 'merge'
    });
  }
}

