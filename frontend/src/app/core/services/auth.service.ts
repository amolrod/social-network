import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError, map } from 'rxjs';
import { ApiService } from './api.service';
import {
  User,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  RefreshTokenResponse
} from '../models/auth.model';

/**
 * Servicio de autenticación con state management usando Signals
 * Maneja login, registro, logout y gestión de tokens JWT
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiService = inject(ApiService);
  private readonly router = inject(Router);

  // Signals para el estado de autenticación
  private readonly currentUserSignal = signal<User | null>(null);
  private readonly isLoadingSignal = signal<boolean>(false);
  
  // Computed signals
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);
  readonly isLoading = this.isLoadingSignal.asReadonly();

  // Claves de localStorage
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'user';

  constructor() {
    // Cargar usuario del localStorage al iniciar
    this.loadUserFromStorage();
  }

  /**
   * Registrar nuevo usuario
   */
  register(data: RegisterData): Observable<AuthResponse> {
    this.isLoadingSignal.set(true);
    
    return this.apiService.post<any>('/auth/register', data).pipe(
      map(response => response.data || response),
      tap(response => this.handleAuthSuccess(response)),
      catchError(error => {
        this.isLoadingSignal.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Iniciar sesión
   */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    this.isLoadingSignal.set(true);
    
    return this.apiService.post<any>('/auth/login', credentials).pipe(
      map(response => response.data || response),
      tap(response => this.handleAuthSuccess(response)),
      catchError(error => {
        this.isLoadingSignal.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Refrescar tokens
   */
  refreshToken(): Observable<RefreshTokenResponse> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.apiService.post<RefreshTokenResponse>('/auth/refresh', {
      refresh_token: refreshToken
    }).pipe(
      tap(response => {
        this.saveTokens(response.access_token, response.refresh_token);
      }),
      catchError(error => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    this.clearAuthData();
    this.router.navigate(['/auth/sign-in']);
  }

  /**
   * Obtener token de acceso
   */
  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Obtener refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Verificar si el usuario está autenticado
   */
  checkAuth(): boolean {
    return !!this.getAccessToken() && !!this.currentUserSignal();
  }

  /**
   * Obtener información del usuario actual
   */
  getCurrentUser(): Observable<User> {
    return this.apiService.get<User>('/users/me').pipe(
      tap(user => {
        this.currentUserSignal.set(user);
        this.saveUser(user);
      })
    );
  }

  /**
   * Maneja el éxito de autenticación
   */
  private handleAuthSuccess(response: AuthResponse): void {
    console.log('🔐 handleAuthSuccess called with:', {
      hasAccessToken: !!response.access_token,
      hasRefreshToken: !!response.refresh_token,
      hasUser: !!response.user,
      response: response
    });
    
    this.saveTokens(response.access_token, response.refresh_token);
    this.currentUserSignal.set(response.user);
    this.saveUser(response.user);
    this.isLoadingSignal.set(false);
    
    console.log('✅ Tokens guardados. Verificando:', {
      accessToken: localStorage.getItem(this.ACCESS_TOKEN_KEY)?.substring(0, 20) + '...',
      refreshToken: localStorage.getItem(this.REFRESH_TOKEN_KEY)?.substring(0, 20) + '...',
      user: this.currentUserSignal()
    });
  }

  /**
   * Guarda los tokens en localStorage
   */
  private saveTokens(accessToken: string, refreshToken: string): void {
    console.log('💾 Guardando tokens:', {
      accessToken: accessToken?.substring(0, 30) + '...',
      refreshToken: refreshToken?.substring(0, 30) + '...'
    });
    
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  /**
   * Guarda el usuario en localStorage
   */
  private saveUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Carga el usuario desde localStorage
   */
  private loadUserFromStorage(): void {
    const userJson = localStorage.getItem(this.USER_KEY);
    if (userJson && userJson !== 'undefined' && userJson !== 'null') {
      try {
        const user = JSON.parse(userJson);
        if (user && typeof user === 'object') {
          this.currentUserSignal.set(user);
        } else {
          console.warn('Invalid user data in localStorage');
          this.clearAuthData();
        }
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        this.clearAuthData();
      }
    }
  }

  /**
   * Limpia todos los datos de autenticación
   */
  private clearAuthData(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSignal.set(null);
    this.isLoadingSignal.set(false);
  }
}
