# 🎯 Guía de Uso - Social Network

Esta guía te ayudará a usar la aplicación en modo desarrollo.

## 📋 Tabla de Contenidos

- [Inicio Rápido](#inicio-rápido)
- [Terminales Recomendadas](#terminales-recomendadas)
- [Uso de la Aplicación](#uso-de-la-aplicación)
- [Testing Manual](#testing-manual)
- [Comandos Útiles](#comandos-útiles)
- [Troubleshooting](#troubleshooting)

---

## � Inicio Rápido

### Checklist de Inicio

Antes de empezar, verifica que TODO esté funcionando:

```bash
# 1. ✅ Docker corriendo
docker-compose ps

# Deberías ver:
# ✅ social-network-postgres   Up (healthy)
# ✅ social-network-redis      Up (healthy)  
# ✅ social-network-pgadmin    Up

# 2. ✅ Backend corriendo
curl http://localhost:3000/api/v1

# Deberías ver:
# {"success":true,"data":"Hello World!","timestamp":"..."}

# 3. ✅ Frontend corriendo
# Abrir: http://localhost:4200
# Deberías ver la página de login/registro
```

### Comandos de Inicio

```bash
# En 3 terminales diferentes:

# Terminal 1: Docker
cd /Users/angel/Desktop/Angular/social-network
docker-compose up

# Terminal 2: Backend
cd /Users/angel/Desktop/Angular/social-network/backend
npm run start:dev

# Terminal 3: Frontend
cd /Users/angel/Desktop/Angular/social-network/frontend
npm start
```

---

## 🖥️ Terminales Recomendadas

Te recomiendo tener **3 terminales abiertas**:

### Terminal 1: Docker Services

```bash
cd /Users/angel/Desktop/Angular/social-network

# Ver logs en tiempo real
docker-compose logs -f

# O simplemente ver el estado
docker-compose ps

# Ver logs de un servicio específico
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Terminal 2: Backend (NestJS)

```bash
cd /Users/angel/Desktop/Angular/social-network/backend

# Iniciar en modo desarrollo (hot reload)
npm run start:dev

# Deberías ver:
# [Nest] LOG [NestFactory] Starting Nest application...
# [Nest] LOG [InstanceLoader] AppModule dependencies initialized
# [Nest] LOG Application is running on: http://localhost:3000
```

**Logs importantes:**
- ✅ `Application is running on: http://localhost:3000` - Backend iniciado
- ✅ `Database connected successfully` - PostgreSQL conectado
- ✅ `Redis client ready` - Redis conectado
- ✅ `WebSocket server started` - WebSocket activo

### Terminal 3: Frontend (Angular)

```bash
cd /Users/angel/Desktop/Angular/social-network/frontend

# Iniciar servidor de desarrollo
npm start

# Deberías ver:
# ✔ Browser application bundle generation complete.
# ✔ Browser application bundle generation complete.
# ** Angular Live Development Server is listening on localhost:4200 **
```

**URLs:**
- Frontend: http://localhost:4200
- Backend API: http://localhost:3000/api/v1
- PgAdmin: http://localhost:5051

---

## 🎮 Uso de la Aplicación

### 1. Registro de Usuario

1. Abrir http://localhost:4200
2. Click en "Registrarse"
3. Llenar formulario:
   - Username: `usuario1`
   - Email: `usuario1@example.com`
   - Full Name: `Usuario Uno`
   - Password: `Password123!`
4. Click en "Registrarse"

### 2. Login

1. En la página de login
2. Ingresar credenciales:
   - Email: `usuario1@example.com`
   - Password: `Password123!`
3. Click en "Iniciar Sesión"
4. Serás redirigido al feed

### 3. Crear una Publicación

1. En el feed, click en el botón "+" o "Crear Post"
2. Escribir contenido: "Mi primera publicación"
3. (Opcional) Subir una imagen
4. Click en "Publicar"
5. La publicación aparecerá en el feed

### 4. Interactuar con Publicaciones

**Dar Like:**
- Click en el ícono de corazón ❤️
- Se pondrá rojo y el contador aumentará
- El autor recibirá una notificación en tiempo real

**Comentar:**
- Click en "Comentar" o el ícono de comentario 💬
- Escribir comentario
- Presionar Enter o click en enviar
- El autor recibirá una notificación

**Responder a un comentario:**
- Hover sobre un comentario
- Click en "Responder"
- Escribir respuesta

### 5. Buscar Usuarios

1. Click en el ícono de búsqueda 🔍
2. Escribir nombre o username
3. Ver resultados en tabs:
   - Todos
   - Usuarios
   - Publicaciones

### 6. Seguir a un Usuario

1. Buscar un usuario o ver su perfil
2. Click en "Seguir"
3. El botón cambiará a "Siguiendo"
4. El usuario recibirá una notificación

### 7. Enviar Mensaje Directo

**Opción A: Desde el perfil**
1. Ir al perfil de un usuario
2. Click en "Mensaje"
3. Se abrirá la ventana de chat
4. Escribir y enviar mensaje

**Opción B: Desde mensajes**
1. Click en el ícono de mensajes 💬
2. Click en "Nueva conversación"
3. Seleccionar usuario
4. Escribir y enviar

### 8. Ver Notificaciones

1. Click en el ícono de campana 🔔
2. Ver lista de notificaciones:
   - Likes en tus posts
   - Comentarios
   - Nuevos seguidores
3. Click en una notificación para ir al contenido
4. Se marcará como leída automáticamente

### 9. Editar Perfil

1. Ir a tu perfil (click en avatar o username)
2. Click en "Editar Perfil"
3. Cambiar:
   - Avatar (subir nueva imagen)
   - Bio
   - Ubicación
   - Nombre completo
4. Click en "Guardar"

### 10. Notificaciones en Tiempo Real ⭐

**WebSocket funcionando:**
- Abre dos navegadores con usuarios diferentes
- Usuario A da like a un post de Usuario B
- Usuario B verá:
  - Badge de notificaciones aumentar instantáneamente 🔴
  - Notificación aparecer en el centro de notificaciones
  - Sin necesidad de recargar la página

**Tipos de notificaciones en tiempo real:**
- 💗 **Like:** Alguien da like a tu post
- 💬 **Comentario:** Alguien comenta en tu post
- 👤 **Follow:** Alguien te sigue
- 📩 **Mensaje:** Recibes un mensaje nuevo

---

## 🧪 Testing Manual

### Test 1: Sistema de Autenticación

```bash
# Registro
POST http://localhost:3000/api/v1/auth/register
{
  "username": "testuser",
  "email": "test@example.com",
  "fullName": "Test User",
  "password": "Password123!"
}

# Login
POST http://localhost:3000/api/v1/auth/login
{
  "email": "test@example.com",
  "password": "Password123!"
}

# Respuesta esperada: access_token y refresh_token
```

### Test 2: CRUD de Posts

```bash
# Obtener token del login anterior

# Crear post
POST http://localhost:3000/api/v1/posts
Headers: Authorization: Bearer {token}
{
  "content": "Test post",
  "imageUrl": "https://example.com/image.jpg"
}

# Obtener feed
GET http://localhost:3000/api/v1/posts?page=1&limit=20
Headers: Authorization: Bearer {token}

# Dar like
POST http://localhost:3000/api/v1/likes/{postId}
Headers: Authorization: Bearer {token}
```

### Test 3: WebSocket

```bash
# En la consola del navegador (Developer Tools):

// Verificar conexión
console.log('WebSocket conectado:', webSocketService.isConnected());

// Escuchar eventos
webSocketService.events$.subscribe(event => {
  console.log('Evento recibido:', event);
});

// Deberías ver eventos cuando:
// - Alguien da like a tu post
// - Alguien comenta en tu post
// - Alguien te sigue
// - Recibes un mensaje
```

### Test 4: Mensajería

1. **Usuario A** envía mensaje a **Usuario B**
2. **Usuario B** debería ver:
   - Badge de mensajes incrementar 🔴
   - Nueva conversación aparecer
3. **Usuario B** responde
4. **Usuario A** ve respuesta instantáneamente

### Test 5: Performance

```bash
# Lighthouse en Chrome DevTools
1. Abrir DevTools (F12)
2. Tab "Lighthouse"
3. Seleccionar "Performance"
4. Click en "Analyze page load"

# Métricas esperadas:
# - First Contentful Paint: < 1.5s
# - Largest Contentful Paint: < 2.5s
# - Total Blocking Time: < 200ms
# - Cumulative Layout Shift: < 0.1
```

---

## 💻 Comandos Útiles

### Docker

```bash
# Iniciar servicios
docker-compose up

# Iniciar en background
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down

# Reiniciar un servicio
docker-compose restart postgres

# Ver estado
docker-compose ps

# Entrar a un contenedor
docker exec -it social-network-postgres bash

# Ver logs de un servicio específico
docker-compose logs -f backend
```

### Backend

```bash
# Desarrollo con hot reload
npm run start:dev

# Debug mode
npm run start:debug

# Build para producción
npm run build

# Tests
npm run test
npm run test:e2e
npm run test:cov

# Linting
npm run lint
npm run format

# Migraciones
npm run migration:generate -- -n MigrationName
npm run migration:run
npm run migration:revert
```

### Frontend

```bash
# Desarrollo
npm start

# Build para producción
npm run build

# Build con SSR
npm run build:ssr

# Servir SSR
npm run serve:ssr

# Tests
npm run test
npm run test:headless
npm run test:coverage

# Linting
npm run lint
npm run lint:fix

# Analizar bundle size
npm run build -- --stats-json
npx webpack-bundle-analyzer dist/frontend/stats.json
```

### Base de Datos

```bash
# Conectarse a PostgreSQL
docker exec -it social-network-postgres psql -U postgres -d social_network

# Dentro de psql:
\dt                        # Listar tablas
\d users                   # Describir tabla users
SELECT * FROM users;       # Query usuarios
SELECT COUNT(*) FROM posts; # Contar posts
\q                         # Salir

# Backup
docker exec social-network-postgres pg_dump -U postgres social_network > backup.sql

# Restore
docker exec -i social-network-postgres psql -U postgres social_network < backup.sql
```

### Git

```bash
# Ver estado
git status

# Agregar cambios
git add .

# Commit
git commit -m "feat: add new feature"

# Push
git push origin main

# Pull
git pull origin main

# Ver ramas
git branch

# Crear rama
git checkout -b feature/new-feature

# Cambiar rama
git checkout main
```

---

## 🔧 Troubleshooting

### Backend no inicia

**Error:** `Port 3000 is already in use`

```bash
# Encontrar proceso usando puerto 3000
lsof -ti:3000

# Matar proceso
lsof -ti:3000 | xargs kill -9

# O cambiar puerto en .env
PORT=3001
```

**Error:** `Unable to connect to the database`

```bash
# Verificar que Docker esté corriendo
docker-compose ps

# Reiniciar postgres
docker-compose restart postgres

# Ver logs de postgres
docker-compose logs -f postgres
```

### Frontend no inicia

**Error:** `Port 4200 is already in use`

```bash
# Matar proceso en puerto 4200
lsof -ti:4200 | xargs kill -9

# O usar otro puerto
ng serve --port 4201
```

**Error:** `Module not found`

```bash
# Limpiar node_modules
rm -rf node_modules package-lock.json

# Reinstalar
npm install

# Limpiar caché de Angular
rm -rf .angular
```

### WebSocket no conecta

**Problema:** Notificaciones en tiempo real no funcionan

```bash
# 1. Verificar que backend tenga WebSocket activo
# Ver logs del backend, deberías ver:
# [NestGateway] WebSocket server started

# 2. Verificar conexión en navegador
# DevTools → Network → WS (WebSocket)
# Deberías ver: ws://localhost:3000/socket.io/...

# 3. Verificar token JWT válido
# DevTools → Application → Local Storage
# Debe haber un token válido
```

### Docker problemas

**Error:** `Cannot connect to Docker daemon`

```bash
# Iniciar Docker Desktop (macOS)
open -a Docker

# O en Linux
sudo systemctl start docker
```

**Error:** `Port already allocated`

```bash
# Cambiar puertos en docker-compose.yml
# Por ejemplo, PostgreSQL:
ports:
  - "5434:5432"  # Cambiar 5433 a 5434
```

### Base de datos corruptos

**Problema:** Datos inconsistentes

```bash
# Opción 1: Limpiar y recrear
docker-compose down -v  # ⚠️ Esto elimina TODOS los datos
docker-compose up -d

# Opción 2: Restaurar desde backup
docker exec -i social-network-postgres psql -U postgres social_network < backup.sql
```

### Imágenes no se suben

**Error:** `File too large` o `Upload failed`

```bash
# Verificar límite de tamaño en .env
MAX_FILE_SIZE=5242880  # 5MB en bytes

# Verificar Nginx límite (si aplica)
# En nginx.conf:
client_max_body_size 10M;
```

### Cache problemas

```bash
# Limpiar caché de Angular
rm -rf frontend/.angular

# Limpiar caché de npm
npm cache clean --force

# Limpiar caché de NestJS
rm -rf backend/dist
```

---

## 📚 Recursos Adicionales

### Documentación

- [README Principal](./README.md) - Información general del proyecto
- [Guía de Instalación](./INSTALLATION_GUIDE.md) - Instalación paso a paso
- [Guía de Despliegue](./DEPLOYMENT_GUIDE.md) - Cómo desplegar en producción
- [Guía de Desarrollo](./DEVELOPMENT_GUIDE.md) - Agregar nuevas funcionalidades

### APIs de Terceros

- **PostgreSQL:** https://www.postgresql.org/docs/
- **Redis:** https://redis.io/docs/
- **NestJS:** https://docs.nestjs.com/
- **Angular:** https://angular.io/docs
- **Socket.io:** https://socket.io/docs/

### Herramientas

- **Postman:** Para probar APIs
- **pgAdmin:** Para gestionar base de datos
- **Redis Commander:** Para ver datos de Redis
- **Insomnia:** Alternativa a Postman

---

## 🎯 Flujo de Trabajo Recomendado

### Desarrollo de Nueva Funcionalidad

1. **Backend primero:**
   ```bash
   # Crear módulo
   cd backend
   nest g module features/nueva-funcionalidad
   nest g service features/nueva-funcionalidad
   nest g controller features/nueva-funcionalidad
   
   # Crear entidad
   # Crear DTOs
   # Implementar lógica
   # Probar con Postman
   ```

2. **Frontend después:**
   ```bash
   # Crear servicio
   cd frontend
   ng g service core/services/nueva-funcionalidad
   
   # Crear componente
   ng g component features/nueva-funcionalidad
   
   # Integrar con backend
   # Probar en navegador
   ```

3. **Testing:**
   ```bash
   # Backend tests
   cd backend
   npm run test
   
   # Frontend tests
   cd frontend
   npm run test
   ```

4. **Commit:**
   ```bash
   git add .
   git commit -m "feat: add nueva funcionalidad"
   git push
   ```

### Debug de Problemas

1. **Ver logs de todos los servicios:**
   ```bash
   docker-compose logs -f
   ```

2. **Backend logs:**
   ```bash
   # En la terminal del backend
   # Ver stack traces completos
   ```

3. **Frontend logs:**
   ```bash
   # DevTools del navegador → Console
   # Ver errores de red → Network tab
   # Ver WebSocket → WS tab
   ```

4. **Database queries:**
   ```bash
   # Habilitar logging en TypeORM
   # En database.config.ts:
   logging: true
   ```

---

## 🎨 Personalización

### Cambiar Tema/Colores

```scss
// frontend/src/styles.scss
$primary-color: #405DE6;  // Cambiar color primario
$secondary-color: #833AB4; // Cambiar color secundario
```

### Cambiar Puerto Backend

```env
# backend/.env
PORT=3001  # Cambiar de 3000 a 3001
```

Actualizar también en frontend:
```typescript
// frontend/src/environments/environment.ts
apiUrl: 'http://localhost:3001/api/v1'
```

### Cambiar Puerto Frontend

```bash
# Opción 1: En el comando
ng serve --port 4201

# Opción 2: En angular.json
"serve": {
  "options": {
    "port": 4201
  }
}
```

---

## ✅ Checklist Diario

Antes de empezar a programar cada día:

- [ ] Docker corriendo (`docker-compose ps`)
- [ ] Backend iniciado (`npm run start:dev`)
- [ ] Frontend iniciado (`npm start`)
- [ ] Base de datos accesible
- [ ] Redis funcionando
- [ ] WebSocket conectado
- [ ] No hay errores en las consolas

---

## 💡 Tips & Trucos

### Desarrollo Rápido

1. **Hot Reload:** Ambos backend y frontend recargan automáticamente
2. **Auto-save en VSCode:** Activa auto-save para ver cambios inmediatos
3. **Multiple cursors:** Alt/Option + Click para editar múltiples líneas
4. **Extensiones útiles:**
   - Angular Language Service
   - ESLint
   - Prettier
   - GitLens
   - REST Client

### Debugging Efectivo

1. **Backend:**
   ```typescript
   console.log('🔍 Debug:', variable);
   console.table(array);
   console.dir(object, { depth: null });
   ```

2. **Frontend:**
   ```typescript
   console.log('🔍 Debug:', variable);
   debugger; // Pausa ejecución
   ```

3. **Chrome DevTools:**
   - Sources → Breakpoints
   - Network → Ver requests
   - Application → Ver localStorage
   - WebSocket → Ver eventos en tiempo real

### Performance

1. **Backend:**
   - Usar índices en base de datos
   - Paginación en queries grandes
   - Caché con Redis para datos frecuentes

2. **Frontend:**
   - Lazy loading de imágenes
   - Virtual scrolling para listas largas
   - OnPush change detection
   - Optimizar bundle size

---

## 🔗 Enlaces Rápidos

| Servicio | URL | Credenciales |
|----------|-----|--------------|
| **Frontend** | http://localhost:4200 | - |
| **Backend API** | http://localhost:3000/api/v1 | - |
| **Swagger Docs** | http://localhost:3000/api | - |
| **PgAdmin** | http://localhost:5051 | admin@admin.com / admin |
| **PostgreSQL** | localhost:5433 | postgres / postgres |
| **Redis** | localhost:6380 | - |

---

## 📞 Soporte

¿Necesitas ayuda?

1. **Revisa la documentación:** Lee los archivos .md
2. **Ver issues:** Busca en GitHub issues si alguien tuvo el mismo problema
3. **Crear issue:** Si no encuentras solución, crea un nuevo issue
4. **Discord/Slack:** Únete a la comunidad (si existe)

---

**¡Happy Coding! 💻✨**

Recuerda: Si algo no funciona, revisa primero los logs. El 90% de los problemas se resuelven viendo los mensajes de error completos.

---

**Última actualización:** 21 de octubre de 2025
# 🚀 Application is running on: http://localhost:3000/api/v1
```

### Terminal 3: Frontend
```bash
cd /Users/angel/Desktop/Angular/social-network/frontend

# Iniciar en modo desarrollo
npm start

# Deberías ver:
# ** Angular Live Development Server is listening on localhost:4200 **
```

---

## 🌐 URLS Y ACCESOS

### 1. Backend API
**URL:** http://localhost:3000/api/v1

**Probar:**
```bash
# Endpoint de prueba
curl http://localhost:3000/api/v1

# Ver en el navegador
open http://localhost:3000/api/v1
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": "Hello World!",
  "timestamp": "2025-10-16T..."
}
```

### 2. Frontend
**URL:** http://localhost:4200

**Abrir:**
```bash
open http://localhost:4200
```

### 3. PgAdmin (Base de Datos Visual)
**URL:** http://localhost:5051

**Login:**
- Email: `admin@admin.com`
- Password: `admin`

**Primera vez conectando a PostgreSQL:**
1. Click derecho en "Servers" → "Register" → "Server..."
2. Tab "General":
   - Name: `Social Network`
3. Tab "Connection":
   - Host: `postgres` (¡importante! no usar "localhost")
   - Port: `5432` (puerto interno)
   - Database: `social_network`
   - Username: `postgres`
   - Password: `postgres`
4. Click "Save"

**Abrir:**
```bash
open http://localhost:5051
```

---

## 🔄 WORKFLOW DIARIO

### Al empezar el día:

```bash
# 1. Ir al directorio del proyecto
cd /Users/angel/Desktop/Angular/social-network

# 2. Iniciar Docker (si no está corriendo)
docker compose up -d

# 3. Verificar que todo está OK
./test-connection.sh

# 4. Iniciar backend (Terminal 1)
cd backend && npm run start:dev

# 5. Iniciar frontend (Terminal 2)
cd frontend && npm start
```

### Al terminar el día:

```bash
# Opcional: Detener Docker para liberar recursos
docker compose stop

# O dejar corriendo (recomendado para desarrollo continuo)
```

---

## 🎨 DESARROLLO

### Backend (NestJS)

**Ubicación:** `/backend/src/`

**Estructura:**
```
backend/src/
├── modules/           # Tus features (auth, users, posts, etc.)
├── common/            # Código compartido
├── config/            # Configuración
└── main.ts            # Entry point
```

**Hot Reload:** ✅ Los cambios se aplican automáticamente

**Ver logs:**
```bash
# Los logs aparecen en la terminal donde corriste npm run start:dev
```

### Frontend (Angular)

**Ubicación:** `/frontend/src/app/`

**Estructura:**
```
frontend/src/app/
├── core/              # Servicios singleton
├── features/          # Features (lazy-loaded)
├── shared/            # Componentes compartidos
├── layout/            # Layout
└── state/             # State management
```

**Hot Reload:** ✅ Los cambios se reflejan automáticamente en http://localhost:4200

**Generar componente:**
```bash
cd frontend
ng generate component features/mi-feature
```

---

## 🗄️ BASE DE DATOS

### Conectarse con PgAdmin
1. Abrir http://localhost:5051
2. Login con `admin@admin.com` / `admin`
3. Navegar a: Servers → Social Network → Databases → social_network

### Conectarse con CLI (Alternativa)
```bash
# Entrar al contenedor de PostgreSQL
docker exec -it social-network-postgres psql -U postgres -d social_network

# Comandos útiles:
\dt              # Ver tablas
\d users         # Ver estructura de tabla users
SELECT * FROM users;  # Ver datos
\q               # Salir
```

### Ver datos en Redis
```bash
# Entrar al contenedor de Redis
docker exec -it social-network-redis redis-cli

# Comandos útiles:
PING             # Verificar conexión
KEYS *           # Ver todas las keys
GET mi_key       # Obtener valor
exit             # Salir
```

---

## 🧪 TESTING

### Backend Tests
```bash
cd backend

# Tests unitarios
npm test

# Tests e2e
npm run test:e2e

# Coverage
npm run test:cov
```

### Frontend Tests
```bash
cd frontend

# Tests unitarios
npm test

# Tests e2e (cuando los implementemos)
npm run e2e
```

---

## 🚨 COMANDOS DE EMERGENCIA

### Backend no responde
```bash
# 1. Verificar que está corriendo
lsof -i :3000

# 2. Matar el proceso si está colgado
pkill -f "nest start"

# 3. Reiniciar
cd backend && npm run start:dev
```

### Docker tiene problemas
```bash
# Reiniciar todo
docker compose restart

# O reiniciar limpio
docker compose down
docker compose up -d
```

### Puerto ocupado
```bash
# Ver qué está usando el puerto
lsof -i :3000    # Backend
lsof -i :4200    # Frontend
lsof -i :5433    # PostgreSQL

# Matar el proceso
kill -9 <PID>
```

### Limpiar todo y empezar de cero
```bash
# 1. Detener y eliminar contenedores
docker compose down -v

# 2. Limpiar node_modules (opcional)
cd backend && rm -rf node_modules && npm install
cd ../frontend && rm -rf node_modules && npm install

# 3. Reiniciar
docker compose up -d
cd backend && npm run start:dev
cd frontend && npm start
```

---

## 📊 MONITOREO

### Ver recursos de Docker
```bash
docker stats
```

### Ver logs en tiempo real
```bash
# Todos los servicios
docker compose logs -f

# Solo PostgreSQL
docker compose logs -f postgres

# Solo Redis
docker compose logs -f redis
```

---

## 💡 TIPS PRO

1. **Usa alias** para comandos frecuentes:
```bash
# Agregar al ~/.zshrc
alias sn-start='cd ~/Desktop/Angular/social-network && docker compose up -d'
alias sn-stop='cd ~/Desktop/Angular/social-network && docker compose stop'
alias sn-logs='cd ~/Desktop/Angular/social-network && docker compose logs -f'
alias sn-backend='cd ~/Desktop/Angular/social-network/backend && npm run start:dev'
alias sn-frontend='cd ~/Desktop/Angular/social-network/frontend && npm start'
```

2. **Usa VS Code con múltiples terminales**:
   - Terminal 1: Backend
   - Terminal 2: Frontend
   - Terminal 3: Git/Docker

3. **Extensiones recomendadas de VS Code**:
   - Angular Language Service
   - ESLint
   - Prettier
   - Docker
   - PostgreSQL (cweijan.vscode-postgresql-client2)

---

## 🎓 RECURSOS

- **NestJS Docs:** https://docs.nestjs.com
- **Angular Docs:** https://angular.dev
- **TypeORM Docs:** https://typeorm.io
- **PostgreSQL Docs:** https://www.postgresql.org/docs

----

**¡Estás listo para desarrollar!** 🚀

Ahora puedes continuar con la **FASE 3: Backend Development** donde implementaremos:
- Entidades de base de datos
- Sistema de autenticación
- Endpoints REST
- Tests
