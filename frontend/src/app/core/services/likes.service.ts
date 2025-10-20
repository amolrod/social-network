import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';

/**
 * Usuario que dio like
 */
export interface LikeUser {
  id: string;
  username: string;
  fullName: string;
  avatarUrl?: string;
  isVerified: boolean;
}

/**
 * Like con información del usuario
 */
export interface LikeWithUser {
  id: string;
  user: LikeUser;
  createdAt: string;
}

/**
 * Respuesta de lista de likes
 */
export interface LikesListResponse {
  likes: LikeWithUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Servicio para gestionar likes en publicaciones
 */
@Injectable({
  providedIn: 'root'
})
export class LikesService {
  private apiService = inject(ApiService);

  // Estado reactivo: IDs de posts que el usuario ha dado like
  likedPostIds = signal<Set<string>>(new Set());

  /**
   * Dar like a un post
   */
  likePost(postId: string): Observable<any> {
    return this.apiService.post(`/likes/posts/${postId}`, {}).pipe(
      tap(() => {
        // Actualizar estado local
        this.likedPostIds.update(ids => {
          const newIds = new Set(ids);
          newIds.add(postId);
          return newIds;
        });
      })
    );
  }

  /**
   * Quitar like de un post
   */
  unlikePost(postId: string): Observable<any> {
    return this.apiService.delete(`/likes/posts/${postId}`).pipe(
      tap(() => {
        // Actualizar estado local
        this.likedPostIds.update(ids => {
          const newIds = new Set(ids);
          newIds.delete(postId);
          return newIds;
        });
      })
    );
  }

  /**
   * Verificar si el usuario ha dado like a un post
   */
  checkLike(postId: string): Observable<{ hasLiked: boolean }> {
    return this.apiService.get<{ hasLiked: boolean }>(`/likes/posts/${postId}/check`);
  }

  /**
   * Verificar si el usuario ha dado like (desde estado local)
   */
  hasLiked(postId: string): boolean {
    return this.likedPostIds().has(postId);
  }

  /**
   * Obtener lista de usuarios que dieron like a un post
   */
  getPostLikes(postId: string, page: number = 1, limit: number = 20): Observable<LikesListResponse> {
    const params = this.apiService.createParams({ page, limit });
    return this.apiService.get<LikesListResponse>(`/likes/posts/${postId}`, params);
  }

  /**
   * Obtener posts que le gustaron al usuario
   */
  getUserLikedPosts(userId: string, page: number = 1, limit: number = 20): Observable<any> {
    const params = this.apiService.createParams({ page, limit });
    return this.apiService.get<any>(`/likes/users/${userId}/posts`, params);
  }

  /**
   * Cargar IDs de posts con like del usuario actual
   * Se debe llamar al iniciar sesión
   */
  loadLikedPostIds(userId: string): void {
    console.log('🔄 Cargando IDs de posts con like para:', userId);
    
    this.getUserLikedPosts(userId, 1, 1000).subscribe({
      next: (response: any) => {
        console.log('✅ Respuesta de getUserLikedPosts:', response);
        
        // Manejar doble envoltura del backend (si existe)
        let data = response;
        if (data.success && data.data) {
          data = data.data;
          console.log('🔄 Desenrollando respuesta anidada:', data);
        }
        
        const ids = new Set<string>(data.posts?.map((post: any) => post.id as string) || []);
        console.log('📋 IDs de posts con like:', Array.from(ids));
        this.likedPostIds.set(ids);
      },
      error: (err) => {
        console.error('❌ Error al cargar IDs de posts con like:', err);
      }
    });
  }
}
