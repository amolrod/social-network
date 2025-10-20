import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UseGuards,
  Req,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { LikesService } from './likes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiResponse } from '../../common/interfaces/api-response.interface';

@Controller('likes')
@UseGuards(JwtAuthGuard)
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  /**
   * Dar like a un post
   * POST /likes/posts/:postId
   */
  @Post('posts/:postId')
  async likePost(
    @Param('postId') postId: string,
    @Req() req: any,
  ): Promise<ApiResponse<any>> {
    const result = await this.likesService.likePost(req.user.id, postId);
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Quitar like de un post
   * DELETE /likes/posts/:postId
   */
  @Delete('posts/:postId')
  async unlikePost(
    @Param('postId') postId: string,
    @Req() req: any,
  ): Promise<ApiResponse<any>> {
    const result = await this.likesService.unlikePost(req.user.id, postId);
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Verificar si el usuario ha dado like a un post
   * GET /likes/posts/:postId/check
   */
  @Get('posts/:postId/check')
  async checkLike(
    @Param('postId') postId: string,
    @Req() req: any,
  ): Promise<ApiResponse<{ hasLiked: boolean }>> {
    const hasLiked = await this.likesService.hasLiked(req.user.id, postId);
    return {
      success: true,
      data: { hasLiked },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Obtener lista de usuarios que dieron like a un post
   * GET /likes/posts/:postId
   */
  @Get('posts/:postId')
  async getPostLikes(
    @Param('postId') postId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
  ): Promise<ApiResponse<any>> {
    const result = await this.likesService.getPostLikes(postId, page, limit);
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Obtener posts que le gustaron al usuario
   * GET /likes/users/:userId/posts
   */
  @Get('users/:userId/posts')
  async getUserLikedPosts(
    @Param('userId') userId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
  ): Promise<ApiResponse<any>> {
    const result = await this.likesService.getUserLikedPosts(userId, page, limit);
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }
}
