'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  ListItemIcon,
  ListItemText,
  Chip,
  useTheme,
  useMediaQuery,
  alpha,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  Stack,
  Tooltip,
  Badge,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  AccountCircle,
  Logout,
  History,
  Code,
  People,
  Settings,
  Business,
  Inventory,
  TrendingUp,
  Search,
  KeyboardArrowRight,
  Menu as MenuIcon,
  Close,
  CalendarToday,
  Person,
  ExpandMore,
  Dashboard as DashboardIcon,
  LocalShipping,
  Replay,
  Refresh,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/lib/permissions';
import { apiPath, pagePath } from '@/lib/api-path';

const DRAWER_WIDTH = 280;

interface ExecutiveLayoutProps {
  children: React.ReactNode;
}

export default function ExecutiveLayout({ children }: ExecutiveLayoutProps) {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [quickStats, setQuickStats] = useState({
    operationsToday: 0,
    topUser: user?.role === 'admin' ? 'Admin' : 'Usuario'
  });

  // Inicializar el drawer basado en el tamaño de pantalla
  React.useEffect(() => {
    setDrawerOpen(!isMobile);
  }, [isMobile]);

  // Obtener estadísticas del día
  React.useEffect(() => {
    const fetchDailyStats = async () => {
      try {
        // Si es usuario, obtener sus propias estadísticas
        const endpoint = user?.role === 'user' ? '/api/user/stats' : '/api/estadisticas';
        const response = await fetch(apiPath(endpoint));
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            if (user?.role === 'user') {
              // Para usuarios normales, mostrar sus propias estadísticas
              setQuickStats({
                operationsToday: data.stats.logsHoy || 0,
                topUser: data.stats.username || 'N/A'
              });
            } else {
              // Para admins, mostrar "Admin" siempre
              setQuickStats({
                operationsToday: data.stats.logsHoy || 0,
                topUser: 'Admin'
              });
            }
          }
        }
      } catch (error) {
        console.error('Error fetching daily stats:', error);
      }
    };

    if (user) {
      fetchDailyStats();
      
      // Refrescar cada 5 minutos
      const interval = setInterval(fetchDailyStats, 5 * 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
  };

  // Menú dinámico según rol
  const getMenuItems = () => {
    if (user?.role === 'admin') {
      return {
        directLinks: [
          { icon: <Code sx={{ fontSize: 22 }} />, label: 'Códigos IC', path: '/admin/codigos-ic', description: 'Herramienta de búsqueda' },
        ],
        sections: [
          {
            title: 'Ordenes de Venta',
            items: [
              { icon: <Replay sx={{ fontSize: 22 }} />, label: 'Reenvío', path: '/user/ordenes-venta/reenvio', description: 'Reenvío a 3PL o actualización de dirección' },
              { icon: <Refresh sx={{ fontSize: 22 }} />, label: 'Reprocesamiento', path: '/user/ordenes-venta/reprocesamiento', description: 'Corrección de costo cero o inventario negativo' },
            ]
          },
          {
            title: 'Administración',
            items: [
              { icon: <People sx={{ fontSize: 22 }} />, label: 'Usuarios', path: '/admin/usuarios', description: 'Gestión de usuarios' },
            ]
          },
          {
            title: 'Análisis',
            items: [
              { icon: <History sx={{ fontSize: 22 }} />, label: 'Logs', path: '/admin/logs', description: 'Historial de actividad' },
              { icon: <TrendingUp sx={{ fontSize: 22 }} />, label: 'Estadísticas', path: '/admin/estadisticas', description: 'Métricas del sistema' },
            ]
          }
        ]
      };
    } else {
      // Usuario normal
      return {
        directLinks: [
          { icon: <Code sx={{ fontSize: 22 }} />, label: 'Códigos IC', path: '/user/codigos-ic', description: 'Herramienta de búsqueda' },
        ],
        sections: [
          {
            title: 'Ordenes de Venta',
            items: [
              { icon: <Replay sx={{ fontSize: 22 }} />, label: 'Reenvío', path: '/user/ordenes-venta/reenvio', description: 'Reenvío a 3PL o actualización de dirección' },
              { icon: <Refresh sx={{ fontSize: 22 }} />, label: 'Reprocesamiento', path: '/user/ordenes-venta/reprocesamiento', description: 'Corrección de costo cero o inventario negativo' },
            ]
          },
          {
            title: 'Mi Actividad',
            items: [
              { icon: <History sx={{ fontSize: 22 }} />, label: 'Mis Registros', path: '/user/mis-registros', description: 'Historial de operaciones' },
            ]
          }
        ]
      };
    }
  };

  const menuItems = getMenuItems();
  const directLinks = menuItems.directLinks;
  const accordionSections = menuItems.sections;

  // Helper para verificar si una ruta está activa
  const isPathActive = (path: string) => {
    const fullPath = pagePath(path);
    return pathname === fullPath || pathname?.startsWith(fullPath + '/');
  };

  // Helper para verificar si algún item de una sección está activo
  const isSectionActive = (items: { path: string }[]) => {
    return items.some(item => isPathActive(item.path));
  };

  const getRoleBadge = (role: string) => {
    const config = {
      admin: { label: 'Admin', color: 'error' as const, bgcolor: alpha(theme.palette.error.main, 0.1) },
      user: { label: 'Usuario', color: 'primary' as const, bgcolor: alpha(theme.palette.primary.main, 0.1) },
      viewer: { label: 'Viewer', color: 'default' as const, bgcolor: alpha(theme.palette.grey[500], 0.1) },
    };
    return config[role as keyof typeof config] || config.user;
  };

  const roleBadge = user ? getRoleBadge(user.role) : null;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8FAFC', overflow: 'hidden' }}>
      {/* Top Navigation Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          bgcolor: '#2c3e50',
          borderBottom: 'none',
          borderRadius: 0,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
      >
        <Toolbar sx={{ 
          px: { xs: 1, sm: 2, md: 3 },
          minHeight: { xs: '56px', sm: '64px' }
        }}>
          <IconButton
            edge="start"
            onClick={() => setDrawerOpen(!drawerOpen)}
            sx={{ 
              mr: { xs: 1, sm: 2 },
              padding: 0,
              '&:hover': { bgcolor: 'transparent' }
            }}
          >
            <svg 
              className={`ham hamRotate ham8 ${drawerOpen ? 'active' : ''}`}
              viewBox="0 0 100 100" 
              width="40"
              height="40"
            >
              <path
                className="line top"
                d="m 30,33 h 40 c 3.722839,0 7.5,3.126468 7.5,8.578427 0,5.451959 -2.727029,8.421573 -7.5,8.421573 h -20" 
              />
              <path
                className="line middle"
                d="m 30,50 h 40" 
              />
              <path
                className="line bottom"
                d="m 70,67 h -40 c 0,0 -7.5,-0.802118 -7.5,-8.365747 0,-7.563629 7.5,-8.634253 7.5,-8.634253 h 20" 
              />
            </svg>
          </IconButton>

          {/* Logo and Title */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
{/*             <Box
              sx={{
                width: { xs: 32, sm: 40 },
                height: { xs: 32, sm: 40 },
                borderRadius: 0,
                background: alpha('#fff', 0.15),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)',
              }}
            >
              <Code sx={{ color: 'white', fontSize: { xs: 20, sm: 24 } }} />
            </Box> */}
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography
                variant="h6"
                onClick={() => router.push(pagePath(user?.role === 'admin' ? '/admin/home' : '/user/home'))}
                sx={{
                  fontWeight: 700,
                  color: 'white',
                  lineHeight: 1.2,
                  fontSize: { xs: '0.9rem', sm: '1.1rem' },
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    opacity: 0.8,
                    transform: 'scale(1.02)',
                  },
                }}
              >
                AutoSoporte
              </Typography>
              <Typography variant="caption" sx={{ color: alpha('#fff', 0.8), display: { xs: 'none', md: 'block' } }}>
                Sistema de Gestión
              </Typography>
            </Box>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Quick Stats */}
          <Stack direction="row" spacing={{ xs: 0.5, sm: 1.5 }} sx={{ mr: { xs: 0.5, sm: 1, md: 3 }, display: { xs: 'none', sm: 'flex' } }}>
            <Chip
              icon={<TrendingUp />}
              label={`${quickStats.operationsToday} ops`}
              size="small"
              sx={{
                bgcolor: alpha('#fff', 0.15),
                color: 'white',
                fontWeight: 600,
                fontSize: { xs: '0.7rem', sm: '0.8125rem' },
                border: `1px solid ${alpha('#fff', 0.2)}`,
                '& .MuiChip-icon': { color: 'white', fontSize: { xs: 16, sm: 18 } },
              }}
            />
            <Chip
              icon={<Person />}
              label={quickStats.topUser}
              size="small"
              sx={{
                bgcolor: alpha('#fff', 0.15),
                color: 'white',
                fontWeight: 600,
                fontSize: { xs: '0.7rem', sm: '0.8125rem' },
                border: `1px solid ${alpha('#fff', 0.2)}`,
                '& .MuiChip-icon': { color: 'white', fontSize: { xs: 16, sm: 18 } },
                display: { xs: 'none', md: 'flex' }
              }}
            />
          </Stack>

          {/* User Menu */}
          <IconButton
            onClick={handleMenu}
            sx={{
              border: `2px solid ${alpha('#fff', 0.2)}`,
              p: { xs: 0.25, sm: 0.5 },
              '&:hover': { borderColor: alpha('#fff', 0.4), bgcolor: alpha('#fff', 0.1) }
            }}
          >
            <Avatar
              sx={{
                width: { xs: 28, sm: 36 },
                height: { xs: 28, sm: 36 },
                bgcolor: alpha('#fff', 0.9),
                color: '#2c3e50',
                fontWeight: 700,
                fontSize: { xs: '0.75rem', sm: '0.95rem' },
              }}
            >
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              elevation: 8,
              sx: {
                mt: 1.5,
                minWidth: 280,
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
              },
            }}
          >
            <Box sx={{ px: 3, py: 2.5 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: theme.palette.primary.main,
                    fontWeight: 700,
                  }}
                >
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                    {user?.username}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                    {user?.email || 'No email'}
                  </Typography>
                  {roleBadge && (
                    <Chip
                      label={roleBadge.label}
                      size="small"
                      sx={{
                        mt: 0.5,
                        height: 20,
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        bgcolor: roleBadge.bgcolor,
                        color: roleBadge.color === 'error' ? theme.palette.error.main : 
                               roleBadge.color === 'primary' ? theme.palette.primary.main : 
                               theme.palette.text.secondary,
                      }}
                    />
                  )}
                </Box>
              </Stack>
            </Box>
            <Divider />
            {user?.role === 'user' && (
              <>
                <MenuItem 
                  onClick={() => {
                    handleClose();
                    router.push(pagePath('/user/perfil'));
                  }} 
                  sx={{ py: 1.5, px: 3 }}
                >
                  <ListItemIcon>
                    <Settings fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Configuración de Cuenta</ListItemText>
                </MenuItem>
                <Divider />
              </>
            )}
            <MenuItem onClick={handleLogout} sx={{ py: 1.5, px: 3, color: 'error.main' }}>
              <ListItemIcon>
                <Logout fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Cerrar Sesión</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Side Navigation */}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: { xs: '85%', sm: DRAWER_WIDTH },
            maxWidth: DRAWER_WIDTH,
            boxSizing: 'border-box',
            bgcolor: '#2c3e50',
            borderRight: `1px solid ${alpha('#000', 0.2)}`,
            borderRadius: 0,
          },
        }}
      >
        <Box sx={{ p: 3, pt: 2, mt: 8 }}>
          {/* Header del Sidenav - Home */}
          <ListItemButton
            onClick={() => {
              router.push(pagePath(user?.role === 'admin' ? '/admin/home' : '/user/home'));
              setDrawerOpen(false);
            }}
            sx={{
              borderRadius: 0,
              py: 2,
              px: 2,
              mb: 2,
              bgcolor: pathname?.includes('/home') ? alpha('#fff', 0.15) : 'transparent',
              border: `1px solid ${alpha('#fff', 0.2)}`,
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: alpha('#fff', 0.1),
              },
            }}
          >
            <Box>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  color: 'white',
                  fontSize: '0.9rem',
                }}
              >
                AutoSoporte
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: alpha('#fff', 0.7), fontSize: '0.7rem' }}
              >
                Sistema de Gestión
              </Typography>
            </Box>
          </ListItemButton>

          <Divider sx={{ borderColor: alpha('#fff', 0.1), mb: 2 }} />

          {/* Enlaces Directos */}
          {directLinks.map((link, index) => {
            const isActive = isPathActive(link.path);
            return (
            <ListItemButton
              key={index}
              onClick={() => {
                router.push(pagePath(link.path));
                setDrawerOpen(false);
              }}
              sx={{
                borderRadius: 0,
                py: 1.5,
                px: 2,
                mb: 1,
                bgcolor: isActive ? alpha('#fff', 0.15) : 'transparent',
                border: `1px solid ${isActive ? alpha('#fff', 0.3) : alpha('#fff', 0.1)}`,
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: alpha('#fff', 0.1),
                },
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontSize: '0.75rem',
                  color: 'white',
                }}
              >
                {link.label}
              </Typography>
            </ListItemButton>
          );
          })}

          {/* Secciones con Acordeón */}
          {accordionSections.map((section, sectionIndex) => {
            const sectionIsActive = isSectionActive(section.items);
            return (
            <Accordion
              key={sectionIndex}
              defaultExpanded={sectionIsActive}
                sx={{
                  bgcolor: 'transparent',
                  boxShadow: 'none',
                  border: `1px solid ${sectionIsActive ? alpha('#fff', 0.3) : alpha('#fff', 0.1)}`,
                  borderRadius: '0 !important',
                  mb: 1,
                  '&:before': { display: 'none' },
                  '& .MuiAccordionSummary-root': {
                    minHeight: 48,
                    '&.Mui-expanded': {
                      minHeight: 48,
                    },
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore sx={{ color: 'white' }} />}
                  sx={{
                    px: 2,
                    color: 'white',
                    '&:hover': {
                      bgcolor: alpha('#fff', 0.05),
                    },
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      fontSize: '0.75rem',
                    }}
                  >
                    {section.title}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                  <List sx={{ p: 0 }}>
                    {section.items.map((item, index) => {
                      const itemIsActive = isPathActive(item.path);
                      return (
                      <ListItem key={index} disablePadding>
                        <ListItemButton
                          onClick={() => {
                            router.push(pagePath(item.path));
                            setDrawerOpen(false);
                          }}
                          sx={{
                            borderRadius: 0,
                            py: 1.5,
                            px: 2,
                            pl: 4,
                            bgcolor: itemIsActive ? alpha('#fff', 0.15) : 'transparent',
                            transition: 'all 0.2s',
                            '&:hover': {
                              bgcolor: alpha('#fff', 0.1),
                              transform: 'translateX(4px)',
                              '& .nav-arrow': {
                                opacity: 1,
                                transform: 'translateX(0)',
                              }
                            },
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 40, color: itemIsActive ? '#3498db' : 'white' }}>
                            {item.icon}
                          </ListItemIcon>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, lineHeight: 1.3, mb: 0.3, color: 'white' }}
                            >
                              {item.label}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: alpha('#fff', 0.7), fontSize: '0.7rem' }}
                            >
                              {item.description}
                            </Typography>
                          </Box>
                          <KeyboardArrowRight
                            className="nav-arrow"
                            sx={{
                              fontSize: 18,
                              color: 'white',
                              opacity: itemIsActive ? 1 : 0,
                              transform: itemIsActive ? 'translateX(0)' : 'translateX(-4px)',
                              transition: 'all 0.2s',
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    );
                    })}
                  </List>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>

      
      </Drawer>

      {/* Side Navigation - Desktop */}
      <Drawer
        variant="persistent"
        open={drawerOpen}
        sx={{
          display: { xs: 'none', md: 'block' },
          width: drawerOpen ? DRAWER_WIDTH : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            bgcolor: '#2c3e50',
            borderRight: `1px solid ${alpha('#000', 0.2)}`,
            borderRadius: 0,
            mt: { xs: '56px', sm: '64px' },
          },
        }}
      >
        <Box sx={{ p: 3, pt: 2 }}>
          {/* Header del Sidenav - Home */}
          <ListItemButton
            onClick={() => router.push(pagePath(user?.role === 'admin' ? '/admin/home' : '/user/home'))}
            sx={{
              borderRadius: 0,
              py: 2,
              px: 2,
              mb: 2,
              bgcolor: pathname?.includes('/home') ? alpha('#fff', 0.15) : 'transparent',
              border: `1px solid ${alpha('#fff', 0.2)}`,
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: alpha('#fff', 0.1),
              },
            }}
          >
            <Box>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  color: 'white',
                  fontSize: '0.9rem',
                }}
              >
                AutoSoporte
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: alpha('#fff', 0.7), fontSize: '0.7rem' }}
              >
                Sistema de Gestión
              </Typography>
            </Box>
          </ListItemButton>

          <Divider sx={{ borderColor: alpha('#fff', 0.1), mb: 2 }} />

          {/* Enlaces Directos */}
          {directLinks.map((link, index) => {
            const isActive = isPathActive(link.path);
            return (
            <ListItemButton
              key={index}
              onClick={() => router.push(pagePath(link.path))}
              sx={{
                borderRadius: 0,
                py: 1.5,
                px: 2,
                mb: 1,
                bgcolor: isActive ? alpha('#fff', 0.15) : 'transparent',
                border: `1px solid ${isActive ? alpha('#fff', 0.3) : alpha('#fff', 0.1)}`,
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: alpha('#fff', 0.1),
                },
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontSize: '0.75rem',
                  color: 'white',
                }}
              >
                {link.label}
              </Typography>
            </ListItemButton>
          );
          })}

          {/* Secciones con Acordeón */}
          {accordionSections.map((section, sectionIndex) => {
            const sectionIsActive = isSectionActive(section.items);
            return (
              <Accordion
                key={sectionIndex}
                defaultExpanded={sectionIsActive}
                sx={{
                  bgcolor: 'transparent',
                  boxShadow: 'none',
                  border: `1px solid ${sectionIsActive ? alpha('#fff', 0.3) : alpha('#fff', 0.1)}`,
                  borderRadius: '0 !important',
                  mb: 1,
                  '&:before': { display: 'none' },
                  '& .MuiAccordionSummary-root': {
                    minHeight: 48,
                    '&.Mui-expanded': {
                      minHeight: 48,
                    },
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore sx={{ color: 'white' }} />}
                  sx={{
                    px: 2,
                    color: 'white',
                    '&:hover': {
                      bgcolor: alpha('#fff', 0.05),
                    },
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      fontSize: '0.75rem',
                    }}
                  >
                    {section.title}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                  <List sx={{ p: 0 }}>
                    {section.items.map((item, index) => {
                      const itemIsActive = isPathActive(item.path);
                      return (
                      <ListItem key={index} disablePadding>
                        <ListItemButton
                          onClick={() => router.push(pagePath(item.path))}
                          sx={{
                            borderRadius: 0,
                            py: 1.5,
                            px: 2,
                            pl: 4,
                            bgcolor: itemIsActive ? alpha('#fff', 0.15) : 'transparent',
                            transition: 'all 0.2s',
                            '&:hover': {
                              bgcolor: alpha('#fff', 0.1),
                              transform: 'translateX(4px)',
                              '& .nav-arrow': {
                                opacity: 1,
                                transform: 'translateX(0)',
                              }
                            },
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 40, color: itemIsActive ? '#3498db' : 'white' }}>
                            {item.icon}
                          </ListItemIcon>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, lineHeight: 1.3, mb: 0.3, color: 'white' }}
                            >
                              {item.label}
                            </Typography>
                            <Typography
                              variant="caption"
                            sx={{ color: alpha('#fff', 0.7), fontSize: '0.7rem' }}
                          >
                            {item.description}
                          </Typography>
                        </Box>
                        <KeyboardArrowRight
                          className="nav-arrow"
                          sx={{
                            fontSize: 18,
                            color: 'white',
                            opacity: itemIsActive ? 1 : 0,
                            transform: itemIsActive ? 'translateX(0)' : 'translateX(-4px)',
                            transition: 'all 0.2s',
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                  })}
                </List>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>


      </Drawer>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: { xs: 8, sm: 10 },
          pb: { xs: 2, sm: 4 },
          px: { xs: 2, sm: 3, md: 4 },
          ml: 0,
          width: { xs: '100%', md: drawerOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%' },
          minHeight: '100vh',
          height: '100vh',
          overflowY: 'auto',
          overflowX: 'hidden',
          transition: theme.transitions.create(['margin-left', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
