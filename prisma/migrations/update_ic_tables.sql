-- Migración para actualizar las tablas IC_Logs e IC_Codes

-- 1. Agregar nuevas columnas a IC_Logs
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_NAME = 'IC_Logs' AND COLUMN_NAME = 'cliente')
BEGIN
    ALTER TABLE IC_Logs ADD cliente NVARCHAR(50) NULL;
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_NAME = 'IC_Logs' AND COLUMN_NAME = 'status')
BEGIN
    ALTER TABLE IC_Logs ADD status NVARCHAR(20) NOT NULL DEFAULT 'PENDIENTE';
    CREATE INDEX IX_IC_Logs_status ON IC_Logs(status);
END

-- 2. Respaldar IC_Codes si tiene datos (opcional, descomentar si necesitas)
-- IF EXISTS (SELECT * FROM IC_Codes)
-- BEGIN
--     SELECT * INTO IC_Codes_Backup_20251031 FROM IC_Codes;
-- END

-- 3. Eliminar tabla IC_Codes antigua y recrearla con nueva estructura
DROP TABLE IF EXISTS IC_Codes;

CREATE TABLE IC_Codes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    log_id INT NOT NULL,
    producto NVARCHAR(100) NOT NULL,
    codigo_ic NVARCHAR(100) NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE()
);

CREATE INDEX IX_IC_Codes_log_id ON IC_Codes(log_id);

PRINT 'Migración completada exitosamente';
