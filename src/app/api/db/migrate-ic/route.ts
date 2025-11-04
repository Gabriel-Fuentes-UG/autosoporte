import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';

const config = {
  server: process.env.DB_HOST || '',
  port: parseInt(process.env.DB_PORT || '1433'),
  database: process.env.DB_NAME || '',
  user: process.env.DB_USER || '',
  password: process.env.DB_PASSWORD || '',
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_CERT === 'true',
  },
};

export async function POST(request: NextRequest) {
  let pool: sql.ConnectionPool | null = null;

  try {
    pool = await sql.connect(config);

    // Migración paso a paso
    const migrations = [
      // 1. Agregar columna cliente a IC_Logs
      `IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                     WHERE TABLE_NAME = 'IC_Logs' AND COLUMN_NAME = 'cliente')
       BEGIN
           ALTER TABLE IC_Logs ADD cliente NVARCHAR(50) NULL;
       END`,

      // 2. Agregar columna status a IC_Logs
      `IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                     WHERE TABLE_NAME = 'IC_Logs' AND COLUMN_NAME = 'status')
       BEGIN
           ALTER TABLE IC_Logs ADD status NVARCHAR(20) NOT NULL DEFAULT 'PENDIENTE';
       END`,

      // 3. Crear índice para status si no existe
      `IF NOT EXISTS (SELECT * FROM sys.indexes 
                     WHERE name='IX_IC_Logs_status' AND object_id = OBJECT_ID('IC_Logs'))
       BEGIN
           CREATE INDEX IX_IC_Logs_status ON IC_Logs(status);
       END`,

      // 4. Recrear tabla IC_Codes
      `DROP TABLE IF EXISTS IC_Codes`,

      `CREATE TABLE IC_Codes (
          id INT IDENTITY(1,1) PRIMARY KEY,
          log_id INT NOT NULL,
          producto NVARCHAR(100) NOT NULL,
          codigo_ic NVARCHAR(100) NOT NULL,
          created_at DATETIME2 NOT NULL DEFAULT GETDATE()
       )`,

      // 5. Crear índice para log_id
      `CREATE INDEX IX_IC_Codes_log_id ON IC_Codes(log_id)`,
    ];

    const results = [];

    for (const migration of migrations) {
      try {
        await pool.request().query(migration);
        results.push({ query: migration.substring(0, 50) + '...', success: true });
      } catch (error: any) {
        results.push({ 
          query: migration.substring(0, 50) + '...', 
          success: false, 
          error: error.message 
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Migración de base de datos completada',
      results,
    });
  } catch (error: any) {
    console.error('Error en migración:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error al ejecutar migración',
      },
      { status: 500 }
    );
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}
