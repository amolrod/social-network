# 🔧 GUÍA DE TROUBLESHOOTING - Botón Editar Perfil

## ✅ Verificaciones Completadas

### Código Fuente
- ✅ `EditProfileModalComponent` existe y está correctamente implementado
- ✅ `ProfileComponent` importa el modal correctamente
- ✅ Botón "Editar perfil" está en el HTML (línea 49)
- ✅ Condición `@if (isOwnProfile())` está correcta
- ✅ Signal `showEditModal` está definido
- ✅ Método `editProfile()` existe y funciona
- ✅ Estilos CSS para `.btn-secondary` están definidos
- ✅ No hay errores de compilación

### Lógica de Visualización
```typescript
// El botón se muestra cuando:
isOwnProfile() === true

// Que es true cuando:
currentUser.id === userProfile.id

// Donde:
- currentUser viene de AuthService.currentUser (signal)
- userProfile viene de la respuesta del backend
```

## 🐛 Debug Agregado

### Console Logs Activos

1. **Al cargar perfil:**
   ```javascript
   📱 Loading profile for username: angelm
r   ✅ Profile loaded: { id: '...', username: '...', ... }
   🔐 Current authenticated user: { id: '...', username: '...', ... }
   🎯 Is own profile? true/false
   ```

2. **En cada evaluación de isOwnProfile:**
   ```javascript
   🔍 isOwnProfile check: { 
     currentUserId: '...', 
     profileUserId: '...', 
     isOwn: true/false 
   }
   ```

## 🔍 Pasos para Diagnosticar

### 1. Abrir DevTools
```
F12 o Click derecho → Inspeccionar
```

### 2. Ir a la pestaña Console

### 3. Navegar a tu perfil
```
http://localhost:4200/profile/TU_USERNAME
```

### 4. Revisar los logs

#### ✅ CASO CORRECTO:
```
📱 Loading profile for username: angelmr
✅ Profile loaded: { id: 'abc-123', username: 'angelmr', ... }
🔐 Current authenticated user: { id: 'abc-123', username: 'angelmr', ... }
🎯 Is own profile? true
🔍 isOwnProfile check: { currentUserId: 'abc-123', profileUserId: 'abc-123', isOwn: true }
```
→ **El botón DEBE aparecer**

#### ❌ CASO PROBLEMA 1: Usuario no autenticado
```
📱 Loading profile for username: angelmr
✅ Profile loaded: { id: 'abc-123', username: 'angelmr', ... }
🔐 Current authenticated user: null
🎯 Is own profile? false
```
→ **Solución:** Volver a hacer login

#### ❌ CASO PROBLEMA 2: IDs no coinciden
```
📱 Loading profile for username: angelmr
✅ Profile loaded: { id: 'abc-123', username: 'angelmr', ... }
🔐 Current authenticated user: { id: 'xyz-456', username: 'otro', ... }
🎯 Is own profile? false
```
→ **Solución:** Estás viendo el perfil de otro usuario (comportamiento correcto)

#### ❌ CASO PROBLEMA 3: Usuario autenticado pero localStorage corrupto
```
📱 Loading profile for username: angelmr
✅ Profile loaded: { id: 'abc-123', username: 'angelmr', ... }
🔐 Current authenticated user: undefined
```
→ **Solución:** 
```javascript
// En consola del navegador:
localStorage.clear()
// Luego volver a hacer login
```

## 🛠️ Soluciones Rápidas

### Solución 1: Limpiar caché y volver a login
```javascript
// En Console del navegador:
localStorage.clear();
location.reload();
// Luego navegar a /auth/sign-in
```

### Solución 2: Verificar token JWT
```javascript
// En Console:
console.log('Token:', localStorage.getItem('access_token'));
console.log('User:', localStorage.getItem('user'));
```

Si token es null → hacer login
Si user es null o "undefined" → hacer login

### Solución 3: Verificar Network
1. Abrir Network tab (F12)
2. Filtrar por `users`
3. Buscar llamada a `/api/v1/users/username/:username`
4. Ver respuesta - debe incluir el `id` del usuario

## 📋 Checklist de Verificación Manual

- [ ] Backend corriendo en http://localhost:3000
- [ ] Frontend corriendo en http://localhost:4200
- [ ] Usuario logueado (ver icono de usuario en navbar)
- [ ] Token en localStorage: `access_token` existe
- [ ] User en localStorage: `user` existe y es JSON válido
- [ ] Al navegar a tu perfil, URL es `/profile/TU_USERNAME`
- [ ] Console muestra: `🎯 Is own profile? true`
- [ ] Botón "Editar perfil" visible arriba a la derecha

## 🎯 Test Rápido

### En Console del navegador:
```javascript
// Ver usuario actual
window.dispatchEvent(new Event('storage'));
console.log('User:', JSON.parse(localStorage.getItem('user') || 'null'));

// Forzar re-render (si usas Angular DevTools)
ng.getComponent(document.querySelector('app-profile')).userProfile();
```

## 📞 Si nada funciona

1. **Hacer build limpio:**
```bash
cd frontend
rm -rf node_modules .angular
npm install
ng serve
```

2. **Revisar que el componente se está usando:**
```bash
cd frontend/src/app/features/profile
ls -la
# Debe mostrar:
# - profile.component.ts
# - profile.component.html
# - profile.component.scss
```

3. **Verificar imports en profile.component.ts:**
```typescript
import { EditProfileModalComponent } from '../../shared/components/edit-profile-modal/edit-profile-modal.component';
// Debe estar en los imports del @Component
imports: [..., EditProfileModalComponent]
```

## ✨ Estado Esperado Final

Cuando todo funciona:
1. ✅ Ves tu perfil
2. ✅ Botón "Editar perfil" visible (azul, borde, con icono de lápiz)
3. ✅ Al hacer click, se abre modal
4. ✅ Modal muestra tu avatar actual (si tienes)
5. ✅ Puedes seleccionar nueva imagen
6. ✅ Preview se muestra inmediatamente
7. ✅ Al guardar, avatar se actualiza en el perfil

---

**Creado:** 22 de octubre de 2025
**Última actualización:** 22 de octubre de 2025
