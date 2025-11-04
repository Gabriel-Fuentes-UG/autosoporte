'use client';

import React from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Paper,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Upload,
} from '@mui/icons-material';

export default function ICManagement() {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
        Gestión de Códigos IC
      </Typography>
      
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        Crear, editar y administrar códigos IC de manera eficiente
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Acciones Rápidas
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button variant="contained" startIcon={<Add />} fullWidth>
                  Crear Nuevo Código IC
                </Button>
                <Button variant="outlined" startIcon={<Upload />} fullWidth>
                  Importar Códigos Masivamente
                </Button>
                <Button variant="outlined" startIcon={<Edit />} fullWidth>
                  Editar Códigos Existentes
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Funcionalidad en Desarrollo
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Las herramientas de gestión avanzada estarán disponibles próximamente.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}