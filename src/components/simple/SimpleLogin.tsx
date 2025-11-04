'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
} from '@mui/material';
import { LoginOutlined } from '@mui/icons-material';
import { apiPath } from '@/lib/api-path';

interface SimpleLoginProps {
  onLogin: (username: string) => void;
}

export default function SimpleLogin({ onLogin }: SimpleLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim()) {
      setError('Por favor ingresa tu usuario');
      return;
    }

    if (!password.trim()) {
      setError('Por favor ingresa tu contraseña');
      return;
    }

    // Llamada al endpoint de login (server-side)
    (async () => {
      try {
        const res = await fetch(apiPath('/api/auth/login'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Error al iniciar sesión');
          return;
        }

        // Guardamos usuario (username + role) en localStorage
        const userObj = data.user || { username };
        localStorage.setItem('ic-user', userObj.username);
        localStorage.setItem('ic-user-role', userObj.role || 'user');
        onLogin(userObj.username);
      } catch (err) {
        setError('Error conectando al servidor');
      }
    })();
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            maxWidth: 400,
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <LoginOutlined sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" component="h1" gutterBottom>
              Códigos IC
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sistema de gestión minimalista
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Usuario"
              variant="outlined"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              margin="normal"
              autoFocus
            />
            
            <TextField
              fullWidth
              label="Contraseña"
              type="password"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              helperText="Prueba: admin/123"
            />

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              size="large"
            >
              Iniciar Sesión
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
}