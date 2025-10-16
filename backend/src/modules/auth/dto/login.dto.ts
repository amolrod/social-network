import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para login de usuario
 */
export class LoginDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @ApiProperty({ example: 'MyP@ssw0rd' })
  @IsString()
  @MinLength(1, { message: 'La contraseña es requerida' })
  password: string;
}
