'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Chip,
  CircularProgress,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  alpha,
  useTheme,
} from '@mui/material';
import { Visibility, Assignment } from '@mui/icons-material';
import { apiPath } from '@/lib/api-path';
import { getStatusColors, getStatusLabel } from '@/lib/status-colors';

interface Log {
  id: number;
  cliente: string;
  status: string;
  created_at: string;
  total_codigos: number;
}

interface ICCode {
  producto: string;
  codigo_ic: string;
}

type OrderBy = 'id' | 'cliente' | 'status' | 'created_at';

export default function UserLogs() {
  const theme = useTheme();
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [orderBy, setOrderBy] = useState<OrderBy>('created_at');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');
  
  // Modal state
  const [codigosModal, setCodigosModal] = useState({
    open: false,
    logId: 0,
    codes: [] as ICCode[],
    loading: false,
  });

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch(apiPath('/api/user/logs'));
      const data = await response.json();

      if (data.success) {
        setLogs(data.data?.logs || []);
      } else {
        setError(data.error || 'Error al cargar registros');
      }
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Error al cargar registros');
      setLoading(false);
    }
  };

  const fetchCodigosIC = async (logId: number) => {
    setCodigosModal(prev => ({ ...prev, open: true, logId, loading: true }));
    
    try {
      const response = await fetch(apiPath(`/api/user/logs/${logId}/codes`));
      const data = await response.json();
      
      if (data.success) {
        setCodigosModal(prev => ({
          ...prev,
          codes: data.data?.codes || [],
          loading: false,
        }));
      }
    } catch (error) {
      console.error('Error fetching codes:', error);
      setCodigosModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleSort = (column: OrderBy) => {
    const isAsc = orderBy === column && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(column);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const sortLogs = (logsToSort: Log[]) => {
    return [...logsToSort].sort((a, b) => {
      let aValue: any = a[orderBy];
      let bValue: any = b[orderBy];

      if (orderBy === 'created_at') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (order === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  };

  // Función removida - ahora usamos la utilidad centralizada getStatusColors

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredLogs = statusFilter === 'TODOS' 
    ? logs 
    : logs.filter(log => log.status.toUpperCase() === statusFilter);

  const sortedLogs = sortLogs(filteredLogs);
  const paginatedLogs = sortedLogs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress sx={{ color: theme.palette.primary.main }} />
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
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, color: '#2c3e50' }}>
        Mis Registros
      </Typography>
      <Typography variant="body1" sx={{ mb: 3, color: '#7f8c8d' }}>
        Historial completo de tus operaciones
      </Typography>

      <Paper elevation={0} sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Filtrar por Estado</InputLabel>
              <Select
                value={statusFilter}
                label="Filtrar por Estado"
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="TODOS">Todos</MenuItem>
                <MenuItem value="PENDIENTE">Pendiente</MenuItem>
                <MenuItem value="PROCESADO">Procesado</MenuItem>
                <MenuItem value="ERROR">Error</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="body2" color="text.secondary">
              Total: {filteredLogs.length} registro{filteredLogs.length !== 1 ? 's' : ''}
            </Typography>
          </Stack>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.grey[500], 0.05) }}>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'id'}
                    direction={orderBy === 'id' ? order : 'asc'}
                    onClick={() => handleSort('id')}
                    sx={{ fontWeight: 700, color: '#2c3e50' }}
                  >
                    ID
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'cliente'}
                    direction={orderBy === 'cliente' ? order : 'asc'}
                    onClick={() => handleSort('cliente')}
                    sx={{ fontWeight: 700, color: '#2c3e50' }}
                  >
                    Cliente
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>
                  Códigos IC
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'status'}
                    direction={orderBy === 'status' ? order : 'asc'}
                    onClick={() => handleSort('status')}
                    sx={{ fontWeight: 700, color: '#2c3e50' }}
                  >
                    Estado
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'created_at'}
                    direction={orderBy === 'created_at' ? order : 'asc'}
                    onClick={() => handleSort('created_at')}
                    sx={{ fontWeight: 700, color: '#2c3e50' }}
                  >
                    Fecha
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>
                  Detalles
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No se encontraron registros
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedLogs.map((log) => {
                  const colors = getStatusColors(log.status);
                  return (
                    <TableRow 
                      key={log.id}
                      sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) } }}
                    >
                      <TableCell>
                        <Chip
                          label={`#${log.id}`}
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
                          {log.cliente}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={<Assignment sx={{ fontSize: 14 }} />}
                          label={log.total_codigos}
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
                        <Chip
                          label={getStatusLabel(log.status)}
                          size="small"
                          sx={{
                            bgcolor: colors.bg,
                            color: colors.text,
                            fontWeight: 700,
                            fontSize: '0.7rem',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                          {formatDate(log.created_at)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Ver códigos IC">
                          <IconButton
                            size="small"
                            onClick={() => fetchCodigosIC(log.id)}
                            sx={{
                              bgcolor: '#2c3e50',
                              color: 'white',
                              width: 32,
                              height: 32,
                              '&:hover': {
                                bgcolor: '#1a252f',
                              },
                            }}
                          >
                            <Visibility sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[15, 30, 50]}
          component="div"
          count={filteredLogs.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </Paper>

      {/* Modal de Códigos IC */}
      <Dialog
        open={codigosModal.open}
        onClose={() => setCodigosModal(prev => ({ ...prev, open: false }))}
        maxWidth="md"
        fullWidth
        fullScreen={false}
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
              <CircularProgress sx={{ color: '#2c3e50' }} />
            </Box>
          ) : codigosModal.codes.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: 0 }}>
              No hay códigos IC asociados a este registro.
            </Alert>
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
