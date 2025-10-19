import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { PostService } from '../../core/services/post.service';
import { Post } from '../../core/models/post.model';
import { CreatePostComponent } from '../../shared/components/create-post/create-post.component';
import { PostCardComponent } from '../../shared/components/post-card/post-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, CreatePostComponent, PostCardComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly postService = inject(PostService);
  
  readonly currentUser = this.authService.currentUser;
  posts = signal<Post[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);
  currentPage = signal(1);
  totalPages = signal(1);
  hasMore = signal(true);

  // Computed signals para evitar errores de undefined en el template
  readonly userInitials = computed(() => {
    const user = this.currentUser();
    if (!user?.fullName) return 'U';
    return user.fullName.substring(0, 2).toUpperCase();
  });

  readonly userFirstName = computed(() => {
    const user = this.currentUser();
    if (!user?.fullName) return '';
    return user.fullName.split(' ')[0];
  });

  ngOnInit(): void {
    console.log('Home component initialized');
    console.log('Current user:', this.currentUser());
    this.loadPosts();
  }

  /**
   * Cargar posts
   */
  loadPosts(page: number = 1): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.postService.getPosts(page, 10).subscribe({
      next: (response) => {
        const newPosts = response.posts || [];
        if (page === 1) {
          this.posts.set(newPosts);
        } else {
          this.posts.update((posts) => [...(posts || []), ...newPosts]);
        }
        this.currentPage.set(response.page);
        this.totalPages.set(response.totalPages);
        this.hasMore.set(response.page < response.totalPages);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar posts:', err);
        this.error.set('Error al cargar los posts. Por favor intenta de nuevo.');
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Cargar más posts (paginación)
   */
  loadMore(): void {
    if (!this.isLoading() && this.hasMore()) {
      this.loadPosts(this.currentPage() + 1);
    }
  }

  /**
   * Manejar post creado
   */
  onPostCreated(post: Post): void {
    this.posts.update((posts) => [post, ...posts]);
  }

  /**
   * Dar like a un post
   */
  onLikePost(postId: string): void {
    // TODO: Implementar like cuando tengamos el módulo de likes
    console.log('Like post:', postId);
    alert('Funcionalidad de likes próximamente');
  }

  /**
   * Eliminar post
   */
  onDeletePost(postId: string): void {
    this.postService.deletePost(postId).subscribe({
      next: () => {
        this.posts.update((posts) => posts.filter((p) => p.id !== postId));
        console.log('Post eliminado exitosamente');
      },
      error: (err) => {
        console.error('Error al eliminar post:', err);
        alert('Error al eliminar el post');
      },
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
