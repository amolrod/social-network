# 🚀 Social Network - Full Stack Application

Una red social moderna y completa construida con **Angular 18** y **NestJS**, siguiendo Clean Architecture y las mejores prácticas del mercado.

## 📋 Stack Tecnológico

### Frontend
- **Angular 18** con Standalone Components
- **Angular Material** para UI/UX
- **Signals** para state management
- **RxJS** para programación reactiva
- **Socket.io Client** para real-time
- **SCSS** para estilos

### Backend
- **NestJS** (Node.js framework)
- **PostgreSQL** como base de datos principal
- **Redis** para caché y sesiones
- **TypeORM** como ORM
- **JWT** para autenticación
- **Socket.io** para WebSockets
- **Helmet** para seguridad

## 🏗️ Arquitectura

```
Clean Architecture + Feature-Sliced Design
├── Presentation Layer (Components, Pages)
├── Application Layer (Services, State)
├── Domain Layer (Models, Business Logic)
└── Infrastructure Layer (API, WebSocket, Storage)
```

## 📁 Estructura del Proyecto

```
social-network/
├── frontend/          # Angular 18 Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/       # Singleton services, guards, interceptors
│   │   │   ├── features/   # Feature modules (lazy-loaded)
│   │   │   ├── shared/     # Reusable components
│   │   │   ├── layout/     # Layout components
│   │   │   └── state/      # Global state (Signals)
│   │   └── environments/
│   └── package.json
│
├── backend/           # NestJS API
│   ├── src/
│   │   ├── modules/        # Feature modules
│   │   ├── common/         # Shared utilities
│   │   ├── config/         # Configuration files
│   │   ├── database/       # DB migrations
│   │   └── gateway/        # WebSocket gateway
│   └── package.json
│
└── docker-compose.yml # Docker setup (PostgreSQL + Redis)
```

## 🚀 Comenzando

### Prerequisitos

- **Node.js** 18+ ([Descargar](https://nodejs.org/))
- **npm** 9+ (viene con Node.js)
- **Docker** y **Docker Compose** ([Descargar](https://www.docker.com/))
- **Git** ([Descargar](https://git-scm.com/))

### Instalación

#### 1. Iniciar la base de datos (PostgreSQL + Redis)

```bash
# En el directorio raíz del proyecto
docker-compose up -d

# Verificar que los contenedores estén corriendo
docker-compose ps
```

Esto iniciará:
- PostgreSQL en `localhost:5433` (puerto 5433 para evitar conflictos)
- Redis en `localhost:6380` (puerto 6380 para evitar conflictos)
- PgAdmin en `localhost:5051` (para gestionar la DB visualmente)

**PgAdmin Credentials:**
- Email: `admin@admin.com`
- Password: `admin`

**PostgreSQL Connection:**
- Host: `localhost`
- Port: `5433` (¡importante!)
- Username: `postgres`
- Password: `postgres`
- Database: `social_network`

#### 2. Configurar el Backend

```bash
cd backend

# Instalar dependencias
npm install

# Copiar el archivo de variables de entorno
cp .env.example .env

# Las variables por defecto ya están configuradas para desarrollo local
# Editar .env si necesitas cambiar algo

# Iniciar el servidor en modo desarrollo
npm run start:dev
```

El backend estará corriendo en `http://localhost:3000/api/v1`

#### 3. Configurar el Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm start
```

El frontend estará corriendo en `http://localhost:4200`

## 📚 Scripts Disponibles

### Backend

```bash
npm run start          # Iniciar en producción
npm run start:dev      # Iniciar en desarrollo (hot-reload)
npm run start:debug    # Iniciar en modo debug
npm run build          # Compilar para producción
npm run test           # Ejecutar tests unitarios
npm run test:e2e       # Ejecutar tests E2E
npm run lint           # Ejecutar linter
```

### Frontend

```bash
npm start              # Iniciar en desarrollo
npm run build          # Compilar para producción
npm run test           # Ejecutar tests unitarios
npm run lint           # Ejecutar linter
```

## 🗄️ Base de Datos

### Esquema Principal

- **users**: Usuarios de la aplicación
- **posts**: Publicaciones
- **comments**: Comentarios en posts
- **likes**: Likes en posts y comentarios
- **follows**: Relación de seguimiento entre usuarios
- **messages**: Mensajes directos
- **notifications**: Notificaciones del sistema

### Conectarse a PostgreSQL

**Con PgAdmin** (Interfaz gráfica):
1. Abrir `http://localhost:5050`
2. Login con `admin@admin.com` / `admin`
3. Agregar nuevo servidor:
   - Host: `postgres`
   - Port: `5432`
   - Username: `postgres`
   - Password: `postgres`

**Con psql** (CLI):
```bash
docker exec -it social-network-postgres psql -U postgres -d social_network
```

## 🔒 Seguridad

El proyecto implementa múltiples capas de seguridad:

- ✅ **JWT Authentication** con refresh tokens
- ✅ **Helmet.js** para headers de seguridad
- ✅ **CORS** configurado correctamente
- ✅ **Rate Limiting** contra ataques de fuerza bruta
- ✅ **Validación de inputs** con class-validator
- ✅ **Passwords hasheados** con bcrypt
- ✅ **SQL Injection protection** con TypeORM
- ✅ **XSS protection** con sanitización de inputs

## 📈 Próximas Fases

- [x] **Fase 1**: Análisis y Arquitectura ✅
- [x] **Fase 2**: Configuración Inicial ✅
- [ ] **Fase 3**: Backend Development (En progreso)
- [ ] **Fase 4**: Frontend Development
- [ ] **Fase 5**: Características Avanzadas
- [ ] **Fase 6**: Optimización y Testing
- [ ] **Fase 7**: Deployment

## 🛠️ Tecnologías Clave

| Categoría | Tecnología | Propósito |
|-----------|-----------|-----------|
| Framework Frontend | Angular 18 | SPA framework |
| Framework Backend | NestJS | API framework |
| Base de Datos | PostgreSQL | Relational database |
| Cache | Redis | In-memory cache |
| ORM | TypeORM | Database abstraction |
| Autenticación | JWT + Passport | Auth strategy |
| Real-time | Socket.io | WebSocket communication |
| Validación | class-validator | DTO validation |
| Testing | Jest + Cypress | Unit & E2E tests |

## 🤝 Contribución

Este proyecto sigue las mejores prácticas de desarrollo:

1. **Commits semánticos**: `feat:`, `fix:`, `docs:`, etc.
2. **Code review**: Todas las features pasan por revisión
3. **Tests**: Cobertura mínima del 80%
4. **Linting**: ESLint + Prettier configurados

## 📝 Licencia

Este proyecto es de código abierto bajo la licencia MIT.

## 📞 Soporte

Para preguntas o problemas, por favor abre un issue en el repositorio.

---

**Construido con ❤️ usando las mejores prácticas del mercado**
