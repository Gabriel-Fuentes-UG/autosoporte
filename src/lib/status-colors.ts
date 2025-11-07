/**
 * Utilidad centralizada para manejar colores de status en la aplicación
 * Define colores pasteles suaves para los diferentes estados de IC_Logs
 */

export type ICLogStatus = 'PROCESADO' | 'PENDIENTE' | 'FALLIDO' | 'ERROR';

export interface StatusColors {
  bg: string;
  text: string;
  main: string;
}

/**
 * Obtiene los colores pasteles para un status determinado
 * @param status - El estado del log (PROCESADO, PENDIENTE, FALLIDO)
 * @returns Objeto con colores de fondo y texto
 */
export function getStatusColors(status: string): StatusColors {
  const normalizedStatus = status.toUpperCase() as ICLogStatus;
  
  switch (normalizedStatus) {
    case 'PROCESADO':
      return {
        bg: '#f0f9f0',      // Verde pastel muy suave
        text: '#2e7d2e',    // Verde más oscuro para el texto
        main: '#4caf50'     // Verde principal
      };
    
    case 'PENDIENTE':
      return {
        bg: '#f0f7ff',      // Azul pastel muy suave
        text: '#1976d2',    // Azul más oscuro para el texto
        main: '#2196f3'     // Azul principal
      };
    
    case 'FALLIDO':
    case 'ERROR':
      return {
        bg: '#fff5f5',      // Rojo pastel muy suave
        text: '#d32f2f',    // Rojo más oscuro para el texto
        main: '#f44336'     // Rojo principal
      };
    
    default:
      return {
        bg: '#f5f5f5',      // Gris neutro
        text: '#616161',    // Gris más oscuro para el texto
        main: '#9e9e9e'     // Gris principal
      };
  }
}

/**
 * Obtiene el label legible para mostrar en la UI
 * @param status - El estado del log
 * @returns String formateado para mostrar
 */
export function getStatusLabel(status: string): string {
  const normalizedStatus = status.toUpperCase();
  
  switch (normalizedStatus) {
    case 'PROCESADO':
      return 'Procesado';
    case 'PENDIENTE':
      return 'Pendiente';
    case 'FALLIDO':
    case 'ERROR':
      return 'Fallido';
    default:
      return status;
  }
}

/**
 * Obtiene solo el color principal para casos simples
 * @param status - El estado del log
 * @returns Color principal como string
 */
export function getStatusColor(status: string): string {
  return getStatusColors(status).main;
}

/**
 * Lista de todos los estados válidos para IC_Logs
 */
export const IC_LOG_STATUSES: ICLogStatus[] = ['PROCESADO', 'PENDIENTE', 'FALLIDO'];

/**
 * Verifica si un status es válido
 * @param status - El estado a verificar
 * @returns true si el status es válido
 */
export function isValidICLogStatus(status: string): boolean {
  const normalizedStatus = status.toUpperCase();
  return IC_LOG_STATUSES.includes(normalizedStatus as ICLogStatus) || normalizedStatus === 'ERROR';
}