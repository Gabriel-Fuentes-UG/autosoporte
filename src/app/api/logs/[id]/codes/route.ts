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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let pool: sql.ConnectionPool | null = null;
  
  try {
    const logId = parseInt(params.id);
    
    if (isNaN(logId)) {
      return NextResponse.json(
        { success: false, error: 'ID inválido' },
        { status: 400 }
      );
    }

    pool = await sql.connect(config);
    
    console.log(`🔍 Fetching codes for log_id: ${logId}`);
    
    const result = await pool.request()
      .input('logId', sql.Int, logId)
      .query(`
        SELECT 
          producto,
          codigo_ic
        FROM IC_Codes
        WHERE log_id = @logId
        ORDER BY id ASC
      `);

    console.log(`✅ Found ${result.recordset.length} codes for log_id ${logId}`);

    return NextResponse.json({
      success: true,
      codes: result.recordset,
    });
  } catch (error) {
    console.error('Error fetching IC codes:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener los códigos IC',
      },
      { status: 500 }
    );
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}
