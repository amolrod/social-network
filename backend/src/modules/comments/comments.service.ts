import { Injectable, NotFoundException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { Post } from '../posts/entities/post.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { EventsGateway } from '../../events/events.gateway';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService: NotificationsService,
    @Inject(forwardRef(() => EventsGateway))
    private readonly eventsGateway: EventsGateway,
  ) {}

  /**
   * Crear un nuevo comentario
   */
  async create(userId: string, createCommentDto: CreateCommentDto): Promise<Comment> {
    const { postId, parentCommentId, content } = createCommentDto;

    // Verificar que el post existe
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Publicación no encontrada');
    }

    // Si es una respuesta, verificar que el comentario padre existe
    if (parentCommentId) {
      const parentComment = await this.commentRepository.findOne({
        where: { id: parentCommentId },
      });
      if (!parentComment) {
        throw new NotFoundException('Comentario padre no encontrado');
      }
    }

    // Crear el comentario
    const comment = this.commentRepository.create({
      userId,
      postId,
      content,
      parentCommentId,
    });

    const savedComment = await this.commentRepository.save(comment);

    // Actualizar contador en el post
    await this.postRepository.increment({ id: postId }, 'commentsCount', 1);

    // Crear notificación (solo si el comentario no es del autor del post)
    if (post.userId !== userId) {
      await this.notificationsService.notifyComment(post.userId, userId, postId, savedComment.id);
      
      // Emitir evento WebSocket para notificación en tiempo real
      this.eventsGateway.emitNewComment(postId, post.userId, {
        userId,
        commentId: savedComment.id,
        content: content.substring(0, 100), // Primeros 100 caracteres
      });
    }

    // Cargar relaciones para la respuesta
    const fullComment = await this.commentRepository.findOne({
      where: { id: savedComment.id },
      relations: ['user'],
    });
    
    return fullComment!;
  }

  /**
   * Obtener comentarios de un post
   */
  async findByPost(
    postId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    comments: Comment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    // Solo comentarios principales (sin padre)
    const [comments, total] = await this.commentRepository.findAndCount({
      where: { postId, parentCommentId: IsNull() },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      comments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtener respuestas a un comentario
   */
  async findReplies(
    commentId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    replies: Comment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const [replies, total] = await this.commentRepository.findAndCount({
      where: { parentCommentId: commentId },
      relations: ['user'],
      order: { createdAt: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      replies,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Actualizar un comentario
   */
  async update(
    commentId: string,
    userId: string,
    updateCommentDto: UpdateCommentDto,
  ): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['user'],
    });

    if (!comment) {
      throw new NotFoundException('Comentario no encontrado');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException('No tienes permiso para editar este comentario');
    }

    comment.content = updateCommentDto.content;
    return this.commentRepository.save(comment);
  }

  /**
   * Eliminar un comentario
   */
  async remove(commentId: string, userId: string): Promise<{ message: string }> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comentario no encontrado');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException('No tienes permiso para eliminar este comentario');
    }

    // Soft delete
    await this.commentRepository.softDelete(commentId);

    // Actualizar contador en el post
    await this.postRepository.decrement({ id: comment.postId }, 'commentsCount', 1);

    return { message: 'Comentario eliminado correctamente' };
  }

  /**
   * Obtener comentarios de un usuario
   */
  async findByUser(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    comments: Comment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const [comments, total] = await this.commentRepository.findAndCount({
      where: { userId },
      relations: ['user', 'post'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      comments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
