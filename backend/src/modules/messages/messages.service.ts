import { Injectable, NotFoundException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { MarkAsReadDto } from './dto/mark-as-read.dto';
import { EventsGateway } from '../../events/events.gateway';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @Inject(forwardRef(() => EventsGateway))
    private readonly eventsGateway: EventsGateway,
  ) {}

  /**
   * Crear un nuevo mensaje
   */
  async create(senderId: string, createMessageDto: CreateMessageDto): Promise<Message> {
    const message = this.messageRepository.create({
      senderId,
      receiverId: createMessageDto.receiverId,
      content: createMessageDto.content,
      mediaUrl: createMessageDto.mediaUrl,
    });

    const savedMessage = await this.messageRepository.save(message);

    // Emitir evento WebSocket para mensaje en tiempo real
    this.eventsGateway.sendMessageToUser(createMessageDto.receiverId, {
      messageId: savedMessage.id,
      senderId,
      content: savedMessage.content,
      createdAt: savedMessage.createdAt,
    });

    return savedMessage;
  }

  /**
   * Obtener conversaciones del usuario (lista de chats)
   */
  async getConversations(userId: string): Promise<any[]> {
    const query = `
      WITH latest_messages AS (
        SELECT DISTINCT ON (LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id))
          m.*,
          CASE 
            WHEN m.sender_id = $1 THEN m.receiver_id
            ELSE m.sender_id
          END as other_user_id
        FROM messages m
        WHERE m.sender_id = $1 OR m.receiver_id = $1
        ORDER BY LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id), m.created_at DESC
      )
      SELECT 
        lm.*,
        u.id as "otherUser_id",
        u.username as "otherUser_username",
        u.full_name as "otherUser_fullName",
        u.avatar_url as "otherUser_avatarUrl",
        u.is_verified as "otherUser_isVerified",
        (SELECT COUNT(*) FROM messages 
         WHERE receiver_id = $1 
         AND sender_id = lm.other_user_id 
         AND is_read = false) as unread_count
      FROM latest_messages lm
      JOIN users u ON u.id = lm.other_user_id
      ORDER BY lm.created_at DESC
    `;

    const results = await this.messageRepository.query(query, [userId]);

    return results.map((row) => ({
      id: row.id,
      content: row.content,
      mediaUrl: row.media_url,
      isRead: row.is_read,
      createdAt: row.created_at,
      otherUser: {
        id: row.otherUser_id,
        username: row.otherUser_username,
        fullName: row.otherUser_fullName,
        avatarUrl: row.otherUser_avatarUrl,
        isVerified: row.otherUser_isVerified,
      },
      unreadCount: parseInt(row.unread_count, 10),
    }));
  }

  /**
   * Obtener mensajes entre dos usuarios
   */
  async getMessagesBetweenUsers(
    userId: string,
    otherUserId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<{ data: Message[]; meta: any }> {
    const skip = (page - 1) * limit;

    const [messages, total] = await this.messageRepository.findAndCount({
      where: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
      order: { createdAt: 'DESC' },
      take: limit,
      skip,
    });

    return {
      data: messages.reverse(), // Invertir para mostrar del más antiguo al más reciente
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Marcar mensajes como leídos
   */
  async markAsRead(userId: string, otherUserId: string): Promise<void> {
    await this.messageRepository.update(
      {
        senderId: otherUserId,
        receiverId: userId,
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      },
    );
  }

  /**
   * Marcar un mensaje específico como leído
   */
  async markMessageAsRead(userId: string, messageId: string): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Mensaje no encontrado');
    }

    // Solo el receptor puede marcar como leído
    if (message.receiverId !== userId) {
      throw new ForbiddenException('No tienes permiso para marcar este mensaje');
    }

    message.isRead = true;
    message.readAt = new Date();

    return await this.messageRepository.save(message);
  }

  /**
   * Eliminar un mensaje (soft delete)
   */
  async deleteMessage(userId: string, messageId: string): Promise<void> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Mensaje no encontrado');
    }

    // Solo el remitente puede eliminar el mensaje
    if (message.senderId !== userId) {
      throw new ForbiddenException('No tienes permiso para eliminar este mensaje');
    }

    await this.messageRepository.softDelete(messageId);
  }

  /**
   * Obtener cantidad de mensajes no leídos
   */
  async getUnreadCount(userId: string): Promise<number> {
    return await this.messageRepository.count({
      where: {
        receiverId: userId,
        isRead: false,
      },
    });
  }
}
