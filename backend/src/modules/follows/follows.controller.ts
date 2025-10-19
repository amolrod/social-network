import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Query,
  Request,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { FollowsService } from './follows.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Follows')
@Controller('follows')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post(':userId')
  @ApiOperation({ summary: 'Seguir a un usuario' })
  @ApiParam({ name: 'userId', description: 'ID del usuario a seguir' })
  @ApiResponse({ status: 201, description: 'Usuario seguido exitosamente' })
  @ApiResponse({ status: 400, description: 'No puedes seguirte a ti mismo' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 409, description: 'Ya sigues a este usuario' })
  async follow(
    @Request() req,
    @Param('userId', ParseUUIDPipe) followingId: string,
  ) {
    const follow = await this.followsService.follow(req.user.id, followingId);
    return {
      success: true,
      message: 'Usuario seguido exitosamente',
      data: follow,
    };
  }

  @Delete(':userId')
  @ApiOperation({ summary: 'Dejar de seguir a un usuario' })
  @ApiParam({ name: 'userId', description: 'ID del usuario a dejar de seguir' })
  @ApiResponse({ status: 200, description: 'Dejaste de seguir al usuario' })
  @ApiResponse({ status: 404, description: 'No sigues a este usuario' })
  async unfollow(
    @Request() req,
    @Param('userId', ParseUUIDPipe) followingId: string,
  ) {
    await this.followsService.unfollow(req.user.id, followingId);
    return {
      success: true,
      message: 'Dejaste de seguir al usuario',
    };
  }

  @Get(':userId/followers')
  @ApiOperation({ summary: 'Obtener seguidores de un usuario' })
  @ApiParam({ name: 'userId', description: 'ID del usuario' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: 'Lista de seguidores obtenida' })
  async getFollowers(
    @Request() req,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    const followers = await this.followsService.getFollowers(
      userId, 
      page, 
      limit,
      req.user?.id
    );
    return {
      success: true,
      data: followers,
    };
  }

  @Get(':userId/following')
  @ApiOperation({ summary: 'Obtener usuarios seguidos por un usuario' })
  @ApiParam({ name: 'userId', description: 'ID del usuario' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: 'Lista de usuarios seguidos obtenida' })
  async getFollowing(
    @Request() req,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    const result = await this.followsService.getFollowing(
      userId,
      page,
      limit,
      req.user?.id,
    );
    return {
      success: true,
      data: result,
    };
  }

  @Get('check/:userId')
  @ApiOperation({ summary: 'Verificar si sigues a un usuario y obtener estadísticas' })
  @ApiParam({ name: 'userId', description: 'ID del usuario a verificar' })
  @ApiResponse({ status: 200, description: 'Estadísticas de seguimiento obtenidas' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async checkFollowStatus(
    @Request() req,
    @Param('userId', ParseUUIDPipe) targetUserId: string,
  ) {
    const stats = await this.followsService.getFollowStats(
      req.user.id,
      targetUserId,
    );
    return {
      success: true,
      data: stats,
    };
  }
}
