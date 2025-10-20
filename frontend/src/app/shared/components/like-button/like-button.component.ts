import { Component, Input, Output, EventEmitter, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LikesService } from '../../../core/services/likes.service';

@Component({
  selector: 'app-like-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      class="like-button"
      [class.liked]="isLiked()"
      [disabled]="isLoading()"
      (click)="toggleLike($event)">
      <svg 
        class="heart-icon"
        [class.animate-heart]="justLiked()"
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        [attr.fill]="isLiked() ? 'currentColor' : 'none'"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round" 
        stroke-linejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
      @if (showCount && likesCount() > 0) {
        <span class="likes-count">{{ formatCount(likesCount()) }}</span>
      }
    </button>
  `,
  styles: [`
    .like-button {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      background: transparent;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
      border-radius: 20px;
      color: #657786;

      &:hover:not(:disabled) {
        background: rgba(224, 36, 94, 0.1);
        color: #e0245e;
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      &.liked {
        color: #e0245e;
        
        .heart-icon {
          fill: #e0245e;
        }
      }
    }

    .heart-icon {
      width: 20px;
      height: 20px;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);

      &.animate-heart {
        animation: heartBeat 0.6s ease-in-out;
      }
    }

    @keyframes heartBeat {
      0%, 100% {
        transform: scale(1);
      }
      25% {
        transform: scale(1.3);
      }
      50% {
        transform: scale(1.1);
      }
      75% {
        transform: scale(1.2);
      }
    }

    .likes-count {
      font-size: 14px;
      font-weight: 500;
      user-select: none;
    }
  `]
})
export class LikeButtonComponent {
  private likesService = inject(LikesService);

  @Input({ required: true }) postId!: string;
  @Input() initialLikesCount: number = 0;
  @Input() initialIsLiked: boolean = false;
  @Input() showCount: boolean = true;
  
  @Output() likeChange = new EventEmitter<{ isLiked: boolean; likesCount: number }>();

  isLoading = signal(false);
  likesCount = signal(0);
  isLiked = signal(false);
  justLiked = signal(false);

  ngOnInit() {
    this.likesCount.set(this.initialLikesCount);
    this.isLiked.set(this.initialIsLiked || this.likesService.hasLiked(this.postId));
  }

  toggleLike(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    
    if (this.isLoading()) return;

    const wasLiked = this.isLiked();
    const previousCount = this.likesCount();

    // Actualización optimista
    this.isLiked.set(!wasLiked);
    this.likesCount.set(wasLiked ? previousCount - 1 : previousCount + 1);
    
    if (!wasLiked) {
      this.justLiked.set(true);
      setTimeout(() => this.justLiked.set(false), 600);
    }

    this.isLoading.set(true);

    const action$ = wasLiked 
      ? this.likesService.unlikePost(this.postId)
      : this.likesService.likePost(this.postId);

    action$.subscribe({
      next: () => {
        this.isLoading.set(false);
        this.likeChange.emit({
          isLiked: this.isLiked(),
          likesCount: this.likesCount()
        });
      },
      error: (err) => {
        console.error('Error al cambiar like:', err);
        
        // Revertir cambios optimistas
        this.isLiked.set(wasLiked);
        this.likesCount.set(previousCount);
        this.isLoading.set(false);

        // Manejar error 409 (ya tiene like) sincronizando estado
        if (err.status === 409 && !wasLiked) {
          this.isLiked.set(true);
          this.likesCount.set(previousCount + 1);
        }
      }
    });
  }

  formatCount(count: number): string {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  }
}
