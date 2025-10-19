import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { User } from '../models/user.model';

export interface UserListResponse {
  data: User[];  // Cambiado de 'users' a 'data'
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiService = inject(ApiService);

  /**
   * Buscar usuarios
   */
  searchUsers(query: string, page: number = 1, limit: number = 20): Observable<UserListResponse> {
    const params = this.apiService.createParams({ q: query, page, limit });
    return this.apiService.get<UserListResponse>('/users/search', params);
  }

  /**
   * Obtener usuario por username
   */
  getUserByUsername(username: string): Observable<User> {
    return this.apiService.get<User>(`/users/username/${username}`);
  }

  /**
   * Obtener usuario por ID
   */
  getUserById(id: string): Observable<User> {
    return this.apiService.get<User>(`/users/${id}`);
  }

  /**
   * Obtener perfil del usuario actual
   */
  getMyProfile(): Observable<User> {
    return this.apiService.get<User>('/users/me');
  }

  /**
   * Actualizar perfil del usuario
   */
  updateProfile(id: string, data: Partial<User>): Observable<User> {
    return this.apiService.patch<User>(`/users/${id}`, data);
  }
}
