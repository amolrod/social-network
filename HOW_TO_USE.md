# 🎯 CÓMO USAR LA APLICACIÓN - Guía Visual

## 📋 Checklist de Inicio

Antes de empezar a programar, verifica que TODO esté funcionando:

```bash
# 1. ✅ Docker corriendo
docker compose ps

# Deberías ver:
# ✅ social-network-postgres   Up (healthy)
# ✅ social-network-redis      Up (healthy)  
# ✅ social-network-pgadmin    Up

# 2. ✅ Backend corriendo
curl http://localhost:3000/api/v1

# Deberías ver:
# {"success":true,"data":"Hello World!","timestamp":"..."}

# 3. ✅ Frontend (si lo iniciaste)
# Abrir: http://localhost:4200
```

---

## 🖥️ TERMINALES RECOMENDADAS

Te recomiendo tener **3 terminales abiertas**:

### Terminal 1: Docker
```bash
cd /Users/angel/Desktop/Angular/social-network

# Ver logs en tiempo real
docker compose logs -f

# O simplemente dejar corriendo:
docker compose ps
```

### Terminal 2: Backend
```bash
cd /Users/angel/Desktop/Angular/social-network/backend

# Iniciar en modo desarrollo (hot reload)
npm run start:dev

# Deberías ver:
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

---

**¡Estás listo para desarrollar!** 🚀

Ahora puedes continuar con la **FASE 3: Backend Development** donde implementaremos:
- Entidades de base de datos
- Sistema de autenticación
- Endpoints REST
- Tests
