import { PartialType } from '@nestjs/swagger';
import { IsString, MaxLength, IsOptional, IsBoolean, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para actualizar usuario
 * Todos los campos son opcionales
 */
export class UpdateUserDto {
  @ApiProperty({ required: false, description: 'Nombre completo del usuario' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fullName?: string;

  @ApiProperty({ required: false, description: 'Biografía del usuario' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiProperty({ required: false, description: 'URL de la foto de perfil' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatarUrl?: string;

  @ApiProperty({ required: false, description: 'URL de la foto de portada' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  coverUrl?: string;

  @ApiProperty({ required: false, description: 'Ubicación del usuario' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;

  @ApiProperty({ required: false, description: 'Sitio web del usuario' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  website?: string;

  @ApiProperty({ required: false, description: 'Perfil privado' })
  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;
}
