'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search,
  Clear,
  FilterList,
  Download,
  Visibility,
  Edit,
  Delete,
} from '@mui/icons-material';

interface ICCode {
  id: string;
  code: string;
  description: string;
  status: 'active' | 'inactive' | 'pending';
  category: string;
  lastUpdated: string;
  createdBy: string;
}

export default function ICSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [results, setResults] = useState<ICCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Inicializar resultados vacíos - se llenarán con datos reales de la API

  const handleSearch = async () => {
    setLoading(true);
    setResults([]);
    
    try {
      console.log('🔍 Realizando búsqueda real de códigos IC...', {
        query: searchQuery,
        status: filterStatus,
        category: filterCategory,
        page,
        limit: rowsPerPage
      });

      // Construir parámetros de búsqueda
      const searchParams = new URLSearchParams();
      if (searchQuery) searchParams.append('q', searchQuery);
      if (filterStatus !== 'all') searchParams.append('status', filterStatus);
      if (filterCategory !== 'all') searchParams.append('category', filterCategory);
      searchParams.append('limit', rowsPerPage.toString());
      searchParams.append('offset', (page * rowsPerPage).toString());

      const response = await fetch(`/api/ic/search?${searchParams.toString()}`);
      const data = await response.json();

      if (data.success) {
        setResults(data.data || []);
        console.log('✅ Búsqueda completada:', {
          encontrados: data.data?.length || 0,
          total: data.pagination?.total || 0
        });
      } else {
        console.error('❌ Error en búsqueda:', data.error);
        setResults([]);
        
        // Mostrar mensaje de error al usuario
        alert(`Error en búsqueda: ${data.error}`);
      }
    } catch (error) {
      console.error('❌ Error de conexión en búsqueda:', error);
      setResults([]);
      
      // Mostrar mensaje de error de conexión
      alert(`Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setFilterStatus('all');
    setFilterCategory('all');
    setResults([]);
    setPage(0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'inactive': return 'Inactivo';
      case 'pending': return 'Pendiente';
      default: return status;
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
        Búsqueda Avanzada de Códigos IC
      </Typography>
      
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        Encuentra y gestiona códigos IC con filtros avanzados y búsqueda en tiempo real
      </Typography>

      {/* Formulario de búsqueda */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Buscar Códigos IC"
                placeholder="Ingrese código, descripción o palabras clave..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={filterStatus}
                  label="Estado"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="all">Todos los estados</MenuItem>
                  <MenuItem value="active">Activos</MenuItem>
                  <MenuItem value="inactive">Inactivos</MenuItem>
                  <MenuItem value="pending">Pendientes</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Categoría</InputLabel>
                <Select
                  value={filterCategory}
                  label="Categoría"
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <MenuItem value="all">Todas las categorías</MenuItem>
                  <MenuItem value="Calzado">Calzado</MenuItem>
                  <MenuItem value="Ropa Deportiva">Ropa Deportiva</MenuItem>
                  <MenuItem value="Accesorios">Accesorios</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<Search />}
              onClick={handleSearch}
              disabled={loading}
              sx={{ minWidth: 120 }}
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<Clear />}
              onClick={handleClear}
            >
              Limpiar
            </Button>
            
            <Button
              variant="text"
              startIcon={<FilterList />}
            >
              Filtros Avanzados
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Resultados */}
      {results.length > 0 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Resultados ({results.length} encontrados)
              </Typography>
              
              <Button
                startIcon={<Download />}
                variant="outlined"
                size="small"
              >
                Exportar
              </Button>
            </Box>

            <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Código IC</TableCell>
                    <TableCell>Descripción</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Categoría</TableCell>
                    <TableCell>Última Actualización</TableCell>
                    <TableCell>Creado por</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {row.code}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {row.description}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(row.status)}
                            color={getStatusColor(row.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{row.category}</TableCell>
                        <TableCell>
                          {new Date(row.lastUpdated).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{row.createdBy}</TableCell>
                        <TableCell align="center">
                          <Tooltip title="Ver detalles">
                            <IconButton size="small">
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Editar">
                            <IconButton size="small">
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <IconButton size="small" color="error">
                              <Delete />
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
              count={results.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[10, 25, 50, 100]}
              labelRowsPerPage="Filas por página:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`
              }
            />
          </CardContent>
        </Card>
      )}

      {/* Estado vacío o sin conexión */}
      {results.length === 0 && !loading && (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
          <Search sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {searchQuery || filterStatus !== 'all' || filterCategory !== 'all' 
              ? 'No se encontraron resultados' 
              : 'Realizar búsqueda'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchQuery || filterStatus !== 'all' || filterCategory !== 'all'
              ? 'Intenta con otros términos de búsqueda o verifica la conexión con la base de datos'
              : 'Usa los filtros de arriba para buscar códigos IC en la base de datos HANA'}
          </Typography>
        </Paper>
      )}
    </Box>
  );
}