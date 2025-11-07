// Tipos base del sistema modular
export interface User {
  id: number;
  username: string;
  email?: string;
  role: 'admin' | 'user' | 'viewer';
  created_at: Date;
  isActive?: boolean;
}

export interface UserSession {
  user: User;
  permissions: Permission[];
  modules: ModuleAccess[];
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
}

export interface ModuleAccess {
  moduleId: string;
  moduleName: string;
  hasAccess: boolean;
  permissions: Permission[];
}

// Módulos del sistema
export interface SystemModule {
  id: string;
  name: string;
  description: string;
  version: string;
  isEnabled: boolean;
  component: React.ComponentType<any>;
  permissions: Permission[];
  routes: ModuleRoute[];
}

export interface ModuleRoute {
  path: string;
  component: React.ComponentType<any>;
  permissions: string[];
}

// Estructura de datos para códigos IC
export interface ICCode {
  id: string | number;
  ic_code: string;
  description: string;
  status: 'active' | 'inactive' | 'pending' | 'archived';
  category: string;
  client?: string;
  created_at: Date;
  lastUpdated?: Date;
  created_by: number;
  updatedBy?: string;
  metadata?: Record<string, any>;
}

// Tipos para logs de IC
export type ICLogStatus = 'PROCESADO' | 'PENDIENTE' | 'FALLIDO' | 'ERROR';

export interface ICLog {
  id: number;
  user: string;
  folio_interno: string;
  action: string;
  details?: string;
  created_at: Date;
  cliente?: string;
  status: ICLogStatus;
  cliente_code?: string;
  updated_by?: string;
  updated_at?: Date;
  codes?: ICLogCode[];
  total_codigos?: number;
}

export interface ICLogCode {
  id: number;
  log_id: number;
  producto: string;
  codigo_ic: string;
  created_at: Date;
}

export interface ICBatch {
  id: string;
  batchNumber: string;
  codes: ICCode[];
  client: string;
  processedBy: string;
  processedAt: Date;
  status: 'processing' | 'completed' | 'failed' | 'cancelled';
  totalCodes: number;
  successfulCodes: number;
  failedCodes: number;
}

// API Responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}