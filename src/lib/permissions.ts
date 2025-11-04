// Sistema de permisos y roles modular
export const PERMISSIONS = {
  // Gestión de usuarios (solo admin)
  USERS_CREATE: 'users:create',
  USERS_READ: 'users:read',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',
  USERS_MANAGE: 'users:manage',

  // Códigos IC (admin y usuarios)
  IC_CODES_VIEW: 'ic_codes:view',
  IC_CODES_CREATE: 'ic_codes:create',
  IC_CODES_READ: 'ic_codes:read',
  IC_CODES_EDIT: 'ic_codes:edit',
  IC_CODES_UPDATE: 'ic_codes:update',
  IC_CODES_DELETE: 'ic_codes:delete',
  IC_CODES_PROCESS: 'ic_codes:process',
  IC_CODES_EXPORT: 'ic_codes:export',

  // Reportes y Analytics
  REPORTS_VIEW: 'reports:view',
  REPORTS_EXPORT: 'reports:export',
  ANALYTICS_VIEW: 'analytics:view',

  // Sistema
  SYSTEM_CONFIG: 'system:config',
  SYSTEM_LOGS: 'system:logs',
  SYSTEM_HEALTH: 'system:health',

  // Módulos futuros (preparado para expansión)
  INVENTORY_READ: 'inventory:read',
  INVENTORY_WRITE: 'inventory:write',
  ORDERS_READ: 'orders:read',
  ORDERS_WRITE: 'orders:write',
  CLIENTS_READ: 'clients:read',
  CLIENTS_WRITE: 'clients:write',
} as const;

export const ROLE_PERMISSIONS = {
  admin: [
    // Todas las funcionalidades de usuario
    PERMISSIONS.IC_CODES_VIEW,
    PERMISSIONS.IC_CODES_CREATE,
    PERMISSIONS.IC_CODES_READ,
    PERMISSIONS.IC_CODES_EDIT,
    PERMISSIONS.IC_CODES_UPDATE,
    PERMISSIONS.IC_CODES_DELETE,
    PERMISSIONS.IC_CODES_PROCESS,
    PERMISSIONS.IC_CODES_EXPORT,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_EXPORT,
    PERMISSIONS.ANALYTICS_VIEW,
    
    // Funcionalidades exclusivas de admin
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_UPDATE,
    PERMISSIONS.USERS_DELETE,
    PERMISSIONS.USERS_MANAGE,
    PERMISSIONS.SYSTEM_CONFIG,
    PERMISSIONS.SYSTEM_LOGS,
    PERMISSIONS.SYSTEM_HEALTH,
    
    // Módulos futuros
    PERMISSIONS.INVENTORY_READ,
    PERMISSIONS.INVENTORY_WRITE,
    PERMISSIONS.ORDERS_READ,
    PERMISSIONS.ORDERS_WRITE,
    PERMISSIONS.CLIENTS_READ,
    PERMISSIONS.CLIENTS_WRITE,
  ],
  
  user: [
    // Funcionalidades básicas para usuarios
    PERMISSIONS.IC_CODES_VIEW,
    PERMISSIONS.IC_CODES_CREATE,
    PERMISSIONS.IC_CODES_READ,
    PERMISSIONS.IC_CODES_EDIT,
    PERMISSIONS.IC_CODES_PROCESS,
    PERMISSIONS.IC_CODES_EXPORT,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_EXPORT,
    
    // Acceso limitado a módulos futuros
    PERMISSIONS.INVENTORY_READ,
    PERMISSIONS.ORDERS_READ,
    PERMISSIONS.CLIENTS_READ,
  ],
  
  viewer: [
    // Solo lectura
    PERMISSIONS.IC_CODES_READ,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.INVENTORY_READ,
    PERMISSIONS.ORDERS_READ,
    PERMISSIONS.CLIENTS_READ,
  ],
} as const;

// Función para verificar permisos
export function hasPermission(userRole: string, requiredPermission: string): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS];
  return rolePermissions?.includes(requiredPermission as any) ?? false;
}

// Función para verificar múltiples permisos
export function hasAnyPermission(userRole: string, requiredPermissions: string[]): boolean {
  return requiredPermissions.some(permission => hasPermission(userRole, permission));
}

// Función para verificar todos los permisos
export function hasAllPermissions(userRole: string, requiredPermissions: string[]): boolean {
  return requiredPermissions.every(permission => hasPermission(userRole, permission));
}