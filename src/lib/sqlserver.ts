import mssql from 'mssql';

// Usar una variable global para mantener el pool entre hot reloads
declare global {
  var sqlPool: mssql.ConnectionPool | undefined;
}

let pool: mssql.ConnectionPool | null = global.sqlPool || null;

/**
 * Get config from environment variables
 */
function getConfig(): mssql.config {
  const config: mssql.config = {
    server: process.env.DB_HOST || '',
    port: parseInt(process.env.DB_PORT || '1433'),
    database: process.env.DB_NAME || '',
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    options: {
      encrypt: process.env.DB_ENCRYPT === 'true',
      trustServerCertificate: process.env.DB_TRUST_CERT === 'true',
      enableArithAbort: true,
      connectTimeout: 30000,
      requestTimeout: 30000,
    },
    pool: {
      max: 20,
      min: 5,
      idleTimeoutMillis: 30000,
    }
  };

  return config;
}

/**
 * Get (or create) a global connection pool.
 */
export async function getPool(): Promise<mssql.ConnectionPool> {
  // Si el pool global existe y está conectado, retornarlo
  if (global.sqlPool && global.sqlPool.connected) {
    pool = global.sqlPool;
    return pool;
  }

  // Si existe pero no está conectado, limpiar
  if (global.sqlPool && !global.sqlPool.connected) {
    try {
      await global.sqlPool.close();
    } catch (err) {
      // Ignorar errores al cerrar
    }
    global.sqlPool = undefined;
  }

  try {
    const config = getConfig();
    console.log('🔗 Conectando a SQL Server:', config.server + ':' + config.port, '- DB:', config.database);
    
    const newPool = new mssql.ConnectionPool(config);
    
    // Manejar eventos del pool
    newPool.on('error', err => {
      console.error('❌ Error en pool SQL Server:', err);
      if (global.sqlPool === newPool) {
        global.sqlPool = undefined;
      }
      pool = null;
    });
    
    await newPool.connect();
    
    // Guardar en el global para persistir entre hot reloads
    global.sqlPool = newPool;
    pool = newPool;
    
    console.log('✅ Conexión SQL Server establecida exitosamente');
    return pool;
  } catch (error) {
    console.error('❌ Error conectando a SQL Server:', error);
    global.sqlPool = undefined;
    pool = null;
    throw error;
  }
}

export async function query<T = any>(sql: string, params?: Record<string, any>) {
  try {
    const p = await getPool();
    const request = p.request();
    
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        // let mssql infer type (for simplicity)
        request.input(k, v as any);
      }
    }
    
    const result = await request.query<T>(sql);
    return result;
  } catch (error: any) {
    // Si hay error de conexión cerrada, limpiar el pool global y reintentar una vez
    if (error.code === 'ECONNCLOSED') {
      console.log('⚠️ Conexión cerrada, reintentando...');
      
      if (global.sqlPool) {
        try {
          await global.sqlPool.close();
        } catch (e) {
          // Ignorar
        }
        global.sqlPool = undefined;
      }
      pool = null;
      
      const p = await getPool();
      const request = p.request();
      
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          request.input(k, v as any);
        }
      }
      
      const result = await request.query<T>(sql);
      return result;
    }
    
    throw error;
  }
}

export async function closePool() {
  if (global.sqlPool) {
    await global.sqlPool.close();
    global.sqlPool = undefined;
  }
  pool = null;
}

export default { getPool, query, closePool };
