/**
 * Interfaz estándar para respuestas de la API
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  timestamp: string;
  message?: string;
}
