import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PostService } from '../../core/services/post.service';
import { Post } from '../../core/models/post.model';
import { PostCardComponent } from '../../shared/components/post-card/post-card.component';

/**
 * Página para ver un post individual
 */
@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, PostCardComponent],
  template: `
    <div class="post-detail-page">
      @if (isLoading()) {
        <div class="loading-container">
          <div class="spinner"></div>
          <p>Cargando publicación...</p>
        </div>
      }

      @if (error()) {
        <div class="error-container">
          <h3>Error</h3>
          <p>{{ error() }}</p>
          <button class="btn-back" (click)="goBack()" type="button">
            Volver
          </button>
        </div>
      }

      @if (post() && !isLoading()) {
        <div class="post-container">
          <div class="header">
            <button class="btn-back" (click)="goBack()" type="button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Volver
            </button>
            <h2>Publicación</h2>
          </div>

          <app-post-card 
            [post]="post()!"
            (deletePost)="onDeletePost($event)">
          </app-post-card>
        </div>
      }
    </div>
  `,
  styles: [`
    .post-detail-page {
      max-width: 600px;
      margin: 0 auto;
      min-height: 100vh;
      background-color: #f3f4f6;
    }

    .header {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.5rem;
      background: white;
      border-bottom: 1px solid #e5e7eb;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .header h2 {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1f2937;
      margin: 0;
      flex: 1;
    }

    .btn-back {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: none;
      border: none;
      color: #1da1f2;
      font-weight: 600;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 8px;
      transition: all 0.2s;
    }

    .btn-back:hover {
      background-color: rgba(29, 161, 242, 0.1);
    }

    .post-container {
      background: white;
    }

    .loading-container,
    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      background: white;
      min-height: 300px;
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

    .loading-container p,
    .error-container p {
      margin-top: 1rem;
      color: #6b7280;
    }

    .error-container h3 {
      color: #ef4444;
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }

    .error-container .btn-back {
      margin-top: 1rem;
    }

    /* Responsive */
    @media (max-width: 640px) {
      .header {
        padding: 0.75rem 1rem;
      }

      .header h2 {
        font-size: 1.125rem;
      }
    }
  `]
})
export class PostDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly postService = inject(PostService);

  readonly post = signal<Post | null>(null);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    const postId = this.route.snapshot.paramMap.get('id');
    if (postId) {
      this.loadPost(postId);
    } else {
      this.error.set('ID de publicación no válido');
      this.isLoading.set(false);
    }
  }

  loadPost(postId: string): void {
    this.postService.getPostById(postId).subscribe({
      next: (post) => {
        this.post.set(post);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar post:', err);
        this.error.set('No se pudo cargar la publicación');
        this.isLoading.set(false);
      }
    });
  }

  onDeletePost(postId: string): void {
    this.postService.deletePost(postId).subscribe({
      next: () => {
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Error al eliminar post:', err);
        alert('Error al eliminar la publicación');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }
}
