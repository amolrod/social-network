import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { User } from '../models/user.model';

/**
 * Comentario
 */
export interface Comment {
  id: string;
  postId: string;
  userId: string;
  user: User;
  parentCommentId?: string;
  content: string;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO para crear comentario
 */
export interface CreateCommentDto {
  postId: string;
  content: string;
  parentCommentId?: string;
}

/**
 * DTO para actualizar comentario
 */
export interface UpdateCommentDto {
  content: string;
}

/**
 * Respuesta de lista de comentarios
 */
export interface CommentsListResponse {
  comments: Comment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Respuesta de lista de respuestas
 */
export interface RepliesListResponse {
  replies: Comment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Servicio para gestionar comentarios
 */
@Injectable({
  providedIn: 'root'
})
export class CommentsService {
  private apiService = inject(ApiService);

  /**
   * Crear un comentario
   */
  createComment(dto: CreateCommentDto): Observable<Comment> {
    return this.apiService.post<Comment>('/comments', dto);
  }

  /**
   * Obtener comentarios de un post
   */
  getPostComments(postId: string, page: number = 1, limit: number = 20): Observable<CommentsListResponse> {
    const params = this.apiService.createParams({ page, limit });
    return this.apiService.get<CommentsListResponse>(`/comments/posts/${postId}`, params);
  }

  /**
   * Obtener respuestas a un comentario
   */
  getCommentReplies(commentId: string, page: number = 1, limit: number = 10): Observable<RepliesListResponse> {
    const params = this.apiService.createParams({ page, limit });
    return this.apiService.get<RepliesListResponse>(`/comments/${commentId}/replies`, params);
  }

  /**
   * Obtener comentarios de un usuario
   */
  getUserComments(userId: string, page: number = 1, limit: number = 20): Observable<CommentsListResponse> {
    const params = this.apiService.createParams({ page, limit });
    return this.apiService.get<CommentsListResponse>(`/comments/users/${userId}`, params);
  }

  /**
   * Actualizar un comentario
   */
  updateComment(commentId: string, dto: UpdateCommentDto): Observable<Comment> {
    return this.apiService.patch<Comment>(`/comments/${commentId}`, dto);
  }

  /**
   * Eliminar un comentario
   */
  deleteComment(commentId: string): Observable<{ message: string }> {
    return this.apiService.delete<{ message: string }>(`/comments/${commentId}`);
  }
}
