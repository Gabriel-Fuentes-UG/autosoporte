'use client';

import React, { useState, useEffect } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import ExecutiveLayout from '@/components/layout/ExecutiveLayout';
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
  Chip,
  TextField,
  MenuItem,
  Stack,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TablePagination,
  TableSortLabel,
} from '@mui/material';
import {
  History,
  Refresh,
  FilterList,
  CheckCircle,
  Error,
  Info,
  Visibility,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';
import { apiPath } from '@/lib/api-path';

interface ICCode {
  producto: string;
  codigo_ic: string;
}

interface Log {
  id: number;
  user: string;
  folio_interno: string; // Renombrado de 'client'
  cliente: string; // Nombre de la tienda
  details: string;
  status: string;
  created_at: string;
  icCodes?: ICCode[];
}

type OrderBy = 'user' | 'folio_interno' | 'cliente' | 'status' | 'created_at';
type Order = 'asc' | 'desc';

function LogsContent() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [orderBy, setOrderBy] = useState<OrderBy>('created_at');
  const [order, setOrder] = useState<Order>('desc');
  
  // Modal state
  const [detailsModal, setDetailsModal] = useState({
    open: false,
    logId: 0,
    codes: [] as ICCode[],
    codesPage: 0,
  });

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch(apiPath('/api/logs'));
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchICCodes = async (logId: number) => {
    try {
      const response = await fetch(`/api/logs/${logId}/codes`);
      if (response.ok) {
        const data = await response.json();
        setDetailsModal({
          open: true,
          logId,
          codes: data.codes || [],
          codesPage: 0,
        });
      }
    } catch (error) {
      console.error('Error fetching IC codes:', error);
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

  const handleCodesPageChange = (event: unknown, newPage: number) => {
    setDetailsModal(prev => ({ ...prev, codesPage: newPage }));
  };

  const getStatusChip = (status: string) => {
    const config = {
      PENDIENTE: { color: 'warning' as const, icon: <Info sx={{ fontSize: 16 }} /> },
      PROCESADO: { color: 'success' as const, icon: <CheckCircle sx={{ fontSize: 16 }} /> },
      ERROR: { color: 'error' as const, icon: <Error sx={{ fontSize: 16 }} /> },
    };
    const statusConfig = config[status as keyof typeof config] || config.PENDIENTE;
    
    return (
      <Chip
        label={status}
        color={statusConfig.color}
        size="small"
        icon={statusConfig.icon}
        sx={{ borderRadius: 1, fontWeight: 600 }}
      />
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const sortLogs = (logsToSort: Log[]) => {
    return [...logsToSort].sort((a, b) => {
      let aValue: any = a[orderBy];
      let bValue: any = b[orderBy];
      
      if (orderBy === 'created_at') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }
      
      if (order === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  const filteredLogs = logs.filter(log => {
    if (filter === 'all') return true;
    return log.status === filter;
  });

  const sortedLogs = sortLogs(filteredLogs);
  const paginatedLogs = sortedLogs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Pagination for IC codes in modal
  const codesPerPage = 15;
  const paginatedCodes = detailsModal.codes.slice(
    detailsModal.codesPage * codesPerPage,
    detailsModal.codesPage * codesPerPage + codesPerPage
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} sx={{ color: '#2c3e50' }} />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#2c3e50', mb: 1 }}>
            Historial de Actividad
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Registro completo de operaciones del sistema
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={2}>
          <TextField
            select
            size="small"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            sx={{ minWidth: 150, '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
            SelectProps={{
              startAdornment: <FilterList sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          >
            <MenuItem value="all">Todos</MenuItem>
            <MenuItem value="PENDIENTE">Pendiente</MenuItem>
            <MenuItem value="PROCESADO">Procesado</MenuItem>
            <MenuItem value="ERROR">Error</MenuItem>
          </TextField>
          
          <Tooltip title="Actualizar">
            <IconButton
              onClick={fetchLogs}
              sx={{
                bgcolor: '#2c3e50',
                color: 'white',
                borderRadius: 0,
                '&:hover': { bgcolor: '#1a252f' },
              }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {sortedLogs.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 0 }}>
          No hay registros de actividad disponibles.
        </Alert>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ borderRadius: 0 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>
                    <TableSortLabel
                      active={orderBy === 'user'}
                      direction={orderBy === 'user' ? order : 'asc'}
                      onClick={() => handleSort('user')}
                    >
                      Usuario
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>
                    <TableSortLabel
                      active={orderBy === 'folio_interno'}
                      direction={orderBy === 'folio_interno' ? order : 'asc'}
                      onClick={() => handleSort('folio_interno')}
                    >
                      Folio Interno
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>
                    <TableSortLabel
                      active={orderBy === 'cliente'}
                      direction={orderBy === 'cliente' ? order : 'asc'}
                      onClick={() => handleSort('cliente')}
                    >
                      Cliente
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>
                    <TableSortLabel
                      active={orderBy === 'status'}
                      direction={orderBy === 'status' ? order : 'asc'}
                      onClick={() => handleSort('status')}
                    >
                      Estado
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>
                    <TableSortLabel
                      active={orderBy === 'created_at'}
                      direction={orderBy === 'created_at' ? order : 'asc'}
                      onClick={() => handleSort('created_at')}
                    >
                      Fecha
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }} align="center">Detalles</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedLogs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        #{log.id}
                      </Typography>
                    </TableCell>
                    <TableCell>{log.user}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#2c3e50', fontWeight: 600 }}>
                        {log.folio_interno}
                      </Typography>
                    </TableCell>
                    <TableCell>{log.cliente}</TableCell>
                    <TableCell>{getStatusChip(log.status)}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                        {formatDate(log.created_at)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Ver códigos IC">
                        <IconButton
                          size="small"
                          onClick={() => fetchICCodes(log.id)}
                          sx={{
                            color: '#2c3e50',
                            '&:hover': { bgcolor: '#e2e8f0' },
                          }}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={sortedLogs.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[15, 30, 50]}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            sx={{ borderRadius: 0 }}
          />
        </>
      )}

      {/* Modal de detalles de códigos IC */}
      <Dialog
        open={detailsModal.open}
        onClose={() => setDetailsModal(prev => ({ ...prev, open: false }))}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ bgcolor: '#2c3e50', color: 'white' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Visibility />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Códigos IC - Log #{detailsModal.logId}
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {detailsModal.codes.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: 0 }}>
              No hay códigos IC asociados a este registro.
            </Alert>
          ) : (
            <>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f8fafc' }}>
                      <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Producto</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Código IC</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedCodes.map((code, index) => (
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

              <TablePagination
                component="div"
                count={detailsModal.codes.length}
                page={detailsModal.codesPage}
                onPageChange={handleCodesPageChange}
                rowsPerPage={codesPerPage}
                rowsPerPageOptions={[codesPerPage]}
                labelRowsPerPage="Códigos por página:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                sx={{ borderTop: 1, borderColor: 'divider' }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setDetailsModal(prev => ({ ...prev, open: false }))}
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

export default function LogsPage() {
  return (
    <AuthProvider>
      <ExecutiveLayout>
        <LogsContent />
      </ExecutiveLayout>
    </AuthProvider>
  );
}
