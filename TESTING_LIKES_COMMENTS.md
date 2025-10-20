# 🎉 Sistema de Likes y Comentarios - Guía de Pruebas

## ✅ Lo que se ha implementado

### Backend (NestJS)
1. **Módulo de Likes** (`/backend/src/modules/likes/`)
   - ✅ Entity con constraint único (un usuario solo puede dar like una vez por post)
   - ✅ Service con métodos: likePost, unlikePost, hasLiked, getPostLikes, getUserLikedPosts, loadLikedPostIds
   - ✅ Controller con endpoints REST completos
   - ✅ Actualización automática de contadores en Post

2. **Módulo de Comments** (`/backend/src/modules/comments/`)
   - ✅ Entity con soporte para comentarios anidados (respuestas)
   - ✅ Service con CRUD completo y soft delete
   - ✅ Controller con endpoints REST completos
   - ✅ Actualización automática de contadores en Post

3. **Post Entity actualizada**
   - ✅ Relaciones OneToMany con likes y comments
   - ✅ Contadores: likesCount, commentsCount, sharesCount

### Frontend (Angular 18)
1. **LikesService** (`/frontend/src/app/core/services/likes.service.ts`)
   - ✅ State management con signals
   - ✅ Métodos para like/unlike
   - ✅ Sincronización de estado al iniciar sesión

2. **CommentsService** (`/frontend/src/app/core/services/comments.service.ts`)
   - ✅ CRUD completo de comentarios
   - ✅ Soporte para respuestas anidadas

3. **LikeButtonComponent** (`/frontend/src/app/shared/components/like-button/`)
   - ✅ Animación de corazón al dar like
   - ✅ Actualización optimista (cambia antes de respuesta del servidor)
   - ✅ Contador de likes formateado (1K, 1M)
   - ✅ Estado persistente

4. **CommentSectionComponent** (`/frontend/src/app/shared/components/comment-section/`)
   - ✅ Formulario para nuevos comentarios
   - ✅ Lista de comentarios con paginación
   - ✅ Autosize del textarea
   - ✅ Eliminar comentarios propios
   - ✅ Formato de tiempo relativo (Ahora, 5m, 2h, etc.)

5. **PostCard actualizado**
   - ✅ Integración de LikeButton
   - ✅ Toggle para mostrar/ocultar comentarios
   - ✅ Contadores dinámicos

---

## 🧪 Pruebas a Realizar

### 1. Iniciar los servicios

```bash
# Terminal 1: Backend
cd /Users/angel/Desktop/Angular/social-network/backend
npm run start:dev

# Terminal 2: Frontend
cd /Users/angel/Desktop/Angular/social-network/frontend
npm start
```

Espera a que ambos estén corriendo:
- Backend: http://localhost:3000/api/v1
- Frontend: http://localhost:4200

---

### 2. Probar Likes

**Test 1: Dar like a un post**
1. Inicia sesión en http://localhost:4200
2. Ve a la página de inicio (Home)
3. Encuentra un post
4. Haz click en el botón del corazón
5. ✅ **Verificar**:
   - El corazón se anima y cambia de color a rojo
   - El contador aumenta en 1
   - El estado persiste al recargar la página

**Test 2: Quitar like**
1. En un post que ya tiene tu like
2. Haz click en el corazón de nuevo
3. ✅ **Verificar**:
   - El corazón vuelve a color gris
   - El contador disminuye en 1
   - El estado persiste al recargar

**Test 3: Estado persistente**
1. Da like a varios posts
2. Recarga la página (F5)
3. ✅ **Verificar**:
   - Todos los likes siguen ahí
   - Los corazones están rojos en los posts correctos

---

### 3. Probar Comentarios

**Test 1: Escribir un comentario**
1. En cualquier post, haz click en "Comentar"
2. Se abre la sección de comentarios
3. Escribe un comentario en el textarea
4. Haz click en "Comentar"
5. ✅ **Verificar**:
   - El comentario aparece inmediatamente arriba
   - El textarea se limpia
   - El contador de comentarios aumenta

**Test 2: Ver comentarios**
1. Haz click en "Comentar" en un post
2. ✅ **Verificar**:
   - Se muestra la lista de comentarios
   - Cada comentario muestra: avatar, nombre, username, tiempo, texto
   - Los comentarios están ordenados del más reciente al más antiguo

**Test 3: Eliminar comentario propio**
1. En un comentario que escribiste
2. Haz click en "Eliminar"
3. Confirma en el alert
4. ✅ **Verificar**:
   - El comentario desaparece
   - El contador disminuye

**Test 4: Paginación de comentarios**
1. En un post con más de 10 comentarios
2. ✅ **Verificar**:
   - Aparecen botones "Anterior" y "Siguiente"
   - Se muestra "Página X de Y"
   - La navegación funciona correctamente

---

### 4. Pruebas de Integración

**Test 1: Múltiples usuarios**
1. Abre dos navegadores (o modo incógnito)
2. Inicia sesión con usuarios diferentes
3. Usuario A da like y comenta en un post
4. Usuario B actualiza la página
5. ✅ **Verificar**:
   - Usuario B ve el like y comentario de Usuario A
   - Los contadores son correctos

**Test 2: Estado inicial**
1. Cierra sesión
2. Inicia sesión de nuevo
3. ✅ **Verificar**:
   - Los likes persisten
   - Los comentarios se cargan correctamente

---

## 🐛 Debugging

### Si los likes no persisten:
1. Abre la consola del navegador (F12)
2. Busca estos logs:
   ```
   👤 Usuario cambió en App component
   🔄 Iniciando carga de followingIds y likedPostIds
   📋 IDs de posts con like: [...]
   ```
3. Si no aparecen, el `App` component no está cargando los likes

### Si los comentarios no aparecen:
1. Abre la consola
2. Busca errores en las peticiones HTTP
3. Verifica que el backend esté corriendo

### Si hay errores de CORS:
1. Verifica que el frontend esté en http://localhost:4200
2. El backend debería permitir este origen

---

## 📊 Endpoints del Backend

### Likes
```bash
# Dar like
POST http://localhost:3000/api/v1/likes/posts/:postId

# Quitar like
DELETE http://localhost:3000/api/v1/likes/posts/:postId

# Verificar like
GET http://localhost:3000/api/v1/likes/posts/:postId/check

# Ver quién dio like
GET http://localhost:3000/api/v1/likes/posts/:postId

# Posts con like del usuario
GET http://localhost:3000/api/v1/likes/users/:userId/posts
```

### Comments
```bash
# Crear comentario
POST http://localhost:3000/api/v1/comments
Body: { "postId": "...", "content": "..." }

# Ver comentarios de un post
GET http://localhost:3000/api/v1/comments/posts/:postId

# Actualizar comentario
PATCH http://localhost:3000/api/v1/comments/:id
Body: { "content": "..." }

# Eliminar comentario
DELETE http://localhost:3000/api/v1/comments/:id

# Respuestas a un comentario
GET http://localhost:3000/api/v1/comments/:commentId/replies
```

---

## ✨ Características Destacadas

1. **Animación del corazón**: Smooth animation cuando das like
2. **Actualización optimista**: La UI cambia antes de que el servidor responda
3. **Rollback automático**: Si hay error, revierte los cambios
4. **Estado global**: Signals para state management reactivo
5. **Formato inteligente**: "1K", "1.5M" para números grandes
6. **Tiempo relativo**: "Ahora", "5m", "2h", "3d" en vez de fechas
7. **Paginación**: Solo carga 10 comentarios a la vez
8. **Soft delete**: Los comentarios eliminados no se borran de la BD
9. **Autosize textarea**: Crece automáticamente al escribir
10. **Responsive**: Funciona en móvil y desktop

---

## 🎯 Próximos Pasos Opcionales

1. **Notificaciones**: Avisar cuando alguien da like o comenta
2. **Respuestas anidadas**: Comentarios dentro de comentarios
3. **Likes en comentarios**: Dar like a comentarios individuales
4. **Menciones**: @username en comentarios
5. **Rich text**: Formateo de texto en comentarios
6. **Emojis**: Picker de emojis para comentarios
7. **Editar comentarios**: Poder editar después de publicar
8. **Reportar**: Sistema para reportar comentarios inapropiados

---

**¡Todo listo para probar!** 🚀

Si encuentras algún error, revisa:
1. Logs del backend
2. Consola del navegador
3. Network tab (peticiones HTTP)
4. Estado de los signals en el componente
