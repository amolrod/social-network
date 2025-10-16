import { Injectable, inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

/**
 * Interceptor para manejo global de errores HTTP
 */
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private readonly router = inject(Router);

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Ha ocurrido un error';

        if (error.error instanceof ErrorEvent) {
          // Error del cliente
          errorMessage = `Error: ${error.error.message}`;
          console.error('Error del cliente:', error.error.message);
        } else {
          // Error del servidor
          console.error(
            `Código de error ${error.status}, ` +
            `mensaje: ${error.message}`
          );

          // Mensajes personalizados según el código de estado
          switch (error.status) {
            case 0:
              errorMessage = 'No se puede conectar con el servidor. Verifica tu conexión.';
              break;
            case 400:
              errorMessage = error.error?.message || 'Solicitud incorrecta';
              break;
            case 401:
              errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
              // Redirigir al login si no estamos ya ahí
              if (!this.router.url.includes('/auth/')) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                this.router.navigate(['/auth/sign-in']);
              }
              break;
            case 403:
              errorMessage = 'No tienes permisos para realizar esta acción';
              break;
            case 404:
              errorMessage = error.error?.message || 'Recurso no encontrado';
              break;
            case 422:
              errorMessage = error.error?.message || 'Datos de validación incorrectos';
              break;
            case 429:
              errorMessage = 'Demasiadas solicitudes. Por favor, espera un momento.';
              break;
            case 500:
              errorMessage = 'Error interno del servidor. Intenta nuevamente más tarde.';
              break;
            case 503:
              errorMessage = 'Servicio no disponible. Intenta nuevamente más tarde.';
              break;
            default:
              errorMessage = error.error?.message || 'Ha ocurrido un error inesperado';
          }
        }

        // Retornar el error con el mensaje procesado
        return throwError(() => ({
          message: errorMessage,
          status: error.status,
          error: error.error
        }));
      })
    );
  }
}
