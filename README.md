# AutoSoporte - Sistema de Gestión

Aplicación web para gestión de códigos IC y soporte interno.

## Stack Tecnológico

- **Next.js 14** con App Router
- **Material-UI (MUI) v5**
- **TypeScript**
- **Prisma ORM** con SQL Server
- **SAP HANA** (queries específicas)

## Instalación

```bash
npm install
npm run dev
```

## Configuración

Crear archivo `.env` basándote en `DEPLOYMENT.md`:

```env
DATABASE_URL="sqlserver://..."
HANA_CONNECTION_STRING="..."
EXTERNAL_API_BASE_URL="..."
ADMIN_EMAIL="..."
ADMIN_PASSWORD="..."
```

## Crear Usuario Administrador

```bash
npm run db:seed
```

## Build

```bash
npm run build
npm start
```

## Estados de IC_Logs

La tabla `IC_Logs` soporta los siguientes estados con colores pasteles:

### Estados Disponibles
- **PROCESADO** - Verde pastel (`#f0f9f0` / `#2e7d2e`)
- **PENDIENTE** - Azul pastel (`#f0f7ff` / `#1976d2`)
- **FALLIDO** - Rojo pastel (`#fff5f5` / `#d32f2f`)

### Migración de Estados
Si tienes datos existentes con estado `ERROR`, ejecuta el script de migración:
```bash
# Ejecutar migración SQL
sqlcmd -S server -d database -i prisma/migrations/update_ic_logs_status.sql

# Probar colores programáticamente
npx tsx scripts/test-status-colors.ts
```

### Uso en Componentes
```typescript
import { getStatusColors, getStatusLabel } from '@/lib/status-colors';

const colors = getStatusColors('PROCESADO');
const label = getStatusLabel('PROCESADO');
```

---

© 2025 - Aplicación Interna de Gestión