
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import helmet from 'helmet';

/**
 * Bootstrap de la aplicación NestJS
 * Configura seguridad, validación, CORS, y otros aspectos globales
 */
async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  // Crear la aplicación
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Obtener ConfigService
  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port', 3000);
  const apiPrefix = configService.get<string>('app.apiPrefix', 'api/v1');
  const corsOrigin = configService.get<string>('app.corsOrigin', 'http://localhost:4200');

  // Seguridad: Helmet (headers de seguridad)
  app.use(helmet());

  // CORS configuración
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Prefijo global para todas las rutas
  app.setGlobalPrefix(apiPrefix);

  // Validación global con class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades no definidas en el DTO
      forbidNonWhitelisted: true, // Lanza error si hay propiedades extras
      transform: true, // Transforma los payloads a instancias de DTO
      transformOptions: {
        enableImplicitConversion: true, // Convierte tipos automáticamente
      },
    }),
  );

  // Filtros globales para manejo de excepciones
  app.useGlobalFilters(new AllExceptionsFilter());

  // Interceptors globales
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // Configuración de Swagger (documentación API)
  const config = new DocumentBuilder()
    .setTitle('Social Network API')
    .setDescription('API de red social con autenticación, posts, comentarios y más')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Autenticación y registro')
    .addTag('users', 'Gestión de usuarios')
    .addTag('posts', 'Publicaciones')
    .addTag('comments', 'Comentarios')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Iniciar servidor
  await app.listen(port);
  
  logger.log(`🚀 Application is running on: http://localhost:${port}/${apiPrefix}`);
  logger.log(`📚 Swagger docs available at: http://localhost:${port}/api/docs`);
  logger.log(`📊 Environment: ${configService.get('app.nodeEnv')}`);
  logger.log(`🌍 CORS enabled for: ${corsOrigin}`);
}

bootstrap();
