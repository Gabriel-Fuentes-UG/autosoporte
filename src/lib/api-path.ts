/**
 * Utilidad para construir rutas de API con base path configurable
 * Facilita la migración entre entornos (dev, staging, production)
 */

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

/**
 * Construye la ruta completa de un endpoint de API
 * @param endpoint - Ruta del endpoint (ej: '/api/auth/login')
 * @returns Ruta completa con base path (ej: '/mi-app/api/auth/login' o '/api/auth/login')
 * 
 * Ejemplos:
 * - BASE_PATH="" y endpoint="/api/users" → "/api/users"
 * - BASE_PATH="/app" y endpoint="/api/users" → "/app/api/users"
 * - BASE_PATH="app" y endpoint="api/users" → "/app/api/users"
 */
export function apiPath(endpoint: string): string {
  // Remover slash inicial del endpoint si existe
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  // Remover slash final del base path si existe
  const cleanBasePath = BASE_PATH.endsWith('/') ? BASE_PATH.slice(0, -1) : BASE_PATH;
  
  // Si base path está vacío, retornar el endpoint con slash inicial
  if (!cleanBasePath || cleanBasePath === '') {
    return `/${cleanEndpoint}`;
  }
  
  // Asegurar que el base path tenga slash inicial
  const finalBasePath = cleanBasePath.startsWith('/') ? cleanBasePath : `/${cleanBasePath}`;
  
  // Construir ruta completa
  return `${finalBasePath}/${cleanEndpoint}`;
}

/**
 * Construye la ruta completa para una página
 * @param path - Ruta de la página (ej: '/admin/usuarios')
 * @returns Ruta completa con base path
 */
export function pagePath(path: string): string {
  return apiPath(path);
}

// Exportar también el base path por si se necesita directamente
export const basePath = BASE_PATH;
