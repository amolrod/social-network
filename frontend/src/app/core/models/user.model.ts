/**
 * Interface para el usuario en el sistema
 */
export interface User {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
  location?: string;
  website?: string;
  isVerified: boolean;
  isPrivate: boolean;
  followersCount?: number;
  followingCount?: number;
  createdAt: Date;
}

/**
 * DTO para actualizar el perfil del usuario
 */
export interface UpdateProfileDto {
  fullName?: string;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
  location?: string;
  website?: string;
  isPrivate?: boolean;
}

/**
 * Interface para las credenciales de login
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Interface para el registro de usuario
 */
export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  fullName?: string;
}

/**
 * Interface para la respuesta de autenticación
 */
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
