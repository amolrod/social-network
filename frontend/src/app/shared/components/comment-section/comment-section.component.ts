import { Component, Input, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommentsService, Comment, CreateCommentDto } from '../../../core/services/comments.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-comment-section',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="comment-section">
      <!-- Formulario para nuevo comentario -->
      <div class="new-comment">
        <div class="user-avatar">
          @if (currentUser()?.avatarUrl) {
            <img [src]="currentUser()!.avatarUrl" [alt]="currentUser()!.fullName || currentUser()!.username">
          } @else {
            <div class="avatar-placeholder">
              {{ (currentUser()?.fullName || currentUser()?.username || 'U').charAt(0).toUpperCase() }}
            </div>
          }
        </div>
        <div class="comment-input-wrapper">
          <textarea
            class="comment-input"
            [(ngModel)]="newCommentText"
            placeholder="Escribe un comentario..."
            rows="1"
            (input)="autoResize($event)"
            [disabled]="isSubmitting()">
          </textarea>
          <button 
            class="submit-btn"
            [disabled]="!canSubmit()"
            (click)="submitComment()">
            @if (isSubmitting()) {
              <span class="spinner"></span>
            } @else {
              Comentar
            }
          </button>
        </div>
      </div>

      <!-- Lista de comentarios -->
      <div class="comments-list">
        @if (isLoading()) {
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Cargando comentarios...</p>
          </div>
        } @else if (comments().length === 0) {
          <div class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p>No hay comentarios aún</p>
            <span>Sé el primero en comentar</span>
          </div>
        } @else {
          @for (comment of comments(); track comment.id) {
            <div class="comment-item">
              <div class="comment-avatar">
                @if (comment.user.avatarUrl) {
                  <img [src]="comment.user.avatarUrl" [alt]="comment.user.fullName || comment.user.username">
                } @else {
                  <div class="avatar-placeholder">
                    {{ (comment.user.fullName || comment.user.username).charAt(0).toUpperCase() }}
                  </div>
                }
              </div>
              <div class="comment-content">
                <div class="comment-header">
                  <span class="comment-author">
                    {{ comment.user.fullName || comment.user.username }}
                    @if (comment.user.isVerified) {
                      <svg class="verified-badge" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                      </svg>
                    }
                  </span>
                  <span class="comment-username">@{{ comment.user.username }}</span>
                  <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
                </div>
                <p class="comment-text">{{ comment.content }}</p>
                <div class="comment-actions">
                  <button class="action-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Responder
                  </button>
                  @if (isCommentOwner(comment)) {
                    <button class="action-btn delete" (click)="deleteComment(comment.id)">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Eliminar
                    </button>
                  }
                </div>
              </div>
            </div>
          }
        }
      </div>

      <!-- Paginación -->
      @if (totalPages() > 1) {
        <div class="pagination">
          <button 
            class="page-btn"
            [disabled]="currentPage() === 1"
            (click)="loadPage(currentPage() - 1)">
            Anterior
          </button>
          <span class="page-info">Página {{ currentPage() }} de {{ totalPages() }}</span>
          <button 
            class="page-btn"
            [disabled]="currentPage() === totalPages()"
            (click)="loadPage(currentPage() + 1)">
            Siguiente
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .comment-section {
      padding: 16px 0;
    }

    .new-comment {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #e1e8ed;
    }

    .user-avatar,
    .comment-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      overflow: hidden;
      flex-shrink: 0;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .avatar-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-weight: 600;
      font-size: 16px;
    }

    .comment-input-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .comment-input {
      width: 100%;
      padding: 12px;
      border: 1px solid #e1e8ed;
      border-radius: 12px;
      font-size: 15px;
      resize: none;
      font-family: inherit;
      transition: border-color 0.2s;

      &:focus {
        outline: none;
        border-color: #1DA1F2;
      }

      &:disabled {
        background: #f7f9fa;
        cursor: not-allowed;
      }
    }

    .submit-btn {
      align-self: flex-end;
      padding: 8px 20px;
      background: #1DA1F2;
      color: white;
      border: none;
      border-radius: 20px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: background 0.2s;
      display: flex;
      align-items: center;
      gap: 6px;

      &:hover:not(:disabled) {
        background: #1a91da;
      }

      &:disabled {
        background: #aab8c2;
        cursor: not-allowed;
      }
    }

    .comments-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .comment-item {
      display: flex;
      gap: 12px;
    }

    .comment-content {
      flex: 1;
      min-width: 0;
    }

    .comment-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
      flex-wrap: wrap;
    }

    .comment-author {
      font-weight: 600;
      color: #14171a;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .verified-badge {
      width: 16px;
      height: 16px;
      color: #1DA1F2;
    }

    .comment-username {
      color: #657786;
      font-size: 14px;
    }

    .comment-time {
      color: #657786;
      font-size: 13px;
    }

    .comment-text {
      margin: 8px 0;
      color: #14171a;
      line-height: 1.5;
      word-wrap: break-word;
    }

    .comment-actions {
      display: flex;
      gap: 16px;
      margin-top: 8px;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      background: transparent;
      border: none;
      color: #657786;
      font-size: 13px;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.2s;

      svg {
        width: 16px;
        height: 16px;
      }

      &:hover {
        background: rgba(29, 161, 242, 0.1);
        color: #1DA1F2;
      }

      &.delete:hover {
        background: rgba(224, 36, 94, 0.1);
        color: #e0245e;
      }
    }

    .loading-state,
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      color: #657786;

      svg {
        width: 48px;
        height: 48px;
        margin-bottom: 12px;
        color: #aab8c2;
      }

      p {
        margin: 0;
        font-size: 16px;
        font-weight: 500;
      }

      span {
        font-size: 14px;
        margin-top: 4px;
      }
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #e1e8ed;
    }

    .page-btn {
      padding: 8px 16px;
      background: white;
      border: 1px solid #e1e8ed;
      border-radius: 20px;
      color: #1DA1F2;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;

      &:hover:not(:disabled) {
        background: #f7f9fa;
        border-color: #1DA1F2;
      }

      &:disabled {
        color: #aab8c2;
        cursor: not-allowed;
      }
    }

    .page-info {
      color: #657786;
      font-size: 14px;
    }

    @media (max-width: 768px) {
      .comment-section {
        padding: 12px 0;
      }

      .new-comment {
        gap: 8px;
      }

      .user-avatar,
      .comment-avatar {
        width: 32px;
        height: 32px;
      }
    }
  `]
})
export class CommentSectionComponent implements OnInit {
  private commentsService = inject(CommentsService);
  private authService = inject(AuthService);

  @Input({ required: true }) postId!: string;
  @Input() initialCommentsCount: number = 0;

  comments = signal<Comment[]>([]);
  isLoading = signal(false);
  isSubmitting = signal(false);
  currentPage = signal(1);
  totalPages = signal(1);
  currentUser = this.authService.currentUser;
  newCommentText = '';

  ngOnInit() {
    this.loadComments();
  }

  loadComments(page: number = 1): void {
    this.isLoading.set(true);
    this.currentPage.set(page);

    this.commentsService.getPostComments(this.postId, page, 10).subscribe({
      next: (response: any) => {
        // Manejar doble envoltura si existe
        let data = response;
        if (data.success && data.data) {
          data = data.data;
        }

        this.comments.set(data.comments || []);
        this.totalPages.set(data.totalPages || 1);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar comentarios:', err);
        this.isLoading.set(false);
      }
    });
  }

  loadPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.loadComments(page);
    }
  }

  canSubmit(): boolean {
    return this.newCommentText.trim().length > 0 && !this.isSubmitting();
  }

  submitComment(): void {
    if (!this.canSubmit()) return;

    this.isSubmitting.set(true);

    const dto: CreateCommentDto = {
      postId: this.postId,
      content: this.newCommentText.trim()
    };

    this.commentsService.createComment(dto).subscribe({
      next: (comment: any) => {
        // Manejar doble envoltura si existe
        let newComment = comment;
        if (newComment.success && newComment.data) {
          newComment = newComment.data;
        }

        // Agregar el nuevo comentario al inicio
        this.comments.update(comments => [newComment, ...comments]);
        this.newCommentText = '';
        this.isSubmitting.set(false);
      },
      error: (err) => {
        console.error('Error al crear comentario:', err);
        alert('Error al publicar el comentario. Intenta de nuevo.');
        this.isSubmitting.set(false);
      }
    });
  }

  deleteComment(commentId: string): void {
    if (!confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
      return;
    }

    this.commentsService.deleteComment(commentId).subscribe({
      next: () => {
        // Eliminar el comentario de la lista
        this.comments.update(comments => 
          comments.filter(c => c.id !== commentId)
        );
      },
      error: (err) => {
        console.error('Error al eliminar comentario:', err);
        alert('Error al eliminar el comentario. Intenta de nuevo.');
      }
    });
  }

  isCommentOwner(comment: Comment): boolean {
    return comment.userId === this.currentUser()?.id;
  }

  autoResize(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short' 
    });
  }
}
