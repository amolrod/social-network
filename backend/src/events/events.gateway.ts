import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

/**
 * Gateway de WebSocket para eventos en tiempo real
 * Maneja conexiones, desconexiones y eventos de:
 * - Notificaciones (likes, comentarios, follows)
 * - Mensajes nuevos
 * - Estado de usuario (online/offline)
 */
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    credentials: true,
  },
  namespace: '/events',
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);
  private userSockets = new Map<string, string>(); // userId -> socketId

  constructor(private jwtService: JwtService) {}

  /**
   * Inicialización del gateway
   */
  afterInit(server: Server) {
    this.logger.log('🚀 WebSocket Gateway initialized');
  }

  /**
   * Manejar nueva conexión de cliente
   */
  async handleConnection(client: Socket) {
    try {
      // Extraer token del handshake
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn(`❌ Client ${client.id} attempted connection without token`);
        client.disconnect();
        return;
      }

      // Verificar token JWT
      const payload = await this.jwtService.verifyAsync(token);
      const userId = payload.sub;

      // Guardar mapeo userId -> socketId
      this.userSockets.set(userId, client.id);
      
      // Guardar userId en el socket para uso futuro
      client.data.userId = userId;

      this.logger.log(`✅ Client connected: ${client.id} (User: ${userId})`);

      // Unir al cliente a su sala personal
      client.join(`user:${userId}`);

      // Emitir evento de conexión exitosa
      client.emit('connected', { userId, socketId: client.id });

      // Notificar a otros usuarios que este usuario está online
      this.server.emit('user:online', { userId });
    } catch (error) {
      this.logger.error(`❌ Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  /**
   * Manejar desconexión de cliente
   */
  handleDisconnect(client: Socket) {
    const userId = client.data.userId;

    if (userId) {
      this.userSockets.delete(userId);
      this.logger.log(`🔌 Client disconnected: ${client.id} (User: ${userId})`);
      
      // Notificar que el usuario está offline
      this.server.emit('user:offline', { userId });
    } else {
      this.logger.log(`🔌 Client disconnected: ${client.id}`);
    }
  }

  /**
   * Enviar notificación a un usuario específico
   */
  sendNotificationToUser(userId: string, notification: any) {
    const socketId = this.userSockets.get(userId);
    
    if (socketId) {
      this.server.to(`user:${userId}`).emit('notification:new', notification);
      this.logger.debug(`📬 Notification sent to user ${userId}`);
    } else {
      this.logger.debug(`📭 User ${userId} is offline, notification not sent via WebSocket`);
    }
  }

  /**
   * Enviar mensaje nuevo a un usuario específico
   */
  sendMessageToUser(userId: string, message: any) {
    const socketId = this.userSockets.get(userId);
    
    if (socketId) {
      this.server.to(`user:${userId}`).emit('message:new', message);
      this.logger.debug(`💬 Message sent to user ${userId}`);
    } else {
      this.logger.debug(`💬 User ${userId} is offline, message not sent via WebSocket`);
    }
  }

  /**
   * Emitir evento de nuevo like
   */
  emitNewLike(postId: string, userId: string, likedBy: any) {
    this.server.to(`user:${userId}`).emit('like:new', {
      postId,
      likedBy,
      timestamp: new Date(),
    });
  }

  /**
   * Emitir evento de nuevo comentario
   */
  emitNewComment(postId: string, userId: string, comment: any) {
    this.server.to(`user:${userId}`).emit('comment:new', {
      postId,
      comment,
      timestamp: new Date(),
    });
  }

  /**
   * Emitir evento de nuevo seguidor
   */
  emitNewFollow(userId: string, follower: any) {
    this.server.to(`user:${userId}`).emit('follow:new', {
      follower,
      timestamp: new Date(),
    });
  }

  /**
   * Verificar si un usuario está conectado
   */
  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }

  /**
   * Obtener lista de usuarios conectados
   */
  getOnlineUsers(): string[] {
    return Array.from(this.userSockets.keys());
  }

  /**
   * Ping/Pong para mantener conexión activa
   */
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', { timestamp: new Date() });
  }

  /**
   * Cliente solicita lista de usuarios online
   */
  @SubscribeMessage('users:online')
  handleGetOnlineUsers(@ConnectedSocket() client: Socket) {
    const onlineUsers = this.getOnlineUsers();
    client.emit('users:online:list', onlineUsers);
  }
}
