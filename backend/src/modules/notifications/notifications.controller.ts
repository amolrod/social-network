import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiResponse } from '../../common/interfaces/api-response.interface';

/**
 * Controller para gestionar notificaciones
 */
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * Obtener notificaciones del usuario autenticado
   * GET /notifications?page=1&limit=20
   */
  @Get()
  async getNotifications(
    @Req() req: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ): Promise<ApiResponse> {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;

    const result = await this.notificationsService.findByUser(
      req.user.id,
      pageNum,
      limitNum,
    );

    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Obtener contador de notificaciones no leídas
   * GET /notifications/unread/count
   */
  @Get('unread/count')
  async getUnreadCount(@Req() req: any): Promise<ApiResponse> {
    const count = await this.notificationsService.getUnreadCount(req.user.id);

    return {
      success: true,
      data: { count },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Marcar una notificación como leída
   * PATCH /notifications/:id/read
   */
  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  async markAsRead(
    @Param('id') notificationId: string,
    @Req() req: any,
  ): Promise<ApiResponse> {
    const success = await this.notificationsService.markAsRead(
      notificationId,
      req.user.id,
    );

    if (!success) {
      return {
        success: false,
        data: null,
        timestamp: new Date().toISOString(),
        message: 'Notificación no encontrada',
      };
    }

    return {
      success: true,
      data: { message: 'Notificación marcada como leída' },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Marcar todas las notificaciones como leídas
   * PATCH /notifications/read-all
   */
  @Patch('read-all')
  @HttpCode(HttpStatus.OK)
  async markAllAsRead(@Req() req: any): Promise<ApiResponse> {
    const count = await this.notificationsService.markAllAsRead(req.user.id);

    return {
      success: true,
      data: {
        message: `${count} notificaciones marcadas como leídas`,
        count,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Eliminar una notificación
   * DELETE /notifications/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteNotification(
    @Param('id') notificationId: string,
    @Req() req: any,
  ): Promise<ApiResponse> {
    const success = await this.notificationsService.remove(notificationId, req.user.id);

    if (!success) {
      return {
        success: false,
        data: null,
        timestamp: new Date().toISOString(),
        message: 'Notificación no encontrada',
      };
    }

    return {
      success: true,
      data: { message: 'Notificación eliminada' },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Eliminar todas las notificaciones leídas
   * DELETE /notifications/read
   */
  @Delete('read')
  @HttpCode(HttpStatus.OK)
  async deleteReadNotifications(@Req() req: any): Promise<ApiResponse> {
    const count = await this.notificationsService.removeReadNotifications(req.user.id);

    return {
      success: true,
      data: {
        message: `${count} notificaciones eliminadas`,
        count,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
