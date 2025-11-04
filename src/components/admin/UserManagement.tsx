'use client';

import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel, Switch, FormControlLabel,
  Alert, CircularProgress, Tooltip, Card, CardContent, Stack, useMediaQuery, useTheme
} from '@mui/material';
import { Add, Edit, Delete, Refresh, CheckCircle, Block } from '@mui/icons-material';
import { apiPath } from '@/lib/api-path';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'user' });
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(apiPath('/api/admin/users'));
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (err: any) {
      setError('Error cargando usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({ username: user.username, email: user.email, password: '', role: user.role });
    } else {
      setEditingUser(null);
      setFormData({ username: '', email: '', password: '', role: 'user' });
    }
    setAdminPassword('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setFormData({ username: '', email: '', password: '', role: 'user' });
    setAdminPassword('');
    setError('');
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    try {
      const url = '/api/admin/users';
      const method = editingUser ? 'PUT' : 'POST';
      const body = editingUser 
        ? { id: editingUser.id, ...formData }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess(editingUser ? 'Usuario actualizado' : 'Usuario creado');
        handleCloseDialog();
        fetchUsers();
      } else {
        setError(data.error || 'Error en la operación');
      }
    } catch (err: any) {
      setError(err.message || 'Error en la operación');
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      const response = await fetch(apiPath('/api/admin/users'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, is_active: !user.is_active })
      });

      const data = await response.json();
      if (data.success) {
        fetchUsers();
        setSuccess(`Usuario ${!user.is_active ? 'habilitado' : 'deshabilitado'}`);
      }
    } catch (err) {
      setError('Error actualizando estado');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este usuario?')) return;

    try {
      const response = await fetch(apiPath('/api/admin/users'), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      const data = await response.json();
      if (data.success) {
        fetchUsers();
        setSuccess('Usuario eliminado');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Error eliminando usuario');
    }
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress sx={{ color: '#2c3e50' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'stretch', sm: 'center' },
        mb: 3,
        gap: 2
      }}>
        <Typography variant="h5" sx={{ color: '#2c3e50', fontWeight: 700 }}>
          Gestión de Usuarios
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            startIcon={<Refresh />}
            onClick={fetchUsers}
            sx={{ borderRadius: 0, color: '#2c3e50', flex: { xs: 1, sm: 'initial' } }}
            size={isMobile ? 'small' : 'medium'}
          >
            Actualizar
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{ 
              bgcolor: '#2c3e50', 
              borderRadius: 0, 
              '&:hover': { bgcolor: '#1a252f' },
              flex: { xs: 1, sm: 'initial' }
            }}
            size={isMobile ? 'small' : 'medium'}
          >
            Nuevo Usuario
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 0 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 0 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Vista Móvil - Cards */}
      {isMobile ? (
        <Stack spacing={2}>
          {users.map((user) => (
            <Card key={user.id} sx={{ borderRadius: 0 }}>
              <CardContent>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {user.username}
                    </Typography>
                    <Chip 
                      label={user.role === 'admin' ? 'Admin' : 'Usuario'} 
                      size="small"
                      sx={{ 
                        bgcolor: user.role === 'admin' ? '#e67e22' : '#3498db', 
                        color: 'white', 
                        borderRadius: 0 
                      }} 
                    />
                  </Box>
                  
                  <Box>
                    <Typography variant="caption" color="text.secondary">Email</Typography>
                    <Typography variant="body2">{user.email}</Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Estado</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <IconButton size="small" onClick={() => handleToggleActive(user)}>
                          {user.is_active ? (
                            <CheckCircle sx={{ color: '#27ae60', fontSize: 20 }} />
                          ) : (
                            <Block sx={{ color: '#e74c3c', fontSize: 20 }} />
                          )}
                        </IconButton>
                        <Typography variant="body2">
                          {user.is_active ? 'Activo' : 'Inactivo'}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box>
                      <Typography variant="caption" color="text.secondary">Creado</Typography>
                      <Typography variant="body2">
                        {new Date(user.created_at).toLocaleDateString('es-ES', { 
                          day: '2-digit', 
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, pt: 1, borderTop: 1, borderColor: 'divider' }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Edit />}
                      onClick={() => handleOpenDialog(user)}
                      sx={{ borderRadius: 0, borderColor: '#2c3e50', color: '#2c3e50' }}
                    >
                      Editar
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Delete />}
                      onClick={() => handleDelete(user.id)}
                      sx={{ borderRadius: 0, borderColor: '#e74c3c', color: '#e74c3c' }}
                    >
                      Eliminar
                    </Button>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : (
        /* Vista Desktop - Tabla */
        <TableContainer component={Paper} sx={{ borderRadius: 0 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f7fa' }}>
                <TableCell sx={{ fontWeight: 600 }}>Usuario</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Rol</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Fecha Creación</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip 
                      label={user.role === 'admin' ? 'Administrador' : 'Usuario'} 
                      size="small"
                      sx={{ 
                        bgcolor: user.role === 'admin' ? '#e67e22' : '#3498db', 
                        color: 'white', 
                        borderRadius: 0 
                      }} 
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title={user.is_active ? 'Deshabilitar' : 'Habilitar'}>
                      <IconButton size="small" onClick={() => handleToggleActive(user)}>
                        {user.is_active ? (
                          <CheckCircle sx={{ color: '#27ae60' }} />
                        ) : (
                          <Block sx={{ color: '#e74c3c' }} />
                        )}
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString('es-ES')}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleOpenDialog(user)} sx={{ color: '#2c3e50' }}>
                      <Edit />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(user.id)} sx={{ color: '#e74c3c' }}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ bgcolor: '#2c3e50', color: 'white' }}>
          {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2, px: { xs: 2, sm: 3 } }}>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 0 }}>{error}</Alert>}
          <TextField
            fullWidth
            label="Usuario"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
            size={isMobile ? 'small' : 'medium'}
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
            size={isMobile ? 'small' : 'medium'}
          />
          <TextField
            fullWidth
            label={editingUser ? 'Nueva Contraseña (opcional)' : 'Contraseña'}
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
            size={isMobile ? 'small' : 'medium'}
          />
          <FormControl fullWidth sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 0 } }} size={isMobile ? 'small' : 'medium'}>
            <InputLabel>Rol</InputLabel>
            <Select
              value={formData.role}
              label="Rol"
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <MenuItem value="user">Usuario</MenuItem>
              <MenuItem value="admin">Administrador</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
          <Button 
            onClick={handleCloseDialog} 
            sx={{ borderRadius: 0, width: { xs: '100%', sm: 'auto' } }}
            size={isMobile ? 'small' : 'medium'}
          >
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            sx={{ 
              bgcolor: '#2c3e50', 
              borderRadius: 0, 
              '&:hover': { bgcolor: '#1a252f' },
              width: { xs: '100%', sm: 'auto' }
            }}
            size={isMobile ? 'small' : 'medium'}
          >
            {editingUser ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
