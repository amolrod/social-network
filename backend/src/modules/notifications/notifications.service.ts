import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';

/**
 * Service para gestionar notificaciones
 */
@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  /**
   * Crear una notificación
   */
  async create(data: {
    userId: string;
    actorId: string;
    type: NotificationType;
    entityType?: string;
    entityId?: string;
  }): Promise<Notification | null> {
    // No crear notificación si el actor es el mismo usuario
    if (data.userId === data.actorId) {
      return null;
    }

    // Verificar si ya existe una notificación similar reciente (últimas 24h)
    const existing = await this.notificationRepository.findOne({
      where: {
        userId: data.userId,
        actorId: data.actorId,
        type: data.type,
        entityId: data.entityId,
        isRead: false,
      },
      order: { createdAt: 'DESC' },
    });

    // Si existe una notificación similar no leída reciente, no crear duplicado
    if (existing) {
      const hoursSince = (Date.now() - existing.createdAt.getTime()) / (1000 * 60 * 60);
      if (hoursSince < 24) {
        return existing;
      }
    }

    const notification = this.notificationRepository.create(data);
    return await this.notificationRepository.save(notification);
  }

  /**
   * Obtener notificaciones de un usuario con paginación
   */
  async findByUser(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    notifications: Notification[];
    total: number;
    page: number;
    totalPages: number;
    unreadCount: number;
  }> {
    console.log(`🔔 Buscando notificaciones para userId: ${userId}, page: ${page}, limit: ${limit}`);
    
    const [notifications, total] = await this.notificationRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['actor'],
    });

    console.log(`✅ Encontradas ${notifications.length} notificaciones de ${total} totales`);

    // Contar notificaciones no leídas
    const unreadCount = await this.notificationRepository.count({
      where: { userId, isRead: false },
    });

    console.log(`📊 Notificaciones no leídas: ${unreadCount}`);

    return {
      notifications,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      unreadCount,
    };
  }

  /**
   * Obtener solo el contador de notificaciones no leídas
   */
  async getUnreadCount(userId: string): Promise<number> {
    return await this.notificationRepository.count({
      where: { userId, isRead: false },
    });
  }

  /**
   * Marcar una notificación como leída
   */
  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    const result = await this.notificationRepository.update(
      { id: notificationId, userId },
      { isRead: true },
    );
    return (result.affected || 0) > 0;
  }

  /**
   * Marcar todas las notificaciones de un usuario como leídas
   */
  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true },
    );
    return result.affected || 0;
  }

  /**
   * Eliminar una notificación
   */
  async remove(notificationId: string, userId: string): Promise<boolean> {
    const result = await this.notificationRepository.delete({
      id: notificationId,
      userId,
    });
    return (result.affected || 0) > 0;
  }

  /**
   * Eliminar todas las notificaciones leídas de un usuario
   */
  async removeReadNotifications(userId: string): Promise<number> {
    const result = await this.notificationRepository.delete({
      userId,
      isRead: true,
    });
    return result.affected || 0;
  }

  /**
   * Crear notificación de LIKE
   */
  async notifyLike(postOwnerId: string, actorId: string, postId: string): Promise<void> {
    await this.create({
      userId: postOwnerId,
      actorId,
      type: NotificationType.LIKE,
      entityType: 'post',
      entityId: postId,
    });
  }

  /**
   * Crear notificación de COMMENT
   */
  async notifyComment(
    postOwnerId: string,
    actorId: string,
    postId: string,
    commentId: string,
  ): Promise<void> {
    await this.create({
      userId: postOwnerId,
      actorId,
      type: NotificationType.COMMENT,
      entityType: 'post',
      entityId: postId,
    });
  }

  /**
   * Crear notificación de FOLLOW
   */
  async notifyFollow(followedUserId: string, actorId: string): Promise<void> {
    await this.create({
      userId: followedUserId,
      actorId,
      type: NotificationType.FOLLOW,
      entityType: 'user',
      entityId: actorId,
    });
  }
}
