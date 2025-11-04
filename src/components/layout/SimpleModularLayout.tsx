'use client';

import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  QrCode,
  People,
  Assessment,
  Logout,
  AdminPanelSettings,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import ICCodesModule from '@/modules/ic/ICCodesModule';
import UserManagementModule from '@/modules/users/UserManagementModule';

const drawerWidth = 280;

interface ModularLayoutProps {
  children: React.ReactNode;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  permission: string;
  component?: React.ComponentType;
}

export default function SimpleModularLayout({ children }: ModularLayoutProps) {
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [currentModule, setCurrentModule] = useState<string>('dashboard');

  if (!user) {
    return <>{children}</>;
  }

  // Definir elementos de navegación basados en permisos
  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Dashboard />,
      permission: PERMISSIONS.IC_CODES_VIEW, // Permiso mínimo
    },
    {
      id: 'ic-codes',
      label: 'Códigos IC',
      icon: <QrCode />,
      permission: PERMISSIONS.IC_CODES_VIEW,
      component: ICCodesModule,
    },
    {
      id: 'user-management',
      label: 'Gestión de Usuarios',
      icon: <People />,
      permission: PERMISSIONS.USERS_MANAGE,
      component: UserManagementModule,
    },
    {
      id: 'reports',
      label: 'Reportes',
      icon: <Assessment />,
      permission: PERMISSIONS.REPORTS_VIEW,
    },
  ];

  const accessibleItems = navigationItems.filter(item =>
    hasPermission(user.role, item.permission)
  );

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const handleModuleSelect = (moduleId: string) => {
    setCurrentModule(moduleId);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const renderCurrentModule = () => {
    if (currentModule === 'dashboard') {
      return (
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Bienvenido al sistema de códigos IC. Selecciona un módulo del menú lateral para comenzar.
          </Typography>
        </Box>
      );
    }

    const selectedItem = navigationItems.find(item => item.id === currentModule);
    if (selectedItem && selectedItem.component) {
      const ModuleComponent = selectedItem.component;
      return <ModuleComponent />;
    }

    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Módulo en desarrollo
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Este módulo está siendo desarrollado.
        </Typography>
      </Box>
    );
  };

  const drawer = (
    <Box>
      <Toolbar sx={{ px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <QrCode />
          </Avatar>
          <Box>
            <Typography variant="h6" noWrap>
              IC Codes
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Sistema de Códigos
            </Typography>
          </Box>
        </Box>
      </Toolbar>
      
      <Divider />
      
      <List sx={{ px: 2, py: 1 }}>
        {accessibleItems.map((item) => (
          <ListItem key={item.id} disablePadding>
            <ListItemButton
              onClick={() => handleModuleSelect(item.id)}
              selected={currentModule === item.id}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'primary.contrastText',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label}
                primaryTypographyProps={{
                  variant: 'body2',
                  fontWeight: currentModule === item.id ? 'medium' : 'regular',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {user.username}
            </Typography>
            <IconButton
              onClick={handleMenuOpen}
              sx={{ ml: 1 }}
            >
              <Avatar sx={{ width: 32, height: 32 }}>
                {user.role === 'admin' ? <AdminPanelSettings /> : <People />}
              </Avatar>
            </IconButton>
          </Box>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Cerrar Sesión
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              bgcolor: 'background.default',
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Toolbar />
        {renderCurrentModule()}
      </Box>
    </Box>
  );
}