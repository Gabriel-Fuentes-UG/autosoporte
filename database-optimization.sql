-- ================================================================
-- OPTIMIZACIÓN DE BASE DE DATOS - SISTEMA IC REEBOK
-- Fecha: 2025-11-03
-- ================================================================

-- ============================================================
-- PASO 1: RENOMBRAR COLUMNA CONFUSA EN IC_Logs
-- ============================================================
-- Cambiar 'client' por 'folio_interno' (más semántico)
EXEC sp_rename 'IC_Logs.client', 'folio_interno', 'COLUMN';
GO

-- ============================================================
-- PASO 2: AGREGAR COLUMNA CLIENTE_CODE (CardCode SAP)
-- ============================================================
-- Agregar el CardCode del cliente para vincular con SAP
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_NAME = 'IC_Logs' AND COLUMN_NAME = 'cliente_code')
BEGIN
    ALTER TABLE IC_Logs ADD cliente_code NVARCHAR(50) NULL;
    
    -- Crear índice para búsquedas rápidas por cliente
    CREATE INDEX IX_IC_Logs_cliente_code ON IC_Logs(cliente_code);
END
GO

-- ============================================================
-- PASO 3: AGREGAR ÍNDICES PARA OPTIMIZACIÓN
-- ============================================================
-- Índice para búsquedas por folio_interno (antiguo client)
IF NOT EXISTS (SELECT * FROM sys.indexes 
               WHERE name='IX_IC_Logs_folio_interno' 
               AND object_id = OBJECT_ID('IC_Logs'))
BEGIN
    CREATE INDEX IX_IC_Logs_folio_interno ON IC_Logs(folio_interno);
END
GO

-- Índice compuesto para búsquedas por usuario y fecha
IF NOT EXISTS (SELECT * FROM sys.indexes 
               WHERE name='IX_IC_Logs_user_date' 
               AND object_id = OBJECT_ID('IC_Logs'))
BEGIN
    CREATE INDEX IX_IC_Logs_user_date ON IC_Logs([user], created_at DESC);
END
GO

-- Índice para búsquedas por cliente y fecha
IF NOT EXISTS (SELECT * FROM sys.indexes 
               WHERE name='IX_IC_Logs_cliente_date' 
               AND object_id = OBJECT_ID('IC_Logs'))
BEGIN
    CREATE INDEX IX_IC_Logs_cliente_date ON IC_Logs(cliente, created_at DESC);
END
GO

-- ============================================================
-- PASO 4: AGREGAR COLUMNAS ADICIONALES ÚTILES
-- ============================================================
-- Usuario que modificó por última vez (para auditoría)
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_NAME = 'IC_Logs' AND COLUMN_NAME = 'updated_by')
BEGIN
    ALTER TABLE IC_Logs ADD updated_by NVARCHAR(100) NULL;
END
GO

-- Fecha de última actualización del status
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_NAME = 'IC_Logs' AND COLUMN_NAME = 'updated_at')
BEGIN
    ALTER TABLE IC_Logs ADD updated_at DATETIME2 NULL;
END
GO

-- ============================================================
-- PASO 5: AGREGAR CONSTRAINTS Y VALIDACIONES
-- ============================================================
-- Constraint para validar status
IF NOT EXISTS (SELECT * FROM sys.check_constraints 
               WHERE name = 'CK_IC_Logs_Status')
BEGIN
    ALTER TABLE IC_Logs 
    ADD CONSTRAINT CK_IC_Logs_Status 
    CHECK (status IN ('PENDIENTE', 'PROCESADO', 'ERROR', 'CANCELADO'));
END
GO

-- ============================================================
-- ESTRUCTURA FINAL OPTIMIZADA DE IC_Logs
-- ============================================================
/*
CREATE TABLE IC_Logs (
    -- Identificadores
    id INT IDENTITY(1,1) PRIMARY KEY,
    folio_interno NVARCHAR(50) NOT NULL,           -- IC-013-20251103-001
    
    -- Información del cliente
    cliente_code NVARCHAR(50) NULL,                -- C000000013 (SAP CardCode)
    cliente NVARCHAR(50) NULL,                     -- INNOVA SPORT (nombre)
    
    -- Auditoría y seguimiento
    [user] NVARCHAR(100) NOT NULL,                 -- Usuario que creó
    updated_by NVARCHAR(100) NULL,                 -- Usuario que modificó
    
    -- Registro de acción
    action NVARCHAR(200) NOT NULL,                 -- IC_BULK_UPDATE
    details NVARCHAR(MAX) NULL,                    -- Detalles del proceso
    status NVARCHAR(20) NOT NULL DEFAULT 'PENDIENTE', -- Estado actual
    
    -- Timestamps
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NULL,
    
    -- Índices y constraints
    CONSTRAINT CK_IC_Logs_Status CHECK (status IN ('PENDIENTE', 'PROCESADO', 'ERROR', 'CANCELADO'))
);

-- Índices
CREATE INDEX IX_IC_Logs_folio_interno ON IC_Logs(folio_interno);
CREATE INDEX IX_IC_Logs_cliente_code ON IC_Logs(cliente_code);
CREATE INDEX IX_IC_Logs_status ON IC_Logs(status);
CREATE INDEX IX_IC_Logs_user_date ON IC_Logs([user], created_at DESC);
CREATE INDEX IX_IC_Logs_cliente_date ON IC_Logs(cliente, created_at DESC);
*/

-- ============================================================
-- PASO 6: MIGRAR DATOS EXISTENTES (OPCIONAL)
-- ============================================================
-- Copiar folio_interno existente si aún no se renombró
-- (Este paso solo si decides ejecutar todo desde cero)

-- ============================================================
-- PASO 7: OPTIMIZACIÓN DE IC_Codes
-- ============================================================
-- IC_Codes ya está bien diseñada, solo agregar índice compuesto
IF NOT EXISTS (SELECT * FROM sys.indexes 
               WHERE name='IX_IC_Codes_log_producto' 
               AND object_id = OBJECT_ID('IC_Codes'))
BEGIN
    CREATE INDEX IX_IC_Codes_log_producto ON IC_Codes(log_id, producto);
END
GO

-- ============================================================
-- PASO 8: CREAR VISTA ÚTIL PARA REPORTES
-- ============================================================
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
GO

-- ============================================================
-- PASO 9: STORED PROCEDURE PARA ACTUALIZAR STATUS
-- ============================================================
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
END
GO

-- ============================================================
-- VERIFICACIÓN FINAL
-- ============================================================
-- Consultar estructura actualizada
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME IN ('IC_Logs', 'IC_Codes', 'IC_Users')
ORDER BY TABLE_NAME, ORDINAL_POSITION;

-- Consultar índices
SELECT 
    t.name as tabla,
    i.name as indice,
    i.type_desc as tipo
FROM sys.indexes i
INNER JOIN sys.tables t ON i.object_id = t.object_id
WHERE t.name IN ('IC_Logs', 'IC_Codes', 'IC_Users')
ORDER BY t.name, i.name;

PRINT '✅ Optimización completada exitosamente';
