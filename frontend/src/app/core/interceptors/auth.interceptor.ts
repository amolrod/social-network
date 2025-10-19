import { inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpInterceptorFn,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

// Variables compartidas para el refresh token
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

/**
 * Verifica si es una petición de autenticación
 */
function isAuthRequest(request: HttpRequest<any>): boolean {
  return request.url.includes('/auth/login') || 
         request.url.includes('/auth/register');
}

/**
 * Verifica si es una petición de refresh token
 */
function isRefreshRequest(request: HttpRequest<any>): boolean {
  return request.url.includes('/auth/refresh');
}

/**
 * Agrega el token JWT al header de la petición
 */
function addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

/**
 * Maneja errores 401 intentando refrescar el token
 */
function handle401Error(
  request: HttpRequest<any>,
  next: HttpHandlerFn,
  authService: AuthService
): Observable<HttpEvent<any>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    const refreshToken = authService.getRefreshToken();

    if (refreshToken) {
      return authService.refreshToken().pipe(
        switchMap((response: any) => {
          isRefreshing = false;
          refreshTokenSubject.next(response.access_token);
          return next(addToken(request, response.access_token));
        }),
        catchError((error) => {
          isRefreshing = false;
          authService.logout();
          return throwError(() => error);
        })
      );
    } else {
      isRefreshing = false;
      authService.logout();
      return throwError(() => new Error('No refresh token available'));
    }
  } else {
    // Esperar a que el refresh termine y reintentar la petición
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => next(addToken(request, token!)))
    );
  }
}

/**
 * Interceptor funcional para adjuntar token JWT a las peticiones HTTP
 * y manejar el refresh token automáticamente
 */
export const authInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  
  // Agregar token si existe y no es una petición de autenticación
  const token = authService.getAccessToken();
  
  console.log('🔍 AuthInterceptor - Request:', {
    url: request.url,
    method: request.method,
    hasToken: !!token,
    tokenPreview: token ? token.substring(0, 20) + '...' : 'NO TOKEN',
    isAuthRequest: isAuthRequest(request)
  });
  
  if (token && !isAuthRequest(request)) {
    request = addToken(request, token);
    console.log('✅ Token añadido al request');
  } else {
    console.warn('⚠️ Token NO añadido:', { hasToken: !!token, isAuthRequest: isAuthRequest(request) });
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('❌ Error en request:', {
        status: error.status,
        url: request.url,
        message: error.message
      });
      
      // Si es 401 y no es petición de refresh, intentar renovar token
      if (error.status === 401 && !isRefreshRequest(request)) {
        return handle401Error(request, next, authService);
      }
      
      return throwError(() => error);
    })
  );
};
