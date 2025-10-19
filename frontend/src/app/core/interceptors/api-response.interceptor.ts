import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { map } from 'rxjs/operators';

/**
 * Interceptor para extraer la propiedad 'data' de las respuestas de la API
 * El backend devuelve: { success: boolean, data: T, timestamp: string }
 * Este interceptor extrae automáticamente el 'data' para simplificar el uso en servicios
 */
export const apiResponseInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    map((event) => {
      // Solo procesar respuestas HTTP exitosas
      if (event instanceof HttpResponse && event.body) {
        // Si la respuesta tiene la estructura de nuestra API
        if (typeof event.body === 'object' && 'data' in event.body && 'success' in event.body) {
          // Retornar una nueva respuesta con solo el contenido de 'data'
          return event.clone({ body: event.body.data });
        }
      }
      return event;
    })
  );
};
