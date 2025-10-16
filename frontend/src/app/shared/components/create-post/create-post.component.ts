import { Component, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostService } from '../../../core/services/post.service';
import { AuthService } from '../../../core/services/auth.service';
import { CreatePostDto, Post } from '../../../core/models/post.model';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.scss'],
})
export class CreatePostComponent {
  private postService = inject(PostService);
  private authService = inject(AuthService);

  @Output() postCreated = new EventEmitter<Post>();

  contentValue = '';
  isSubmitting = signal(false);
  error = signal<string | null>(null);
  readonly maxLength = 5000;
  readonly currentUser = this.authService.currentUser;

  /**
   * Contador de caracteres restantes
   */
  getRemainingChars(): number {
    return this.maxLength - this.contentValue.length;
  }

  /**
   * Verificar si el botón está habilitado
   */
  isButtonDisabled(): boolean {
    const disabled = this.isSubmitting() || this.contentValue.trim().length === 0 || this.getRemainingChars() < 0;
    console.log('Button disabled check:', {
      disabled,
      isSubmitting: this.isSubmitting(),
      contentLength: this.contentValue.length,
      trimmedLength: this.contentValue.trim().length,
      remainingChars: this.getRemainingChars()
    });
    return disabled;
  }

  /**
   * Obtener iniciales del usuario
   */
  get userInitials(): string {
    const user = this.currentUser();
    if (!user?.fullName) return 'U';
    return user.fullName.substring(0, 2).toUpperCase();
  }

  /**
   * Publicar post
   */
  onSubmit(): void {
    const content = this.contentValue.trim();

    if (!content) {
      this.error.set('El contenido no puede estar vacío');
      return;
    }

    if (content.length > this.maxLength) {
      this.error.set(`El contenido no puede exceder ${this.maxLength} caracteres`);
      return;
    }

    this.isSubmitting.set(true);
    this.error.set(null);

    const createPostDto: CreatePostDto = {
      content: content,
      visibility: 'public',
    };

    this.postService.createPost(createPostDto).subscribe({
      next: (post) => {
        this.contentValue = '';
        this.isSubmitting.set(false);
        this.postCreated.emit(post);
      },
      error: (err) => {
        console.error('Error al crear post:', err);
        this.error.set(err.error?.message || 'Error al publicar. Intenta de nuevo.');
        this.isSubmitting.set(false);
      },
    });
  }

  /**
   * Actualizar contenido
   */
  onContentChange(value: string): void {
    this.contentValue = value;
    if (this.error()) {
      this.error.set(null);
    }
  }
}
