import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Patch,
  ParseUUIDPipe,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  /**
   * POST /messages - Enviar un nuevo mensaje
   */
  @Post()
  async createMessage(@Request() req, @Body() createMessageDto: CreateMessageDto) {
    const message = await this.messagesService.create(req.user.id, createMessageDto);
    return {
      message: 'Mensaje enviado exitosamente',
      data: message,
    };
  }

  /**
   * GET /messages/conversations - Obtener lista de conversaciones
   */
  @Get('conversations')
  async getConversations(@Request() req) {
    const conversations = await this.messagesService.getConversations(req.user.id);
    return {
      data: conversations,
    };
  }

  /**
   * GET /messages/with/:userId - Obtener mensajes con un usuario específico
   */
  @Get('with/:userId')
  async getMessagesWithUser(
    @Request() req,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return await this.messagesService.getMessagesBetweenUsers(req.user.id, userId, page, limit);
  }

  /**
   * PATCH /messages/mark-read/:userId - Marcar todos los mensajes de un usuario como leídos
   */
  @Patch('mark-read/:userId')
  async markAsRead(@Request() req, @Param('userId', ParseUUIDPipe) userId: string) {
    await this.messagesService.markAsRead(req.user.id, userId);
    return {
      message: 'Mensajes marcados como leídos',
    };
  }

  /**
   * PATCH /messages/:id/read - Marcar un mensaje específico como leído
   */
  @Patch(':id/read')
  async markMessageAsRead(@Request() req, @Param('id', ParseUUIDPipe) messageId: string) {
    const message = await this.messagesService.markMessageAsRead(req.user.id, messageId);
    return {
      message: 'Mensaje marcado como leído',
      data: message,
    };
  }

  /**
   * GET /messages/unread-count - Obtener cantidad de mensajes no leídos
   */
  @Get('unread-count')
  async getUnreadCount(@Request() req) {
    const count = await this.messagesService.getUnreadCount(req.user.id);
    return {
      count,
    };
  }

  /**
   * DELETE /messages/:id - Eliminar un mensaje
   */
  @Delete(':id')
  async deleteMessage(@Request() req, @Param('id', ParseUUIDPipe) messageId: string) {
    await this.messagesService.deleteMessage(req.user.id, messageId);
    return {
      message: 'Mensaje eliminado exitosamente',
    };
  }
}
