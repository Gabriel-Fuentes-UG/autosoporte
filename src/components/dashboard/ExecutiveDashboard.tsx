'use client';

import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  useTheme,
  alpha,
  Stack,
  Avatar,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from '@mui/material';
import {
  Person,
  Business,
  Inventory,
  TrendingUp,
  AccessTime,
  MoreVert,
  FiberManualRecord,
} from '@mui/icons-material';
import { getStatusColors, getStatusLabel } from '@/lib/status-colors';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, subtitle, icon, color }: StatCardProps) {
  const theme = useTheme();

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        transition: 'all 0.3s',
        '&:hover': {
          boxShadow: `0 4px 20px ${alpha(color, 0.15)}`,
          borderColor: alpha(color, 0.3),
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
              bgcolor: alpha(color, 0.1),
              color: color,
            }}
          >
            {icon}
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

        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, color: color }}>
          {value}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      </CardContent>
    </Card>
  );
}

interface ActivityLog {
  id: string;
  user: string;
  action: string;
  code: string;
  client: string;
  time: string;
  status: 'success' | 'pending' | 'error';
}

interface TopItem {
  rank: number;
  name: string;
  count: number;
  percentage: number;
}

export default function ExecutiveDashboard() {
  const theme = useTheme();

  // Datos de ejemplo - estos vendrán de la API
  const stats = [
    {
      title: 'Operaciones Hoy',
      value: '24',
      subtitle: '+12 desde ayer',
      icon: <TrendingUp />,
      color: theme.palette.primary.main,
    },
    {
      title: 'Top Usuario',
      value: 'admin',
      subtitle: '18 operaciones',
      icon: <Person />,
      color: theme.palette.success.main,
    },
    {
      title: 'Cliente Activo',
      value: 'Nike Corp',
      subtitle: '45 códigos este mes',
      icon: <Business />,
      color: theme.palette.info.main,
    },
    {
      title: 'Producto Top',
      value: 'RBK-2024',
      subtitle: '89 registros',
      icon: <Inventory />,
      color: theme.palette.warning.main,
    },
  ];

  const recentLogs: ActivityLog[] = [
    {
      id: '1',
      user: 'admin',
      action: 'Crear código',
      code: 'IC-2024-001',
      client: 'Nike Corp',
      time: 'Hace 5 min',
      status: 'success',
    },
    {
      id: '2',
      user: 'jdoe',
      action: 'Actualizar',
      code: 'IC-2024-002',
      client: 'Adidas Inc',
      time: 'Hace 12 min',
      status: 'success',
    },
    {
      id: '3',
      user: 'admin',
      action: 'Eliminar',
      code: 'IC-2023-999',
      client: 'Puma Ltd',
      time: 'Hace 28 min',
      status: 'pending',
    },
    {
      id: '4',
      user: 'msmith',
      action: 'Crear código',
      code: 'IC-2024-003',
      client: 'Nike Corp',
      time: 'Hace 35 min',
      status: 'success',
    },
    {
      id: '5',
      user: 'admin',
      action: 'Crear código',
      code: 'IC-2024-004',
      client: 'Reebok Int',
      time: 'Hace 1 hora',
      status: 'success',
    },
  ];

  const topUsers: TopItem[] = [
    { rank: 1, name: 'admin', count: 18, percentage: 45 },
    { rank: 2, name: 'jdoe', count: 12, percentage: 30 },
    { rank: 3, name: 'msmith', count: 8, percentage: 20 },
    { rank: 4, name: 'rjones', count: 2, percentage: 5 },
  ];

  const topClients: TopItem[] = [
    { rank: 1, name: 'Nike Corp', count: 45, percentage: 38 },
    { rank: 2, name: 'Adidas Inc', count: 32, percentage: 27 },
    { rank: 3, name: 'Puma Ltd', count: 28, percentage: 24 },
    { rank: 4, name: 'Reebok Int', count: 13, percentage: 11 },
  ];

  const topProducts: TopItem[] = [
    { rank: 1, name: 'RBK-2024-A', count: 89, percentage: 42 },
    { rank: 2, name: 'RBK-2024-B', count: 67, percentage: 32 },
    { rank: 3, name: 'RBK-2023-X', count: 45, percentage: 21 },
    { rank: 4, name: 'RBK-2024-C', count: 11, percentage: 5 },
  ];

  const getStatusColorLocal = (status: string) => {
    // Para datos mock del dashboard
    switch (status) {
      case 'success':
        return theme.palette.success.main;
      case 'pending':
        return theme.palette.warning.main;
      case 'error':
        return theme.palette.error.main;
      // Para IC_Logs reales
      case 'PROCESADO':
        return getStatusColors(status).main;
      case 'PENDIENTE':
        return getStatusColors(status).main;
      case 'FALLIDO':
        return getStatusColors(status).main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getStatusLabelLocal = (status: string) => {
    // Para datos mock del dashboard
    switch (status) {
      case 'success':
        return 'Exitoso';
      case 'pending':
        return 'Pendiente';
      case 'error':
        return 'Error';
      // Para IC_Logs reales
      case 'PROCESADO':
      case 'PENDIENTE':
      case 'FALLIDO':
        return getStatusLabel(status);
      default:
        return status;
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Panel de Control
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Resumen de actividad y análisis en tiempo real
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Activity Logs */}
        <Grid item xs={12} lg={8}>
          <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Actividad Reciente
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Últimas operaciones del sistema
                  </Typography>
                </Box>
                <IconButton size="small">
                  <MoreVert />
                </IconButton>
              </Stack>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                        Usuario
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                        Acción
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                        Código
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                        Cliente
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                        Estado
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                        Hora
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentLogs.map((log) => (
                      <TableRow
                        key={log.id}
                        sx={{
                          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) },
                          cursor: 'pointer',
                        }}
                      >
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Avatar sx={{ width: 32, height: 32, fontSize: '0.85rem', bgcolor: theme.palette.primary.main }}>
                              {log.user.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography variant="body2" fontWeight={600}>
                              {log.user}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{log.action}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={log.code}
                            size="small"
                            sx={{ fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{log.client}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={<FiberManualRecord sx={{ fontSize: 12 }} />}
                            label={getStatusLabelLocal(log.status)}
                            size="small"
                            sx={{
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              bgcolor: alpha(getStatusColorLocal(log.status), 0.1),
                              color: getStatusColorLocal(log.status),
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="flex-end">
                            <AccessTime sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
                            <Typography variant="caption" color="text.secondary">
                              {log.time}
                            </Typography>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Rankings */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            {/* Top Users */}
            <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  🏆 Top Usuarios Hoy
                </Typography>
                <Stack spacing={2}>
                  {topUsers.map((item) => (
                    <Stack key={item.rank} direction="row" spacing={2} alignItems="center">
                      <Chip
                        label={item.rank}
                        size="small"
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          fontWeight: 700,
                          bgcolor: item.rank === 1 ? theme.palette.warning.main : alpha(theme.palette.grey[500], 0.1),
                          color: item.rank === 1 ? 'white' : theme.palette.text.primary,
                        }}
                      />
                      <Typography variant="body2" fontWeight={600} sx={{ flexGrow: 1 }}>
                        {item.name}
                      </Typography>
                      <Chip
                        label={`${item.count} ops`}
                        size="small"
                        sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                      />
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
            </Card>

            {/* Top Clients */}
            <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  🏢 Top Clientes
                </Typography>
                <Stack spacing={2}>
                  {topClients.map((item) => (
                    <Box key={item.rank}>
                      <Stack direction="row" justifyContent="space-between" mb={0.5}>
                        <Typography variant="body2" fontWeight={600}>
                          {item.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.count}
                        </Typography>
                      </Stack>
                      <Box
                        sx={{
                          width: '100%',
                          height: 6,
                          bgcolor: alpha(theme.palette.grey[500], 0.1),
                          borderRadius: 1,
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          sx={{
                            width: `${item.percentage}%`,
                            height: '100%',
                            bgcolor: theme.palette.info.main,
                            transition: 'width 0.5s',
                          }}
                        />
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  📦 Top Productos
                </Typography>
                <Stack spacing={2}>
                  {topProducts.map((item) => (
                    <Box key={item.rank}>
                      <Stack direction="row" justifyContent="space-between" mb={0.5}>
                        <Typography variant="body2" fontWeight={600}>
                          {item.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.count}
                        </Typography>
                      </Stack>
                      <Box
                        sx={{
                          width: '100%',
                          height: 6,
                          bgcolor: alpha(theme.palette.grey[500], 0.1),
                          borderRadius: 1,
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          sx={{
                            width: `${item.percentage}%`,
                            height: '100%',
                            bgcolor: theme.palette.warning.main,
                            transition: 'width 0.5s',
                          }}
                        />
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
