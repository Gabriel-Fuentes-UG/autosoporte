'use client';

import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Lock,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginForm() {
  const { login } = useAuth();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ username: '', password: '' });

  const validateForm = () => {
    const newErrors = { username: '', password: '' };
    let isValid = true;

    if (!credentials.username.trim()) {
      newErrors.username = 'El correo electrónico es requerido';
      isValid = false;
    }

    if (!credentials.password.trim()) {
      newErrors.password = 'La contraseña es requerida';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await login(credentials.username, credentials.password);
      
      // Redirigir inmediatamente según el rol
      if (result.success && result.role) {
        if (result.role === 'admin') {
          window.location.href = '/admin/home';
        } else {
          window.location.href = '/user/home';
        }
      }
    } catch (err: any) {
      setError(err.message || 'Credenciales incorrectas');
      setLoading(false);
    }
  };

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials(prev => ({ ...prev, [field]: e.target.value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
    setError('');
  };

  // Obtener la inicial del email
  const getUserInitial = () => {
    const email = credentials.username.trim();
    if (!email) return null;
    return email.charAt(0).toUpperCase();
  };

  const hasUserEmail = credentials.username.trim().length > 0;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f5f7fa',
        padding: { xs: 2, sm: 3, md: 4 },
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #2c3e50, #34495e, #2c3e50)',
        },
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: { xs: '100%', sm: 420, md: 480 },
          bgcolor: 'white',
          boxShadow: '0 10px 40px rgba(44, 62, 80, 0.15)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Header con diseño mejorado */}
        <Box
          sx={{
            bgcolor: '#2c3e50',
            p: { xs: 4, sm: 5 },
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            },
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                bgcolor: hasUserEmail ? 'rgba(52, 152, 219, 0.2)' : 'rgba(255,255,255,0.1)',
                border: hasUserEmail ? '2px solid rgba(52, 152, 219, 0.4)' : '2px solid rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                backdropFilter: 'blur(10px)',
                position: 'relative',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: hasUserEmail ? 'scale(1.05) rotate(0deg)' : 'scale(1) rotate(0deg)',
                boxShadow: hasUserEmail ? '0 4px 20px rgba(52, 152, 219, 0.3)' : 'none',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: -2,
                  left: -2,
                  right: -2,
                  bottom: -2,
                  background: hasUserEmail 
                    ? 'linear-gradient(45deg, rgba(52, 152, 219, 0.6), rgba(41, 128, 185, 0.6))' 
                    : 'transparent',
                  borderRadius: 'inherit',
                  opacity: 0,
                  transition: 'opacity 0.4s ease',
                  animation: hasUserEmail ? 'pulse 2s ease-in-out infinite' : 'none',
                  zIndex: -1,
                },
                '@keyframes pulse': {
                  '0%, 100%': {
                    opacity: 0.3,
                    transform: 'scale(1)',
                  },
                  '50%': {
                    opacity: 0.6,
                    transform: 'scale(1.1)',
                  },
                },
              }}
            >
              {/* Animación de transición entre candado e inicial */}
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Candado - se oculta cuando hay email */}
                <Lock 
                  sx={{ 
                    color: 'white', 
                    fontSize: 28,
                    position: 'absolute',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    opacity: hasUserEmail ? 0 : 1,
                    transform: hasUserEmail ? 'scale(0.5) rotate(-90deg)' : 'scale(1) rotate(0deg)',
                  }} 
                />
                
                {/* Inicial del usuario - aparece cuando hay email */}
                {getUserInitial() && (
                  <Typography
                    sx={{
                      color: 'white',
                      fontSize: '1.75rem',
                      fontWeight: 700,
                      position: 'absolute',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      opacity: hasUserEmail ? 1 : 0,
                      transform: hasUserEmail ? 'scale(1) rotate(0deg)' : 'scale(0.5) rotate(90deg)',
                    }}
                  >
                    {getUserInitial()}
                  </Typography>
                )}
              </Box>
            </Box>
            <Typography
              variant="h5"
              sx={{
                color: 'white',
                fontWeight: 700,
                mb: 0.5,
                fontSize: { xs: '1.35rem', sm: '1.5rem' },
                letterSpacing: '-0.5px',
              }}
            >
              AutoSoporte
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255,255,255,0.8)',
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                fontWeight: 500,
              }}
            >
              Sistema de Gestión
            </Typography>
          </Box>
        </Box>

        {/* Contenedor del formulario */}
        <Box sx={{ p: { xs: 3, sm: 4, md: 5 } }}>



          {/* Error Alert mejorado */}
          {error && (
            <Alert
              severity="error"
              onClose={() => setError('')}
              sx={{
                mb: 3,
                borderRadius: 0,
                bgcolor: '#fff5f5',
                color: '#c0392b',
                border: '1px solid #fadbd8',
                '& .MuiAlert-icon': {
                  color: '#c0392b',
                },
              }}
            >
              {error}
            </Alert>
          )}

          {/* Form mejorado */}
          <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="caption"
                sx={{
                  color: '#2c3e50',
                  fontWeight: 600,
                  display: 'block',
                  mb: 1,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
              </Typography>
              <TextField
                fullWidth
                placeholder="Ingrese su correo electrónico"
                value={credentials.username}
                onChange={handleInputChange('username')}
                disabled={loading}
                error={!!errors.username}
                helperText={errors.username}
                autoComplete="username"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: '#7f8c8d', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 0,
                    bgcolor: '#f8f9fa',
                    transition: 'all 0.2s',
                    '& fieldset': {
                      borderColor: '#e1e8ed',
                      borderWidth: '1px',
                    },
                    '&:hover': {
                      bgcolor: '#ffffff',
                      '& fieldset': {
                        borderColor: '#2c3e50',
                      },
                    },
                    '&.Mui-focused': {
                      bgcolor: '#ffffff',
                      '& fieldset': {
                        borderColor: '#2c3e50',
                        borderWidth: '2px',
                      },
                    },
                    '&.Mui-error fieldset': {
                      borderColor: '#e74c3c',
                    },
                  },
                  '& .MuiInputBase-input': {
                    py: 1.5,
                    fontSize: '0.95rem',
                    '&::placeholder': {
                      color: '#95a5a6',
                      opacity: 1,
                    },
                  },
                  '& .MuiFormHelperText-root': {
                    color: '#e74c3c',
                    ml: 0,
                    mt: 0.5,
                    fontSize: '0.75rem',
                  },
                }}
              />
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography
                variant="caption"
                sx={{
                  color: '#2c3e50',
                  fontWeight: 600,
                  display: 'block',
                  mb: 1,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
              </Typography>
              <TextField
                fullWidth
                placeholder="Ingrese su contraseña"
                type={showPassword ? 'text' : 'password'}
                value={credentials.password}
                onChange={handleInputChange('password')}
                disabled={loading}
                error={!!errors.password}
                helperText={errors.password}
                autoComplete="current-password"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: '#7f8c8d', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        disabled={loading}
                        sx={{
                          color: '#7f8c8d',
                          '&:hover': {
                            bgcolor: 'rgba(44, 62, 80, 0.05)',
                          },
                        }}
                      >
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 0,
                    bgcolor: '#f8f9fa',
                    transition: 'all 0.2s',
                    '& fieldset': {
                      borderColor: '#e1e8ed',
                      borderWidth: '1px',
                    },
                    '&:hover': {
                      bgcolor: '#ffffff',
                      '& fieldset': {
                        borderColor: '#2c3e50',
                      },
                    },
                    '&.Mui-focused': {
                      bgcolor: '#ffffff',
                      '& fieldset': {
                        borderColor: '#2c3e50',
                        borderWidth: '2px',
                      },
                    },
                    '&.Mui-error fieldset': {
                      borderColor: '#e74c3c',
                    },
                  },
                  '& .MuiInputBase-input': {
                    py: 1.5,
                    fontSize: '0.95rem',
                    '&::placeholder': {
                      color: '#95a5a6',
                      opacity: 1,
                    },
                  },
                  '& .MuiFormHelperText-root': {
                    color: '#e74c3c',
                    ml: 0,
                    mt: 0.5,
                    fontSize: '0.75rem',
                  },
                }}
              />
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                bgcolor: '#2c3e50',
                color: 'white',
                borderRadius: 0,
                py: { xs: 1.5, sm: 1.75 },
                fontWeight: 600,
                fontSize: { xs: '0.95rem', sm: '1rem' },
                textTransform: 'none',
                border: '2px solid #2c3e50',
                letterSpacing: '0.3px',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                  transition: 'left 0.5s',
                },
                '&:hover': {
                  bgcolor: '#1a252f',
                  borderColor: '#1a252f',
                  boxShadow: '0 4px 12px rgba(44, 62, 80, 0.3)',
                  '&::before': {
                    left: '100%',
                  },
                },
                '&:active': {
                  transform: 'scale(0.98)',
                },
                '&:disabled': {
                  bgcolor: '#bdc3c7',
                  borderColor: '#bdc3c7',
                  color: 'white',
                },
              }}
            >
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CircularProgress size={18} sx={{ color: 'white' }} />
                  <span>Verificando credenciales...</span>
                </Box>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </form>
        </Box>

        {/* Footer mejorado */}
        <Box
          sx={{
            borderTop: '1px solid #ecf0f1',
            bgcolor: '#f8f9fa',
            py: 2.5,
            px: { xs: 3, sm: 4 },
            textAlign: 'center',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: '#95a5a6',
              fontSize: { xs: '0.7rem', sm: '0.75rem' },
              display: 'block',
            }}
          >
            Sistema de Gestión
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: '#95a5a6',
              fontSize: { xs: '0.7rem', sm: '0.75rem' },
            }}
          >
            {new Date().getFullYear()}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
