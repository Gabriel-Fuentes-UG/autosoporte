'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import {
  ContentPaste as PasteIcon,
  Send as SendIcon,
  Clear as ClearIcon,
  Logout as LogoutIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import SimpleAdmin from './SimpleAdmin';
import { apiPath } from '@/lib/api-path';

interface ICCode {
  articulo: string;
  codigo: string;
}

interface LogEntry {
  user: string;
  client: string;
  time: string;
  count: number;
}

interface SimpleDashboardProps {
  user: string;
  onLogout: () => void;
}

const clients = [
  { name: 'COPPEL', code: 'C000000001' },
  { name: 'LIVERPOOL', code: 'C000000006' },
  { name: 'INNOVA SPORT', code: 'C000000013' },
  { name: 'MARTI', code: 'C000000007' },
  { name: 'DERREMATE (MELI)', code: 'C000000033' },
  { name: 'AMAZON', code: 'C000000113' },
  { name: 'SUBURBIA', code: 'C000000114' },
];

export default function SimpleDashboard({ user, onLogout }: SimpleDashboardProps) {
  const [role, setRole] = useState<string>('user');
  const [showAdmin, setShowAdmin] = useState(false);
  const [selectedClient, setSelectedClient] = useState('');
  const [rawPaste, setRawPaste] = useState('');
  const [parsedRows, setParsedRows] = useState<ICCode[]>([]);
  const [message, setMessage] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Cargar logs del localStorage
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('ic-logs') || '[]');
    setLogs(stored);
    const r = localStorage.getItem('ic-user-role') || 'user';
    setRole(r);
  }, []);

  // Guardar logs cuando cambien
  useEffect(() => {
    localStorage.setItem('ic-logs', JSON.stringify(logs));
  }, [logs]);

  // Parsear texto pegado automáticamente
  useEffect(() => {
    const rows = parsePastedText(rawPaste);
    setParsedRows(rows);
  }, [rawPaste]);

  const parsePastedText = (text: string): ICCode[] => {
    if (!text) return [];

    const lines = text.trim().split(/\r\n|\n/).map(l => l.trim()).filter(l => l !== '');
    const rowsMap = new Map<string, ICCode>(); // Para eliminar duplicados por artículo

    lines.forEach((line) => {
      let cells = line.split('\t');
      if (cells.length < 2) cells = line.split(',');
      if (cells.length < 2) cells = line.split(';');
      if (cells.length < 2) cells = line.split(/\s{2,}/);
      
      if (cells.length >= 2) {
        const articulo = cells[0].trim();
        let codigo = cells[1].trim();
        
        if (articulo && codigo) {
          // Si el cliente seleccionado es INNOVA SPORT, agregar "0" al inicio del código IC
          if (selectedClient === 'INNOVA SPORT' && !codigo.startsWith('0')) {
            codigo = '0' + codigo;
          }
          
          // Usar Map para eliminar duplicados por artículo (mantiene el último)
          rowsMap.set(articulo, { articulo, codigo });
        }
      }
    });

    // Convertir Map a array
    return Array.from(rowsMap.values());
  };

  const handleSend = async () => {
    setMessage('');

    if (!selectedClient) {
      setMessage('Selecciona un cliente antes de enviar.');
      return;
    }
    
    if (!parsedRows || parsedRows.length === 0) {
      setMessage('No hay códigos válidos para enviar.');
      return;
    }

    try {
      // Aquí conectarías a tu API real - por ahora simulamos
      const response = await fetch(apiPath('/api/ic/save'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user,
          client: selectedClient,
          codes: parsedRows,
        }),
      });

      if (response.ok) {
        // Agregar al log
        const newLog: LogEntry = {
          user,
          client: selectedClient,
          time: new Date().toLocaleString(),
          count: parsedRows.length,
        };

        setLogs(prev => [newLog, ...prev]);
        setRawPaste('');
        setParsedRows([]);
        setMessage(`✅ Se enviaron ${parsedRows.length} códigos IC correctamente.`);
      } else {
        setMessage('❌ Error al guardar en la base de datos.');
      }
    } catch (error) {
      // Si no hay conexión, solo registra local
      const newLog: LogEntry = {
        user,
        client: selectedClient,
        time: new Date().toLocaleString(),
        count: parsedRows.length,
      };

      setLogs(prev => [newLog, ...prev]);
      setRawPaste('');
      setParsedRows([]);
      setMessage(`📝 Se registró localmente (${parsedRows.length} códigos).`);
    }
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) {
        setMessage('El portapapeles está vacío.');
        return;
      }
      setRawPaste(text);
      setMessage('✅ Contenido pegado desde el portapapeles.');
    } catch (err) {
      setMessage('❌ No se pudo acceder al portapapeles.');
    }
  };

  const clearLogs = () => {
    if (window.confirm('¿Borrar todos los registros?')) {
      setLogs([]);
      setMessage('🗑️ Registros eliminados.');
    }
  };

  return (
    <>
      {/* Header */}
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Códigos IC - {user}
          </Typography>
          {role === 'admin' && (
            <Button color="inherit" onClick={() => setShowAdmin(prev => !prev)} sx={{ mr: 1 }}>
              Administración
            </Button>
          )}
          <Button color="inherit" onClick={onLogout} startIcon={<LogoutIcon />}>
            Salir
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 2, mb: 2 }}>
        <Grid container spacing={2} sx={{ height: 'calc(100vh - 100px)' }}>
          
          {/* Panel izquierdo - Registros / Admin */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: '100%', overflow: 'auto' }}>
              {showAdmin && role === 'admin' ? (
                <SimpleAdmin />
              ) : (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" color="text.primary">
                  📋 Registros ({logs.length})
                </Typography>
                {logs.length > 0 && (
                  <IconButton size="small" onClick={clearLogs} color="error">
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
                {logs.length === 0 ? (
                  <Typography color="text.secondary">
                    No hay registros aún.
                  </Typography>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Usuario</strong></TableCell>
                          <TableCell><strong>Cliente</strong></TableCell>
                          <TableCell><strong>Códigos</strong></TableCell>
                          <TableCell><strong>Hora</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {logs.map((log, i) => (
                          <TableRow key={i} hover>
                            <TableCell>{log.user}</TableCell>
                            <TableCell>{log.client}</TableCell>
                            <TableCell>
                              <Typography variant="body2" color="primary">
                                {log.count}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption">
                                {log.time}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  )}
                </>
              )}
            </Paper>
          </Grid>

          {/* Panel derecho - Procesamiento */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              
              {/* Selección de cliente y acciones */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  📦 Procesar Códigos IC
                </Typography>
                
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      label="Cliente"
                      value={selectedClient}
                      onChange={(e) => setSelectedClient(e.target.value)}
                      SelectProps={{ native: true }}
                    >
                      <option value="">Seleccionar cliente...</option>
                      {clients.map((client) => (
                        <option key={client.code} value={client.name}>
                          {client.name} ({client.code})
                        </option>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        onClick={pasteFromClipboard}
                        startIcon={<PasteIcon />}
                        fullWidth
                      >
                        Pegar
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => {setRawPaste(''); setMessage('');}}
                        startIcon={<ClearIcon />}
                      >
                        Limpiar
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              {/* Área de texto y preview */}
              <Box sx={{ flex: 1, mt: 2, display: 'flex', flexDirection: 'column' }}>
                <Grid container spacing={2} sx={{ flex: 1 }}>
                  
                  {/* Área de pegado */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      📋 Pegar datos (Artículo + Código):
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={12}
                      value={rawPaste}
                      onChange={(e) => setRawPaste(e.target.value)}
                      placeholder="Pega aquí los códigos IC&#10;Formato: Artículo [TAB] Código&#10;Ejemplo:&#10;ART001    IC001&#10;ART002    IC002&#10;&#10;📋 Se eliminan duplicados por artículo automáticamente&#10;⚡ INNOVA SPORT: Se agrega '0' al inicio del código IC"
                      variant="outlined"
                    />
                  </Grid>

                  {/* Preview */}
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2">
                        👀 Preview ({parsedRows.length} códigos)
                      </Typography>
                      {selectedClient === 'INNOVA SPORT' && parsedRows.length > 0 && (
                        <Typography variant="caption" color="info.main" sx={{ fontStyle: 'italic' }}>
                          ⚡ Agregando "0" automáticamente
                        </Typography>
                      )}
                    </Box>
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        height: 300, 
                        overflow: 'auto', 
                        p: 1,
                        backgroundColor: 'grey.50'
                      }}
                    >
                      {parsedRows.length === 0 ? (
                        <Typography color="text.secondary" variant="body2">
                          Los códigos aparecerán aquí automáticamente...
                        </Typography>
                      ) : (
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell><strong>Artículo</strong></TableCell>
                              <TableCell><strong>Código IC</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {parsedRows.map((row, i) => (
                              <TableRow key={i}>
                                <TableCell>{row.articulo}</TableCell>
                                <TableCell>{row.codigo}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </Paper>
                  </Grid>
                </Grid>

                {/* Mensaje y botón de envío */}
                <Box sx={{ mt: 2 }}>
                  {message && (
                    <Alert 
                      severity={message.includes('❌') ? 'error' : message.includes('✅') ? 'success' : 'info'} 
                      sx={{ mb: 2 }}
                    >
                      {message}
                    </Alert>
                  )}
                  
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleSend}
                    disabled={!selectedClient || parsedRows.length === 0}
                    startIcon={<SendIcon />}
                    fullWidth
                  >
                    Enviar {parsedRows.length > 0 && `(${parsedRows.length} códigos)`}
                  </Button>
                </Box>
              </Box>

            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}