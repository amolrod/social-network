import { IsString, MinLength, MaxLength, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para crear un comentario
 */
export class CreateCommentDto {
  @ApiProperty({ example: '¡Excelente publicación!' })
  @IsString()
  @MinLength(1, { message: 'El comentario no puede estar vacío' })
  @MaxLength(2000, { message: 'El comentario no puede exceder 2000 caracteres' })
  content: string;

  @ApiProperty({ example: 'uuid-del-post' })
  @IsUUID('4', { message: 'ID de post inválido' })
  postId: string;

  @ApiProperty({ example: 'uuid-del-comentario-padre', required: false })
  @IsOptional()
  @IsUUID('4', { message: 'ID de comentario padre inválido' })
  parentCommentId?: string;
}
