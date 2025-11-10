-- Script para crear las tablas en PRODUCCIÓN: CadenaDeSuministro
-- Solo las tablas necesarias para el sistema IC

USE CadenaDeSuministro;
GO

-- Tabla de Usuarios
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'IC_Users')
BEGIN
    CREATE TABLE IC_Users (
        id INT IDENTITY(1,1) NOT NULL,
        username NVARCHAR(100) NOT NULL,
        password_hash NVARCHAR(200) NOT NULL,
        role NVARCHAR(50) NOT NULL DEFAULT 'user',
        created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
        email NVARCHAR(200) NOT NULL DEFAULT '',
        is_active BIT NOT NULL DEFAULT 1,
        updated_at DATETIME2 DEFAULT SYSUTCDATETIME(),
        CONSTRAINT PK__IC_Users__3213E83F3650DF97 PRIMARY KEY (id),
        CONSTRAINT UQ__IC_Users__F3DBC5723100E9EF UNIQUE (username),
        CONSTRAINT UQ__IC_Users__email UNIQUE (email)
    );
    PRINT 'Tabla IC_Users creada exitosamente';
END
ELSE
BEGIN
    PRINT 'Tabla IC_Users ya existe';
END
GO

-- Tabla de Logs de operaciones
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'IC_Logs')
BEGIN
    CREATE TABLE IC_Logs (
        id INT IDENTITY(1,1) NOT NULL,
        [user] NVARCHAR(100) NOT NULL,
        folio_interno NVARCHAR(150) NOT NULL,
        [action] NVARCHAR(200) NOT NULL,
        details NVARCHAR(MAX) NULL,
        created_at DATETIME2 DEFAULT GETDATE(),
        cliente NVARCHAR(200) NULL,
        [status] NVARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
        cliente_code NVARCHAR(50) NULL,
        updated_by NVARCHAR(100) NULL,
        updated_at DATETIME2 NULL,
        CONSTRAINT PK__IC_Logs__3213E83FB9DAC845 PRIMARY KEY (id)
    );
    
    -- Crear índices para mejorar rendimiento
    CREATE INDEX IX_IC_Logs_status ON IC_Logs([status]);
    CREATE INDEX IX_IC_Logs_folio_interno ON IC_Logs(folio_interno);
    CREATE INDEX IX_IC_Logs_cliente_code ON IC_Logs(cliente_code);
    CREATE INDEX IX_IC_Logs_user_date ON IC_Logs([user], created_at DESC);
    CREATE INDEX IX_IC_Logs_cliente_date ON IC_Logs(cliente, created_at DESC);
    
    PRINT 'Tabla IC_Logs creada exitosamente con índices';
END
ELSE
BEGIN
    PRINT 'Tabla IC_Logs ya existe';
END
GO

-- Tabla de Códigos IC
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'IC_Codes')
BEGIN
    CREATE TABLE IC_Codes (
        id INT IDENTITY(1,1) NOT NULL,
        log_id INT NOT NULL,
        producto NVARCHAR(100) NOT NULL,
        codigo_ic NVARCHAR(100) NOT NULL,
        created_at DATETIME2 DEFAULT GETDATE(),
        CONSTRAINT PK__IC_Codes__3213E83F1CAF7DE9 PRIMARY KEY (id),
        CONSTRAINT FK_IC_Codes_IC_Logs FOREIGN KEY (log_id) 
            REFERENCES IC_Logs(id) ON DELETE CASCADE
    );
    
    -- Crear índices
    CREATE INDEX IX_IC_Codes_log_id ON IC_Codes(log_id);
    CREATE INDEX IX_IC_Codes_log_producto ON IC_Codes(log_id, producto);
    
    PRINT 'Tabla IC_Codes creada exitosamente con índices';
END
ELSE
BEGIN
    PRINT 'Tabla IC_Codes ya existe';
END
GO

-- Verificar las tablas creadas
SELECT 
    t.name AS TableName,
    SCHEMA_NAME(t.schema_id) AS SchemaName,
    c.name AS ColumnName,
    ty.name AS DataType,
    c.max_length AS MaxLength,
    c.is_nullable AS IsNullable
FROM sys.tables t
INNER JOIN sys.columns c ON t.object_id = c.object_id
INNER JOIN sys.types ty ON c.user_type_id = ty.user_type_id
WHERE t.name IN ('IC_Users', 'IC_Logs', 'IC_Codes')
ORDER BY t.name, c.column_id;
GO

PRINT '============================================';
PRINT 'Creación de tablas completada';
PRINT 'Base de datos: CadenaDeSuministro (PRODUCCIÓN)';
PRINT '============================================';
GO
