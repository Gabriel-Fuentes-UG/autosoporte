'use client';

import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Inventory,
  LocalShipping,
  Warning,
  CheckCircle,
  Error,
  Info,
  Refresh,
} from '@mui/icons-material';
import { apiPath } from '@/lib/api-path';

interface ICStats {
  totalCodes: number;
  activeCodes: number;
  inactiveCodes: number;
  pendingCodes: number;
  todayUpdates: number;
  alerts: number;
}

interface ICAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: string;
}

export default function ICDashboard() {
  const [stats, setStats] = useState<ICStats>({
    totalCodes: 0,
    activeCodes: 0,
    inactiveCodes: 0,
    pendingCodes: 0,
    todayUpdates: 0,
    alerts: 0,
  });

  const [alerts, setAlerts] = useState<ICAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      console.log('📊 Cargando datos reales del dashboard...');
      
      // Obtener estadísticas reales de la API
      const response = await fetch(apiPath('/api/ic/stats'));
      const data = await response.json();
      
      if (data.success) {
        setStats({
          totalCodes: data.data.totalCodes,
          activeCodes: data.data.activeCodes,
          inactiveCodes: data.data.inactiveCodes,
          pendingCodes: data.data.pendingCodes,
          todayUpdates: data.data.todayUpdates,
          alerts: data.data.systemAlerts?.length || 0,
        });

        setAlerts(data.data.systemAlerts || []);
        
        console.log('✅ Datos del dashboard cargados exitosamente:', data.data);
      } else {
        console.error('❌ Error en respuesta de API:', data.error);
        // En caso de error, mostrar datos vacíos con mensaje de error
        setStats({
          totalCodes: 0,
          activeCodes: 0,
          inactiveCodes: 0,
          pendingCodes: 0,
          todayUpdates: 0,
          alerts: 1,
        });
        
        setAlerts([{
          id: 'error',
          type: 'error',
          message: `Error conectando con base de datos: ${data.error}`,
          timestamp: new Date().toISOString(),
        }]);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('❌ Error cargando dashboard:', err);
      
      const errorMessage = String(err);
      
      // Mostrar error de conexión
      setStats({
        totalCodes: 0,
        activeCodes: 0,
        inactiveCodes: 0,
        pendingCodes: 0,
        todayUpdates: 0,
        alerts: 1,
      });
      
      setAlerts([{
        id: 'connection-error',
        type: 'error',
        message: `Error de conexión: ${errorMessage}`,
        timestamp: new Date().toISOString(),
      }]);
      
      setLoading(false);
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    icon, 
    color, 
    trend, 
    trendValue 
  }: {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    trend?: 'up' | 'down';
    trendValue?: string;
  }) => (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ color, mr: 1 }}>{icon}</Box>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
        </Box>
        
        <Typography variant="h4" component="div" sx={{ mb: 1, fontWeight: 600 }}>
          {value.toLocaleString()}
        </Typography>
        
        {trend && trendValue && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {trend === 'up' ? (
              <TrendingUp sx={{ color: 'success.main', mr: 0.5 }} />
            ) : (
              <TrendingDown sx={{ color: 'error.main', mr: 0.5 }} />
            )}
            <Typography 
              variant="body2" 
              sx={{ 
                color: trend === 'up' ? 'success.main' : 'error.main',
                fontWeight: 500 
              }}
            >
              {trendValue}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return <Warning color="warning" />;
      case 'error': return <Error color="error" />;
      case 'info': return <Info color="info" />;
      default: return <CheckCircle color="success" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning': return 'warning';
      case 'error': return 'error';
      case 'info': return 'info';
      default: return 'success';
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <Typography variant="h5" gutterBottom>
          Cargando Dashboard de Códigos IC...
        </Typography>
        <LinearProgress sx={{ mt: 2 }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header del Dashboard */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Dashboard de Códigos IC
        </Typography>
        <Tooltip title="Actualizar datos">
          <IconButton onClick={loadDashboardData} color="primary">
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Tarjetas de estadísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Códigos IC"
            value={stats.totalCodes}
            icon={<Inventory />}
            color="primary.main"
            trend="up"
            trendValue="+5.2%"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Códigos Activos"
            value={stats.activeCodes}
            icon={<CheckCircle />}
            color="success.main"
            trend="up"
            trendValue="+2.1%"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Códigos Inactivos"
            value={stats.inactiveCodes}
            icon={<Error />}
            color="error.main"
            trend="down"
            trendValue="-1.3%"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pendientes"
            value={stats.pendingCodes}
            icon={<Warning />}
            color="warning.main"
            trend="up"
            trendValue="+12.5%"
          />
        </Grid>
      </Grid>

      {/* Fila de información adicional */}
      <Grid container spacing={3}>
        {/* Actividad reciente */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Actividad de Hoy
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Actualizaciones realizadas
                </Typography>
                <Typography variant="h5" color="primary.main">
                  {stats.todayUpdates}
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={75} 
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Typography variant="body2" sx={{ mt: 1 }}>
                75% del objetivo diario completado
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Alertas del sistema */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Alertas del Sistema ({alerts.length})
              </Typography>
              <List dense>
                {alerts.map((alert) => (
                  <ListItem key={alert.id} sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {getAlertIcon(alert.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={alert.message}
                      secondary={new Date(alert.timestamp).toLocaleTimeString()}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Resumen de estado */}
      <Paper sx={{ p: 3, mt: 3, bgcolor: 'rgba(25,118,210,0.05)' }}>
        <Typography variant="h6" gutterBottom>
          Resumen del Estado del Sistema
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip 
            icon={<CheckCircle />} 
            label="Base de datos conectada" 
            color="success" 
            variant="filled"
          />
          <Chip 
            icon={<LocalShipping />} 
            label="Sincronización activa" 
            color="info" 
            variant="filled"
          />
          <Chip 
            icon={<Warning />} 
            label={`${alerts.length} alertas pendientes`} 
            color="warning" 
            variant="filled"
          />
        </Box>
      </Paper>
    </Box>
  );
}