import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para actualizar un comentario
 */
export class UpdateCommentDto {
  @ApiProperty({ example: 'Comentario actualizado' })
  @IsString()
  @MinLength(1, { message: 'El comentario no puede estar vacío' })
  @MaxLength(2000, { message: 'El comentario no puede exceder 2000 caracteres' })
  content: string;
}
