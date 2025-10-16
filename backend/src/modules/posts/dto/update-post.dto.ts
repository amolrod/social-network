import { PartialType } from '@nestjs/swagger';
import { CreatePostDto } from './create-post.dto';

/**
 * DTO para actualizar un post
 * Todos los campos son opcionales (hereda de CreatePostDto con PartialType)
 */
export class UpdatePostDto extends PartialType(CreatePostDto) {}
