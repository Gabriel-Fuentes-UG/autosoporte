'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import ExecutiveLayout from '@/components/layout/ExecutiveLayout';
import { Box, Typography, Paper, alpha } from '@mui/material';
import { Refresh } from '@mui/icons-material';

export default function ReprocesamientoPage() {
  return (
    <AuthProvider>
      <ExecutiveLayout>
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: (theme) => alpha(theme.palette.warning.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Refresh sx={{ fontSize: 28, color: 'warning.main' }} />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
                  Reprocesamiento de Órdenes
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Corrección de órdenes con costo cero, inventario negativo u otros errores especificados
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Content Placeholder */}
          <Paper
            elevation={0}
            sx={{
              p: 6,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              textAlign: 'center',
              bgcolor: '#ffffff',
            }}
          >
            <Refresh sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
              Módulo en desarrollo
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.disabled' }}>
              Próximamente podrás reprocesar órdenes que presenten errores como costo cero, 
              inventario negativo u otros problemas que requieran corrección.
            </Typography>
          </Paper>
        </Box>
      </ExecutiveLayout>
    </AuthProvider>
  );
}
