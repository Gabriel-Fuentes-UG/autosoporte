'use client';

import React, { useState, useEffect } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import ExecutiveLayout from '@/components/layout/ExecutiveLayout';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Divider,
  Chip,
  useMediaQuery,
  useTheme,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  TrendingUp,
  People,
  Assignment,
  CheckCircle,
  Error,
  Today,
  Visibility,
} from '@mui/icons-material';
import { apiPath } from '@/lib/api-path';

interface Stats {
  totalTickets: number;
  ticketsHoy: number;
  codigosHoy: number;
  logsPorMes: Array<{ mes: string; total: number }>;
  codigosPorSemana: Array<{ semana: string; total: number }>;
  porCliente: Array<{ cliente: string; total: number }>;
  porUsuario: Array<{ user: string; total: number }>;
  porEstado: Array<{ status: string; total: number }>;
  recientes: Array<{
    id: number;
    user: string;
    cliente: string;
    created_at: string;
    status: string;
    total_codigos: number;
  }>;
}

function EstadisticasContent() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Modal state para códigos IC
  const [codigosModal, setCodigosModal] = useState({
    open: false,
    logId: 0,
    codes: [] as Array<{ producto: string; codigo_ic: string }>,
    loading: false,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(apiPath('/api/estadisticas'));
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCodigosIC = async (logId: number) => {
    setCodigosModal({ open: true, logId, codes: [], loading: true });
    try {
      const response = await fetch(`/api/logs/${logId}/codes`);
      if (response.ok) {
        const data = await response.json();
        setCodigosModal(prev => ({ ...prev, codes: data.codes || [], loading: false }));
      }
    } catch (error) {
      console.error('Error fetching IC codes:', error);
      setCodigosModal(prev => ({ ...prev, loading: false }));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-MX', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      PENDIENTE: { bg: '#fbbf24', text: '#92400e' },
      PROCESADO: { bg: '#22c55e', text: '#065f46' },
      ERROR: { bg: '#ef4444', text: '#991b1b' },
    };
    return colors[status] || { bg: '#94a3b8', text: '#1e293b' };
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} sx={{ color: '#2c3e50' }} />
      </Box>
    );
  }

  if (!stats) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">
          Error al cargar las estadísticas
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#2c3e50', mb: 1 }}>
          Estadísticas del Sistema
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Métricas y análisis de actividad en tiempo real
        </Typography>
      </Box>

      {/* Tarjetas de resumen */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 0, bgcolor: '#f0f9ff' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="start">
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Total Tickets
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#2c3e50' }}>
                    {stats?.totalTickets?.toLocaleString() || '0'}
                  </Typography>
                </Box>
                <Assignment sx={{ fontSize: 40, color: '#3b82f6', opacity: 0.7 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 0, bgcolor: '#fef3f2' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="start">
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Tickets Hoy
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#2c3e50' }}>
                    {stats?.ticketsHoy?.toLocaleString() || '0'}
                  </Typography>
                </Box>
                <Today sx={{ fontSize: 40, color: '#ef4444', opacity: 0.7 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 0, bgcolor: '#faf5ff' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="start">
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Códigos Hoy
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#2c3e50' }}>
                    {stats?.codigosHoy?.toLocaleString() || '0'}
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, color: '#a855f7', opacity: 0.7 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Gráfica de Dona - Estado de Tickets */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 0, height: 400, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#2c3e50', mb: 3 }}>
              Estado de Tickets
            </Typography>
            
            {(stats?.porEstado?.length || 0) === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No hay datos disponibles
              </Typography>
            ) : (
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                {(() => {
                  const pendiente = stats?.porEstado?.find(e => e.status === 'PENDIENTE')?.total || 0;
                  const procesado = stats?.porEstado?.find(e => e.status === 'PROCESADO')?.total || 0;
                  const error = stats?.porEstado?.find(e => e.status === 'ERROR')?.total || 0;
                  const total = pendiente + procesado + error;
                  
                  if (total === 0) return <Typography variant="body2" color="text.secondary">Sin datos</Typography>;
                  
                  const pendientePercent = (pendiente / total) * 100;
                  const procesadoPercent = (procesado / total) * 100;
                  const errorPercent = (error / total) * 100;
                  
                  return (
                    <Box sx={{ textAlign: 'center', width: '100%' }}>
                      <Box sx={{ position: 'relative', display: 'inline-flex', mb: 3 }}>
                        <Box
                          sx={{
                            width: 200,
                            height: 200,
                            borderRadius: '50%',
                            background: `conic-gradient(
                              #fbbf24 0% ${pendientePercent}%,
                              #22c55e ${pendientePercent}% ${pendientePercent + procesadoPercent}%,
                              #ef4444 ${pendientePercent + procesadoPercent}% 100%
                            )`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          }}
                        >
                          <Box
                            sx={{
                              width: 140,
                              height: 140,
                              borderRadius: '50%',
                              bgcolor: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexDirection: 'column',
                            }}
                          >
                            <Typography variant="h3" sx={{ fontWeight: 700, color: '#2c3e50' }}>
                              {total}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Total
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      
                      <Stack spacing={1.5}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#fbbf24' }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>Pendiente</Typography>
                          </Stack>
                          <Chip
                            label={`${pendiente} (${pendientePercent.toFixed(1)}%)`}
                            size="small"
                            sx={{ bgcolor: '#fef3c7', color: '#92400e', fontWeight: 600, borderRadius: 1 }}
                          />
                        </Stack>
                        
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#22c55e' }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>Procesado</Typography>
                          </Stack>
                          <Chip
                            label={`${procesado} (${procesadoPercent.toFixed(1)}%)`}
                            size="small"
                            sx={{ bgcolor: '#d1fae5', color: '#065f46', fontWeight: 600, borderRadius: 1 }}
                          />
                        </Stack>
                        
                        {error > 0 && (
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ef4444' }} />
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>Error</Typography>
                            </Stack>
                            <Chip
                              label={`${error} (${errorPercent.toFixed(1)}%)`}
                              size="small"
                              sx={{ bgcolor: '#fee2e2', color: '#991b1b', fontWeight: 600, borderRadius: 1 }}
                            />
                          </Stack>
                        )}
                      </Stack>
                    </Box>
                  );
                })()}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Tickets por Mes */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 0, height: 400 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#2c3e50', mb: 3 }}>
              Tickets por Mes (Últimos 12)
            </Typography>
            
            {(stats?.logsPorMes?.length || 0) === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No hay datos disponibles
              </Typography>
            ) : (
              <Box 
                sx={{ 
                  maxHeight: 320, 
                  overflowY: 'auto',
                  pr: 1,
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: '#f1f1f1',
                    borderRadius: '10px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: '#888',
                    borderRadius: '10px',
                    '&:hover': {
                      backgroundColor: '#555',
                    },
                  },
                }}
              >
                <Stack spacing={2}>
                {stats?.logsPorMes?.map((item, index) => {
                  const maxTotal = Math.max(...(stats?.logsPorMes?.map(m => m.total) || [1]));
                  const percentage = (item.total / maxTotal) * 100;
                  
                  return (
                    <Box key={index}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                          {item.mes}
                        </Typography>
                        <Chip
                          label={`${item.total} tickets`}
                          size="small"
                          sx={{ bgcolor: '#3b82f6', color: 'white', fontWeight: 600, borderRadius: 1 }}
                        />
                      </Box>
                      <Box sx={{ width: '100%', bgcolor: '#e2e8f0', height: 8, borderRadius: 1, overflow: 'hidden' }}>
                        <Box
                          sx={{
                            width: `${percentage}%`,
                            bgcolor: '#3b82f6',
                            height: '100%',
                            transition: 'width 0.5s ease',
                          }}
                        />
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Códigos IC por Semana del Mes */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 0, height: 400 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#2c3e50', mb: 3 }}>
              Códigos IC por Semana (Mes Actual)
            </Typography>
            
            {(stats?.codigosPorSemana?.length || 0) === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No hay datos disponibles
              </Typography>
            ) : (
              <Box 
                sx={{ 
                  maxHeight: 320,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <Stack spacing={3}>
                {stats?.codigosPorSemana?.map((item, index) => {
                  const maxTotal = Math.max(...(stats?.codigosPorSemana?.map(s => s.total) || [1]));
                  const percentage = (item.total / maxTotal) * 100;
                  const colors = ['#8b5cf6', '#a855f7', '#c084fc', '#d8b4fe'];
                  
                  return (
                    <Box key={index}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                          {item.semana}
                        </Typography>
                        <Chip
                          label={`${item.total} códigos`}
                          size="small"
                          sx={{ bgcolor: colors[index] || '#a855f7', color: 'white', fontWeight: 600, borderRadius: 1 }}
                        />
                      </Box>
                      <Box sx={{ width: '100%', bgcolor: '#e2e8f0', height: 10, borderRadius: 1, overflow: 'hidden' }}>
                        <Box
                          sx={{
                            width: `${percentage}%`,
                            bgcolor: colors[index] || '#a855f7',
                            height: '100%',
                            transition: 'width 0.5s ease',
                          }}
                        />
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Logs por Cliente */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 0, height: 400 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#2c3e50', mb: 3 }}>
              Actividad por Cliente
            </Typography>
            
            {(stats?.porCliente?.length || 0) === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No hay datos disponibles
              </Typography>
            ) : (
              <Box 
                sx={{ 
                  maxHeight: 320, 
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  pr: 1,
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: '#f1f1f1',
                    borderRadius: '10px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: '#888',
                    borderRadius: '10px',
                    '&:hover': {
                      backgroundColor: '#555',
                    },
                  },
                }}
              >
                <Stack spacing={2}>
                {stats?.porCliente?.map((item, index) => (
                  <Box key={index}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.9rem' }} noWrap>
                        {item.cliente}
                      </Typography>
                      <Chip
                        label={`${item.total} tickets`}
                        size="small"
                        sx={{ bgcolor: '#2c3e50', color: 'white', fontWeight: 600, borderRadius: 1 }}
                      />
                    </Box>
                    <Box sx={{ width: '100%', bgcolor: '#e2e8f0', height: 8, borderRadius: 1, overflow: 'hidden' }}>
                      <Box
                        sx={{
                          width: `${(item.total / (stats?.totalTickets || 1)) * 100}%`,
                          bgcolor: '#2c3e50',
                          height: '100%',
                          transition: 'width 0.5s ease',
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Stack>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Logs por Usuario */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 0, height: 400 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#2c3e50', mb: 3 }}>
              Actividad por Usuario
            </Typography>
            
            {(stats?.porUsuario?.length || 0) === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No hay datos disponibles
              </Typography>
            ) : (
              <Box 
                sx={{ 
                  maxHeight: 320, 
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  pr: 1,
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: '#f1f1f1',
                    borderRadius: '10px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: '#888',
                    borderRadius: '10px',
                    '&:hover': {
                      backgroundColor: '#555',
                    },
                  },
                }}
              >
                <Stack spacing={2}>
                {stats?.porUsuario?.map((item, index) => (
                  <Box key={index}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <People sx={{ fontSize: 20, color: '#64748b' }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {item.user}
                        </Typography>
                      </Stack>
                      <Chip
                        label={`${item.total} tickets`}
                        size="small"
                        sx={{ bgcolor: '#3b82f6', color: 'white', fontWeight: 600, borderRadius: 1 }}
                      />
                    </Box>
                    <Box sx={{ width: '100%', bgcolor: '#e2e8f0', height: 8, borderRadius: 1, overflow: 'hidden' }}>
                      <Box
                        sx={{
                          width: `${(item.total / (stats?.totalTickets || 1)) * 100}%`,
                          bgcolor: '#3b82f6',
                          height: '100%',
                          transition: 'width 0.5s ease',
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Stack>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Actividad Reciente */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#2c3e50', mb: 3 }}>
              Actividad Reciente (Últimos 15 registros)
            </Typography>
            
            {(stats?.recientes?.length || 0) === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No hay actividad reciente
              </Typography>
            ) : (
              <Box 
                sx={{ 
                  maxHeight: 500, 
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  pr: 1,
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: '#f1f1f1',
                    borderRadius: '10px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: '#888',
                    borderRadius: '10px',
                    '&:hover': {
                      backgroundColor: '#555',
                    },
                  },
                }}
              >
                <Stack spacing={1}>
                  {stats?.recientes?.map((log) => {
                  const colors = getStatusColor(log.status);
                  
                  return (
                    <Paper
                      key={log.id}
                      elevation={0}
                      sx={{
                        p: 1.5,
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: '#e2e8f0',
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: '#2c3e50',
                          boxShadow: '0 2px 8px rgba(44, 62, 80, 0.1)',
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1.5}
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        {/* Left Section - ID, User, Client */}
                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: colors.bg,
                              flexShrink: 0,
                              boxShadow: `0 0 0 2px ${colors.bg}20`,
                            }}
                          />
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.25 }}>
                              <Chip
                                label={`#${log.id}`}
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: '0.65rem',
                                  fontWeight: 700,
                                  bgcolor: '#f8fafc',
                                  color: '#64748b',
                                  borderRadius: 0.5,
                                }}
                              />
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#2c3e50', fontSize: '0.85rem' }}>
                                {log.user}
                              </Typography>
                            </Stack>
                            <Typography 
                              variant="caption" 
                              color="text.secondary" 
                              sx={{ 
                                display: 'block',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                fontSize: '0.7rem',
                              }}
                            >
                              {log.cliente}
                            </Typography>
                          </Box>
                        </Stack>

                        {/* Right Section - Status, Date, Codes Count, Action */}
                        <Stack 
                          direction="row" 
                          spacing={0.75} 
                          alignItems="center"
                          sx={{
                            flexWrap: isMobile ? 'wrap' : 'nowrap',
                            justifyContent: 'flex-end',
                          }}
                        >
                          <Chip
                            label={log.status}
                            size="small"
                            sx={{
                              bgcolor: colors.bg,
                              color: colors.text,
                              fontWeight: 600,
                              borderRadius: 0.5,
                              fontSize: '0.65rem',
                              height: 22,
                            }}
                          />
                          
                          <Typography 
                            variant="caption" 
                            color="text.secondary" 
                            sx={{ 
                              whiteSpace: 'nowrap',
                              fontSize: '0.65rem',
                              display: { xs: 'none', sm: 'block' },
                            }}
                          >
                            {formatDate(log.created_at)}
                          </Typography>
                          
                          <Chip
                            icon={<Assignment sx={{ fontSize: 12 }} />}
                            label={`${log.total_codigos}`}
                            size="small"
                            sx={{
                              bgcolor: '#eff6ff',
                              color: '#1e40af',
                              fontWeight: 700,
                              borderRadius: 0.5,
                              fontSize: '0.65rem',
                              height: 22,
                              '& .MuiChip-icon': {
                                color: '#1e40af',
                              },
                            }}
                          />
                          
                          <Tooltip title="Ver códigos IC">
                            <IconButton
                              size="small"
                              onClick={() => fetchCodigosIC(log.id)}
                              sx={{
                                bgcolor: '#2c3e50',
                                color: 'white',
                                width: 28,
                                height: 28,
                                borderRadius: 0.75,
                                '&:hover': { 
                                  bgcolor: '#1a252f',
                                  transform: 'scale(1.05)',
                                },
                                transition: 'all 0.2s',
                              }}
                            >
                              <Visibility sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Stack>
                    </Paper>
                  );
                })}
              </Stack>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Modal de Códigos IC */}
      <Dialog
        open={codigosModal.open}
        onClose={() => setCodigosModal(prev => ({ ...prev, open: false }))}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ bgcolor: '#2c3e50', color: 'white' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Visibility />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Códigos IC - Log #{codigosModal.logId}
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {codigosModal.loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={40} sx={{ color: '#2c3e50' }} />
            </Box>
          ) : codigosModal.codes.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              No hay códigos IC asociados a este registro.
            </Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Producto</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Código IC</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {codigosModal.codes.map((code, index) => (
                    <TableRow key={index} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {code.producto}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                          {code.codigo_ic}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setCodigosModal(prev => ({ ...prev, open: false }))}
            variant="contained"
            sx={{
              bgcolor: '#2c3e50',
              borderRadius: 0,
              '&:hover': { bgcolor: '#1a252f' },
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default function EstadisticasPage() {
  return (
    <AuthProvider>
      <ExecutiveLayout>
        <EstadisticasContent />
      </ExecutiveLayout>
    </AuthProvider>
  );
}
