# 🎯 GUÍA RÁPIDA - Solución de Problemas Resueltos

## ✅ PROBLEMAS SOLUCIONADOS

### 1. Backend no inicia (http://localhost:3000/api/v1)
**Causa:** PostgreSQL no estaba corriendo o tenía conflicto de puertos

**Solución aplicada:**
- ✅ Docker Compose configurado con puertos alternativos:
  - PostgreSQL: puerto **5433** (en lugar de 5432)
  - Redis: puerto **6380** (en lugar de 6379)
  - PgAdmin: puerto **5051** (en lugar de 5050)
- ✅ Archivo `.env` actualizado con los nuevos puertos

### 2. PgAdmin no carga (http://localhost:5050)
**Causa:** Puerto incorrecto en la URL

**Solución:** Ahora usa **http://localhost:5051**

---

## 🚀 COMANDOS PARA INICIAR TODO

### Opción 1: Script Automático (Recomendado)
```bash
./start.sh
```

### Opción 2: Paso a Paso

#### 1. Iniciar bases de datos
```bash
docker compose up -d
```

#### 2. Verificar que todo está OK
```bash
./test-connection.sh
# O manualmente:
docker compose ps
```

#### 3. Iniciar Backend (en una terminal)
```bash
cd backend
npm run start:dev
```

Deberías ver:
```
🚀 Application is running on: http://localhost:3000/api/v1
📚 Environment: development
🌍 CORS enabled for: http://localhost:4200
```

#### 4. Iniciar Frontend (en otra terminal)
```bash
cd frontend
npm start
```

---

## 🌐 URLs ACTUALIZADAS

| Servicio | URL | Credenciales |
|----------|-----|--------------|
| **Frontend** | http://localhost:4200 | - |
| **Backend API** | http://localhost:3000/api/v1 | - |
| **PgAdmin** | http://localhost:5051 | admin@admin.com / admin |
| **PostgreSQL** | localhost:5433 | postgres / postgres |
| **Redis** | localhost:6380 | (sin password) |

---

## 🔍 VERIFICAR QUE TODO FUNCIONA

### 1. Verificar Docker
```bash
docker compose ps

# Debería mostrar:
# social-network-postgres   Up (healthy)
# social-network-redis      Up (healthy)
# social-network-pgadmin    Up
```

### 2. Probar Backend
```bash
curl http://localhost:3000/api/v1

# Debería responder con:
# {"success":true,"data":"Hello World!","timestamp":"..."}
```

### 3. Probar Frontend
Abrir http://localhost:4200 en el navegador

### 4. Probar PgAdmin
1. Abrir http://localhost:5051
2. Login: `admin@admin.com` / `admin`
3. Agregar servidor:
   - Name: `Social Network`
   - Host: `postgres` (¡importante! usar el nombre del servicio, no localhost)
   - Port: `5432` (puerto interno del contenedor)
   - Username: `postgres`
   - Password: `postgres`

---

## 🛑 DETENER TODO

```bash
# Detener y eliminar contenedores
docker compose down

# Detener sin eliminar (mantiene los datos)
docker compose stop
```

---

## 🔧 SOLUCIÓN DE PROBLEMAS COMUNES

### Error: "password authentication failed"
**Solución:** Verificar que `.env` tiene los valores correctos:
```bash
cat backend/.env | grep DB_
```

Debería mostrar:
```
DB_PORT=5433
DB_USERNAME=postgres
DB_PASSWORD=postgres
```

### Error: "ECONNREFUSED localhost:5432"
**Solución:** El backend está intentando conectarse al puerto viejo.
```bash
# Verificar el .env
cd backend
grep DB_PORT .env

# Debería mostrar: DB_PORT=5433
```

### Error: "address already in use"
**Solución:** Otro servicio está usando el puerto.
```bash
# Ver qué está usando el puerto
lsof -i :5433  # o el puerto que sea

# Detener Docker y reiniciar
docker compose down
docker compose up -d
```

### Docker no inicia
```bash
# Ver logs de errores
docker compose logs postgres
docker compose logs redis

# Reiniciar Docker Desktop
# O reiniciar los servicios:
docker compose restart
```

### Backend sigue sin conectar
```bash
# 1. Verificar variables de entorno
cd backend
cat .env

# 2. Limpiar y reinstalar
rm -rf node_modules
npm install

# 3. Reiniciar el servidor
npm run start:dev
```

---

## 📝 ARCHIVOS IMPORTANTES MODIFICADOS

- `docker-compose.yml` - Puertos actualizados (5433, 6380, 5051)
- `backend/.env` - Configuración de conexión actualizada
- `backend/.env.example` - Plantilla actualizada

---

## 🎓 LO QUE APRENDIMOS

1. ✅ Docker Compose puede configurarse con puertos personalizados
2. ✅ Los puertos internos del contenedor (5432) vs externos (5433) son diferentes
3. ✅ El archivo `.env` controla la configuración del backend
4. ✅ Siempre verificar que los servicios están corriendo antes de iniciar el backend

---

## ✨ SIGUIENTE PASO

Ahora que todo funciona, puedes continuar con la **FASE 3: Backend Development**
- Crear entidades de base de datos
- Implementar autenticación
- Desarrollar endpoints REST

```bash
# Con todo corriendo, verifica:
# ✅ http://localhost:3000/api/v1 → Backend responde
# ✅ http://localhost:5051 → PgAdmin carga
# ✅ docker compose ps → Todo "Up (healthy)"
```

**¡Estás listo para empezar a programar!** 🚀
