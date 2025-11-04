import { User, SystemModule, ModuleAccess } from '@/types/system';
import { ROLE_PERMISSIONS, hasPermission, PERMISSIONS } from './permissions';

// Registro de módulos del sistema - versión simplificada
class ModuleRegistry {
  private modules: Map<string, SystemModule> = new Map();
  
  registerModule(module: SystemModule) {
    this.modules.set(module.id, module);
    console.log(`📦 Módulo registrado: ${module.name} v${module.version}`);
  }
  
  getModule(moduleId: string): SystemModule | undefined {
    return this.modules.get(moduleId);
  }
  
  getAllModules(): SystemModule[] {
    return Array.from(this.modules.values());
  }
  
  // Obtener módulos accesibles para un usuario
  getAccessibleModules(user: User): string[] {
    const userRole = user.role;
    
    // Definir qué módulos puede acceder cada rol
    const moduleAccess = {
      admin: ['ic-codes', 'user-management', 'reports'],
      user: ['ic-codes', 'reports'],
      viewer: ['ic-codes']
    };
    
    return moduleAccess[userRole as keyof typeof moduleAccess] || [];
  }

  // Verificar si un usuario puede acceder a un módulo específico
  canAccessModule(user: User, moduleId: string): boolean {
    const accessibleModules = this.getAccessibleModules(user);
    return accessibleModules.includes(moduleId);
  }
}

// Definir los módulos disponibles (sin lazy loading por ahora)
const AVAILABLE_MODULES = {
  'ic-codes': {
    id: 'ic-codes',
    name: 'Códigos IC',
    description: 'Gestión de códigos de identificación interna',
    version: '1.0.0',
    isEnabled: true,
    icon: 'QrCode',
    path: '/ic-codes',
    permissions: [PERMISSIONS.IC_CODES_VIEW, PERMISSIONS.IC_CODES_CREATE]
  },
  'user-management': {
    id: 'user-management',
    name: 'Gestión de Usuarios',
    description: 'Administración de usuarios del sistema',
    version: '1.0.0',
    isEnabled: true,
    icon: 'People',
    path: '/users',
    permissions: [PERMISSIONS.USERS_MANAGE]
  },
  'reports': {
    id: 'reports',
    name: 'Reportes',
    description: 'Reportes y análisis del sistema',
    version: '1.0.0',
    isEnabled: true,
    icon: 'Assessment',
    path: '/reports',
    permissions: [PERMISSIONS.REPORTS_VIEW]
  }
};

// Crear instancia del registry
const moduleRegistry = new ModuleRegistry();

// Función para obtener la configuración de navegación basada en el usuario
export function getNavigationModules(user: User | null) {
  if (!user) return [];

  const accessibleModuleIds = moduleRegistry.getAccessibleModules(user);
  
  return accessibleModuleIds.map(moduleId => {
    const module = AVAILABLE_MODULES[moduleId as keyof typeof AVAILABLE_MODULES];
    if (!module) return null;
    
    return {
      id: module.id,
      name: module.name,
      description: module.description,
      icon: module.icon,
      path: module.path,
      enabled: module.isEnabled
    };
  }).filter(Boolean);
}

// Función para verificar permisos de módulo
export function hasModulePermission(user: User | null, moduleId: string, permission: string): boolean {
  if (!user) return false;
  
  const module = AVAILABLE_MODULES[moduleId as keyof typeof AVAILABLE_MODULES];
  if (!module) return false;
  
  // Verificar si el usuario puede acceder al módulo
  if (!moduleRegistry.canAccessModule(user, moduleId)) return false;
  
  // Verificar el permiso específico
  return hasPermission(user.role, permission);
}

export { moduleRegistry };
export default moduleRegistry;