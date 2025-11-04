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

---

© 2025 - Aplicación Interna de Gestión