import { Injectable, NotFoundException, ConflictException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from './entities/like.entity';
import { Post } from '../posts/entities/post.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Dar like a un post
   */
  async likePost(userId: string, postId: string): Promise<{ message: string }> {
    // Verificar que el post existe
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Publicación no encontrada');
    }

    // Verificar si ya existe el like
    const existingLike = await this.likeRepository.findOne({
      where: { userId, postId },
    });

    if (existingLike) {
      throw new ConflictException('Ya has dado like a esta publicación');
    }

    // Crear el like
    const like = this.likeRepository.create({
      userId,
      postId,
    });

    await this.likeRepository.save(like);

    // Actualizar contador en el post
    await this.postRepository.increment({ id: postId }, 'likesCount', 1);

    // Crear notificación (solo si el like no es del autor del post)
    if (post.userId !== userId) {
      await this.notificationsService.notifyLike(post.userId, userId, postId);
    }

    return { message: 'Like agregado correctamente' };
  }

  /**
   * Quitar like de un post
   */
  async unlikePost(userId: string, postId: string): Promise<{ message: string }> {
    // Verificar que el post existe
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Publicación no encontrada');
    }

    // Buscar el like
    const like = await this.likeRepository.findOne({
      where: { userId, postId },
    });

    if (!like) {
      throw new NotFoundException('No has dado like a esta publicación');
    }

    // Eliminar el like
    await this.likeRepository.remove(like);

    // Actualizar contador en el post
    await this.postRepository.decrement({ id: postId }, 'likesCount', 1);

    return { message: 'Like eliminado correctamente' };
  }

  /**
   * Verificar si el usuario ha dado like a un post
   */
  async hasLiked(userId: string, postId: string): Promise<boolean> {
    const like = await this.likeRepository.findOne({
      where: { userId, postId },
    });
    return !!like;
  }

  /**
   * Obtener likes de un post con información del usuario
   */
  async getPostLikes(postId: string, page: number = 1, limit: number = 20) {
    const [likes, total] = await this.likeRepository.findAndCount({
      where: { postId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      likes: likes.map((like) => ({
        id: like.id,
        user: {
          id: like.user.id,
          username: like.user.username,
          fullName: like.user.fullName,
          avatarUrl: like.user.avatarUrl,
          isVerified: like.user.isVerified,
        },
        createdAt: like.createdAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtener posts que le gustaron a un usuario
   */
  async getUserLikedPosts(userId: string, page: number = 1, limit: number = 20) {
    const [likes, total] = await this.likeRepository.findAndCount({
      where: { userId },
      relations: ['post', 'post.user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      posts: likes.map((like) => like.post),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
