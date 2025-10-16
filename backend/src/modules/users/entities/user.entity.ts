import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';

/**
 * Entidad User - Representa un usuario del sistema
 * Incluye soft deletes y timestamps automáticos
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  @Index()
  username: string;

  @Column({ unique: true, length: 255 })
  @Index()
  email: string;

  @Column({ length: 255 })
  @Exclude() // No exponer el password en las respuestas
  password: string;

  @Column({ name: 'full_name', length: 100, nullable: true })
  fullName: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ name: 'avatar_url', length: 500, nullable: true })
  avatarUrl: string;

  @Column({ name: 'cover_url', length: 500, nullable: true })
  coverUrl: string;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({ name: 'is_private', default: false })
  isPrivate: boolean;

  @Column({ name: 'followers_count', default: 0 })
  followersCount: number;

  @Column({ name: 'following_count', default: 0 })
  followingCount: number;

  @Column({ name: 'posts_count', default: 0 })
  postsCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  // Relaciones (se agregarán progresivamente)
  // @OneToMany(() => Post, post => post.user)
  // posts: Post[];
}
