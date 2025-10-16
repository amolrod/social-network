import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Post, CreatePostDto } from '../models/post.model';

export interface PaginatedPosts {
  posts: Post[];
  total: number;
  page: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private apiService = inject(ApiService);

  /**
   * Crear un nuevo post
   */
  createPost(createPostDto: CreatePostDto): Observable<Post> {
    return this.apiService.post<Post>('/posts', createPostDto);
  }

  /**
   * Obtener todos los posts con paginación
   */
  getPosts(page: number = 1, limit: number = 10): Observable<PaginatedPosts> {
    const params = this.apiService.createParams({ page, limit });
    return this.apiService.get<PaginatedPosts>('/posts', params);
  }

  /**
   * Obtener un post por ID
   */
  getPostById(id: string): Observable<Post> {
    return this.apiService.get<Post>(`/posts/${id}`);
  }

  /**
   * Obtener posts de un usuario específico
   */
  getPostsByUser(
    username: string,
    page: number = 1,
    limit: number = 10,
  ): Observable<PaginatedPosts> {
    const params = this.apiService.createParams({ page, limit });
    return this.apiService.get<PaginatedPosts>(`/posts/user/${username}`, params);
  }

  /**
   * Actualizar un post
   */
  updatePost(id: string, updates: Partial<CreatePostDto>): Observable<Post> {
    return this.apiService.patch<Post>(`/posts/${id}`, updates);
  }

  /**
   * Eliminar un post
   */
  deletePost(id: string): Observable<{ message: string }> {
    return this.apiService.delete<{ message: string }>(`/posts/${id}`);
  }
}
