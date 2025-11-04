import { User, SystemModule, ModuleAccess } from '@/types/system';
import { ROLE_PERMISSIONS, hasPermission, PERMISSIONS } from './permissions';

// Registro de módulos del sistema
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
  
  getEnabledModules(): SystemModule[] {
    return this.getAllModules().filter(module => module.isEnabled);
  }
  
  getModulesForUser(user: User): ModuleAccess[] {
    const userPermissions = ROLE_PERMISSIONS[user.role] || [];
    
    return this.getEnabledModules().map(module => ({
      moduleId: module.id,
      moduleName: module.name,
      hasAccess: module.permissions.some(permission => 
        userPermissions.includes(permission.id as any)
      ),
      permissions: module.permissions.filter(permission =>
        hasPermission(user.role, permission.id)
      )
    }));
  }
}

// Instancia singleton del registro
export const moduleRegistry = new ModuleRegistry();

// Función para cargar módulos del sistema
export function loadSystemModules() {
  // Módulo principal: Códigos IC
  moduleRegistry.registerModule({
    id: 'ic-codes',
    name: 'Gestión de Códigos IC',
    description: 'Módulo principal para gestión de códigos IC de Reebok',
    version: '1.0.0',
    isEnabled: true,
    component: () => import('@/modules/ic-codes/ICCodesModule'),
    permissions: [
      {
        id: 'ic_codes:create',
        name: 'Crear Códigos IC',
        description: 'Permite crear nuevos códigos IC',
        resource: 'ic_codes',
        action: 'create'
      },
      {
        id: 'ic_codes:read',
        name: 'Ver Códigos IC',
        description: 'Permite ver códigos IC existentes',
        resource: 'ic_codes',
        action: 'read'
      },
      {
        id: 'ic_codes:update',
        name: 'Actualizar Códigos IC',
        description: 'Permite modificar códigos IC',
        resource: 'ic_codes',
        action: 'update'
      },
      {
        id: 'ic_codes:delete',
        name: 'Eliminar Códigos IC',
        description: 'Permite eliminar códigos IC',
        resource: 'ic_codes',
        action: 'delete'
      },
      {
        id: 'ic_codes:process',
        name: 'Procesar Lotes',
        description: 'Permite procesar lotes de códigos IC',
        resource: 'ic_codes',
        action: 'manage'
      }
    ],
    routes: [
      {
        path: '/ic-codes',
        component: () => import('@/modules/ic-codes/pages/Dashboard'),
        permissions: ['ic_codes:read']
      },
      {
        path: '/ic-codes/create',
        component: () => import('@/modules/ic-codes/pages/CreateCodes'),
        permissions: ['ic_codes:create']
      },
      {
        path: '/ic-codes/manage',
        component: () => import('@/modules/ic-codes/pages/ManageCodes'),
        permissions: ['ic_codes:update', 'ic_codes:delete']
      }
    ]
  });

  // Módulo de administración de usuarios (solo para admin)
  moduleRegistry.registerModule({
    id: 'user-management',
    name: 'Gestión de Usuarios',
    description: 'Administración de usuarios del sistema',
    version: '1.0.0',
    isEnabled: true,
    component: () => import('@/modules/users/UserManagementModule'),
    permissions: [
      {
        id: 'users:manage',
        name: 'Gestionar Usuarios',
        description: 'Permite administrar usuarios del sistema',
        resource: 'users',
        action: 'manage'
      }
    ],
    routes: [
      {
        path: '/admin/users',
        component: () => import('@/modules/users/pages/UsersList'),
        permissions: ['users:manage']
      },
      {
        path: '/admin/users/create',
        component: () => import('@/modules/users/pages/CreateUser'),
        permissions: ['users:create']
      }
    ]
  });

  // Módulo de reportes
  moduleRegistry.registerModule({
    id: 'reports',
    name: 'Reportes y Analytics',
    description: 'Generación de reportes y análisis de datos',
    version: '1.0.0',
    isEnabled: true,
    component: () => import('@/modules/reports/ReportsModule'),
    permissions: [
      {
        id: 'reports:view',
        name: 'Ver Reportes',
        description: 'Permite ver reportes del sistema',
        resource: 'reports',
        action: 'read'
      }
    ],
    routes: [
      {
        path: '/reports',
        component: () => import('@/modules/reports/pages/Dashboard'),
        permissions: ['reports:view']
      }
    ]
  });

  console.log('🎉 Módulos del sistema cargados exitosamente');
}

// Función para obtener rutas basadas en permisos de usuario
export function getRoutesForUser(user: User) {
  const userModules = moduleRegistry.getModulesForUser(user);
  const routes: any[] = [];

  userModules.forEach(moduleAccess => {
    if (moduleAccess.hasAccess) {
      const module = moduleRegistry.getModule(moduleAccess.moduleId);
      if (module) {
        module.routes.forEach(route => {
          const hasRoutePermission = route.permissions.some(permission =>
            hasPermission(user.role, permission)
          );
          if (hasRoutePermission) {
            routes.push(route);
          }
        });
      }
    }
  });

  return routes;
}