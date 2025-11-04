# 🏷️ Reebok IC Manager - Aplicación Especializada en Códigos IC

Aplicación web especializada para la gestión completa y avanzada de Códigos IC (Item Codes) de Reebok, construida con Next.js 14 y Material-UI.

## 🚀 Características Principales

### 📊 Dashboard Completo
- **Estadísticas en tiempo real** de códigos IC
- **Métricas de actividad** y tendencias
- **Alertas del sistema** y notificaciones
- **Visualización gráfica** de datos

### 🔍 Búsqueda Avanzada
- **Búsqueda multi-criterio** (código, descripción, categoría)
- **Filtros inteligentes** por estado y fecha
- **Exportación de resultados** a múltiples formatos
- **Búsqueda en tiempo real** con paginación optimizada

### ⚙️ Gestión Completa
- **Crear nuevos códigos IC** con validación
- **Editar códigos existentes** con control de versiones
- **Activar/Desactivar códigos** de manera masiva
- **Importación masiva** desde archivos Excel/CSV

### 📈 Analíticas Avanzadas
- **Reportes automáticos** de uso y tendencias
- **Métricas de rendimiento** del sistema
- **Análisis de patrones** de códigos IC
- **Exportación de reportes** personalizados

### 🛠️ Configuración Personalizable
- **Preferencias del usuario** y sistema
- **Notificaciones configurables**
- **Temas y personalización** de interfaz
- **Gestión de permisos** y roles

## 🏗️ Arquitectura Técnica

### Frontend
- **Next.js 14** con App Router
- **Material-UI (MUI) v5** para diseño Material Design
- **TypeScript** para tipado estático
- **React Hook Form + Zod** para manejo de formularios
- **Recharts** para visualización de datos

### Backend
- **Next.js API Routes** para endpoints RESTful
- **SAP HANA** como base de datos principal
- **ODBC** para conectividad con HANA
- **Connection Pooling** para optimización de rendimiento

### Base de Datos
- **Conexión directa a SAP B1 (SBOVECTOR)**
- **Consultas optimizadas** para códigos IC
- **Transacciones ACID** para integridad de datos
- **Logging avanzado** de operaciones

## 🚦 APIs Disponibles

### Búsqueda y Consulta
```
GET  /api/ic/search       - Búsqueda básica con filtros
POST /api/ic/search       - Búsqueda avanzada multi-criterio
GET  /api/ic/stats        - Estadísticas generales
POST /api/ic/stats        - Estadísticas personalizadas
```

### Gestión de Códigos
```
GET    /api/ic/manage?code=XXX  - Obtener código específico
POST   /api/ic/manage          - Crear nuevo código IC
PUT    /api/ic/manage          - Actualizar código existente
DELETE /api/ic/manage?code=XXX  - Eliminar/desactivar código
```

## 🔧 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ y npm
- Acceso a SAP HANA (SBOVECTOR)
- Drivers ODBC configurados
- Permisos de lectura/escritura en base de datos

### Instalación
```bash
# Clonar e instalar dependencias
cd reebok-ic-app
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tu cadena de conexión HANA

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build
npm start
```

### Variables de Entorno
```env
HANA_CONNECTION_STRING="DRIVER=HDBODBC;UID=SYSTEM;PWD=tupassword;ServerNode=servidor:puerto;DATABASE=SBOVECTOR;"
NODE_ENV=development
```

## 📱 Responsive Design

La aplicación está completamente optimizada para:
- 🖥️ **Desktop** - Interfaz completa con todas las funcionalidades
- 📱 **Mobile** - Versión adaptativa con navegación táctil
- 📟 **Tablet** - Layout optimizado para pantallas medianas

## 🔐 Seguridad y Rendimiento

### Seguridad
- **Validación de entrada** en frontend y backend
- **Sanitización de consultas SQL** para prevenir inyecciones
- **Control de acceso** basado en roles de usuario
- **Logging de auditoría** de todas las operaciones

### Rendimiento
- **Connection pooling** para optimizar conexiones HANA
- **Paginación eficiente** en consultas grandes
- **Caché de resultados** frecuentes
- **Lazy loading** de componentes pesados

## 📊 Métricas y Monitoreo

La aplicación incluye:
- **Dashboard de métricas** en tiempo real
- **Alertas automáticas** para problemas del sistema
- **Logs detallados** de operaciones
- **Métricas de uso** y rendimiento

## 🛣️ Roadmap

### Próximas Funcionalidades
- [ ] **Integración con SAP Business One** completa
- [ ] **Sistema de workflows** para aprobaciones
- [ ] **API REST pública** para integraciones
- [ ] **Notificaciones push** en tiempo real
- [ ] **Módulo de reportes** avanzado con BI
- [ ] **Sincronización offline** para trabajo sin conexión

## 🤝 Contribución

Esta es una aplicación empresarial especializada para Reebok. Para modificaciones o mejoras, contactar al equipo de desarrollo.

## 📄 Licencia

© 2024 Reebok - Aplicación Interna de Gestión de Códigos IC

---

**🎯 Objetivo:** Proveer una herramienta especializada y eficiente para la gestión completa de códigos IC, mejorando la productividad y precisión en las operaciones de inventario de Reebok.