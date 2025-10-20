import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface UploadResponse {
  url: string;
  fileName: string;
}

/**
 * Servicio para manejar la subida de archivos
 */
@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private readonly apiService = inject(ApiService);

  /**
   * Sube una imagen y devuelve la URL
   */
  uploadImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);

    // Por ahora usamos un endpoint placeholder
    // TODO: Implementar endpoint real en el backend
    return this.apiService.post<UploadResponse>('/upload/image', formData).pipe(
      map(response => response.url)
    );
  }

  /**
   * Convierte un archivo a base64 para preview
   */
  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  /**
   * Valida que un archivo sea una imagen
   */
  isValidImage(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    return validTypes.includes(file.type);
  }

  /**
   * Valida el tamaño del archivo (en MB)
   */
  isValidSize(file: File, maxSizeMB: number = 5): boolean {
    const maxSize = maxSizeMB * 1024 * 1024; // Convertir a bytes
    return file.size <= maxSize;
  }
}
