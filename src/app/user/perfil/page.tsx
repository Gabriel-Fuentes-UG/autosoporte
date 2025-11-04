'use client';

import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, Card, CardContent,
  Alert, CircularProgress, InputAdornment, IconButton, Divider
} from '@mui/material';
import { Visibility, VisibilityOff, Lock, Person, Email, VpnKey } from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { apiPath } from '@/lib/api-path';
import ExecutiveLayout from '@/components/layout/ExecutiveLayout';

function PerfilContent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Validar si el botón debe estar habilitado
  const isValidPassword = currentPassword.length >= 6 && password.length >= 6 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentPassword) {
      setError('Debes ingresar tu contraseña actual');
      return;
    }

    if (currentPassword.length < 6) {
      setError('La contraseña actual debe tener al menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (currentPassword === password) {
      setError('La nueva contraseña debe ser diferente a la actual');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(apiPath('/api/user/update-password'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user?.id,
          currentPassword,
          password 
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Contraseña actualizada correctamente');
        setCurrentPassword('');
        setPassword('');
        setConfirmPassword('');
      } else {
        setError(data.error || 'Error actualizando contraseña');
      }
    } catch (err: any) {
      setError('Error en la operación');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress sx={{ color: '#2c3e50' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" sx={{ color: '#2c3e50', fontWeight: 700, mb: 3 }}>
        Configuración de Cuenta
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 0 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 0 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Información del Usuario - Solo Lectura */}
      <Card sx={{ mb: 3, borderRadius: 0 }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: '#2c3e50', fontWeight: 600, mb: 3 }}>
            Información Personal
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Nombre de Usuario"
              value={user.username}
              disabled
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person sx={{ color: '#7f8c8d' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 0,
                  bgcolor: '#f5f7fa'
                }
              }}
            />

            <TextField
              fullWidth
              label="Correo Electrónico"
              value={user.email}
              disabled
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: '#7f8c8d' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 0,
                  bgcolor: '#f5f7fa'
                }
              }}
            />

            <Alert severity="info" sx={{ borderRadius: 0 }}>
              Estos datos no pueden ser modificados. Contacta al administrador si necesitas actualizarlos.
            </Alert>
          </Box>
        </CardContent>
      </Card>

      {/* Cambio de Contraseña */}
      <Card sx={{ borderRadius: 0 }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: '#2c3e50', fontWeight: 600, mb: 1 }}>
            Cambiar Contraseña
          </Typography>
          <Typography variant="body2" sx={{ color: '#7f8c8d', mb: 3 }}>
            La contraseña debe tener al menos 6 caracteres
          </Typography>

          <Divider sx={{ mb: 3 }} />

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                fullWidth
                label="Contraseña Actual"
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                helperText={
                  currentPassword.length > 0 && currentPassword.length < 6
                    ? 'Mínimo 6 caracteres'
                    : 'Ingresa tu contraseña actual para verificar tu identidad'
                }
                error={currentPassword.length > 0 && currentPassword.length < 6}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <VpnKey sx={{ color: '#e67e22' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        edge="end"
                      >
                        {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 0
                  }
                }}
              />

              <Divider>
                <Typography variant="caption" sx={{ color: '#7f8c8d' }}>
                  NUEVA CONTRASEÑA
                </Typography>
              </Divider>

              <TextField
                fullWidth
                label="Nueva Contraseña"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                helperText={
                  password.length > 0 && password.length < 6
                    ? 'Mínimo 6 caracteres'
                    : `${password.length}/6 caracteres`
                }
                error={password.length > 0 && password.length < 6}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: '#7f8c8d' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 0
                  }
                }}
              />

              <TextField
                fullWidth
                label="Confirmar Nueva Contraseña"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                helperText={
                  confirmPassword.length > 0 && password !== confirmPassword
                    ? 'Las contraseñas no coinciden'
                    : confirmPassword.length > 0 && password === confirmPassword
                    ? '✓ Las contraseñas coinciden'
                    : ''
                }
                error={confirmPassword.length > 0 && password !== confirmPassword}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: '#7f8c8d' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 0
                  }
                }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setCurrentPassword('');
                    setPassword('');
                    setConfirmPassword('');
                    setError('');
                    setSuccess('');
                  }}
                  sx={{
                    borderRadius: 0,
                    borderColor: '#7f8c8d',
                    color: '#7f8c8d'
                  }}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!isValidPassword || loading}
                  sx={{
                    bgcolor: '#2c3e50',
                    borderRadius: 0,
                    minWidth: 150,
                    '&:hover': {
                      bgcolor: '#1a252f'
                    },
                    '&.Mui-disabled': {
                      bgcolor: '#ecf0f1',
                      color: '#bdc3c7'
                    }
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} sx={{ color: 'white' }} />
                  ) : (
                    'Actualizar Contraseña'
                  )}
                </Button>
              </Box>
            </Box>
          </form>
        </CardContent>
      </Card>

      {/* Información Adicional */}
      <Alert severity="warning" sx={{ mt: 3, borderRadius: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
          Consejos de Seguridad:
        </Typography>
        <Typography variant="body2" component="ul" sx={{ pl: 2, m: 0 }}>
          <li>Usa una contraseña única que no uses en otros sitios</li>
          <li>Combina letras, números y caracteres especiales</li>
          <li>No compartas tu contraseña con nadie</li>
        </Typography>
      </Alert>
    </Box>
  );
}

export default function PerfilPage() {
  return (
    <ExecutiveLayout>
      <PerfilContent />
    </ExecutiveLayout>
  );
}
