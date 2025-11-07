import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


// Forzar renderizado dinámico - no pregenerar durante el build
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    // Create or update IC_Users table
    const createUsers = `
IF OBJECT_ID(N'dbo.IC_Users', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.IC_Users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(100) NOT NULL UNIQUE,
    email NVARCHAR(200) NOT NULL,
    password_hash NVARCHAR(200) NOT NULL,
    role NVARCHAR(50) NOT NULL DEFAULT 'user',
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2 DEFAULT SYSUTCDATETIME()
  );
END
ELSE
BEGIN
  -- Add columns if they don't exist
  IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.IC_Users') AND name = 'email')
  BEGIN
    ALTER TABLE dbo.IC_Users ADD email NVARCHAR(200) NOT NULL DEFAULT '';
  END
  
  IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.IC_Users') AND name = 'is_active')
  BEGIN
    ALTER TABLE dbo.IC_Users ADD is_active BIT NOT NULL DEFAULT 1;
  END
  
  IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.IC_Users') AND name = 'updated_at')
  BEGIN
    ALTER TABLE dbo.IC_Users ADD updated_at DATETIME2 DEFAULT SYSUTCDATETIME();
  END
END
`;

    // Create IC_Logs table
    const createLogs = `
IF OBJECT_ID(N'dbo.IC_Logs', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.IC_Logs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    [user] NVARCHAR(100) NOT NULL,
    folio_interno NVARCHAR(150) NOT NULL,
    action NVARCHAR(200) NOT NULL,
    details NVARCHAR(MAX) NULL,
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    status NVARCHAR(20) DEFAULT 'PENDIENTE',
    cliente_code NVARCHAR(50) NULL,
    updated_by NVARCHAR(100) NULL,
    updated_at DATETIME2 NULL
  );
END
`;

    // Create IC_Codes table
    const createCodes = `
IF OBJECT_ID(N'dbo.IC_Codes', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.IC_Codes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    log_id INT NOT NULL,
    producto NVARCHAR(100) NOT NULL,
    codigo_ic NVARCHAR(100) NOT NULL,
    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_IC_Codes_Log FOREIGN KEY (log_id) REFERENCES dbo.IC_Logs(id) ON DELETE CASCADE
  );
END
`;

    // Ejecutar migraciones usando $executeRawUnsafe de Prisma
    await prisma.$executeRawUnsafe(createUsers);
    await prisma.$executeRawUnsafe(createLogs);
    await prisma.$executeRawUnsafe(createCodes);

    return NextResponse.json({ 
      success: true, 
      message: 'Migraciones ejecutadas (IC_Users, IC_Logs, IC_Codes) via Prisma.' 
    });
  } catch (error) {
    console.error('❌ Migration error:', error);
    return NextResponse.json({ 
      error: 'Error ejecutando migraciones', 
      detail: (error as any).message 
    }, { status: 500 });
  }
}
