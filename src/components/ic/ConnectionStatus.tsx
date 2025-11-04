'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Divider,
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Refresh,
  Storage,
  Timer,
} from '@mui/icons-material';
import { apiPath } from '@/lib/api-path';

interface ConnectionStatus {
  connected: boolean;
  serverTimestamp?: string;
  serverInfo?: {
    DATABASE_NAME: string;
    SQL_PORT: number;
    serverVersion: string;
  };
  tableStatus?: {
    oitmExists: boolean;
    totalItems: number;
  };
  error?: string;
  errorType?: string;
  connectionString?: string;
}

export default function ConnectionStatus() {
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkConnection = async () => {
    setLoading(true);
    try {
      console.log('🔍 Verificando conexión HANA...');
      const response = await fetch(apiPath('/api/health'));
      const data = await response.json();
      
      setStatus(data);
      setLastCheck(new Date());
      
      if (data.success) {
        console.log('✅ Conexión HANA exitosa');
      } else {
        console.error('❌ Error de conexión HANA:', data.error);
      }
    } catch (error) {
      console.error('❌ Error verificando conexión:', error);
      setStatus({
        connected: false,
        error: 'Error de red al verificar conexión',
        errorType: 'NETWORK_ERROR'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkConnection();
    
    // Verificar conexión cada 30 segundos
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading && !status) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress size={40} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Verificando conexión HANA...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Estado de Conexión SAP HANA
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={loading ? <CircularProgress size={16} /> : <Refresh />}
            onClick={checkConnection}
            disabled={loading}
          >
            Actualizar
          </Button>
        </Box>

        {status?.connected ? (
          <>
            <Alert severity="success" sx={{ mb: 2 }}>
              <Typography variant="subtitle2">
                ✅ Conectado exitosamente a SAP HANA
              </Typography>
            </Alert>

            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <Chip
                icon={<CheckCircle />}
                label="Base de datos activa"
                color="success"
                size="small"
              />
              <Chip
                icon={<Storage />}
                label={`${status.tableStatus?.totalItems || 0} códigos IC`}
                color="info"
                size="small"
              />
              <Chip
                icon={<Timer />}
                label={`Último check: ${lastCheck?.toLocaleTimeString() || 'N/A'}`}
                color="default"
                size="small"
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Información del Servidor:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                📊 Base de datos: {status.serverInfo?.DATABASE_NAME || 'SBOVECTOR'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                🌐 Puerto: {status.serverInfo?.SQL_PORT || 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                📅 Timestamp servidor: {status.serverTimestamp ? new Date(status.serverTimestamp).toLocaleString() : 'N/A'}
              </Typography>
              {status.serverInfo?.serverVersion && (
                <Typography variant="body2" color="text.secondary">
                  🏷️ Versión: {status.serverInfo.serverVersion}
                </Typography>
              )}
            </Box>
          </>
        ) : (
          <>
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="subtitle2">
                ❌ Error de conexión con SAP HANA
              </Typography>
              <Typography variant="body2">
                {status?.error || 'Error desconocido'}
              </Typography>
            </Alert>

            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <Chip
                icon={<Error />}
                label="Sin conexión"
                color="error"
                size="small"
              />
              <Chip
                icon={<Timer />}
                label={`Último intento: ${lastCheck?.toLocaleTimeString() || 'N/A'}`}
                color="default"
                size="small"
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Diagnóstico:
              </Typography>
              
              {status?.errorType === 'HOST_NOT_FOUND' && (
                <Typography variant="body2" color="error.main">
                  🔌 No se puede conectar al servidor. Verificar host y puerto en la configuración.
                </Typography>
              )}
              
              {status?.errorType === 'AUTHENTICATION_ERROR' && (
                <Typography variant="body2" color="error.main">
                  🔐 Error de autenticación. Verificar usuario y contraseña en variables de entorno.
                </Typography>
              )}
              
              {status?.errorType === 'DATABASE_ERROR' && (
                <Typography variant="body2" color="error.main">
                  💾 Base de datos SBOVECTOR no encontrada o inaccesible.
                </Typography>
              )}

              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                📡 Conexión configurada: {status?.connectionString || 'NO CONFIGURADO'}
              </Typography>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
}