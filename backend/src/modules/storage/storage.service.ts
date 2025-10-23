import { Injectable } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

@Injectable()
export class StorageService {
  private readonly uploadPath = './uploads';

  constructor() {
    // Crear directorio de uploads si no existe
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  /**
   * Configuración de multer para almacenamiento local
   */
  getMulterConfig() {
    return {
      storage: diskStorage({
        destination: this.uploadPath,
        filename: (req, file, cb) => {
          // Generar nombre único: timestamp-random-extension
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Validar que sea imagen
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new Error('Solo se permiten imágenes (jpg, jpeg, png, gif, webp)'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB máximo
      },
    };
  }

  /**
   * Obtener URL pública del archivo
   */
  getFileUrl(filename: string): string {
    return `/uploads/${filename}`;
  }

  /**
   * Eliminar archivo
   */
  deleteFile(filename: string): void {
    const filePath = `${this.uploadPath}/${filename}`;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  /**
   * Eliminar archivo por URL
   */
  deleteFileByUrl(url: string): void {
    if (!url) return;
    
    // Extraer nombre del archivo de la URL
    const filename = url.split('/').pop();
    if (filename) {
      this.deleteFile(filename);
    }
  }
}
