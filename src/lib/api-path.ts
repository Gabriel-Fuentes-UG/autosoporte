/**
 * Utilidad para construir rutas de API con base path configurable
 * 
 * IMPORTANTE:
 * - NEXT_PUBLIC_BASE_PATH se configura en .env y se embebe en tiempo de build
 * - Next.js aplica basePath automáticamente a navegación de páginas
 * - fetch() del lado del cliente NO aplica basePath automáticamente
 * - Esta función añade basePath manualmente para fetch() cuando es necesario
 */

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

/**
 * Construye la ruta de un endpoint de API con basePath
 * @param endpoint - Ruta del endpoint (ej: '/api/auth/login')
 * @returns Ruta completa con basePath para fetch() del cliente
 * 
 * USO: Solo para llamadas fetch() del lado del cliente
 * Next.js NO aplica basePath automáticamente a fetch(), debemos añadirlo manualmente
 * 
 * Ejemplos:
 * - Sin basePath: apiPath('/api/users') → '/api/users'
 * - Con basePath="/ReebokSoporte": apiPath('/api/users') → '/ReebokSoporte/api/users'
 */
export function apiPath(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Si no hay basePath configurado, retornar endpoint limpio
  if (!BASE_PATH || BASE_PATH === '') {
    return cleanEndpoint;
  }
  
  // Limpiar y normalizar basePath
  const cleanBasePath = BASE_PATH.endsWith('/') ? BASE_PATH.slice(0, -1) : BASE_PATH;
  const finalBasePath = cleanBasePath.startsWith('/') ? cleanBasePath : `/${cleanBasePath}`;
  
  // Retornar endpoint con basePath
  return `${finalBasePath}${cleanEndpoint}`;
}

/**
 * Construye la ruta para navegación de páginas
 * @param path - Ruta de la página (ej: '/admin/usuarios')
 * @returns Ruta limpia (Next.js aplica basePath automáticamente en router.push)
 * 
 * USO: Solo para router.push() y navegación entre páginas
 * Next.js SÍ aplica basePath automáticamente a router.push(), NO debemos añadirlo
 * 
 * Ejemplos (ambos casos retornan la ruta sin basePath):
 * - pagePath('/admin/home') → '/admin/home'
 * - Next.js convierte automáticamente en → '/ReebokSoporte/admin/home'
 */
export function pagePath(path: string): string {
  // Retornar la ruta limpia, Next.js añade basePath automáticamente
  return path.startsWith('/') ? path : `/${path}`;
}

// Exportar también el base path por si se necesita directamente
export const basePath = BASE_PATH;
