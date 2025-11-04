'use client';

import React, { useEffect, useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  TextField,
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
  Select,
  MenuItem,
  IconButton,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { apiPath } from '@/lib/api-path';

interface UserRecord {
  id?: number;
  username: string;
  role?: string;
}

export default function SimpleAdmin() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<UserRecord | null>(null);
  const [password, setPassword] = useState('');

  const load = async () => {
    try {
      const res = await fetch(apiPath('/api/admin/users'));
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { load(); }, []);

  const handleOpenNew = () => {
    setEditing({ username: '', role: 'user' });
    setPassword('');
    setOpen(true);
  };

  const handleEdit = (u: UserRecord) => {
    setEditing(u);
    setPassword('');
    setOpen(true);
  };

  const handleSave = async () => {
    if (!editing) return;
    try {
      if (!editing.id) {
        // create - incluir email usando el username
        const response = await fetch(apiPath('/api/admin/users'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            username: editing.username, 
            email: editing.username, 
            password, 
            role: editing.role 
          }),
        });
        const data = await response.json();
        if (!data.success) {
          alert(data.error || 'Error creando usuario');
          return;
        }
      } else {
        // update - solo enviar los campos necesarios
        const updateBody: any = { id: editing.id };
        if (editing.username) updateBody.username = editing.username;
        if (password) updateBody.password = password;
        if (editing.role) updateBody.role = editing.role;
        
        const response = await fetch(apiPath('/api/admin/users'), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateBody),
        });
        const data = await response.json();
        if (!data.success) {
          alert(data.error || 'Error actualizando usuario');
          return;
        }
      }
      setOpen(false);
      load();
    } catch (err) {
      console.error(err);
      alert('Error en la operación');
    }
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (!confirm('Eliminar usuario?')) return;
    await fetch(apiPath('/api/admin/users'), { method: 'DELETE', body: JSON.stringify({ id }), headers: { 'Content-Type': 'application/json' } });
    load();
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Administración - Usuarios</Typography>
        <Button variant="contained" onClick={handleOpenNew}>Nuevo usuario</Button>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Usuario</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Creado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u: any) => (
              <TableRow key={u.id}>
                <TableCell>{u.username}</TableCell>
                <TableCell>{u.role}</TableCell>
                <TableCell>{new Date(u.created_at).toLocaleString()}</TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleEdit(u)}><EditIcon /></IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(u.id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editing && editing.id ? 'Editar usuario' : 'Nuevo usuario'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Usuario" value={editing?.username || ''} onChange={(e) => setEditing(prev => prev ? { ...prev, username: e.target.value } : prev)} />
            <TextField label="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} helperText={editing?.id ? 'Dejar vacío para no cambiar' : ''} />
            <Select value={editing?.role || 'user'} onChange={(e) => setEditing(prev => prev ? { ...prev, role: e.target.value } : prev as any)}>
              <MenuItem value="user">user</MenuItem>
              <MenuItem value="admin">admin</MenuItem>
            </Select>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
