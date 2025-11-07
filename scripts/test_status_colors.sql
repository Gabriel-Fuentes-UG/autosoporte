-- Script de pruebas para los nuevos estados de IC_Logs
-- Fecha: 2025-11-06
-- Descripción: Insertar datos de prueba con los nuevos estados y colores

-- Insertar logs de prueba con diferentes estados
INSERT INTO IC_Logs (
    [user], 
    folio_interno, 
    [action], 
    details, 
    cliente, 
    status, 
    cliente_code,
    created_at
) VALUES 
-- Estado PROCESADO (Verde pastel)
('admin', 'TEST-001', 'Prueba estado PROCESADO', 'Log de prueba procesado correctamente', 'Cliente Test A', 'PROCESADO', 'CTA', GETDATE()),

-- Estado PENDIENTE (Azul pastel) 
('user1', 'TEST-002', 'Prueba estado PENDIENTE', 'Log de prueba en estado pendiente', 'Cliente Test B', 'PENDIENTE', 'CTB', GETDATE()),

-- Estado FALLIDO (Rojo pastel)
('user2', 'TEST-003', 'Prueba estado FALLIDO', 'Log de prueba que falló durante el proceso', 'Cliente Test C', 'FALLIDO', 'CTC', GETDATE());

-- Verificar que se insertaron correctamente
SELECT 
    id,
    [user],
    folio_interno,
    status,
    cliente,
    created_at
FROM IC_Logs 
WHERE folio_interno LIKE 'TEST-%'
ORDER BY created_at DESC;

-- Limpiar datos de prueba (ejecutar solo si es necesario)
-- DELETE FROM IC_Logs WHERE folio_interno LIKE 'TEST-%';