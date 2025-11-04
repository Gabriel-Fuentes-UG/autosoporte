import * as odbc from 'odbc';

interface HanaConnection {
  query: (sql: string, params?: any[]) => Promise<any[]>;
  close: () => Promise<void>;
}

class ICHanaConnectionPool {
  private static instance: ICHanaConnectionPool;
  private connectionString: string;
  private pool: odbc.Pool | null = null;
  private maxConnections = 10;
  private minConnections = 2;

  private constructor() {
    this.connectionString = process.env.HANA_CONNECTION_STRING!;
    if (!this.connectionString) {
      throw new Error('HANA_CONNECTION_STRING no está configurado en las variables de entorno');
    }
  }

  public static getInstance(): ICHanaConnectionPool {
    if (!ICHanaConnectionPool.instance) {
      ICHanaConnectionPool.instance = new ICHanaConnectionPool();
    }
    return ICHanaConnectionPool.instance;
  }

  public async initialize(): Promise<void> {
    try {
      this.pool = await odbc.pool({
        connectionString: this.connectionString,
        initialSize: this.minConnections,
        maxSize: this.maxConnections,
        shrink: true,
        reuseConnections: true,
        connectionTimeout: 30000,
        loginTimeout: 30000
      });
      console.log('Pool de conexiones IC-HANA inicializado exitosamente');
    } catch (error) {
      console.error('Error inicializando pool IC-HANA:', error);
      throw error;
    }
  }

  public async getConnection(): Promise<HanaConnection> {
    if (!this.pool) {
      await this.initialize();
    }

    try {
      const connection = await this.pool!.connect();
      
      return {
        query: async (sql: string, params?: any[]) => {
          console.log(`Ejecutando consulta IC: ${sql.substring(0, 100)}...`);
          console.log(`Parámetros:`, params);
          
          const startTime = Date.now();
          try {
            const result = await connection.query(sql, params);
            const duration = Date.now() - startTime;
            console.log(`Consulta IC completada en ${duration}ms, ${result.length} registros`);
            return result;
          } catch (error) {
            const duration = Date.now() - startTime;
            console.error(`Error en consulta IC (${duration}ms):`, error);
            throw error;
          }
        },
        close: async () => {
          await connection.close();
        }
      };
    } catch (error) {
      console.error('Error obteniendo conexión IC-HANA:', error);
      throw error;
    }
  }

  public async testConnection(): Promise<boolean> {
    try {
      const conn = await this.getConnection();
      const result = await conn.query('SELECT 1 as test FROM DUMMY');
      await conn.close();
      return result.length > 0;
    } catch (error) {
      console.error('Test de conexión IC-HANA falló:', error);
      return false;
    }
  }

  public async closePool(): Promise<void> {
    if (this.pool) {
      await this.pool.close();
      this.pool = null;
      console.log('Pool de conexiones IC-HANA cerrado');
    }
  }
}

export default ICHanaConnectionPool;