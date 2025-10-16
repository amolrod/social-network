import { IsEmail, IsString, MinLength, MaxLength, IsOptional, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para registro de usuario
 */
export class CreateUserDto {
  @ApiProperty({ example: 'johndoe', description: 'Nombre de usuario único' })
  @IsString()
  @MinLength(3, { message: 'El username debe tener al menos 3 caracteres' })
  @MaxLength(50, { message: 'El username no puede exceder 50 caracteres' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'El username solo puede contener letras, números y guiones bajos',
  })
  username: string;

  @ApiProperty({ example: 'john@example.com', description: 'Email del usuario' })
  @IsEmail({}, { message: 'Email inválido' })
  @MaxLength(255)
  email: string;

  @ApiProperty({ example: 'MyP@ssw0rd', description: 'Contraseña (mínimo 8 caracteres)' })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(255)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'La contraseña debe contener al menos una mayúscula, una minúscula y un número',
  })
  password: string;

  @ApiProperty({ example: 'John Doe', description: 'Nombre completo', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fullName?: string;
}
