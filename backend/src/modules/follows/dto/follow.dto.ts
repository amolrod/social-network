import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty } from 'class-validator';

/**
 * DTO para seguir a un usuario
 */
export class FollowDto {
  @ApiProperty({
    description: 'ID del usuario a seguir',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  followingId: string;
}

/**
 * Respuesta con información del usuario seguido/seguidor
 */
export class FollowUserResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty({ required: false })
  avatarUrl?: string;

  @ApiProperty()
  isVerified: boolean;

  @ApiProperty()
  followersCount: number;

  @ApiProperty()
  followingCount: number;

  @ApiProperty()
  isFollowing?: boolean; // Si el usuario actual lo sigue

  @ApiProperty()
  followedAt: Date; // Fecha del follow
}

/**
 * Respuesta de estadísticas de seguimiento
 */
export class FollowStatsResponse {
  @ApiProperty()
  followersCount: number;

  @ApiProperty()
  followingCount: number;

  @ApiProperty()
  isFollowing: boolean;

  @ApiProperty()
  isFollowedBy: boolean; // Si el usuario objetivo sigue al usuario actual
}
