'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Chip,
  Alert,
  Grid,
  Card,
  CardContent,
  Stack,
  Tooltip,
  InputAdornment,
  Divider,
  Tab,
  Tabs,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  QrCode,
  ViewModule as Barcode,
  Inventory,
  TrendingUp,
  Warning,
  CheckCircle,
  Info,
  Assessment,
  Download,
  Upload,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import { ICCode } from '@/types/system';
import { getStatusColors, getStatusLabel } from '@/lib/status-colors';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ICCodesModule() {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [codes, setCodes] = useState<ICCode[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ICCode | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stats, setStats] = useState({
    totalCodes: 0,
    activeCodes: 0,
    inactiveCodes: 0,
    recentActivity: 0
  });

  // Verificar permisos básicos
  if (!user || !hasPermission(user.role, PERMISSIONS.IC_CODES_VIEW)) {
    return (
      <Alert severity="error">
        No tienes permisos para acceder a este módulo
      </Alert>
    );
  }

  const canCreate = hasPermission(user.role, PERMISSIONS.IC_CODES_CREATE);
  const canEdit = hasPermission(user.role, PERMISSIONS.IC_CODES_EDIT);
  const canDelete = hasPermission(user.role, PERMISSIONS.IC_CODES_DELETE);

  useEffect(() => {
    loadCodes();
  }, []);

  const loadCodes = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ic/codes');
      const data = await response.json();
      
      if (data.success) {
        setCodes(data.codes || []);
        calculateStats(data.codes || []);
      } else {
        setMessage({ type: 'error', text: data.error || 'Error cargando códigos IC' });
      }
    } catch (error) {
      console.error('Error loading IC codes:', error);
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (codeList: ICCode[]) => {
    const active = codeList.filter(c => c.status === 'active').length;
    const inactive = codeList.filter(c => c.status === 'inactive').length;
    const recent = codeList.filter(c => {
      const daysSinceCreated = (Date.now() - new Date(c.created_at).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceCreated <= 7;
    }).length;

    setStats({
      totalCodes: codeList.length,
      activeCodes: active,
      inactiveCodes: inactive,
      recentActivity: recent
    });
  };

  const handleOpenNew = () => {
    setEditing({
      id: '0',
      ic_code: '',
      description: '',
      category: 'general',
      status: 'active',
      created_at: new Date(),
      created_by: user?.id || 0
    });
    setOpen(true);
  };

  const handleEdit = (code: ICCode) => {
    setEditing(code);
    setOpen(true);
  };

  const handleSave = async () => {
    if (!editing) return;
    
    setLoading(true);
    try {
      const url = '/api/ic/codes';
      const method = editing.id === '0' ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing),
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage({ 
          type: 'success', 
          text: editing.id === '0' ? 'Código IC creado exitosamente' : 'Código IC actualizado exitosamente' 
        });
        setOpen(false);
        loadCodes();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al guardar código IC' });
      }
    } catch (error) {
      console.error('Error saving IC code:', error);
      setMessage({ type: 'error', text: 'Error al guardar código IC' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (codeId: string | number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este código IC?')) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/ic/codes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: codeId }),
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: 'Código IC eliminado exitosamente' });
        loadCodes();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al eliminar código IC' });
      }
    } catch (error) {
      console.error('Error deleting IC code:', error);
      setMessage({ type: 'error', text: 'Error al eliminar código IC' });
    } finally {
      setLoading(false);
    }
  };

  // Filtrar códigos
  const filteredCodes = codes.filter(code => {
    const matchesSearch = code.ic_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         code.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || code.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'barcode': return <Barcode />;
      case 'qr': return <QrCode />;
      case 'inventory': return <Inventory />;
      default: return <Info />;
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Códigos IC
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gestiona y administra los códigos de identificación interna
          </Typography>
        </Box>
        {canCreate && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenNew}
            size="large"
          >
            Nuevo Código IC
          </Button>
        )}
      </Box>

      {/* Mensaje de estado */}
      {message && (
        <Alert 
          severity={message.type} 
          sx={{ mb: 3 }}
          onClose={() => setMessage(null)}
        >
          {message.text}
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Dashboard" />
          <Tab label="Gestión de Códigos" />
          <Tab label="Reportes" />
        </Tabs>
      </Box>

      {/* Tab Panel 0: Dashboard */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {/* Estadísticas */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <QrCode />
                  </Avatar>
                  <Box>
                    <Typography variant="h4">{stats.totalCodes}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Códigos
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <CheckCircle />
                  </Avatar>
                  <Box>
                    <Typography variant="h4">{stats.activeCodes}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Códigos Activos
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'warning.main' }}>
                    <Warning />
                  </Avatar>
                  <Box>
                    <Typography variant="h4">{stats.inactiveCodes}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Códigos Inactivos
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'info.main' }}>
                    <TrendingUp />
                  </Avatar>
                  <Box>
                    <Typography variant="h4">{stats.recentActivity}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Actividad Reciente
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Gráfico de resumen */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Resumen de Códigos IC
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Mantén un control eficiente de tus códigos de identificación interna.
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Distribución por Estado:
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <Chip 
                      label={`Activos: ${stats.activeCodes}`} 
                      color="success" 
                      variant="outlined" 
                    />
                    <Chip 
                      label={`Inactivos: ${stats.inactiveCodes}`} 
                      color="default" 
                      variant="outlined" 
                    />
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tab Panel 1: Gestión de Códigos */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Buscar códigos IC..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={statusFilter}
                  label="Estado"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">Todos</MenuItem>
                  <MenuItem value="active">Activos</MenuItem>
                  <MenuItem value="inactive">Inactivos</MenuItem>
                  <MenuItem value="pending">Pendientes</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Stack direction="row" spacing={1}>
                <Button startIcon={<Download />} variant="outlined">
                  Exportar
                </Button>
                <Button startIcon={<Upload />} variant="outlined">
                  Importar
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>

        <Paper sx={{ overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Código IC</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell>Categoría</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Fecha Creación</TableCell>
                  {(canEdit || canDelete) && (
                    <TableCell align="center">Acciones</TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCodes.map((code) => (
                  <TableRow key={code.id} hover>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        {getCategoryIcon(code.category)}
                        <Typography variant="body1" fontWeight="medium">
                          {code.ic_code}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {code.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={code.category.toUpperCase()}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={code.status.toUpperCase()}
                        color={getStatusColor(code.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(code.created_at).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    {(canEdit || canDelete) && (
                      <TableCell align="center">
                        {canEdit && (
                          <Tooltip title="Editar código">
                            <IconButton 
                              size="small" 
                              onClick={() => handleEdit(code)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {canDelete && (
                          <Tooltip title="Eliminar código">
                            <IconButton 
                              size="small" 
                              color="error" 
                              onClick={() => handleDelete(code.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </TabPanel>

      {/* Tab Panel 2: Reportes */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Assessment sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Reportes de Códigos IC
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Genera reportes detallados sobre el uso y estado de los códigos IC.
                </Typography>
                
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Reportes Disponibles:
                  </Typography>
                  
                  <Stack spacing={2}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="body1" fontWeight="medium">
                        Reporte de Códigos Activos
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Lista completa de todos los códigos IC activos en el sistema
                      </Typography>
                    </Paper>
                    
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="body1" fontWeight="medium">
                        Análisis de Uso
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Estadísticas de uso y frecuencia de códigos IC
                      </Typography>
                    </Paper>
                    
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="body1" fontWeight="medium">
                        Códigos por Categoría
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Distribución de códigos IC organizados por categorías
                      </Typography>
                    </Paper>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Dialog para crear/editar código IC */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editing?.id === '0' ? 'Crear Nuevo Código IC' : 'Editar Código IC'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Código IC"
              value={editing?.ic_code || ''}
              onChange={(e) => setEditing(prev => prev ? { ...prev, ic_code: e.target.value } : prev)}
              fullWidth
              required
            />
            
            <TextField
              label="Descripción"
              value={editing?.description || ''}
              onChange={(e) => setEditing(prev => prev ? { ...prev, description: e.target.value } : prev)}
              fullWidth
              multiline
              rows={3}
              required
            />
            
            <FormControl fullWidth>
              <InputLabel>Categoría</InputLabel>
              <Select
                value={editing?.category || 'general'}
                label="Categoría"
                onChange={(e) => setEditing(prev => prev ? { ...prev, category: e.target.value } : prev)}
              >
                <MenuItem value="general">General</MenuItem>
                <MenuItem value="barcode">Código de Barras</MenuItem>
                <MenuItem value="qr">Código QR</MenuItem>
                <MenuItem value="inventory">Inventario</MenuItem>
                <MenuItem value="product">Producto</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                value={editing?.status || 'active'}
                label="Estado"
                onChange={(e) => setEditing(prev => prev ? { ...prev, status: e.target.value as 'active' | 'inactive' | 'pending' | 'archived' } : prev)}
              >
                <MenuItem value="active">Activo</MenuItem>
                <MenuItem value="inactive">Inactivo</MenuItem>
                <MenuItem value="pending">Pendiente</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained" disabled={loading}>
            {editing?.id === '0' ? 'Crear' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}