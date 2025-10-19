import { Component, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FollowService } from '../../../core/services/follow.service';

@Component({
  selector: 'app-follow-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      [class]="buttonClass"
      [disabled]="isLoading()"
      (click)="toggleFollow($event)">
      @if (isLoading()) {
        <span class="spinner"></span>
        Cargando...
      } @else {
        {{ isFollowing ? 'Siguiendo' : 'Seguir' }}
      }
    </button>
  `,
  styles: [`
    button {
      padding: 8px 20px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 14px;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
      min-width: 100px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      &:not(:disabled):hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      &:not(:disabled):active {
        transform: translateY(0);
      }

      &.small {
        padding: 6px 16px;
        font-size: 13px;
        min-width: 80px;
      }

      &.large {
        padding: 10px 24px;
        font-size: 15px;
        min-width: 120px;
      }

      &.follow {
        background: #1DA1F2;
        color: white;

        &:hover:not(:disabled) {
          background: #1a91da;
        }
      }

      &.following {
        background: white;
        color: #1DA1F2;
        border: 2px solid #1DA1F2;

        &:hover:not(:disabled) {
          background: #ffebee;
          color: #dc3545;
          border-color: #dc3545;
        }
      }
    }

    .spinner {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class FollowButtonComponent {
  private followService = inject(FollowService);

  @Input({ required: true }) userId!: string;
  @Input() isFollowing: boolean = false;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  
  @Output() followChange = new EventEmitter<boolean>();

  isLoading = signal(false);

  get buttonClass(): string {
    const sizeClass = this.size;
    const stateClass = this.isFollowing ? 'following' : 'follow';
    return `${sizeClass} ${stateClass}`;
  }

  toggleFollow(event: Event): void {
    event.stopPropagation(); // Evitar propagación si está dentro de un elemento clickeable
    
    if (this.isLoading()) return;

    this.isLoading.set(true);

    const action$ = this.isFollowing 
      ? this.followService.unfollowUser(this.userId)
      : this.followService.followUser(this.userId);

    action$.subscribe({
      next: () => {
        this.isFollowing = !this.isFollowing;
        this.followChange.emit(this.isFollowing);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al cambiar estado de follow:', err);
        
        // Si el error es 409 (Conflict), significa que ya existe la relación
        // Sincronizamos el estado con el servidor
        if (err.status === 409) {
          // Si intentamos seguir y ya seguimos, actualizamos el estado
          if (!this.isFollowing) {
            this.isFollowing = true;
            this.followChange.emit(true);
          }
        } else if (err.status === 404) {
          // Si intentamos dejar de seguir y no seguimos, actualizamos el estado
          if (this.isFollowing) {
            this.isFollowing = false;
            this.followChange.emit(false);
          }
        } else {
          // Para otros errores, mostramos mensaje
          alert('Error al procesar la solicitud. Intenta de nuevo.');
        }
        
        this.isLoading.set(false);
      }
    });
  }
}
