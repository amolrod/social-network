import { Component, Input, Output, EventEmitter, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Post } from '../../../core/models/post.model';
import { AuthService } from '../../../core/services/auth.service';
import { LikeButtonComponent } from '../like-button/like-button.component';
import { CommentSectionComponent } from '../comment-section/comment-section.component';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, RouterLink, LikeButtonComponent, CommentSectionComponent],
  templateUrl: './post-card.component.html',
  styleUrls: ['./post-card.component.scss'],
})
export class PostCardComponent {
  private authService = inject(AuthService);

  @Input({ required: true }) post!: Post;
  @Output() deletePost = new EventEmitter<string>();

  showMenu = signal(false);
  showComments = signal(false);
  likesCount = signal(0);
  commentsCount = signal(0);
  readonly currentUser = this.authService.currentUser;

  ngOnInit() {
    // Inicializar contadores desde el post
    this.likesCount.set(this.post.likesCount || 0);
    this.commentsCount.set(this.post.commentsCount || 0);
  }

  /**
   * Verificar si el post es del usuario actual
   */
  readonly isOwnPost = computed(() => {
    const user = this.currentUser();
    return user?.id === this.post?.userId;
  });

  /**
   * Obtener iniciales del usuario
   */
  get userInitials(): string {
    if (!this.post?.user?.fullName) return 'U';
    return this.post.user.fullName.substring(0, 2).toUpperCase();
  }

  /**
   * Formatear fecha de forma relativa
   */
  getTimeAgo(): string {
    if (!this.post?.createdAt) return '';

    const now = new Date();
    const postDate = new Date(this.post.createdAt);
    const diffMs = now.getTime() - postDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;

    return postDate.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
    });
  }

  /**
   * Toggle menú de opciones
   */
  toggleMenu(): void {
    this.showMenu.update((v) => !v);
  }

  /**
   * Toggle sección de comentarios
   */
  toggleComments(): void {
    this.showComments.update((v) => !v);
  }

  /**
   * Manejar cambio en likes
   */
  onLikeChange(event: { isLiked: boolean; likesCount: number }): void {
    this.likesCount.set(event.likesCount);
  }

  /**
   * Eliminar post
   */
  onDelete(): void {
    if (confirm('¿Estás seguro de que quieres eliminar este post?')) {
      this.deletePost.emit(this.post.id);
    }
    this.showMenu.set(false);
  }

  /**
   * Compartir post (placeholder)
   */
  onShare(): void {
    // TODO: Implementar funcionalidad de compartir
    alert('Funcionalidad de compartir próximamente');
  }
}
