# 🚀 Deployment Guide - Servidor de Producción

## Pasos para Desplegar en Producción

### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd reebok-ic-app
```

### 2. Configurar Variables de Entorno

```bash
# Copiar el template
cp .env.template .env

# Editar con las credenciales de producción
nano .env
```

**Variables CRÍTICAS a configurar:**

```env
# Base de Datos
DATABASE_URL="sqlserver://production-server:1433;database=Soporte;user=Admin;password=PRODUCTION_PASSWORD;encrypt=true;trustServerCertificate=true"

# Credenciales del Admin (¡CAMBIAR!)
ADMIN_EMAIL=admin@yourcompany.com
ADMIN_PASSWORD=YourSecureProductionPassword123!
ADMIN_USERNAME=ADMINISTRADOR

# API Externa
EXTERNAL_API_USER=your_production_user
EXTERNAL_API_PASSWORD=your_production_password

# Base Path (si el app está en un subdirectorio)
NEXT_PUBLIC_BASE_PATH=
# O por ejemplo: NEXT_PUBLIC_BASE_PATH=/autosoporte
```

### 3. Instalar Dependencias

```bash
npm install
```

### 4. Generar Cliente de Prisma

```bash
npm run db:generate
```

### 5. Crear Usuario Administrador

```bash
npm run db:seed
```

Este comando:
- Lee las credenciales desde las variables de entorno
- Crea o actualiza el usuario administrador
- Usa bcrypt para hashear la contraseña

**Salida esperada:**
```
🌱 Iniciando seed de la base de datos...
🔄 Actualizando usuario administrador...
✅ Usuario administrador actualizado exitosamente:
   ID: 1
   Username: ADMINISTRADOR
   Email: admin@yourcompany.com
   Role: admin
```

### 6. Build de Producción

```bash
npm run build
```

### 7. Iniciar Aplicación

```bash
# Con PM2 (recomendado)
pm2 start npm --name "autosoporte" -- start

# O directamente
npm start
```

## Seguridad en Producción

### ✅ Variables de Entorno

**El archivo `.env` NUNCA se sube a git**, solo se usa localmente en cada servidor.

**Ventajas de este sistema:**
1. El script `seed.ts` SÍ está en git (sin credenciales hardcodeadas)
2. Las credenciales están en `.env` (protegido por `.gitignore`)
3. Cada ambiente (dev, staging, prod) tiene su propio `.env`

### 🔒 Archivo `.env.template`

- **SÍ se sube a git** con valores de ejemplo
- Sirve como documentación de qué variables configurar
- No contiene credenciales reales

### 📋 Checklist de Seguridad

- [ ] Cambiar `ADMIN_PASSWORD` con contraseña robusta
- [ ] Configurar `DATABASE_URL` con credenciales de producción
- [ ] Actualizar credenciales de API externa si difieren
- [ ] Configurar `NEXT_PUBLIC_BASE_PATH` si aplica
- [ ] Verificar que `.env` tenga permisos restrictivos (600)

```bash
# Proteger el archivo .env
chmod 600 .env
```

## Actualización del Admin

Si necesitas cambiar las credenciales del admin en producción:

1. Edita el archivo `.env`:
```bash
nano .env
```

2. Cambia las variables:
```env
ADMIN_EMAIL=nuevo@email.com
ADMIN_PASSWORD=NuevaContraseñaSegura123!
```

3. Ejecuta el seed:
```bash
npm run db:seed
```

Esto actualizará el usuario existente con las nuevas credenciales.

## Múltiples Ambientes

### Desarrollo Local
```env
ADMIN_EMAIL=admin@local.dev
ADMIN_PASSWORD=dev123
DATABASE_URL="sqlserver://localhost:1433;database=Soporte_Dev;..."
```

### Staging
```env
ADMIN_EMAIL=admin@staging.com
ADMIN_PASSWORD=Staging_Password_123!
DATABASE_URL="sqlserver://staging-server:1433;database=Soporte_Staging;..."
```

### Producción
```env
ADMIN_EMAIL=admin@company.com
ADMIN_PASSWORD=Super_Secure_Prod_Pass_2024!
DATABASE_URL="sqlserver://prod-server:1433;database=Soporte;..."
```

## Troubleshooting

### Error: "Cannot find .env file"
```bash
# Asegúrate de copiar el template
cp .env.template .env
```

### Error: "Admin credentials not set"
```bash
# Verifica que las variables estén en .env
grep ADMIN_ .env
```

### Error al ejecutar seed
```bash
# Verificar conexión a base de datos
npm run db:generate

# Intentar de nuevo
npm run db:seed
```

## PM2 Configuration (Recomendado)

Crear archivo `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'autosoporte',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production'
    }
  }]
}
```

Comandos PM2:
```bash
# Iniciar
pm2 start ecosystem.config.js

# Ver logs
pm2 logs autosoporte

# Reiniciar
pm2 restart autosoporte

# Detener
pm2 stop autosoporte
```

---

**Última actualización**: Noviembre 2025
