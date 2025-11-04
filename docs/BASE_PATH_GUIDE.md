# Sistema de Rutas Configurable - Base Path

## Descripción

Este sistema implementa una gestión centralizada de rutas de API mediante la variable de entorno `NEXT_PUBLIC_BASE_PATH`. Esto facilita la migración del sistema entre diferentes entornos (desarrollo, staging, producción) sin necesidad de modificar múltiples archivos.

## Configuración

### Archivo `.env`

```env
# Base path para rutas de API
# Desarrollo: NEXT_PUBLIC_BASE_PATH=/
# Producción: NEXT_PUBLIC_BASE_PATH=/reebok-ic
NEXT_PUBLIC_BASE_PATH=/
```

### Ejemplos de configuración por entorno:

**Desarrollo local:**
```env
NEXT_PUBLIC_BASE_PATH=/
```
Resultado: `http://localhost:3000/api/auth/login`

**Producción con subdirectorio:**
```env
NEXT_PUBLIC_BASE_PATH=/reebok-ic
```
Resultado: `https://servidor.com/reebok-ic/api/auth/login`

**Producción con subdominio:**
```env
NEXT_PUBLIC_BASE_PATH=/
```
Resultado: `https://reebok.servidor.com/api/auth/login`

## Uso

### Importar la utilidad

```typescript
import { apiPath, pagePath } from '@/lib/api-path';
```

### Para llamadas a API

```typescript
// ❌ ANTES (rutas hardcodeadas)
const response = await fetch('/api/auth/login', {
  method: 'POST',
  // ...
});

// ✅ AHORA (rutas dinámicas)
const response = await fetch(apiPath('/api/auth/login'), {
  method: 'POST',
  // ...
});
```

### Para navegación de páginas

```typescript
// ❌ ANTES
router.push('/admin/usuarios');

// ✅ AHORA
router.push(pagePath('/admin/usuarios'));
```

## Archivos Actualizados

### Contextos
- ✅ `src/contexts/AuthContext.tsx`
  - `checkSession()` - Verificación de sesión
  - `login()` - Autenticación
  - `logout()` - Cierre de sesión

### Layouts
- ✅ `src/components/layout/ExecutiveLayout.tsx`
  - `fetchDailyStats()` - Estadísticas del dashboard

### Componentes de Herramientas
- ✅ `src/components/tools/CodigosIC.tsx`
  - `fetchClientes()` - Carga de clientes
  - Envío de códigos IC

### Componentes de Administración
- ✅ `src/components/admin/UserManagement.tsx`
  - `fetchUsers()` - Listar usuarios
  - `handleToggleActive()` - Activar/desactivar usuario
  - `handleDelete()` - Eliminar usuario

### Componentes de Dashboard
- ✅ `src/components/dashboard/UserHome.tsx`
  - `fetchUserData()` - Datos del usuario
- ✅ `src/components/ic/ICDashboard.tsx`
  - `loadDashboardData()` - Estadísticas IC
- ✅ `src/components/ic/ConnectionStatus.tsx`
  - `checkConnection()` - Verificar conexión HANA

### Componentes de Usuario
- ✅ `src/components/user/UserLogs.tsx`
  - `fetchLogs()` - Historial de operaciones

### Páginas
- ✅ `src/app/login/page.tsx`
  - Verificación de autenticación
- ✅ `src/app/admin/logs/page.tsx`
  - `fetchLogs()` - Logs del sistema
- ✅ `src/app/admin/estadisticas/page.tsx`
  - `fetchStats()` - Estadísticas generales

### Componentes Simple (Interfaz Simplificada)
- ✅ `src/components/simple/SimpleLogin.tsx`
  - Login simplificado
- ✅ `src/components/simple/SimpleAdmin.tsx`
  - CRUD de usuarios
- ✅ `src/components/simple/SimpleDashboard.tsx`
  - Gestión de códigos IC

## Funciones Disponibles

### `apiPath(endpoint: string): string`

Construye la ruta completa para endpoints de API.

**Parámetros:**
- `endpoint` - Ruta del endpoint (ej: `/api/auth/login`)

**Retorna:**
- Ruta completa con base path

**Ejemplo:**
```typescript
// Con BASE_PATH="/"
apiPath('/api/users') // → "/api/users"

// Con BASE_PATH="/reebok-ic"
apiPath('/api/users') // → "/reebok-ic/api/users"
```

### `pagePath(path: string): string`

Construye la ruta completa para páginas.

**Parámetros:**
- `path` - Ruta de la página (ej: `/admin/usuarios`)

**Retorna:**
- Ruta completa con base path

**Ejemplo:**
```typescript
// Con BASE_PATH="/"
pagePath('/admin/users') // → "/admin/users"

// Con BASE_PATH="/reebok-ic"
pagePath('/admin/users') // → "/reebok-ic/admin/users"
```

### `basePath: string`

Variable exportada con el valor del base path actual.

**Uso:**
```typescript
import { basePath } from '@/lib/api-path';

console.log(`El base path actual es: ${basePath}`);
```

## Migración a Producción

### Paso 1: Determinar la estructura de URLs

**Opción A - Subdirectorio:**
```
https://servidor.com/reebok-ic/
```
→ `NEXT_PUBLIC_BASE_PATH=/reebok-ic`

**Opción B - Subdominio:**
```
https://reebok.servidor.com/
```
→ `NEXT_PUBLIC_BASE_PATH=/`

**Opción C - Dominio dedicado:**
```
https://reebok-ic.com/
```
→ `NEXT_PUBLIC_BASE_PATH=/`

### Paso 2: Actualizar `.env` en producción

```bash
# Editar archivo .env en el servidor
nano .env

# Cambiar la línea:
NEXT_PUBLIC_BASE_PATH=/nueva-ruta
```

### Paso 3: Reconstruir la aplicación

```bash
# Instalar dependencias
npm install

# Generar Prisma Client
npx prisma generate

# Construir para producción
npm run build

# Reiniciar el servidor
pm2 restart reebok-ic-app
```

### Paso 4: Verificar

```bash
# Probar endpoint de salud
curl https://servidor.com/nueva-ruta/api/health

# Verificar login
curl -X POST https://servidor.com/nueva-ruta/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin@reebok.com","password":"admin123"}'
```

## Configuración de Next.js (Opcional)

Si usas subdirectorio, también actualiza `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.NEXT_PUBLIC_BASE_PATH !== '/' 
    ? process.env.NEXT_PUBLIC_BASE_PATH 
    : '',
  // ... resto de configuración
};

module.exports = nextConfig;
```

## Troubleshooting

### Error: "404 - Page not found"

**Causa:** Base path no coincide entre `.env` y la configuración del servidor.

**Solución:**
1. Verificar que `NEXT_PUBLIC_BASE_PATH` esté correcto en `.env`
2. Reconstruir la aplicación: `npm run build`
3. Limpiar caché: `rm -rf .next`

### Error: "API endpoint not found"

**Causa:** Olvidaste usar `apiPath()` en alguna llamada.

**Solución:**
```bash
# Buscar llamadas sin apiPath
grep -r "fetch('/api/" src/

# Reemplazar manualmente o usar script
```

### Las rutas funcionan en desarrollo pero no en producción

**Causa:** Variable de entorno no está siendo cargada.

**Solución:**
```bash
# Verificar que la variable esté presente
echo $NEXT_PUBLIC_BASE_PATH

# Si no aparece, agregar a .env.production
NEXT_PUBLIC_BASE_PATH=/tu-ruta
```

## Buenas Prácticas

### ✅ DO

```typescript
// Siempre usar apiPath para APIs
fetch(apiPath('/api/users'))

// Siempre usar pagePath para navegación
router.push(pagePath('/admin/users'))

// Mantener rutas relativas
apiPath('/api/auth/login') // ✅
```

### ❌ DON'T

```typescript
// No hardcodear rutas
fetch('/api/users') // ❌

// No usar URLs completas
fetch('http://localhost:3000/api/users') // ❌

// No olvidar el slash inicial
apiPath('api/users') // ❌ (falta el /)
```

## Resumen de Beneficios

✅ **Centralización**: Un solo lugar para cambiar rutas  
✅ **Flexibilidad**: Fácil migración entre entornos  
✅ **Mantenibilidad**: Código más limpio y consistente  
✅ **Escalabilidad**: Preparado para múltiples despliegues  
✅ **Zero Downtime**: Cambiar rutas sin modificar código

---

**Última actualización:** Noviembre 2025  
**Versión del sistema:** 2.0.0  
**Archivos actualizados:** 21 componentes + 1 utilidad
