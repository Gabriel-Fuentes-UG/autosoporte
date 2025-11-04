/**
 * Utilidad para construir rutas de API con base path configurable
 * Facilita la migración entre entornos (dev, staging, production)
 */

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '/';

/**
 * Construye la ruta completa de un endpoint de API
 * @param endpoint - Ruta del endpoint (ej: '/api/auth/login')
 * @returns Ruta completa con base path (ej: '/mi-app/api/auth/login')
 */
export function apiPath(endpoint: string): string {
  // Remover slash inicial del endpoint si existe
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  // Remover slash final del base path si existe
  const cleanBasePath = BASE_PATH.endsWith('/') ? BASE_PATH.slice(0, -1) : BASE_PATH;
  
  // Si base path es solo '/', retornar el endpoint con slash inicial
  if (cleanBasePath === '' || cleanBasePath === '/') {
    return `/${cleanEndpoint}`;
  }
  
  // Construir ruta completa
  return `${cleanBasePath}/${cleanEndpoint}`;
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
