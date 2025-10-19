import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';

/**
 * Respuesta de usuario en listas de follows
 */
export interface FollowUser {
  id: string;
  username: string;
  fullName: string;
  avatarUrl?: string;
  isVerified: boolean;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  followedAt?: string;
}

/**
 * Estadísticas de follows
 */
export interface FollowStats {
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  isFollowedBy: boolean;
}

/**
 * Respuesta paginada de follows
 */
export interface FollowListResponse {
  followers?: FollowUser[];
  following?: FollowUser[];
  total: number;
  page: number;
  totalPages: number;
}

/**
 * Servicio para gestionar follows (seguir/dejar de seguir usuarios)
 */
@Injectable({
  providedIn: 'root'
})
export class FollowService {
  private apiService = inject(ApiService);

  // Estado reactivo: IDs de usuarios que el usuario actual sigue
  followingIds = signal<Set<string>>(new Set());

  /**
   * Seguir a un usuario
   */
  followUser(userId: string): Observable<any> {
    return this.apiService.post(`/follows/${userId}`, {}).pipe(
      tap(() => {
        // Actualizar estado local
        this.followingIds.update(ids => {
          const newIds = new Set(ids);
          newIds.add(userId);
          return newIds;
        });
      })
    );
  }

  /**
   * Dejar de seguir a un usuario
   */
  unfollowUser(userId: string): Observable<any> {
    return this.apiService.delete(`/follows/${userId}`).pipe(
      tap(() => {
        // Actualizar estado local
        this.followingIds.update(ids => {
          const newIds = new Set(ids);
          newIds.delete(userId);
          return newIds;
        });
      })
    );
  }

  /**
   * Obtener seguidores de un usuario
   */
  getFollowers(userId: string, page: number = 1, limit: number = 20): Observable<FollowListResponse> {
    const params = this.apiService.createParams({ page, limit });
    return this.apiService.get<FollowListResponse>(`/follows/${userId}/followers`, params);
  }

  /**
   * Obtener usuarios seguidos por un usuario
   */
  getFollowing(userId: string, page: number = 1, limit: number = 20): Observable<FollowListResponse> {
    const params = this.apiService.createParams({ page, limit });
    return this.apiService.get<FollowListResponse>(`/follows/${userId}/following`, params);
  }

  /**
   * Verificar si sigues a un usuario y obtener estadísticas
   */
  checkFollowStatus(userId: string): Observable<FollowStats> {
    return this.apiService.get<FollowStats>(`/follows/check/${userId}`);
  }

  /**
   * Verificar si el usuario actual sigue a otro usuario (desde estado local)
   */
  isFollowing(userId: string): boolean {
    return this.followingIds().has(userId);
  }

  /**
   * Cargar IDs de usuarios seguidos (para inicializar el estado)
   */
  loadFollowingIds(currentUserId: string): void {
    console.log('🔄 Cargando IDs de usuarios seguidos para:', currentUserId);
    
    this.getFollowing(currentUserId, 1, 1000).subscribe({
      next: (response: any) => {
        console.log('✅ Respuesta de getFollowing:', response);
        
        // Manejar doble envoltura del backend (si existe)
        let data = response;
        if (data.success && data.data) {
          data = data.data;
          console.log('🔄 Desenrollando respuesta anidada:', data);
        }
        
        const ids = new Set<string>(data.following?.map((user: any) => user.id as string) || []);
        console.log('📋 IDs de usuarios seguidos:', Array.from(ids));
        this.followingIds.set(ids);
      },
      error: (err) => {
        console.error('❌ Error al cargar IDs de seguidos:', err);
      }
    });
  }
}
