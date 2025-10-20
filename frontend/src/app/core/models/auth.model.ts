/**
 * Interfaz para el usuario autenticado
 */
export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
  location?: string;
  website?: string;
  isVerified: boolean;
  isPrivate: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  createdAt: string;
}

/**
 * Interfaz para las credenciales de login
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Interfaz para los datos de registro
 */
export interface RegisterData {
  username: string;
  email: string;
  password: string;
  fullName: string;
}

/**
 * Interfaz para la respuesta de autenticación
 */
export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

/**
 * Interfaz para la respuesta de refresh token
 */
export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
}
