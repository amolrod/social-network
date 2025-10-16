# 🚀 Guía de Instalación - PostgreSQL y Redis (macOS)

## Problema Detectado
- El backend no puede conectarse a PostgreSQL
- Docker tiene conflicto de puertos

## ✅ SOLUCIÓN: Instalar PostgreSQL y Redis con Homebrew

### Paso 1: Instalar Homebrew (si no lo tienes)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### Paso 2: Instalar PostgreSQL
```bash
# Instalar PostgreSQL
brew install postgresql@16

# Iniciar el servicio
brew services start postgresql@16

# Verificar que está corriendo
brew services list | grep postgresql
```

### Paso 3: Crear la base de datos
```bash
# Crear el usuario y base de datos
createdb social_network

# Opcional: Crear usuario específico
# psql postgres
# CREATE USER postgres WITH PASSWORD 'postgres';
# GRANT ALL PRIVILEGES ON DATABASE social_network TO postgres;
```

### Paso 4: Instalar Redis
```bash
# Instalar Redis
brew install redis

# Iniciar el servicio
brew services start redis

# Verificar que está corriendo
redis-cli ping
# Debe responder: PONG
```

### Paso 5: Verificar que todo está corriendo
```bash
# Ver servicios de Homebrew
brew services list

# Debería mostrar:
# postgresql@16  started
# redis          started
```

---

## 🔧 OPCIÓN ALTERNATIVA: Docker con puertos diferentes

Si prefieres usar Docker pero tienes conflicto de puertos:

### Editar docker-compose.yml
Cambiar los puertos a:
```yaml
postgres:
  ports:
    - '5433:5432'  # Puerto externo 5433 en lugar de 5432

redis:
  ports:
    - '6380:6379'  # Puerto externo 6380 en lugar de 6379

pgadmin:
  ports:
    - '5051:80'    # Puerto externo 5051 en lugar de 5050
```

### Actualizar .env
```bash
DB_PORT=5433
REDIS_PORT=6380
```

---

## 🧪 Verificar Conexión

### PostgreSQL
```bash
# Con psql (si lo instalaste)
psql -h localhost -U postgres -d social_network

# O verificar si el puerto está escuchando
lsof -i :5432
```

### Redis
```bash
redis-cli ping
# Respuesta esperada: PONG
```

---

## ⚡ Comandos Rápidos

### Iniciar servicios
```bash
brew services start postgresql@16
brew services start redis
```

### Detener servicios
```bash
brew services stop postgresql@16
brew services stop redis
```

### Reiniciar servicios
```bash
brew services restart postgresql@16
brew services restart redis
```

---

## 🆘 Solución de Problemas

### Error: "password authentication failed"
El usuario actual de tu Mac ya tiene acceso a PostgreSQL sin contraseña.

**Solución:** Actualizar `.env` del backend:
```bash
DB_USERNAME=tu_usuario_mac  # Por ejemplo: angel
DB_PASSWORD=              # Dejar vacío
```

O usar el usuario actual:
```bash
DB_USERNAME=$USER
```

### Error: "role 'postgres' does not exist"
```bash
createuser -s postgres
```

### Error: "database 'social_network' does not exist"
```bash
createdb social_network
```

---

## 📚 Siguiente Paso

Una vez que PostgreSQL y Redis estén corriendo:

```bash
# En el directorio backend
cd backend
npm run start:dev
```

Deberías ver:
```
🚀 Application is running on: http://localhost:3000/api/v1
```
