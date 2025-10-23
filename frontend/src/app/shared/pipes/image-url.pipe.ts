import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe para construir URLs completas de imágenes
 * Convierte rutas relativas como '/uploads/image.jpg' a URLs absolutas
 */
@Pipe({
  name: 'imageUrl',
  standalone: true
})
export class ImageUrlPipe implements PipeTransform {
  private readonly baseUrl = 'http://localhost:3000';

  transform(value: string | null | undefined): string {
    if (!value) {
      return '';
    }

    // Si ya es una URL completa, retornarla tal cual
    if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:')) {
      return value;
    }

    // Construir URL completa
    return `${this.baseUrl}${value}`;
  }
}
