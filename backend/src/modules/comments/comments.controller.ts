import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiResponse } from '../../common/interfaces/api-response.interface';

@Controller('comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  /**
   * Crear un comentario
   * POST /comments
   */
  @Post()
  async create(
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: any,
  ): Promise<ApiResponse<any>> {
    const comment = await this.commentsService.create(req.user.id, createCommentDto);
    return {
      success: true,
      data: comment,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Obtener comentarios de un post
   * GET /comments/posts/:postId
   */
  @Get('posts/:postId')
  async findByPost(
    @Param('postId') postId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
  ): Promise<ApiResponse<any>> {
    const result = await this.commentsService.findByPost(postId, page, limit);
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Obtener respuestas a un comentario
   * GET /comments/:commentId/replies
   */
  @Get(':commentId/replies')
  async findReplies(
    @Param('commentId') commentId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ): Promise<ApiResponse<any>> {
    const result = await this.commentsService.findReplies(commentId, page, limit);
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Obtener comentarios de un usuario
   * GET /comments/users/:userId
   */
  @Get('users/:userId')
  async findByUser(
    @Param('userId') userId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
  ): Promise<ApiResponse<any>> {
    const result = await this.commentsService.findByUser(userId, page, limit);
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Actualizar un comentario
   * PATCH /comments/:id
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Req() req: any,
  ): Promise<ApiResponse<any>> {
    const comment = await this.commentsService.update(id, req.user.id, updateCommentDto);
    return {
      success: true,
      data: comment,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Eliminar un comentario
   * DELETE /comments/:id
   */
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any): Promise<ApiResponse<any>> {
    const result = await this.commentsService.remove(id, req.user.id);
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }
}
