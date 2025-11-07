-- Migración para actualizar estados de IC_Logs
-- Fecha: 2025-11-06
-- Descripción: Actualizar estados existentes y agregar soporte para PROCESADO, PENDIENTE, FALLIDO

-- Paso 1: Verificar datos actuales
SELECT status, COUNT(*) as count 
FROM IC_Logs 
GROUP BY status;

-- Paso 2: Migrar estados antiguos a nuevos estados
-- Si hay datos con 'ERROR', cambiarlos a 'FALLIDO'
UPDATE IC_Logs 
SET status = 'FALLIDO' 
WHERE status = 'ERROR';

-- Si hay datos con estados en minúsculas, convertirlos a mayúsculas
UPDATE IC_Logs 
SET status = UPPER(status) 
WHERE status != UPPER(status);

-- Paso 3: Agregar constraint para validar solo los estados permitidos
-- Primero eliminar el constraint existente si existe
IF EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_IC_Logs_Status')
BEGIN
    ALTER TABLE IC_Logs DROP CONSTRAINT CK_IC_Logs_Status;
END

-- Agregar nuevo constraint con los estados válidos
ALTER TABLE IC_Logs 
ADD CONSTRAINT CK_IC_Logs_Status 
CHECK (status IN ('PROCESADO', 'PENDIENTE', 'FALLIDO'));

-- Paso 4: Actualizar el valor por defecto si es necesario
-- El valor por defecto ya está configurado como 'PENDIENTE' en el schema de Prisma

-- Paso 5: Verificar los cambios
SELECT status, COUNT(*) as count 
FROM IC_Logs 
GROUP BY status
ORDER BY status;

-- Paso 6: Verificar que todos los registros tienen estados válidos
SELECT COUNT(*) as invalid_status_count
FROM IC_Logs 
WHERE status NOT IN ('PROCESADO', 'PENDIENTE', 'FALLIDO');

-- Si el resultado anterior es 0, la migración fue exitosa