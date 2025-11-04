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
  Avatar,
  Stack,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd,
  AdminPanelSettings,
  Person,
  Visibility,
  Block,
  CheckCircle,
  Warning,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import { User } from '@/types/system';

interface UserRecord extends User {
  email?: string;
  lastLogin?: Date;
  isActive: boolean;
  createdBy?: string;
}

export default function UserManagementModule() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<UserRecord | null>(null);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0,
    regularUsers: 0
  });

  // Verificar permisos
  if (!currentUser || !hasPermission(currentUser.role, PERMISSIONS.USERS_MANAGE)) {
    return (
      <Alert severity="error">
        No tienes permisos para acceder a este módulo
      </Alert>
    );
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      
      if (data.users) {
        const userRecords: UserRecord[] = data.users.map((u: any) => ({
          id: u.id,
          username: u.username,
          role: u.role,
          created_at: new Date(u.created_at),
          isActive: true,
          email: u.email,
          lastLogin: u.last_login ? new Date(u.last_login) : undefined,
          createdBy: u.created_by
        }));
        
        setUsers(userRecords);
        
        // Calcular estadísticas
        setStats({
          totalUsers: userRecords.length,
          activeUsers: userRecords.filter(u => u.isActive).length,
          adminUsers: userRecords.filter(u => u.role === 'admin').length,
          regularUsers: userRecords.filter(u => u.role === 'user').length
        });
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setMessage({ type: 'error', text: 'Error cargando usuarios' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNew = () => {
    setEditing({
      id: 0,
      username: '',
      role: 'user',
      created_at: new Date(),
      isActive: true
    });
    setPassword('');
    setOpen(true);
  };

  const handleEdit = (user: UserRecord) => {
    setEditing(user);
    setPassword('');
    setOpen(true);
  };

  const handleSave = async () => {
    if (!editing) return;
    
    setLoading(true);
    try {
      const url = '/api/admin/users';
      const method = editing.id === 0 ? 'POST' : 'PUT';
      
      const body: any = {
        username: editing.username,
        role: editing.role,
      };
      
      if (editing.id !== 0) {
        body.id = editing.id;
      }
      
      if (password) {
        body.password = password;
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage({ 
          type: 'success', 
          text: editing.id === 0 ? 'Usuario creado exitosamente' : 'Usuario actualizado exitosamente' 
        });
        setOpen(false);
        loadUsers();
        
        // Limpiar mensaje después de 3 segundos
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al guardar usuario' });
      }
    } catch (error) {
      console.error('Error saving user:', error);
      setMessage({ type: 'error', text: 'Error al guardar usuario' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId }),
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: 'Usuario eliminado exitosamente' });
        loadUsers();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al eliminar usuario' });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setMessage({ type: 'error', text: 'Error al eliminar usuario' });
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <AdminPanelSettings color="error" />;
      case 'user': return <Person color="primary" />;
      case 'viewer': return <Visibility color="action" />;
      default: return <Person />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'error';
      case 'user': return 'primary';
      case 'viewer': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ space: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Gestión de Usuarios
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Administra los usuarios del sistema y sus permisos
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAdd />}
          onClick={handleOpenNew}
          size="large"
        >
          Nuevo Usuario
        </Button>
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

      {/* Estadísticas */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <Person />
                </Avatar>
                <Box>
                  <Typography variant="h4">{stats.totalUsers}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Usuarios
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
                  <Typography variant="h4">{stats.activeUsers}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Usuarios Activos
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
                <Avatar sx={{ bgcolor: 'error.main' }}>
                  <AdminPanelSettings />
                </Avatar>
                <Box>
                  <Typography variant="h4">{stats.adminUsers}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Administradores
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
                  <Person />
                </Avatar>
                <Box>
                  <Typography variant="h4">{stats.regularUsers}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Usuarios Regulares
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabla de usuarios */}
      <Paper sx={{ overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Usuario</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Fecha Creación</TableCell>
                <TableCell>Último Acceso</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar>
                        {getRoleIcon(user.role)}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {user.username}
                        </Typography>
                        {user.email && (
                          <Typography variant="caption" color="text.secondary">
                            {user.email}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.role.toUpperCase()}
                      color={getRoleColor(user.role) as any}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.isActive ? 'Activo' : 'Inactivo'}
                      color={user.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {user.created_at.toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {user.lastLogin ? user.lastLogin.toLocaleDateString() : 'Nunca'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Editar usuario">
                      <IconButton 
                        size="small" 
                        onClick={() => handleEdit(user)}
                        disabled={user.id === currentUser?.id} // No editar a sí mismo
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar usuario">
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => handleDelete(user.id)}
                        disabled={user.id === currentUser?.id} // No eliminar a sí mismo
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialog para crear/editar usuario */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editing?.id === 0 ? 'Crear Nuevo Usuario' : 'Editar Usuario'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Nombre de Usuario"
              value={editing?.username || ''}
              onChange={(e) => setEditing(prev => prev ? { ...prev, username: e.target.value } : prev)}
              fullWidth
              required
            />
            
            <TextField
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              helperText={editing?.id !== 0 ? 'Dejar vacío para no cambiar' : 'Mínimo 6 caracteres'}
              fullWidth
              required={editing?.id === 0}
            />
            
            <FormControl fullWidth>
              <InputLabel>Rol</InputLabel>
              <Select
                value={editing?.role || 'user'}
                label="Rol"
                onChange={(e) => setEditing(prev => prev ? { ...prev, role: e.target.value as any } : prev)}
              >
                <MenuItem value="user">Usuario Regular</MenuItem>
                <MenuItem value="admin">Administrador</MenuItem>
                <MenuItem value="viewer">Solo Lectura</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained" disabled={loading}>
            {editing?.id === 0 ? 'Crear' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}