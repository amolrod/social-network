import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follow } from './entities/follow.entity';
import { User } from '../users/entities/user.entity';
import {
  FollowUserResponse,
  FollowStatsResponse,
} from './dto/follow.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class FollowsService {
  constructor(
    @InjectRepository(Follow)
    private readonly followRepository: Repository<Follow>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Seguir a un usuario
   */
  async follow(followerId: string, followingId: string): Promise<Follow> {
    // Validar que no intente seguirse a sí mismo
    if (followerId === followingId) {
      throw new BadRequestException('No puedes seguirte a ti mismo');
    }

    // Verificar que el usuario a seguir existe
    const userToFollow = await this.userRepository.findOne({
      where: { id: followingId },
    });

    if (!userToFollow) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar que no exista ya el follow
    const existingFollow = await this.followRepository.findOne({
      where: { followerId, followingId },
    });

    if (existingFollow) {
      throw new ConflictException('Ya sigues a este usuario');
    }

    // Crear el follow
    const follow = this.followRepository.create({
      followerId,
      followingId,
    });

    const savedFollow = await this.followRepository.save(follow);

    // Actualizar contadores
    await this.userRepository.increment({ id: followerId }, 'followingCount', 1);
    await this.userRepository.increment({ id: followingId }, 'followersCount', 1);

    // Crear notificación
    await this.notificationsService.notifyFollow(followingId, followerId);

    return savedFollow;
  }

  /**
   * Dejar de seguir a un usuario
   */
  async unfollow(followerId: string, followingId: string): Promise<void> {
    const follow = await this.followRepository.findOne({
      where: { followerId, followingId },
    });

    if (!follow) {
      throw new NotFoundException('No sigues a este usuario');
    }

    await this.followRepository.remove(follow);

    // Actualizar contadores
    await this.userRepository.decrement({ id: followerId }, 'followingCount', 1);
    await this.userRepository.decrement({ id: followingId }, 'followersCount', 1);
  }

  /**
   * Obtener seguidores de un usuario
   */
  async getFollowers(
    userId: string,
    page: number = 1,
    limit: number = 20,
    currentUserId?: string,
  ): Promise<{
    followers: FollowUserResponse[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [follows, total] = await this.followRepository.findAndCount({
      where: { followingId: userId },
      relations: ['follower'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    // Mapear a respuesta con información adicional
    const followers = await Promise.all(
      follows.map(async (follow) => {
        const isFollowing = currentUserId
          ? await this.isFollowing(currentUserId, follow.follower.id)
          : false;

        return {
          id: follow.follower.id,
          username: follow.follower.username,
          fullName: follow.follower.fullName,
          avatarUrl: follow.follower.avatarUrl,
          isVerified: follow.follower.isVerified,
          followersCount: follow.follower.followersCount,
          followingCount: follow.follower.followingCount,
          isFollowing,
          followedAt: follow.createdAt,
        };
      }),
    );

    return {
      followers,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtener usuarios seguidos por un usuario
   */
  async getFollowing(
    userId: string,
    page: number = 1,
    limit: number = 20,
    currentUserId?: string,
  ): Promise<{
    following: FollowUserResponse[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [follows, total] = await this.followRepository.findAndCount({
      where: { followerId: userId },
      relations: ['following'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    // Mapear a respuesta con información adicional
    const following = await Promise.all(
      follows.map(async (follow) => {
        const isFollowing = currentUserId
          ? await this.isFollowing(currentUserId, follow.following.id)
          : true; // Si es el mismo usuario, siempre es true

        return {
          id: follow.following.id,
          username: follow.following.username,
          fullName: follow.following.fullName,
          avatarUrl: follow.following.avatarUrl,
          isVerified: follow.following.isVerified,
          followersCount: follow.following.followersCount,
          followingCount: follow.following.followingCount,
          isFollowing,
          followedAt: follow.createdAt,
        };
      }),
    );

    return {
      following,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Verificar si un usuario sigue a otro
   */
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follow = await this.followRepository.findOne({
      where: { followerId, followingId },
    });

    return !!follow;
  }

  /**
   * Obtener estadísticas de seguimiento entre dos usuarios
   */
  async getFollowStats(
    userId: string,
    targetUserId: string,
  ): Promise<FollowStatsResponse> {
    const targetUser = await this.userRepository.findOne({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const [isFollowing, isFollowedBy] = await Promise.all([
      this.isFollowing(userId, targetUserId),
      this.isFollowing(targetUserId, userId),
    ]);

    return {
      followersCount: targetUser.followersCount,
      followingCount: targetUser.followingCount,
      isFollowing,
      isFollowedBy,
    };
  }

  /**
   * Obtener IDs de usuarios seguidos (útil para filtrar feed)
   */
  async getFollowingIds(userId: string): Promise<string[]> {
    const follows = await this.followRepository.find({
      where: { followerId: userId },
      select: ['followingId'],
    });

    return follows.map((f) => f.followingId);
  }
}
