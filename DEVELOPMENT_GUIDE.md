# 📘 Guía de Desarrollo - Social Network

## 🏗️ Principios de Arquitectura

### Clean Architecture
Este proyecto sigue los principios de Clean Architecture:

1. **Independencia de Frameworks**: El dominio no depende de Angular o NestJS
2. **Testeable**: La lógica de negocio es fácil de testear
3. **Independencia de UI**: La UI puede cambiar sin afectar el dominio
4. **Independencia de Base de Datos**: Podemos cambiar PostgreSQL sin afectar el negocio
5. **Independencia de Servicios Externos**: El core no depende de APIs externas

### SOLID Principles

- **S**ingle Responsibility: Cada clase tiene una única razón para cambiar
- **O**pen/Closed: Abierto para extensión, cerrado para modificación
- **L**iskov Substitution: Las clases derivadas deben ser sustituibles por sus clases base
- **I**nterface Segregation: Muchas interfaces específicas son mejores que una general
- **D**ependency Inversion: Depender de abstracciones, no de implementaciones concretas

## 📁 Estructura de Directorios

### Backend (NestJS)

```
backend/src/
├── modules/              # Módulos por feature
│   ├── auth/            # Autenticación y autorización
│   │   ├── dto/         # Data Transfer Objects
│   │   ├── entities/    # Entidades de TypeORM
│   │   ├── strategies/  # Estrategias de Passport
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   │
│   └── users/           # Gestión de usuarios
│       ├── dto/
│       ├── entities/
│       ├── repositories/
│       ├── users.controller.ts
│       ├── users.service.ts
│       └── users.module.ts
│
├── common/              # Código compartido
│   ├── decorators/      # Decoradores custom
│   ├── filters/         # Exception filters
│   ├── guards/          # Guards de autenticación/autorización
│   ├── interceptors/    # Interceptors de request/response
│   └── pipes/           # Pipes de validación
│
├── config/              # Configuración
│   ├── app.config.ts
│   ├── database.config.ts
│   └── jwt.config.ts
│
└── database/            # Base de datos
    └── migrations/      # Migraciones de TypeORM
```

### Frontend (Angular)

```
frontend/src/app/
├── core/                # Servicios singleton y utilidades core
│   ├── auth/
│   │   ├── guards/      # Auth guards (canActivate, canLoad)
│   │   ├── interceptors/ # HTTP interceptors
│   │   └── services/    # Auth service
│   ├── services/        # Servicios globales
│   └── models/          # Modelos de dominio
│
├── features/            # Módulos por feature (lazy-loaded)
│   ├── auth/
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── feed/
│   ├── profile/
│   └── messages/
│
├── shared/              # Componentes/pipes/directivas reutilizables
│   ├── components/
│   ├── directives/
│   └── pipes/
│
├── layout/              # Componentes de layout
│   ├── header/
│   ├── sidebar/
│   └── footer/
│
└── state/               # State management (Signals)
    ├── auth.state.ts
    └── user.state.ts
```

## 🎯 Convenciones de Código

### Naming Conventions

#### Backend (NestJS)
```typescript
// Archivos
user.entity.ts          // Entidades
create-user.dto.ts      // DTOs
user.service.ts         // Servicios
user.controller.ts      // Controladores
jwt-auth.guard.ts       // Guards

// Clases
export class User {}                    // PascalCase
export class UserService {}
export class CreateUserDto {}

// Métodos y variables
const userName = 'John';                // camelCase
async findUserById(id: string) {}
```

#### Frontend (Angular)
```typescript
// Archivos
user.model.ts           // Modelos
user.service.ts         // Servicios
user-profile.component.ts  // Componentes
auth.guard.ts           // Guards

// Clases e interfaces
export interface User {}                // PascalCase
export class UserService {}

// Métodos y variables
userName = 'John';                      // camelCase
getUserById(id: string) {}

// Signals
userSignal = signal<User | null>(null);
```

### Commits Semánticos

```bash
feat: Agregar sistema de autenticación
fix: Corregir error en validación de email
docs: Actualizar README con instrucciones de deployment
style: Formatear código con Prettier
refactor: Extraer lógica de validación a servicio separado
test: Agregar tests para UserService
chore: Actualizar dependencias
perf: Optimizar queries de base de datos
```

## 🔐 Seguridad - Checklist

### Backend
- [ ] Validar todos los inputs con DTOs y class-validator
- [ ] Sanitizar datos para prevenir XSS
- [ ] Usar prepared statements (TypeORM lo hace automáticamente)
- [ ] Implementar rate limiting en endpoints sensibles
- [ ] Hashear passwords con bcrypt (mínimo 10 rounds)
- [ ] Validar y sanitizar file uploads
- [ ] Usar HTTPS en producción
- [ ] Implementar CSRF protection
- [ ] Configurar CORS correctamente
- [ ] Nunca exponer información sensible en errores

### Frontend
- [ ] Validar inputs en el cliente (además del servidor)
- [ ] Sanitizar datos antes de renderizar (Angular lo hace automáticamente)
- [ ] Almacenar tokens en httpOnly cookies o en memoria
- [ ] Nunca guardar información sensible en localStorage
- [ ] Implementar CSP (Content Security Policy)
- [ ] Validar permisos antes de mostrar UI

## 🧪 Testing

### Backend Tests (Jest)
```typescript
describe('UserService', () => {
  it('should create a user', async () => {
    const user = await service.create({
      email: 'test@test.com',
      password: 'password123',
    });
    expect(user).toBeDefined();
    expect(user.email).toBe('test@test.com');
  });
});
```

### Frontend Tests (Jasmine/Karma)
```typescript
describe('UserService', () => {
  it('should fetch user by id', (done) => {
    service.getUserById('123').subscribe(user => {
      expect(user).toBeDefined();
      expect(user.id).toBe('123');
      done();
    });
  });
});
```

## 📊 Performance

### Backend
- Usar índices en columnas frecuentemente consultadas
- Implementar paginación en listas
- Usar Redis para caché de queries pesadas
- Implementar lazy loading de relaciones
- Usar select específicos en lugar de traer todos los campos

### Frontend
- Lazy loading de rutas
- OnPush change detection
- Virtual scrolling para listas grandes
- Lazy loading de imágenes
- Code splitting
- Service Workers para caché

## 🚀 Deployment Checklist

### Pre-deployment
- [ ] Todos los tests pasan
- [ ] No hay vulnerabilidades de seguridad (`npm audit`)
- [ ] Variables de entorno configuradas
- [ ] SSL/TLS configurado
- [ ] Backup de base de datos configurado
- [ ] Logging configurado
- [ ] Monitoring configurado

### Environment Variables
```bash
# Nunca commitear estos valores reales
NODE_ENV=production
JWT_SECRET=<generar-con-openssl-rand>
DB_PASSWORD=<password-seguro>
```

## 📚 Recursos Adicionales

- [NestJS Documentation](https://docs.nestjs.com/)
- [Angular Documentation](https://angular.dev/)
- [TypeORM Documentation](https://typeorm.io/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

## 🤝 Code Review Guidelines

### Qué revisar:
1. ✅ El código sigue los principios SOLID
2. ✅ Hay tests para la nueva funcionalidad
3. ✅ No hay código duplicado (DRY)
4. ✅ Las variables y funciones tienen nombres descriptivos
5. ✅ Los errores se manejan correctamente
6. ✅ No hay console.log() en código de producción
7. ✅ La documentación está actualizada

### Red Flags:
- ❌ Lógica de negocio en controllers/components
- ❌ Queries N+1
- ❌ Hardcoded values
- ❌ Código comentado en lugar de eliminado
- ❌ Falta de manejo de errores
- ❌ Dependencias circulares

## 💡 Best Practices

1. **Keep it simple**: El código más simple es el mejor código
2. **YAGNI**: You Aren't Gonna Need It - no implementes features que no necesitas aún
3. **Documenta decisiones**: Explica el "por qué", no el "qué"
4. **Fail fast**: Valida inputs lo antes posible
5. **Single source of truth**: Un lugar para cada pieza de información
6. **Composition over inheritance**: Prefiere composición
7. **Immutability**: Usa datos inmutables cuando sea posible

---

**Esta guía está viva y debe actualizarse conforme el proyecto evoluciona.**
