# 📦 Guía de Instalación - Social Network# 🚀 Guía de Instalación - PostgreSQL y Redis (macOS)



Esta guía te llevará paso a paso por la instalación completa del proyecto en tu máquina local.## Problema Detectado

- El backend no puede conectarse a PostgreSQL

## 📋 Tabla de Contenidos- Docker tiene conflicto de puertos



- [Requisitos Previos](#requisitos-previos)## ✅ SOLUCIÓN: Instalar PostgreSQL y Redis con Homebrew

- [Instalación Paso a Paso](#instalación-paso-a-paso)

- [Verificación](#verificación)### Paso 1: Instalar Homebrew (si no lo tienes)

- [Troubleshooting](#troubleshooting)```bash

- [Siguientes Pasos](#siguientes-pasos)/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

```

---

### Paso 2: Instalar PostgreSQL

## 🔧 Requisitos Previos```bash

# Instalar PostgreSQL

Antes de comenzar, asegúrate de tener instalado:brew install postgresql@16



### Software Requerido# Iniciar el servicio

brew services start postgresql@16

| Software | Versión Mínima | Verificación | Descarga |

|----------|----------------|--------------|----------|# Verificar que está corriendo

| **Node.js** | 20.x | `node --version` | [nodejs.org](https://nodejs.org/) |brew services list | grep postgresql

| **npm** | 9.x | `npm --version` | (Incluido con Node.js) |```

| **Docker Desktop** | 24.x | `docker --version` | [docker.com](https://www.docker.com/products/docker-desktop) |

| **Docker Compose** | 2.x | `docker-compose --version` | (Incluido con Docker Desktop) |### Paso 3: Crear la base de datos

| **Git** | 2.x | `git --version` | [git-scm.com](https://git-scm.com/) |```bash

# Crear el usuario y base de datos

### Verificar Instalacióncreatedb social_network



```bash# Opcional: Crear usuario específico

# Node.js# psql postgres

node --version# CREATE USER postgres WITH PASSWORD 'postgres';

# Debería mostrar: v20.x.x o superior# GRANT ALL PRIVILEGES ON DATABASE social_network TO postgres;

```

# npm

npm --version### Paso 4: Instalar Redis

# Debería mostrar: 9.x.x o superior```bash

# Instalar Redis

# Dockerbrew install redis

docker --version

# Debería mostrar: Docker version 24.x.x o superior# Iniciar el servicio

brew services start redis

# Docker Compose

docker-compose --version# Verificar que está corriendo

# Debería mostrar: Docker Compose version 2.x.x o superiorredis-cli ping

# Debe responder: PONG

# Git```

git --version

# Debería mostrar: git version 2.x.x o superior### Paso 5: Verificar que todo está corriendo

``````bash

# Ver servicios de Homebrew

### Espacio en Discobrew services list



- **Mínimo:** 5GB libres# Debería mostrar:

- **Recomendado:** 10GB libres# postgresql@16  started

# redis          started

### Puertos Disponibles```



Los siguientes puertos deben estar libres:---



- **3000** - Backend API (NestJS)## 🔧 OPCIÓN ALTERNATIVA: Docker con puertos diferentes

- **4200** - Frontend (Angular)

- **5433** - PostgreSQLSi prefieres usar Docker pero tienes conflicto de puertos:

- **6380** - Redis

- **5051** - PgAdmin### Editar docker-compose.yml

Cambiar los puertos a:

```bash```yaml

# Verificar puertos en uso (macOS/Linux)postgres:

lsof -i :3000  ports:

lsof -i :4200    - '5433:5432'  # Puerto externo 5433 en lugar de 5432

lsof -i :5433

lsof -i :6380redis:

lsof -i :5051  ports:

    - '6380:6379'  # Puerto externo 6380 en lugar de 6379

# Si algún puerto está ocupado, matar el proceso:

lsof -ti:3000 | xargs kill -9pgadmin:

```  ports:

    - '5051:80'    # Puerto externo 5051 en lugar de 5050

---```



## 🚀 Instalación Paso a Paso### Actualizar .env

```bash

### Paso 1: Clonar el RepositorioDB_PORT=5433

REDIS_PORT=6380

```bash```

# Clonar con HTTPS

git clone https://github.com/yourusername/social-network.git---



# O con SSH (si tienes clave SSH configurada)## 🧪 Verificar Conexión

git clone git@github.com:yourusername/social-network.git

### PostgreSQL

# Entrar al directorio```bash

cd social-network# Con psql (si lo instalaste)

psql -h localhost -U postgres -d social_network

# Verificar que estás en la carpeta correcta

ls -la# O verificar si el puerto está escuchando

# Deberías ver: backend/, frontend/, docker-compose.yml, README.md, etc.lsof -i :5432

``````



### Paso 2: Iniciar Servicios Docker (PostgreSQL + Redis)### Redis

```bash

```bashredis-cli ping

# Iniciar Docker Desktop primero (si no está corriendo)# Respuesta esperada: PONG

# macOS: Abrir Docker Desktop desde Applications```

# Windows: Abrir Docker Desktop desde el menú inicio

# Linux: sudo systemctl start docker---



# Iniciar servicios en background## ⚡ Comandos Rápidos

docker-compose up -d

### Iniciar servicios

# Ver el estado de los servicios```bash

docker-compose psbrew services start postgresql@16

brew services start redis

# Deberías ver algo como:```

# NAME                        STATUS              PORTS

# social-network-postgres     Up (healthy)        0.0.0.0:5433->5432/tcp### Detener servicios

# social-network-redis        Up (healthy)        0.0.0.0:6380->6379/tcp```bash

# social-network-pgadmin      Up                  0.0.0.0:5051->80/tcpbrew services stop postgresql@16

```brew services stop redis

```

**Importante:** Espera a que el status de postgres sea `(healthy)` antes de continuar. Puede tomar 10-30 segundos.

### Reiniciar servicios

```bash```bash

# Ver logs de los servicios (opcional)brew services restart postgresql@16

docker-compose logs -fbrew services restart redis

```

# Presiona Ctrl+C para salir de los logs

```---



#### Solución de Problemas Docker## 🆘 Solución de Problemas



Si Docker no inicia:### Error: "password authentication failed"

El usuario actual de tu Mac ya tiene acceso a PostgreSQL sin contraseña.

```bash

# Opción 1: Reiniciar Docker Desktop**Solución:** Actualizar `.env` del backend:

# Cerrar y abrir la aplicación```bash

DB_USERNAME=tu_usuario_mac  # Por ejemplo: angel

# Opción 2: Limpiar Docker y reiniciarDB_PASSWORD=              # Dejar vacío

docker system prune -a --volumes```

docker-compose up -d

O usar el usuario actual:

# Opción 3: Verificar que Docker tenga suficientes recursos```bash

# Docker Desktop → Preferences → ResourcesDB_USERNAME=$USER

# Recomendado: 4GB RAM, 2 CPUs```

```

### Error: "role 'postgres' does not exist"

### Paso 3: Configurar Backend (NestJS)```bash

createuser -s postgres

```bash```

# Entrar al directorio backend

cd backend### Error: "database 'social_network' does not exist"

```bash

# Instalar dependenciascreatedb social_network

npm install```



# Esto puede tomar 2-5 minutos dependiendo de tu conexión---

# Deberías ver: added XXX packages in XXs

## 📚 Siguiente Paso

# Copiar archivo de variables de entorno

cp .env.example .envUna vez que PostgreSQL y Redis estén corriendo:



# Verificar que el archivo .env existe```bash

ls -la .env# En el directorio backend

```cd backend

npm run start:dev

#### Configurar Variables de Entorno```



El archivo `.env` ya tiene las configuraciones correctas para desarrollo local:Deberías ver:

```

```env🚀 Application is running on: http://localhost:3000/api/v1

# App```

PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5433
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=social_network

# Redis
REDIS_HOST=localhost
REDIS_PORT=6380

# JWT (estos valores son solo para desarrollo)
JWT_SECRET=development-secret-key-change-in-production
JWT_REFRESH_SECRET=development-refresh-secret-key-change-in-production
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880  # 5MB

# CORS
FRONTEND_URL=http://localhost:4200
```

**Nota:** Estos valores son correctos para desarrollo local. No necesitas cambiar nada.

#### Iniciar Backend

```bash
# Iniciar en modo desarrollo (con hot reload)
npm run start:dev

# Espera a ver estos mensajes:
# ✓ [NestFactory] Starting Nest application...
# ✓ [InstanceLoader] AppModule dependencies initialized
# ✓ [RoutesResolver] UsersController {/api/v1/users}:
# ✓ [RoutesResolver] PostsController {/api/v1/posts}:
# ✓ [NestApplication] Nest application successfully started
# ✓ [WebSocketGateway] WebSocket server started on port 3000
# 🚀 Application is running on: http://localhost:3000/api/v1
```

**Deja esta terminal abierta.** El backend estará corriendo y recargándose automáticamente cuando hagas cambios.

### Paso 4: Configurar Frontend (Angular)

**Abre una NUEVA terminal** (deja la del backend corriendo)

```bash
# Desde la raíz del proyecto
cd frontend

# Instalar dependencias
npm install

# Esto puede tomar 2-5 minutos
# Deberías ver: added XXX packages in XXs
```

#### Verificar Variables de Entorno

El archivo `src/environments/environment.ts` ya está configurado:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/v1',
  wsUrl: 'http://localhost:3000',
};
```

**No necesitas cambiar nada.**

#### Iniciar Frontend

```bash
# Iniciar servidor de desarrollo
npm start

# O alternativamente:
npm run start

# Espera a ver:
# ✔ Browser application bundle generation complete.
# ** Angular Live Development Server is listening on localhost:4200 **
```

El navegador debería abrirse automáticamente en `http://localhost:4200`. Si no se abre, ábrelo manualmente.

**Deja esta terminal abierta también.** El frontend estará corriendo y recargándose automáticamente.

---

## ✅ Verificación

### 1. Verificar Docker

```bash
# En una nueva terminal
docker-compose ps

# Todos los servicios deberían estar "Up" y postgres "healthy"
```

### 2. Verificar Backend

```bash
# Prueba el endpoint de health check
curl http://localhost:3000/api/v1

# Deberías recibir:
# {"success":true,"data":"Hello World!","timestamp":"2025-10-21T..."}
```

O abre en el navegador: http://localhost:3000/api/v1

### 3. Verificar Frontend

Abre el navegador en: http://localhost:4200

Deberías ver:
- ✅ Página de Login/Registro
- ✅ Sin errores en la consola del navegador (F12 → Console)
- ✅ Estilos cargados correctamente

### 4. Verificar Base de Datos (Opcional)

#### Opción A: PgAdmin (Interfaz Gráfica)

1. Abrir http://localhost:5051
2. Login:
   - Email: `admin@admin.com`
   - Password: `admin`
3. Click derecho en "Servers" → Register → Server
4. Configurar:
   - **General Tab:**
     - Name: `Social Network`
   - **Connection Tab:**
     - Host: `postgres` (nombre del contenedor)
     - Port: `5432` (puerto interno)
     - Username: `postgres`
     - Password: `postgres`
     - Database: `social_network`
5. Click "Save"
6. Expandir: Servers → Social Network → Databases → social_network → Schemas → public → Tables
7. Deberías ver las tablas: users, posts, comments, likes, follows, messages, notifications

#### Opción B: CLI

```bash
# Conectarse a PostgreSQL
docker exec -it social-network-postgres psql -U postgres -d social_network

# Ver tablas
\dt

# Deberías ver:
# users, posts, comments, likes, follows, messages, notifications

# Salir
\q
```

### 5. Prueba End-to-End

1. **Registro:**
   - En http://localhost:4200
   - Click "Registrarse"
   - Llenar formulario:
     - Username: `testuser`
     - Email: `test@example.com`
     - Full Name: `Test User`
     - Password: `Password123!`
   - Click "Registrarse"
   - ✅ Deberías ser redirigido al feed

2. **Crear Post:**
   - Click en "+" o "Crear Post"
   - Escribir: "Mi primer post!"
   - Click "Publicar"
   - ✅ El post debería aparecer en el feed

3. **WebSocket (Opcional):**
   - Abre la consola del navegador (F12)
   - Deberías ver: `🔌 WebSocket conectado`
   - Si creas otro usuario y das like, deberías ver notificaciones en tiempo real

---

## 🔧 Troubleshooting

### Problema: Puerto ya en uso

**Error:** `Port 3000 is already in use` o `Port 4200 is already in use`

**Solución:**

```bash
# Encontrar y matar proceso en puerto 3000
lsof -ti:3000 | xargs kill -9

# Encontrar y matar proceso en puerto 4200
lsof -ti:4200 | xargs kill -9

# Reiniciar el servicio
npm run start:dev  # (backend)
npm start          # (frontend)
```

### Problema: Docker no inicia

**Error:** `Cannot connect to Docker daemon`

**Solución:**

```bash
# macOS: Abrir Docker Desktop
open -a Docker

# Linux: Iniciar servicio
sudo systemctl start docker

# Windows: Abrir Docker Desktop desde menú inicio
```

### Problema: Base de datos no conecta

**Error:** `Unable to connect to the database`

**Solución:**

```bash
# Reiniciar PostgreSQL
docker-compose restart postgres

# Ver logs
docker-compose logs -f postgres

# Si persiste, recrear contenedores
docker-compose down
docker-compose up -d
```

### Problema: npm install falla

**Error:** `npm ERR! ...`

**Solución:**

```bash
# Limpiar caché de npm
npm cache clean --force

# Eliminar node_modules y package-lock.json
rm -rf node_modules package-lock.json

# Reinstalar
npm install

# Si persiste, verificar versión de Node.js
node --version  # Debe ser 20.x o superior
```

### Problema: Frontend no carga estilos

**Solución:**

```bash
# Limpiar caché de Angular
rm -rf .angular

# Reiniciar servidor
npm start
```

### Problema: Errores de TypeScript

**Error:** `TS2304: Cannot find name...`

**Solución:**

```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install

# Verificar tsconfig.json existe
ls tsconfig.json
```

### Problema: WebSocket no conecta

**Solución:**

1. Verificar que backend esté corriendo
2. Ver logs del backend - debería decir "WebSocket server started"
3. Verificar en DevTools → Network → WS
4. Debería haber una conexión a `ws://localhost:3000`

---

## 🎉 ¡Instalación Completada!

Si llegaste hasta aquí sin errores, ¡felicitaciones! 🎊

### Estado Final

Deberías tener:
- ✅ 3 terminales abiertas:
  1. Docker Compose (opcional, puede ser en background)
  2. Backend corriendo en http://localhost:3000
  3. Frontend corriendo en http://localhost:4200
- ✅ Base de datos PostgreSQL funcionando
- ✅ Redis funcionando
- ✅ Aplicación accesible en el navegador
- ✅ WebSocket conectado

### Siguientes Pasos

1. **Lee la documentación:**
   - [Guía de Uso](./HOW_TO_USE.md) - Cómo usar la aplicación
   - [README Principal](./README.md) - Información general

2. **Explora la aplicación:**
   - Crea usuarios
   - Publica contenido
   - Prueba las notificaciones en tiempo real
   - Envía mensajes

3. **Despliegue (cuando estés listo):**
   - [Guía de Despliegue](./DEPLOYMENT_GUIDE.md) - Cómo poner la app en producción

---

## 📞 Soporte

¿Problemas con la instalación?

1. **Revisa los logs:** 99% de los errores se explican en los logs
2. **Busca en Issues:** https://github.com/yourusername/social-network/issues
3. **Crea un Issue:** Si no encuentras solución
4. **Discord/Comunidad:** Únete a la comunidad (si existe)

---

## 📝 Checklist de Instalación

- [ ] Node.js 20+ instalado
- [ ] npm 9+ instalado
- [ ] Docker Desktop instalado y corriendo
- [ ] Git instalado
- [ ] Puertos 3000, 4200, 5433, 6380, 5051 libres
- [ ] Repositorio clonado
- [ ] Docker Compose iniciado (postgres healthy)
- [ ] Backend: dependencias instaladas (`npm install`)
- [ ] Backend: archivo `.env` creado
- [ ] Backend: servidor corriendo (`npm run start:dev`)
- [ ] Frontend: dependencias instaladas (`npm install`)
- [ ] Frontend: servidor corriendo (`npm start`)
- [ ] Verificación: Backend responde en http://localhost:3000/api/v1
- [ ] Verificación: Frontend carga en http://localhost:4200
- [ ] Verificación: Registro de usuario funciona
- [ ] Verificación: Creación de post funciona

---

**¡Bienvenido a Social Network! 🚀**

Happy coding! 💻✨
