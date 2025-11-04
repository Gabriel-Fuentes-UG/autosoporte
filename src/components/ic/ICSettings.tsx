'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Divider,
} from '@mui/material';
import {
  Settings,
} from '@mui/icons-material';

export default function ICSettings() {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
        Configuración del Sistema IC
      </Typography>
      
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        Personaliza el comportamiento y preferencias del sistema
      </Typography>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <Settings sx={{ mr: 1, verticalAlign: 'middle' }} />
            Configuraciones Generales
          </Typography>
          
          <Box sx={{ mt: 3 }}>
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Actualización automática de códigos"
            />
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Box>
            <FormControlLabel
              control={<Switch />}
              label="Notificaciones por email"
            />
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Box>
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Modo de depuración"
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}