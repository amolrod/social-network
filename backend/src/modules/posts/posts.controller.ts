import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear un nuevo post' })
  @ApiResponse({ status: 201, description: 'Post creado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async create(@Request() req, @Body() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto, req.user.sub);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Obtener todos los posts con paginación' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Lista de posts obtenida' })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Request() req,
  ) {
    const userId = req.user?.sub; // Opcional, para filtros de visibilidad
    return this.postsService.findAll(page, limit, userId);
  }

  @Get('user/:username')
  @Public()
  @ApiOperation({ summary: 'Obtener posts de un usuario específico' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Posts del usuario obtenidos' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async findByUser(
    @Param('username') username: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Request() req,
  ) {
    const userId = req.user?.sub;
    return this.postsService.findByUser(username, page, limit, userId);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Obtener un post por ID' })
  @ApiResponse({ status: 200, description: 'Post encontrado' })
  @ApiResponse({ status: 404, description: 'Post no encontrado' })
  @ApiResponse({ status: 403, description: 'No tienes permiso para ver este post' })
  async findOne(@Param('id') id: string, @Request() req) {
    const userId = req.user?.sub;
    return this.postsService.findOne(id, userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un post' })
  @ApiResponse({ status: 200, description: 'Post actualizado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'No tienes permiso para editar este post' })
  @ApiResponse({ status: 404, description: 'Post no encontrado' })
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @Request() req,
  ) {
    return this.postsService.update(id, updatePostDto, req.user.sub);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar un post' })
  @ApiResponse({ status: 200, description: 'Post eliminado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'No tienes permiso para eliminar este post' })
  @ApiResponse({ status: 404, description: 'Post no encontrado' })
  async remove(@Param('id') id: string, @Request() req) {
    await this.postsService.remove(id, req.user.sub);
    return { message: 'Post eliminado exitosamente' };
  }
}
