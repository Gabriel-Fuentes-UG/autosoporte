-- Insertar datos de prueba para el usuario actual: Gabriel Fuentes Duarte
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
-- Estado PROCESADO para Gabriel Fuentes Duarte
('Gabriel Fuentes Duarte', 'GFD-001', 'Actualización masiva de códigos IC', 'Proceso completado exitosamente - 25 códigos actualizados', 'INNOVA SPORT', 'PROCESADO', 'INNOVA', GETDATE()),

-- Estado PENDIENTE para Gabriel Fuentes Duarte  
('Gabriel Fuentes Duarte', 'GFD-002', 'Carga de nuevos productos', 'Pendiente de validación por el sistema externo', 'DEPORTES MARTI', 'PENDIENTE', 'DMARTI', GETDATE()),

-- Estado FALLIDO para Gabriel Fuentes Duarte
('Gabriel Fuentes Duarte', 'GFD-003', 'Sincronización con API externa', 'Error de conectividad con el servidor de códigos IC', 'Cliente Test Premium', 'FALLIDO', 'CPREM', GETDATE()),

-- Más datos PENDIENTE 
('Gabriel Fuentes Duarte', 'GFD-004', 'Actualización de inventario', 'En proceso de validación de stock', 'SERVICIOS COMERCIALES AMAZON MEXICO', 'PENDIENTE', 'SCAMX', DATEADD(HOUR, -2, GETDATE())),

-- Más datos PROCESADO
('Gabriel Fuentes Duarte', 'GFD-005', 'Migración de datos legacy', 'Migración completada sin errores', 'COPPEL', 'PROCESADO', 'COPP', DATEADD(HOUR, -1, GETDATE()));

-- Verificar que se insertaron correctamente
SELECT 
    id,
    [user],
    folio_interno,
    status,
    cliente,
    created_at
FROM IC_Logs 
WHERE [user] = 'Gabriel Fuentes Duarte'
ORDER BY created_at DESC;