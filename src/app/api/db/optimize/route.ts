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
    const results: string[] = [];

    // PASO 1: Renombrar columna 'client' a 'folio_interno'
    try {
      await pool.request().query(`EXEC sp_rename 'IC_Logs.client', 'folio_interno', 'COLUMN'`);
      results.push('✅ Columna renombrada: client → folio_interno');
    } catch (e: any) {
      if (e.message.includes('already exists')) {
        results.push('⚠️ Columna folio_interno ya existe');
      } else {
        results.push(`❌ Error renombrando: ${e.message}`);
      }
    }

    // PASO 2: Agregar cliente_code
    try {
      await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                       WHERE TABLE_NAME = 'IC_Logs' AND COLUMN_NAME = 'cliente_code')
        BEGIN
            ALTER TABLE IC_Logs ADD cliente_code NVARCHAR(50) NULL;
        END
      `);
      results.push('✅ Columna agregada: cliente_code');
    } catch (e: any) {
      results.push(`❌ Error agregando cliente_code: ${e.message}`);
    }

    // PASO 3: Agregar updated_by y updated_at
    try {
      await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                       WHERE TABLE_NAME = 'IC_Logs' AND COLUMN_NAME = 'updated_by')
        BEGIN
            ALTER TABLE IC_Logs ADD updated_by NVARCHAR(100) NULL;
        END
      `);
      results.push('✅ Columna agregada: updated_by');
    } catch (e: any) {
      results.push(`❌ Error agregando updated_by: ${e.message}`);
    }

    try {
      await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                       WHERE TABLE_NAME = 'IC_Logs' AND COLUMN_NAME = 'updated_at')
        BEGIN
            ALTER TABLE IC_Logs ADD updated_at DATETIME2 NULL;
        END
      `);
      results.push('✅ Columna agregada: updated_at');
    } catch (e: any) {
      results.push(`❌ Error agregando updated_at: ${e.message}`);
    }

    // PASO 4: Crear índices
    const indices = [
      { name: 'IX_IC_Logs_folio_interno', sql: 'CREATE INDEX IX_IC_Logs_folio_interno ON IC_Logs(folio_interno)' },
      { name: 'IX_IC_Logs_cliente_code', sql: 'CREATE INDEX IX_IC_Logs_cliente_code ON IC_Logs(cliente_code)' },
      { name: 'IX_IC_Logs_user_date', sql: 'CREATE INDEX IX_IC_Logs_user_date ON IC_Logs([user], created_at DESC)' },
      { name: 'IX_IC_Logs_cliente_date', sql: 'CREATE INDEX IX_IC_Logs_cliente_date ON IC_Logs(cliente, created_at DESC)' },
      { name: 'IX_IC_Codes_log_producto', sql: 'CREATE INDEX IX_IC_Codes_log_producto ON IC_Codes(log_id, producto)' },
    ];

    for (const idx of indices) {
      try {
        await pool.request().query(`
          IF NOT EXISTS (SELECT * FROM sys.indexes 
                         WHERE name='${idx.name}' AND object_id = OBJECT_ID('IC_Logs'))
          BEGIN
              ${idx.sql};
          END
        `);
        results.push(`✅ Índice creado: ${idx.name}`);
      } catch (e: any) {
        if (e.message.includes('already exists')) {
          results.push(`⚠️ Índice ya existe: ${idx.name}`);
        } else {
          results.push(`❌ Error creando índice ${idx.name}: ${e.message}`);
        }
      }
    }

    // PASO 5: Crear constraint de status
    try {
      await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sys.check_constraints 
                       WHERE name = 'CK_IC_Logs_Status')
        BEGIN
            ALTER TABLE IC_Logs 
            ADD CONSTRAINT CK_IC_Logs_Status 
            CHECK (status IN ('PENDIENTE', 'PROCESADO', 'ERROR', 'CANCELADO'));
        END
      `);
      results.push('✅ Constraint agregado: CK_IC_Logs_Status');
    } catch (e: any) {
      results.push(`❌ Error creando constraint: ${e.message}`);
    }

    // PASO 6: Crear vista
    try {
      await pool.request().query(`
        CREATE OR ALTER VIEW vw_IC_Logs_Detalle AS
        SELECT 
            l.id,
            l.folio_interno,
            l.cliente_code,
            l.cliente,
            l.[user],
            l.status,
            l.created_at,
            l.updated_at,
            l.updated_by,
            COUNT(DISTINCT c.id) as total_codigos,
            STRING_AGG(CAST(c.producto + ':' + c.codigo_ic AS NVARCHAR(MAX)), ', ') 
                WITHIN GROUP (ORDER BY c.id) as codigos_detalle
        FROM IC_Logs l
        LEFT JOIN IC_Codes c ON l.id = c.log_id
        GROUP BY 
            l.id, l.folio_interno, l.cliente_code, l.cliente,
            l.[user], l.status, l.created_at, l.updated_at, l.updated_by;
      `);
      results.push('✅ Vista creada: vw_IC_Logs_Detalle');
    } catch (e: any) {
      results.push(`❌ Error creando vista: ${e.message}`);
    }

    // PASO 7: Crear stored procedure
    try {
      await pool.request().query(`
        CREATE OR ALTER PROCEDURE sp_ActualizarStatusLog
            @folio_interno NVARCHAR(50),
            @nuevo_status NVARCHAR(20),
            @updated_by NVARCHAR(100) = NULL
        AS
        BEGIN
            SET NOCOUNT ON;
            
            UPDATE IC_Logs
            SET 
                status = @nuevo_status,
                updated_at = GETDATE(),
                updated_by = @updated_by
            WHERE folio_interno = @folio_interno;
            
            SELECT @@ROWCOUNT as rows_affected;
        END;
      `);
      results.push('✅ Stored procedure creado: sp_ActualizarStatusLog');
    } catch (e: any) {
      results.push(`❌ Error creando procedure: ${e.message}`);
    }

    await pool.close();

    return NextResponse.json({
      success: true,
      message: 'Optimización completada',
      results,
    });

  } catch (error: any) {
    console.error('Error en optimización:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
