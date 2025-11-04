'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  TrendingUp,
  People,
  Assignment,
  CheckCircle,
  Warning,
  Error as ErrorIcon
} from '@mui/icons-material';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalLogs: number;
  recentActivity: any[];
}

export default function AdminHome() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Aquí llamarías a tu API real
      // const response = await fetch('/api/admin/dashboard');
      // const data = await response.json();
      
      // Datos de ejemplo por ahora
      setTimeout(() => {
        setStats({
          totalUsers: 15,
          activeUsers: 12,
          totalLogs: 1250,
          recentActivity: [
            { id: 1, user: 'Juan Pérez', action: 'Búsqueda IC', timestamp: new Date(), status: 'success' },
            { id: 2, user: 'María García', action: 'Consulta artículo', timestamp: new Date(), status: 'success' },
            { id: 3, user: 'Pedro López', action: 'Error de conexión', timestamp: new Date(), status: 'error' },
          ]
        });
        setLoading(false);
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Error cargando datos');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress sx={{ color: '#2c3e50' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, color: '#2c3e50', fontWeight: 700 }}>
        Dashboard Administrativo
      </Typography>

      {/* Tarjetas de Estadísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#2c3e50', color: 'white', borderRadius: 0 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {stats?.totalUsers || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Total Usuarios
                  </Typography>
                </Box>
                <People sx={{ fontSize: 48, opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#27ae60', color: 'white', borderRadius: 0 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {stats?.activeUsers || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Usuarios Activos
                  </Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 48, opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#3498db', color: 'white', borderRadius: 0 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {stats?.totalLogs || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Registros Totales
                  </Typography>
                </Box>
                <Assignment sx={{ fontSize: 48, opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#e67e22', color: 'white', borderRadius: 0 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    98%
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Uptime
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 48, opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Actividad Reciente */}
      <Card sx={{ borderRadius: 0 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, color: '#2c3e50', fontWeight: 600 }}>
            Actividad Reciente del Sistema
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f7fa' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Usuario</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Acción</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Fecha/Hora</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats?.recentActivity.map((activity) => (
                  <TableRow key={activity.id} hover>
                    <TableCell>{activity.user}</TableCell>
                    <TableCell>{activity.action}</TableCell>
                    <TableCell>{new Date(activity.timestamp).toLocaleString('es-ES')}</TableCell>
                    <TableCell>
                      {activity.status === 'success' ? (
                        <Chip 
                          label="Exitoso" 
                          size="small" 
                          sx={{ bgcolor: '#27ae60', color: 'white', borderRadius: 0 }} 
                        />
                      ) : (
                        <Chip 
                          label="Error" 
                          size="small" 
                          sx={{ bgcolor: '#e74c3c', color: 'white', borderRadius: 0 }} 
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Información del Sistema */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 0 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: '#2c3e50', fontWeight: 600 }}>
                Estado del Sistema
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Base de Datos
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={85} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 0,
                    bgcolor: '#ecf0f1',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: '#27ae60'
                    }
                  }} 
                />
                <Typography variant="caption" color="text.secondary">
                  85% disponible
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  CPU
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={45} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 0,
                    bgcolor: '#ecf0f1',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: '#3498db'
                    }
                  }} 
                />
                <Typography variant="caption" color="text.secondary">
                  45% uso
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Memoria
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={62} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 0,
                    bgcolor: '#ecf0f1',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: '#e67e22'
                    }
                  }} 
                />
                <Typography variant="caption" color="text.secondary">
                  62% uso
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 0 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: '#2c3e50', fontWeight: 600 }}>
                Alertas y Notificaciones
              </Typography>
              <Alert severity="info" sx={{ mb: 2, borderRadius: 0 }}>
                Sistema funcionando correctamente
              </Alert>
              <Alert severity="warning" sx={{ mb: 2, borderRadius: 0 }}>
                3 usuarios pendientes de activación
              </Alert>
              <Alert severity="success" sx={{ borderRadius: 0 }}>
                Última copia de seguridad: Hace 2 horas
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
