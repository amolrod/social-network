import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { User } from '../users/entities/user.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Crear un nuevo post
   */
  async create(createPostDto: CreatePostDto, userId: string): Promise<Post> {
    // Verificar que el usuario existe
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Crear el post
    const post = this.postRepository.create({
      ...createPostDto,
      userId: userId,
    });

    const savedPost = await this.postRepository.save(post);

    // Incrementar el contador de posts del usuario
    await this.userRepository.increment({ id: userId }, 'postsCount', 1);

    // Retornar el post con el autor cargado (la relación eager carga el user automáticamente)
    return savedPost;
  }

  /**
   * Obtener todos los posts con paginación
   */
  async findAll(
    page: number = 1,
    limit: number = 10,
    userId?: string,
  ): Promise<{ posts: Post[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;

    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .orderBy('post.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    // Si se proporciona userId, filtrar por visibilidad
    // TODO: Implementar lógica de visibilidad basada en follows
    if (userId) {
      queryBuilder.where(
        '(post.visibility = :public OR post.userId = :userId)',
        { public: 'public', userId },
      );
    } else {
      queryBuilder.where('post.visibility = :public', { public: 'public' });
    }

    const [posts, total] = await queryBuilder.getManyAndCount();

    return {
      posts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtener un post por ID
   */
  async findOne(id: string, userId?: string): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException('Post no encontrado');
    }

    // Verificar permisos de visibilidad
    if (post.visibility === 'private' && post.userId !== userId) {
      throw new ForbiddenException('No tienes permiso para ver este post');
    }

    // TODO: Verificar si el usuario sigue al autor para posts con visibilidad 'followers'

    return post;
  }

  /**
   * Obtener posts de un usuario específico
   */
  async findByUser(
    username: string,
    page: number = 1,
    limit: number = 10,
    requestUserId?: string,
  ): Promise<{ posts: Post[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;

    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .where('user.username = :username', { username })
      .orderBy('post.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    // Filtrar por visibilidad si no es el dueño del perfil
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (user.id !== requestUserId) {
      queryBuilder.andWhere(
        '(post.visibility = :public OR post.visibility = :followers)',
        { public: 'public', followers: 'followers' },
      );
      // TODO: Implementar verificación de follows para 'followers'
    }

    const [posts, total] = await queryBuilder.getManyAndCount();

    return {
      posts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Actualizar un post
   */
  async update(
    id: string,
    updatePostDto: UpdatePostDto,
    userId: string,
  ): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException('Post no encontrado');
    }

    // Verificar que el usuario es el autor del post
    if (post.userId !== userId) {
      throw new ForbiddenException('No tienes permiso para editar este post');
    }

    // Actualizar campos
    Object.assign(post, updatePostDto);
    return this.postRepository.save(post);
  }

  /**
   * Eliminar un post
   */
  async remove(id: string, userId: string): Promise<void> {
    const post = await this.postRepository.findOne({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException('Post no encontrado');
    }

    // Verificar que el usuario es el autor del post
    if (post.userId !== userId) {
      throw new ForbiddenException('No tienes permiso para eliminar este post');
    }

    // Decrementar el contador de posts del usuario
    await this.userRepository.decrement({ id: userId }, 'postsCount', 1);

    // Soft delete
    await this.postRepository.softRemove(post);
  }

  /**
   * Obtener estadísticas de posts de un usuario
   */
  async getUserPostsCount(userId: string): Promise<number> {
    return this.postRepository.count({
      where: { userId },
    });
  }
}
