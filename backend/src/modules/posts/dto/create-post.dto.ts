import { IsString, MinLength, MaxLength, IsOptional, IsEnum, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para crear un post
 */
export class CreatePostDto {
  @ApiProperty({ example: '¡Hola mundo! Esta es mi primera publicación' })
  @IsString()
  @MinLength(1, { message: 'El contenido no puede estar vacío' })
  @MaxLength(5000, { message: 'El contenido no puede exceder 5000 caracteres' })
  content: string;

  @ApiProperty({ example: ['https://example.com/image.jpg'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaUrls?: string[];

  @ApiProperty({ example: 'public', enum: ['public', 'private', 'followers'], required: false })
  @IsOptional()
  @IsEnum(['public', 'private', 'followers'])
  visibility?: string;
}
