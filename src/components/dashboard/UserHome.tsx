'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Avatar,
  Stack,
  alpha,
  useTheme,
  Paper,
  Divider,
} from '@mui/material';
import {
  Assignment,
  CheckCircle,
  AccessTime,
  TrendingUp,
  Person,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { apiPath } from '@/lib/api-path';

interface UserStats {
  totalLogs: number;
  logsHoy: number;
  totalCodigos: number;
  codigosHoy: number;
  recentActivity: Array<{
    id: number;
    cliente: string;
    status: string;
    created_at: string;
    total_codigos: number;
  }>;
  username: string;
  email: string;
}

export default function UserHome() {
  const { user } = useAuth();
  const theme = useTheme();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await fetch(apiPath('/api/user/stats'));
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      } else {
        setError(data.error || 'Error al cargar datos');
      }
      setLoading(false);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PROCESADO':
        return { bg: '#27ae60', text: 'white' };
      case 'PENDIENTE':
        return { bg: '#f39c12', text: 'white' };
      case 'ERROR':
        return { bg: '#e74c3c', text: 'white' };
      default:
        return { bg: '#95a5a6', text: 'white' };
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 1, color: '#2c3e50', fontWeight: 700 }}>
        Bienvenido, {stats?.username || user?.username}
      </Typography>
      <Typography variant="body1" sx={{ mb: 3, color: '#7f8c8d' }}>
        Resumen de tu actividad en AutoSoporte
      </Typography>

      {/* Tarjetas de Estadísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              height: '100%',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              transition: 'all 0.3s',
              '&:hover': {
                boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.15)}`,
                borderColor: alpha(theme.palette.primary.main, 0.3),
                transform: 'translateY(-2px)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                  }}
                >
                  <Assignment />
                </Avatar>
                <Chip
                  label="Total"
                  size="small"
                  sx={{
                    height: 24,
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    bgcolor: alpha(theme.palette.grey[500], 0.1),
                  }}
                />
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, color: theme.palette.primary.main }}>
                {stats?.totalLogs || 0}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                Operaciones Totales
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total de registros realizados
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              height: '100%',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              transition: 'all 0.3s',
              '&:hover': {
                boxShadow: `0 4px 20px ${alpha(theme.palette.success.main, 0.15)}`,
                borderColor: alpha(theme.palette.success.main, 0.3),
                transform: 'translateY(-2px)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    color: theme.palette.success.main,
                  }}
                >
                  <CheckCircle />
                </Avatar>
                <Chip
                  label="Total"
                  size="small"
                  sx={{
                    height: 24,
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    bgcolor: alpha(theme.palette.grey[500], 0.1),
                  }}
                />
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, color: theme.palette.success.main }}>
                {stats?.totalCodigos || 0}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                Códigos IC Totales
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Códigos procesados
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              height: '100%',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              transition: 'all 0.3s',
              '&:hover': {
                boxShadow: `0 4px 20px ${alpha(theme.palette.info.main, 0.15)}`,
                borderColor: alpha(theme.palette.info.main, 0.3),
                transform: 'translateY(-2px)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: alpha(theme.palette.info.main, 0.1),
                    color: theme.palette.info.main,
                  }}
                >
                  <AccessTime />
                </Avatar>
                <Chip
                  label="Hoy"
                  size="small"
                  sx={{
                    height: 24,
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    bgcolor: alpha(theme.palette.grey[500], 0.1),
                  }}
                />
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, color: theme.palette.info.main }}>
                {stats?.logsHoy || 0}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                Operaciones Hoy
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Registros del día actual
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              height: '100%',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              transition: 'all 0.3s',
              '&:hover': {
                boxShadow: `0 4px 20px ${alpha(theme.palette.warning.main, 0.15)}`,
                borderColor: alpha(theme.palette.warning.main, 0.3),
                transform: 'translateY(-2px)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                    color: theme.palette.warning.main,
                  }}
                >
                  <TrendingUp />
                </Avatar>
                <Chip
                  label="Hoy"
                  size="small"
                  sx={{
                    height: 24,
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    bgcolor: alpha(theme.palette.grey[500], 0.1),
                  }}
                />
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, color: theme.palette.warning.main }}>
                {stats?.codigosHoy || 0}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                Códigos IC Hoy
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Códigos del día actual
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Actividad Reciente del Usuario */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          mb: 3,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: '#2c3e50' }}>
            Mi Actividad Reciente
          </Typography>
          {stats?.recentActivity && stats.recentActivity.length > 0 ? (
            <Box sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(theme.palette.grey[500], 0.05) }}>
                    <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Log</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Cliente</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Códigos IC</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Fecha/Hora</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.recentActivity.map((activity, index) => {
                    const colors = getStatusColor(activity.status);
                    return (
                      <TableRow 
                        key={activity.id}
                        sx={{
                          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) },
                          borderBottom: index === stats.recentActivity.length - 1 ? 'none' : undefined,
                        }}
                      >
                        <TableCell>
                          <Chip 
                            label={`#${activity.id}`}
                            size="small"
                            sx={{
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main,
                              fontWeight: 700,
                              fontSize: '0.7rem',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {activity.cliente}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            icon={<Assignment sx={{ fontSize: 14 }} />}
                            label={activity.total_codigos} 
                            size="small" 
                            sx={{ 
                              bgcolor: alpha(theme.palette.info.main, 0.1),
                              color: theme.palette.info.main,
                              fontWeight: 700,
                              fontSize: '0.7rem',
                              '& .MuiChip-icon': {
                                color: theme.palette.info.main,
                              },
                            }} 
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                            {formatDate(activity.created_at)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={activity.status} 
                            size="small" 
                            sx={{ 
                              bgcolor: colors.bg,
                              color: colors.text,
                              fontWeight: 700,
                              fontSize: '0.7rem',
                            }} 
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No hay actividad reciente
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Tus operaciones aparecerán aquí
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Información de la Cuenta */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                <Avatar
                  sx={{
                    width: 56,
                    height: 56,
                    bgcolor: theme.palette.primary.main,
                    fontWeight: 700,
                    fontSize: '1.5rem',
                  }}
                >
                  {stats?.username?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#2c3e50' }}>
                    Información de la Cuenta
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Detalles de tu perfil
                  </Typography>
                </Box>
              </Stack>
              
              <Divider sx={{ mb: 2 }} />
              
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>
                    Nombre de Usuario
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                    {stats?.username || user?.username}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>
                    Correo Electrónico
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                    {stats?.email || user?.email || 'No registrado'}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: '#2c3e50' }}>
                Información del Sistema
              </Typography>
              <Stack spacing={2}>
                <Alert 
                  severity="success" 
                  sx={{ 
                    borderRadius: 1,
                    border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                  }}
                >
                  Sistema funcionando correctamente
                </Alert>
                <Alert 
                  severity="info"
                  sx={{ 
                    borderRadius: 1,
                    border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                  }}
                >
                  Última actualización: {new Date().toLocaleString('es-ES')}
                </Alert>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
