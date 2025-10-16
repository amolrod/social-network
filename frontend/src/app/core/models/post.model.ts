import { User } from './user.model';

/**
 * Interface para un post/publicación
 */
export interface Post {
  id: string;
  userId: string;
  user?: User;
  content: string;
  mediaUrls: string[];
  visibility: 'public' | 'private' | 'followers';
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface para crear un post
 */
export interface CreatePostDto {
  content: string;
  mediaUrls?: string[];
  visibility?: 'public' | 'private' | 'followers';
}

/**
 * Interface para un comentario
 */
export interface Comment {
  id: string;
  postId: string;
  userId: string;
  user?: User;
  parentCommentId?: string;
  content: string;
  likesCount: number;
  isLiked?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
