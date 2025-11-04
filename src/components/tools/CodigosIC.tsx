'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Alert,
  Snackbar,
  useTheme,
  useMediaQuery,
  MenuItem,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Backdrop
} from '@mui/material';
import {
  ContentPaste,
  Add,
  Delete,
  Upload,
  CheckCircle,
  ErrorOutline
} from '@mui/icons-material';
import { DataGrid, GridRowsProp, GridColDef, GridRowModel } from '@mui/x-data-grid';
import { useAuth } from '@/contexts/AuthContext';
import { apiPath } from '@/lib/api-path';

interface Cliente {
  CardName: string;
  CardCode: string;
}

interface AlertState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

export default function CodigosIC() {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState('');
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [clientesSource, setClientesSource] = useState<'external' | 'backup'>('external');
  const [loading, setLoading] = useState(false);
  const [processingModal, setProcessingModal] = useState(false);
  const [data, setData] = useState<GridRowsProp>([
    { id: 1, articulo: '', codigoIC: '' }
  ]);
  const [alert, setAlert] = useState<AlertState>({
    open: false,
    message: '',
    severity: 'info'
  });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [resultModal, setResultModal] = useState({
    open: false,
    success: false,
    title: '',
    message: '',
    logId: null as number | null,
    logCode: '' as string,
    details: null as any
  });

  // Cargar clientes al montar el componente
  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      setLoadingClientes(true);
      const response = await fetch(apiPath('/api/clientes'));
      const result = await response.json();

      if (result.success && result.data) {
        setClientes(result.data);
        setClientesSource(result.source || 'external');
        
        if (result.source === 'backup') {
          showAlert('⚠️ Usando lista de clientes local (no se pudo conectar con el servidor externo)', 'warning');
        }
      } else {
        showAlert('Error al cargar clientes', 'error');
      }
    } catch (error) {
      console.error('Error fetching clientes:', error);
      showAlert('Error al conectar con el servidor', 'error');
    } finally {
      setLoadingClientes(false);
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'articulo',
      headerName: 'Artículo',
      flex: 1,
      minWidth: 150,
      editable: true,
    },
    {
      field: 'codigoIC',
      headerName: 'Código IC',
      flex: 1,
      minWidth: 150,
      editable: true,
    },
  ];

  const handlePegarDesdeClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const rows = text.split('\n').filter(row => row.trim() !== '');
      
      // Usar Map para eliminar duplicados por artículo (mantiene el último)
      const uniqueMap = new Map<string, { articulo: string; codigoIC: string }>();
      
      rows.forEach(row => {
        const [articulo, codigoIC] = row.split('\t');
        const articuloTrimmed = articulo?.trim() || '';
        const codigoICTrimmed = codigoIC?.trim() || '';
        
        // Solo agregar si el artículo no está vacío
        if (articuloTrimmed) {
          uniqueMap.set(articuloTrimmed, {
            articulo: articuloTrimmed,
            codigoIC: codigoICTrimmed
          });
        }
      });

      // Convertir Map a array con IDs
      const newData = Array.from(uniqueMap.values()).map((item, index) => ({
        id: index + 1,
        ...item
      }));

      if (newData.length > 0) {
        const duplicatesRemoved = rows.length - newData.length;
        setData(newData);
        
        if (duplicatesRemoved > 0) {
          showAlert(
            `Datos pegados correctamente. Se encontraron ${newData.length} artículos únicos (${duplicatesRemoved} duplicados eliminados)`,
            'success'
          );
        } else {
          showAlert(`Datos pegados correctamente. ${newData.length} artículos únicos`, 'success');
        }
      } else {
        showAlert('No se encontraron datos válidos en el portapapeles', 'warning');
      }
    } catch (error) {
      showAlert('Error al pegar desde el portapapeles. Asegúrate de copiar datos en formato de tabla.', 'error');
    }
  };

  const handleLimpiarTabla = () => {
    setData([{ id: 1, articulo: '', codigoIC: '' }]);
    showAlert('Tabla limpiada', 'info');
  };

  const handleAgregarFila = () => {
    const newId = data.length > 0 ? Math.max(...data.map(d => d.id)) + 1 : 1;
    setData([...data, { id: newId, articulo: '', codigoIC: '' }]);
  };

  const handleEliminarDuplicados = () => {
    // Usar Map para mantener solo el último valor de cada artículo único
    const uniqueMap = new Map<string, { articulo: string; codigoIC: string }>();
    
    data.forEach(row => {
      const articulo = row.articulo?.trim() || '';
      if (articulo) {
        uniqueMap.set(articulo, {
          articulo: row.articulo,
          codigoIC: row.codigoIC || ''
        });
      }
    });

    const uniqueData = Array.from(uniqueMap.values()).map((item, index) => ({
      id: index + 1,
      ...item
    }));

    const duplicatesRemoved = data.length - uniqueData.length;
    
    if (duplicatesRemoved > 0) {
      setData(uniqueData);
      showAlert(`Se eliminaron ${duplicatesRemoved} artículo${duplicatesRemoved !== 1 ? 's' : ''} duplicado${duplicatesRemoved !== 1 ? 's' : ''}. Ahora tienes ${uniqueData.length} artículo${uniqueData.length !== 1 ? 's' : ''} único${uniqueData.length !== 1 ? 's' : ''}`, 'success');
    } else {
      showAlert('No se encontraron artículos duplicados', 'info');
    }
  };

  const handleAgregarCeroAlInicio = () => {
    const updatedData = data.map(row => {
      if (row.codigoIC && row.codigoIC.trim() !== '') {
        // Evitar agregar múltiples ceros si ya empieza con 0
        const codigoActual = row.codigoIC.trim();
        if (!codigoActual.startsWith('0')) {
          return { ...row, codigoIC: '0' + codigoActual };
        }
      }
      return row;
    });
    
    setData(updatedData);
    showAlert('Se agregó un "0" al inicio de los códigos IC', 'success');
  };

  const handleActualizar = () => {
    if (!clienteSeleccionado) {
      showAlert('Por favor seleccione un cliente', 'warning');
      return;
    }

    // Filtrar solo registros válidos (con ambos campos llenos)
    const registrosValidos = data.filter(row => 
      row.articulo && row.articulo.trim() !== '' && 
      row.codigoIC && row.codigoIC.trim() !== ''
    );

    if (registrosValidos.length === 0) {
      showAlert('Debe haber al menos un registro con ambos campos llenos', 'warning');
      return;
    }

    setConfirmOpen(true);
  };

  const handleConfirmActualizar = async () => {
    setConfirmOpen(false);
    setProcessingModal(true);

    try {
      // Filtrar solo registros válidos
      const registrosValidos = data.filter(row => 
        row.articulo && row.articulo.trim() !== '' && 
        row.codigoIC && row.codigoIC.trim() !== ''
      );

      // Usar Map para eliminar duplicados por artículo antes de enviar
      const uniqueMap = new Map<string, { articulo: string; codigoIC: string }>();
      
      registrosValidos.forEach(row => {
        const articulo = row.articulo.trim();
        const codigoIC = row.codigoIC.trim();
        
        // Mantener el último valor para cada artículo
        uniqueMap.set(articulo, { articulo, codigoIC });
      });

      const codigos = Array.from(uniqueMap.values());

      const clienteObj = clientes.find(c => c.CardCode === clienteSeleccionado);

      const response = await fetch(apiPath('/api/codigos-ic/actualizar'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente: clienteSeleccionado,
          clienteNombre: clienteObj?.CardName || clienteSeleccionado,
          codigos,
          userId: user?.id,
          username: user?.username
        })
      });

      const result = await response.json();

      setProcessingModal(false);

      if (response.ok && result.success) {
        // Respuesta exitosa del API externa
        const externalResponse = result.externalResponse;
        const productosProc = externalResponse?.ProductosProcesados || result.updated;
        
        setResultModal({
          open: true,
          success: true,
          title: '✅ Códigos IC Procesados Exitosamente',
          message: `Se procesaron correctamente ${productosProc} producto(s)`,
          logId: result.logId,
          logCode: result.logCode || '',
          details: externalResponse
        });
      } else {
        // Error del API externa o del servidor
        const errorMsg = result.error || 'Error desconocido';
        const details = result.details || '';
        
        setResultModal({
          open: true,
          success: false,
          title: '❌ Error en el Registro',
          message: errorMsg,
          logId: result.logId || null,
          logCode: result.logCode || '',
          details: details
        });
      }
    } catch (error: any) {
      setProcessingModal(false);
      setResultModal({
        open: true,
        success: false,
        title: '❌ Error de Conexión',
        message: 'No se pudo conectar con el servidor',
        logId: null,
        logCode: '',
        details: error.message
      });
    }
  };

  const handleCloseResultModal = () => {
    setResultModal({ ...resultModal, open: false });
    
    // Si fue exitoso, limpiar tabla después de cerrar modal
    if (resultModal.success) {
      setTimeout(() => {
        handleLimpiarTabla();
        setClienteSeleccionado('');
      }, 300);
    }
  };

  const processRowUpdate = (newRow: GridRowModel) => {
    setData(data.map(row => (row.id === newRow.id ? newRow : row)));
    return newRow;
  };

  const showAlert = (message: string, severity: AlertState['severity']) => {
    setAlert({ open: true, message, severity });
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  const getClienteNombre = () => {
    const cliente = clientes.find(c => c.CardCode === clienteSeleccionado);
    return cliente?.CardName || clienteSeleccionado;
  };

  // Verificar si hay al menos un registro válido (con ambos campos llenos)
  const hasValidData = () => {
    return data.some(row => row.articulo && row.articulo.trim() !== '' && row.codigoIC && row.codigoIC.trim() !== '');
  };

  // Calcular artículos únicos
  const getUniqueArticles = () => {
    const validRows = data.filter(row => row.articulo && row.articulo.trim() !== '');
    const uniqueArticles = new Set(validRows.map(row => row.articulo.trim()));
    return {
      total: validRows.length,
      unique: uniqueArticles.size,
      duplicates: validRows.length - uniqueArticles.size
    };
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h4" sx={{ mb: 3, color: '#2c3e50', fontWeight: 700 }}>
        Gestión de Códigos IC
      </Typography>

      <Grid container spacing={3}>
        {/* Panel de Control */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, borderRadius: 0 }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#2c3e50', fontWeight: 600 }}>
              Configuración
            </Typography>

            {/* Selector de Cliente */}
            <TextField
              select
              fullWidth
              label="Cliente"
              value={clienteSeleccionado}
              onChange={(e) => setClienteSeleccionado(e.target.value)}
              disabled={loading || loadingClientes}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 0,
                  '& fieldset': { borderColor: '#e1e8ed' },
                  '&:hover fieldset': { borderColor: '#2c3e50' },
                  '&.Mui-focused fieldset': { borderColor: '#2c3e50' },
                },
              }}
            >
              {loadingClientes ? (
                <MenuItem disabled>Cargando clientes...</MenuItem>
              ) : clientes.length === 0 ? (
                <MenuItem disabled>No hay clientes disponibles</MenuItem>
              ) : (
                clientes.map((cliente) => (
                  <MenuItem key={cliente.CardCode} value={cliente.CardCode}>
                    {cliente.CardName}
                  </MenuItem>
                ))
              )}
            </TextField>

            {/* Backup Warning */}
            {clientesSource === 'backup' && (
              <Alert severity="warning" sx={{ mb: 2, borderRadius: 0 }}>
                <Typography variant="body2">
                  <strong>⚠️ Modo Respaldo:</strong>
                  <br />
                  No se pudo conectar con el API externo. Los clientes mostrados son datos de respaldo.
                </Typography>
              </Alert>
            )}

            {/* Info Box */}
            <Alert severity="info" sx={{ mb: 2, borderRadius: 0 }}>
              <Typography variant="body2">
                <strong>Cómo usar:</strong>
                <br />
                1. Selecciona un cliente
                <br />
                2. Pega datos desde Excel o edita manualmente
                <br />
                3. Haz clic en Actualizar
              </Typography>
            </Alert>

            {/* Botones de gestión de datos */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<ContentPaste />}
                onClick={handlePegarDesdeClipboard}
                disabled={loading}
                sx={{
                  borderRadius: 0,
                  borderColor: '#2c3e50',
                  color: '#2c3e50',
                  '&:hover': {
                    borderColor: '#1a252f',
                    bgcolor: 'rgba(44, 62, 80, 0.04)',
                  },
                }}
              >
                Pegar desde Excel
              </Button>

              <Button
                fullWidth
                variant="outlined"
                startIcon={<Delete />}
                onClick={handleLimpiarTabla}
                disabled={loading}
                sx={{
                  borderRadius: 0,
                  borderColor: '#e74c3c',
                  color: '#e74c3c',
                  '&:hover': {
                    borderColor: '#c0392b',
                    bgcolor: 'rgba(231, 76, 60, 0.04)',
                  },
                }}
              >
                Limpiar Tabla
              </Button>

              <Button
                fullWidth
                variant="outlined"
                startIcon={<Add />}
                onClick={handleAgregarFila}
                disabled={loading}
                sx={{
                  borderRadius: 0,
                  borderColor: '#27ae60',
                  color: '#27ae60',
                  '&:hover': {
                    borderColor: '#229954',
                    bgcolor: 'rgba(39, 174, 96, 0.04)',
                  },
                }}
              >
                Agregar Fila
              </Button>

              {/* Botón para eliminar duplicados */}
              {(() => {
                const stats = getUniqueArticles();
                return stats.duplicates > 0 && (
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Delete />}
                    onClick={handleEliminarDuplicados}
                    disabled={loading}
                    sx={{
                      borderRadius: 0,
                      borderColor: '#e67e22',
                      color: '#e67e22',
                      '&:hover': {
                        borderColor: '#d35400',
                        bgcolor: 'rgba(230, 126, 34, 0.04)',
                      },
                    }}
                  >
                    Eliminar {stats.duplicates} Duplicado{stats.duplicates !== 1 ? 's' : ''}
                  </Button>
                );
              })()}

              {/* Botón especial solo para INNOVA SPORT */}
              {clienteSeleccionado === 'C000000013' && hasValidData() && (
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleAgregarCeroAlInicio}
                  disabled={loading}
                  sx={{
                    borderRadius: 0,
                    bgcolor: '#f39c12',
                    color: 'white',
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: '#e67e22',
                    },
                    '&:disabled': {
                      bgcolor: '#bdc3c7',
                    },
                  }}
                >
                  Agregar Cero al Inicio
                </Button>
              )}
            </Box>

            {/* Botón Actualizar */}
            <Button
              fullWidth
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <Upload />}
              onClick={handleActualizar}
              disabled={loading || !clienteSeleccionado || !hasValidData()}
              sx={{
                bgcolor: '#2c3e50',
                borderRadius: 0,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: '#1a252f',
                },
                '&:disabled': {
                  bgcolor: '#bdc3c7',
                },
              }}
            >
              {loading ? 'Actualizando...' : 'Actualizar Códigos IC'}
            </Button>

            {/* Warning Box */}
            <Alert severity="warning" sx={{ mt: 3, borderRadius: 0 }}>
              <Typography variant="body2">
                <strong>Importante:</strong> Esta acción enviará los códigos IC al sistema externo.
                Verifica los datos antes de continuar.
              </Typography>
            </Alert>
          </Paper>
        </Grid>

        {/* DataGrid */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, borderRadius: 0 }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#2c3e50', fontWeight: 600 }}>
              Datos ({data.length} {data.length === 1 ? 'registro' : 'registros'})
              {hasValidData() && (() => {
                const stats = getUniqueArticles();
                return (
                  <>
                    <Typography component="span" sx={{ ml: 1, color: '#27ae60', fontSize: '0.9rem' }}>
                      • {data.filter(row => row.articulo && row.articulo.trim() !== '' && row.codigoIC && row.codigoIC.trim() !== '').length} válido(s)
                    </Typography>
                    <Typography component="span" sx={{ ml: 1, color: '#3498db', fontSize: '0.9rem' }}>
                      • {stats.unique} artículo{stats.unique !== 1 ? 's' : ''} único{stats.unique !== 1 ? 's' : ''}
                    </Typography>
                    {stats.duplicates > 0 && (
                      <Typography component="span" sx={{ ml: 1, color: '#e67e22', fontSize: '0.9rem' }}>
                        • {stats.duplicates} duplicado{stats.duplicates !== 1 ? 's' : ''}
                      </Typography>
                    )}
                  </>
                );
              })()}
            </Typography>
            <Box sx={{ height: 500, width: '100%' }}>
              <DataGrid
                rows={data}
                columns={columns}
                processRowUpdate={processRowUpdate}
                sx={{
                  border: '1px solid #e1e8ed',
                  '& .MuiDataGrid-cell': {
                    borderColor: '#e1e8ed',
                  },
                  '& .MuiDataGrid-columnHeaders': {
                    bgcolor: '#f5f7fa',
                    borderColor: '#e1e8ed',
                  },
                  '& .MuiDataGrid-columnHeaderTitle': {
                    fontWeight: 600,
                    color: '#2c3e50',
                  },
                  '& .MuiDataGrid-row:hover': {
                    bgcolor: 'rgba(44, 62, 80, 0.04)',
                  },
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Dialog de Confirmación */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ bgcolor: '#2c3e50', color: 'white' }}>
          Confirmar Actualización
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography>
            ¿Estás seguro de que deseas actualizar <strong>{data.filter(row => row.articulo && row.articulo.trim() !== '' && row.codigoIC && row.codigoIC.trim() !== '').length}</strong> código(s) IC para el cliente <strong>{getClienteNombre()}</strong>?
          </Typography>
          {data.length !== data.filter(row => row.articulo && row.articulo.trim() !== '' && row.codigoIC && row.codigoIC.trim() !== '').length && (
            <Typography sx={{ mt: 1, color: '#f39c12' }}>
              Nota: Se ignorarán {data.length - data.filter(row => row.articulo && row.articulo.trim() !== '' && row.codigoIC && row.codigoIC.trim() !== '').length} registro(s) con campos vacíos.
            </Typography>
          )}
          <Typography sx={{ mt: 2, color: '#e74c3c' }}>
            Esta acción enviará los datos al sistema externo y creará un registro con estado PENDIENTE.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmOpen(false)}
            sx={{ borderRadius: 0, color: '#7f8c8d' }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmActualizar}
            variant="contained"
            sx={{
              borderRadius: 0,
              bgcolor: '#2c3e50',
              '&:hover': { bgcolor: '#1a252f' },
            }}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Procesamiento */}
      <Backdrop
        open={processingModal}
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: 'rgba(44, 62, 80, 0.9)',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ color: 'white', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Procesando Códigos IC...
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
            Enviando {data.length} código(s) al sistema externo
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.7 }}>
            Por favor espere...
          </Typography>
        </Box>
      </Backdrop>

      {/* Modal de Resultado */}
      <Dialog
        open={resultModal.open}
        onClose={handleCloseResultModal}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 0,
            bgcolor: resultModal.success ? '#f0f9f4' : '#fef2f2'
          }
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: resultModal.success ? '#2c3e50' : '#dc2626',
            color: 'white',
            py: 2.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5
          }}
        >
          {resultModal.success ? (
            <CheckCircle sx={{ fontSize: 32 }} />
          ) : (
            <ErrorOutline sx={{ fontSize: 32 }} />
          )}
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: isMobile ? '1.1rem' : '1.25rem' }}>
            {resultModal.title}
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Box>
            {/* Mensaje principal */}
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 2.5, 
                fontSize: isMobile ? '0.95rem' : '1.05rem',
                fontWeight: 500,
                color: '#1f2937'
              }}
            >
              {resultModal.message}
            </Typography>

            {/* Detalles del resultado exitoso */}
            {resultModal.success && resultModal.details && (
              <Box sx={{ bgcolor: 'white', p: 2.5, borderRadius: 1, border: '1px solid #e5e7eb' }}>
                <Grid container spacing={2}>
                  {/* Log Code - Destacado */}
                  <Grid item xs={12}>
                    <Box sx={{ 
                      bgcolor: '#2c3e50', 
                      p: 2, 
                      borderRadius: 1,
                      textAlign: 'center'
                    }}>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 0.5, fontSize: '0.75rem' }}>
                        CÓDIGO DE REGISTRO
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: 'white', letterSpacing: 1 }}>
                        {resultModal.logCode}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem' }}>
                        ID: #{resultModal.logId}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.8rem' }}>
                      CLIENTE
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {getClienteNombre()} ({clienteSeleccionado})
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.8rem' }}>
                      PRODUCTOS PROCESADOS
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {resultModal.details.ProductosProcesados || 0}
                    </Typography>
                  </Grid>
                  
                  {resultModal.details.SystemDate && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.8rem' }}>
                        FECHA DE PROCESO
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {new Date(resultModal.details.SystemDate).toLocaleString('es-MX', {
                          dateStyle: 'medium',
                          timeStyle: 'medium'
                        })}
                      </Typography>
                    </Grid>
                  )}
                  
                  <Grid item xs={12}>
                    <Box sx={{ 
                      bgcolor: '#f0f9f4', 
                      p: 1.5, 
                      borderRadius: 1,
                      border: '1px solid #86efac'
                    }}>
                      <Typography variant="body2" sx={{ color: '#166534', fontWeight: 500 }}>
                        ⏳ Estado: PENDIENTE
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Detalles del error */}
            {!resultModal.success && (
              <Box sx={{ bgcolor: 'white', p: 2.5, borderRadius: 1, border: '1px solid #fecaca' }}>
                {(resultModal.logId || resultModal.logCode) && (
                  <Box sx={{ 
                    bgcolor: '#dc2626', 
                    p: 2, 
                    borderRadius: 1,
                    textAlign: 'center',
                    mb: 2
                  }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 0.5, fontSize: '0.75rem' }}>
                      CÓDIGO DE REGISTRO
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'white', letterSpacing: 1 }}>
                      {resultModal.logCode || `LOG-${resultModal.logId}`}
                    </Typography>
                    {resultModal.logId && (
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem' }}>
                        ID: #{resultModal.logId}
                      </Typography>
                    )}
                  </Box>
                )}
                
                {resultModal.details && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.8rem' }}>
                      DETALLES
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontFamily: 'monospace',
                        bgcolor: '#fef2f2',
                        p: 1.5,
                        borderRadius: 1,
                        fontSize: '0.85rem',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                      }}
                    >
                      {resultModal.details}
                    </Typography>
                  </Box>
                )}
                
                <Box sx={{ 
                  mt: 2,
                  bgcolor: '#fef2f2', 
                  p: 1.5, 
                  borderRadius: 1,
                  border: '1px solid #fecaca'
                }}>
                  <Typography variant="body2" sx={{ color: '#991b1b', fontWeight: 500 }}>
                    ⚠️ Por favor, REINTENTAR
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 2.5, bgcolor: '#f9fafb' }}>
          <Button
            onClick={handleCloseResultModal}
            variant="contained"
            fullWidth={isMobile}
            sx={{
              bgcolor: resultModal.success ? '#2c3e50' : '#dc2626',
              borderRadius: 0,
              py: 1.5,
              px: 4,
              fontWeight: 600,
              fontSize: isMobile ? '0.95rem' : '1rem',
              '&:hover': {
                bgcolor: resultModal.success ? '#1a252f' : '#b91c1c'
              }
            }}
          >
            {resultModal.success ? 'ACEPTAR' : 'CERRAR'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones menores (opcional) */}
      <Snackbar
        open={alert.open}
        autoHideDuration={alert.severity === 'success' ? 6000 : 10000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={alert.severity}
          sx={{ 
            borderRadius: 0, 
            minWidth: '400px',
            maxWidth: '600px',
            whiteSpace: 'pre-line',
            fontSize: '0.95rem',
            '& .MuiAlert-message': {
              width: '100%'
            }
          }}
          icon={alert.severity === 'success' ? <CheckCircle /> : alert.severity === 'error' ? <ErrorOutline /> : undefined}
        >
          <Box sx={{ fontWeight: alert.severity === 'error' ? 600 : 400 }}>
            {alert.message}
          </Box>
        </Alert>
      </Snackbar>
    </Box>
  );
}
