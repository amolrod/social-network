# 🚀 Guía de Despliegue - Social Network

Esta guía te ayudará a desplegar la aplicación en producción en diferentes plataformas.

## 📋 Tabla de Contenidos

- [Requisitos Previos](#requisitos-previos)
- [Preparación](#preparación)
- [Opción 1: VPS/Servidor Propio (DigitalOcean, AWS EC2, etc.)](#opción-1-vpsservidor-propio)
- [Opción 2: Vercel (Frontend) + Railway/Render (Backend)](#opción-2-vercel-frontend--railwayrender-backend)
- [Opción 3: Docker Compose en VPS](#opción-3-docker-compose-en-vps)
- [Opción 4: Kubernetes](#opción-4-kubernetes)
- [Base de Datos en Producción](#base-de-datos-en-producción)
- [Almacenamiento de Archivos](#almacenamiento-de-archivos)
- [Dominios y SSL](#dominios-y-ssl)
- [Monitoreo y Logs](#monitoreo-y-logs)
- [Backup y Recuperación](#backup-y-recuperación)

---

## 🎯 Requisitos Previos

### Hardware Mínimo Recomendado
- **CPU:** 2 cores
- **RAM:** 4GB
- **Almacenamiento:** 20GB SSD
- **Ancho de banda:** 1TB/mes

### Software
- Ubuntu 22.04 LTS (o similar)
- Docker y Docker Compose
- Node.js 20+
- Nginx (para reverse proxy)
- Certbot (para SSL)

### Servicios Externos
- **Base de datos:** PostgreSQL (Railway, Supabase, AWS RDS, etc.)
- **Redis:** Upstash Redis o Redis Cloud
- **Almacenamiento:** AWS S3, Cloudinary, o DigitalOcean Spaces
- **DNS:** Cloudflare (recomendado para CDN y protección)

---

## 🛠️ Preparación

### 1. Variables de Entorno de Producción

#### Backend (.env.production)

```env
# App
PORT=3000
NODE_ENV=production

# Database (usar servicio externo)
DB_HOST=your-postgres-host.railway.app
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=YOUR_SECURE_PASSWORD
DB_DATABASE=social_network
DB_SSL=true

# Redis (usar servicio externo)
REDIS_HOST=your-redis-host.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=YOUR_REDIS_PASSWORD
REDIS_TLS=true

# JWT (generar secretos seguros)
JWT_SECRET=change-this-to-a-secure-random-string-at-least-32-chars
JWT_REFRESH_SECRET=change-this-to-another-secure-random-string-at-least-32-chars
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Upload (usar S3 o Cloudinary en producción)
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# CORS
FRONTEND_URL=https://your-domain.com

# AWS S3 (opcional)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# Cloudinary (alternativa)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

#### Frontend (environment.prod.ts)

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.your-domain.com/api/v1',
  wsUrl: 'https://api.your-domain.com',
};
```

### 2. Generar Secretos Seguros

```bash
# En tu terminal local, genera secretos aleatorios:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copia el resultado y úsalo para JWT_SECRET

node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copia el resultado y úsalo para JWT_REFRESH_SECRET
```

---

## 🌐 Opción 1: VPS/Servidor Propio

### DigitalOcean, AWS EC2, Linode, Hetzner, etc.

#### Paso 1: Configurar el Servidor

```bash
# 1. Conectarse por SSH
ssh root@your-server-ip

# 2. Actualizar sistema
apt update && apt upgrade -y

# 3. Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs

# 4. Instalar Nginx
apt install -y nginx

# 5. Instalar Certbot para SSL
apt install -y certbot python3-certbot-nginx

# 6. Instalar PM2 (Process Manager)
npm install -g pm2

# 7. Crear usuario para la app (seguridad)
adduser appuser
usermod -aG sudo appuser
su - appuser
```

#### Paso 2: Clonar y Configurar el Proyecto

```bash
# Clonar repositorio
cd ~
git clone https://github.com/yourusername/social-network.git
cd social-network

# Backend
cd backend
npm install --production
cp .env.example .env.production
nano .env.production  # Editar con variables de producción

# Compilar
npm run build

# Frontend
cd ../frontend
npm install
nano src/environments/environment.prod.ts  # Editar con URLs de producción

# Compilar para producción
npm run build
```

#### Paso 3: Configurar PM2 para Backend

```bash
cd ~/social-network/backend

# Crear archivo ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'social-network-api',
    script: 'dist/main.js',
    instances: 2,  // Usa múltiples instancias (cluster mode)
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm Z',
    merge_logs: true,
  }]
};
EOF

# Crear directorio de logs
mkdir -p logs

# Iniciar con PM2
pm2 start ecosystem.config.js --env production

# Configurar PM2 para auto-inicio en reboot
pm2 startup
pm2 save
```

#### Paso 4: Configurar Nginx

```bash
# Crear configuración de Nginx
sudo nano /etc/nginx/sites-available/social-network
```

Contenido del archivo:

```nginx
# Backend API
server {
    listen 80;
    server_name api.your-domain.com;

    # Logs
    access_log /var/log/nginx/api-access.log;
    error_log /var/log/nginx/api-error.log;

    # Proxy to Node.js backend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Límite de tamaño de archivos
    client_max_body_size 10M;
}

# Frontend
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Root directory
    root /home/appuser/social-network/frontend/dist/frontend/browser;
    index index.html;

    # Logs
    access_log /var/log/nginx/frontend-access.log;
    error_log /var/log/nginx/frontend-error.log;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Cache estático
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Angular routing (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Seguridad
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

```bash
# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/social-network /etc/nginx/sites-enabled/

# Eliminar sitio default
sudo rm /etc/nginx/sites-enabled/default

# Verificar configuración
sudo nginx -t

# Recargar Nginx
sudo systemctl reload nginx
```

#### Paso 5: Configurar SSL con Let's Encrypt

```bash
# Obtener certificados SSL para ambos dominios
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
sudo certbot --nginx -d api.your-domain.com

# Certbot configurará automáticamente Nginx para HTTPS
# Los certificados se renovarán automáticamente

# Verificar auto-renovación
sudo certbot renew --dry-run
```

#### Paso 6: Configurar Firewall

```bash
# UFW firewall
sudo ufw allow 22     # SSH
sudo ufw allow 80     # HTTP
sudo ufw allow 443    # HTTPS
sudo ufw enable
sudo ufw status
```

---

## ☁️ Opción 2: Vercel (Frontend) + Railway/Render (Backend)

Esta es la opción más rápida y sencilla para deployment.

### Backend en Railway

#### Paso 1: Crear cuenta en Railway
1. Ve a [railway.app](https://railway.app)
2. Registrarte con GitHub

#### Paso 2: Crear Proyecto
1. Click en "New Project"
2. Seleccionar "Deploy from GitHub repo"
3. Seleccionar tu repositorio
4. Railway detectará automáticamente NestJS

#### Paso 3: Configurar Variables de Entorno
En el dashboard de Railway:
- Click en tu servicio → Variables
- Agregar todas las variables del `.env.production`
- Railway proporciona PostgreSQL y Redis gratis en plan inicial

#### Paso 4: Configurar PostgreSQL y Redis
1. Click "New" → "Database" → "PostgreSQL"
2. Click "New" → "Database" → "Redis"
3. Railway auto-generará las variables de conexión

#### Paso 5: Deploy
- Railway desplegará automáticamente en cada push a GitHub
- Obtén la URL pública: `your-app.up.railway.app`

### Frontend en Vercel

#### Paso 1: Preparar el Proyecto

```bash
cd frontend

# Crear vercel.json
cat > vercel.json << 'EOF'
{
  "version": 2,
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "build": {
    "env": {
      "NODE_ENV": "production"
    }
  }
}
EOF
```

#### Paso 2: Deploy en Vercel

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

O desde la web:
1. Ve a [vercel.com](https://vercel.com)
2. Importar proyecto desde GitHub
3. Configurar:
   - Framework Preset: Angular
   - Build Command: `npm run build`
   - Output Directory: `dist/frontend/browser`
4. Variables de entorno:
   - `NEXT_PUBLIC_API_URL`: URL de Railway
5. Deploy!

---

## 🐳 Opción 3: Docker Compose en VPS

Desplegar todo con Docker en un servidor.

### docker-compose.production.yml

```yaml
version: '3.8'

services:
  # PostgreSQL
  postgres:
    image: postgres:16-alpine
    container_name: social-network-postgres-prod
    restart: always
    environment:
      POSTGRES_USER: ${DB_USERNAME}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_DATABASE}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USERNAME}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis
  redis:
    image: redis:7-alpine
    container_name: social-network-redis-prod
    restart: always
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    container_name: social-network-backend-prod
    restart: always
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DB_HOST: postgres
      DB_PORT: 5432
      REDIS_HOST: redis
      REDIS_PORT: 6379
    env_file:
      - ./backend/.env.production
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - app-network
    volumes:
      - ./backend/uploads:/app/uploads

  # Frontend (Nginx)
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    container_name: social-network-frontend-prod
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - backend
    networks:
      - app-network

volumes:
  postgres_data:
  redis_data:

networks:
  app-network:
    driver: bridge
```

### Dockerfile.prod para Backend

```dockerfile
# backend/Dockerfile.prod
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Build
RUN npm run build

# Imagen de producción
FROM node:20-alpine

WORKDIR /app

# Copiar node_modules y build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Exponer puerto
EXPOSE 3000

# Usuario no-root para seguridad
USER node

# Comando de inicio
CMD ["node", "dist/main.js"]
```

### Dockerfile.prod para Frontend

```dockerfile
# frontend/Dockerfile.prod
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Build para producción
RUN npm run build

# Imagen de Nginx
FROM nginx:alpine

# Copiar build de Angular
COPY --from=builder /app/dist/frontend/browser /usr/share/nginx/html

# Copiar configuración de Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Exponer puerto
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf

```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        server_name _;
        root /usr/share/nginx/html;
        index index.html;

        # Gzip
        gzip on;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

        # Cache
        location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # SPA routing
        location / {
            try_files $uri $uri/ /index.html;
        }
    }
}
```

### Desplegar

```bash
# En tu servidor VPS
git clone https://github.com/yourusername/social-network.git
cd social-network

# Configurar variables de entorno
cp backend/.env.example backend/.env.production
nano backend/.env.production

# Build y deploy
docker-compose -f docker-compose.production.yml up -d --build

# Ver logs
docker-compose -f docker-compose.production.yml logs -f
```

---

## 🗄️ Base de Datos en Producción

### Opciones de Hosting para PostgreSQL

#### 1. Railway (Recomendado para empezar)
- ✅ Free tier: 512MB RAM, 1GB almacenamiento
- ✅ Backups automáticos
- ✅ SSL incluido
- 💰 $5/mes plan Hobby

#### 2. Supabase
- ✅ Free tier: 500MB database
- ✅ Backups automáticos diarios
- ✅ Dashboard web incluido
- 💰 $25/mes plan Pro

#### 3. AWS RDS
- ✅ Altamente escalable
- ✅ Multi-AZ para alta disponibilidad
- ✅ Backups automáticos
- 💰 Desde $15/mes (db.t3.micro)

#### 4. DigitalOcean Managed Database
- ✅ Fácil de usar
- ✅ Backups automáticos
- ✅ Monitoring incluido
- 💰 Desde $15/mes (1GB RAM)

### Configuración de Conexión Segura

```typescript
// backend/src/config/database.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false, // Para servicios como Railway
  } : false,
  synchronize: false, // ⚠️ NUNCA true en producción
  logging: process.env.NODE_ENV === 'development',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
};
```

### Migraciones en Producción

```bash
# Generar migración
npm run migration:generate -- -n MigrationName

# Ejecutar migraciones en producción
NODE_ENV=production npm run migration:run

# Revertir última migración (emergencia)
NODE_ENV=production npm run migration:revert
```

---

## 📦 Almacenamiento de Archivos

En producción, NO uses almacenamiento local. Usa servicios en la nube:

### Opción A: AWS S3

```bash
npm install @aws-sdk/client-s3 multer-s3
```

```typescript
// backend/src/modules/storage/storage.service.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class StorageService {
  private s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const key = `${Date.now()}-${file.originalname}`;
    
    await this.s3Client.send(new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    }));

    return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  }
}
```

### Opción B: Cloudinary

```bash
npm install cloudinary
```

```typescript
// backend/src/modules/storage/storage.service.ts
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class StorageService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'social-network' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result.secure_url);
        }
      );
      
      uploadStream.end(file.buffer);
    });
  }
}
```

---

## 🌍 Dominios y SSL

### Configurar DNS en Cloudflare

1. **Agregar dominio a Cloudflare**
   - Ve a cloudflare.com
   - Add Site
   - Sigue instrucciones para cambiar nameservers

2. **Configurar DNS Records**
   ```
   Type    Name    Content              Proxy
   A       @       your-server-ip       ✅ Proxied
   A       www     your-server-ip       ✅ Proxied
   A       api     your-server-ip       ✅ Proxied
   ```

3. **Configurar SSL/TLS**
   - SSL/TLS → Overview → Full (strict)
   - Edge Certificates → Always Use HTTPS: ON
   - Edge Certificates → Automatic HTTPS Rewrites: ON

### SSL con Let's Encrypt (si no usas Cloudflare)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificados
sudo certbot --nginx -d your-domain.com -d www.your-domain.com -d api.your-domain.com

# Auto-renovación (crontab)
sudo certbot renew --dry-run
```

---

## 📊 Monitoreo y Logs

### PM2 Monitoring

```bash
# Ver logs en tiempo real
pm2 logs

# Monitorear recursos
pm2 monit

# Dashboard web
pm2 plus
```

### Sentry para Error Tracking

```bash
npm install @sentry/node
```

```typescript
// backend/src/main.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### Logging con Winston

```bash
npm install winston
```

```typescript
// backend/src/config/logger.config.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});
```

---

## 💾 Backup y Recuperación

### Backup Automático de PostgreSQL

```bash
# Crear script de backup
cat > ~/backup-db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/appuser/backups"
mkdir -p $BACKUP_DIR

# Backup de PostgreSQL
docker exec social-network-postgres-prod pg_dump -U postgres social_network | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Mantener solo últimos 7 días
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete

# Upload a S3 (opcional)
aws s3 cp $BACKUP_DIR/db_$DATE.sql.gz s3://your-backup-bucket/
EOF

chmod +x ~/backup-db.sh

# Agregar a crontab (ejecutar diario a las 2 AM)
crontab -e
# Agregar línea:
0 2 * * * /home/appuser/backup-db.sh
```

### Restaurar Backup

```bash
# Descomprimir
gunzip db_20231021_020000.sql.gz

# Restaurar
docker exec -i social-network-postgres-prod psql -U postgres social_network < db_20231021_020000.sql
```

---

## ✅ Checklist de Despliegue

### Antes del Despliegue

- [ ] Todas las variables de entorno configuradas
- [ ] Secretos JWT generados aleatoriamente
- [ ] Base de datos de producción creada
- [ ] Redis de producción configurado
- [ ] Almacenamiento externo configurado (S3/Cloudinary)
- [ ] Dominio configurado y DNS apuntando
- [ ] SSL/TLS configurado
- [ ] Firewall configurado

### Durante el Despliegue

- [ ] Backend compilado y ejecutándose
- [ ] Frontend compilado y servido
- [ ] Nginx configurado correctamente
- [ ] PM2 iniciado con auto-restart
- [ ] WebSocket funcionando
- [ ] CORS configurado correctamente

### Después del Despliegue

- [ ] Verificar endpoints API
- [ ] Verificar frontend carga correctamente
- [ ] Verificar login/registro
- [ ] Verificar upload de imágenes
- [ ] Verificar WebSocket (notificaciones)
- [ ] Verificar logs sin errores
- [ ] Configurar monitoreo
- [ ] Configurar backups automáticos
- [ ] Documentar credenciales en lugar seguro

---

## 🔧 Troubleshooting en Producción

### Backend no inicia

```bash
# Ver logs
pm2 logs

# Verificar variables de entorno
pm2 env 0

# Verificar conexión a DB
docker exec -it postgres psql -U postgres -c "SELECT 1"
```

### Frontend muestra pantalla blanca

```bash
# Ver logs de Nginx
sudo tail -f /var/log/nginx/error.log

# Verificar que los archivos se sirvieron correctamente
ls -la /home/appuser/social-network/frontend/dist/frontend/browser/
```

### WebSocket no conecta

- Verificar que Nginx tenga configuración de upgrade headers
- Verificar CORS en backend
- Verificar URL de WebSocket en frontend environment

### Base de datos lenta

```bash
# Ver queries lentas
docker exec -it postgres psql -U postgres -d social_network
SELECT * FROM pg_stat_activity WHERE state = 'active';

# Crear índices si falta
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
```

---

## 📈 Escalabilidad

### Horizontal Scaling

```bash
# PM2 Cluster Mode (múltiples instancias)
pm2 start ecosystem.config.js -i max  # max = número de CPUs

# Load Balancer con Nginx
upstream backend {
  server localhost:3000;
  server localhost:3001;
  server localhost:3002;
}
```

### Vertical Scaling

- Aumentar RAM del servidor
- Aumentar CPU cores
- Aumentar almacenamiento SSD

### Database Scaling

- Read replicas para queries de lectura
- Connection pooling
- Índices optimizados
- Query caching con Redis

---

## 🎯 Optimizaciones de Performance

### Backend

1. **Compresión HTTP**
   ```typescript
   import compression from 'compression';
   app.use(compression());
   ```

2. **Rate Limiting**
   ```bash
   npm install @nestjs/throttler
   ```

3. **Cache con Redis**
   ```typescript
   @UseInterceptors(CacheInterceptor)
   @CacheTTL(300) // 5 minutos
   ```

### Frontend

1. **Lazy Loading**
   - Ya implementado con rutas lazy

2. **Service Worker PWA**
   ```bash
   ng add @angular/pwa
   ```

3. **CDN para Assets**
   - Usar Cloudflare CDN
   - Servir imágenes desde S3 con CloudFront

---

## 💡 Tips Finales

1. **Nunca** commitear archivos `.env`
2. **Siempre** usar HTTPS en producción
3. **Implementar** rate limiting para prevenir abuse
4. **Monitorear** logs y métricas constantemente
5. **Hacer** backups regulares de la base de datos
6. **Usar** un servicio de monitoreo (UptimeRobot, Pingdom)
7. **Implementar** CI/CD para deploys automáticos (GitHub Actions)
8. **Documentar** todo el proceso de deployment
9. **Tener** un plan de rollback
10. **Probar** en staging antes de producción

---

## 📞 Soporte

¿Problemas con el despliegue?

- 📧 Email: support@your-domain.com
- 💬 Discord: [Tu servidor de Discord]
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/social-network/issues)

---

**¡Buena suerte con tu despliegue! 🚀**

Si tienes éxito, no olvides compartir tu proyecto y dar crédito. ⭐
