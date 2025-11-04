'use client';

import React from 'react';
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
  Chip,
  Avatar,
  Menu,
  MenuItem,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Code,
  People,
  Analytics,
  Settings,
  Logout,
  AdminPanelSettings,
  PersonOutline,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';

const drawerWidth = 280;

interface ModularLayoutProps {
  children: React.ReactNode;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  permissions: string[];
  badge?: number;
}

export default function ModularLayout({ children }: ModularLayoutProps) {
  const { user, logout, availableModules } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  if (!user) {
    return <>{children}</>;
  }

  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Dashboard />,
      path: '/',
      permissions: []
    },
    {
      id: 'ic-codes',
      label: 'Códigos IC',
      icon: <Code />,
      path: '/ic-codes',
      permissions: [PERMISSIONS.IC_CODES_READ]
    },
    {
      id: 'reports',
      label: 'Reportes',
      icon: <Analytics />,
      path: '/reports',
      permissions: [PERMISSIONS.REPORTS_VIEW]
    },
    // Módulos exclusivos para administradores
    ...(user.role === 'admin' ? [
      {
        id: 'users',
        label: 'Gestión de Usuarios',
        icon: <People />,
        path: '/admin/users',
        permissions: [PERMISSIONS.USERS_MANAGE]
      },
      {
        id: 'system',
        label: 'Configuración',
        icon: <Settings />,
        path: '/admin/system',
        permissions: [PERMISSIONS.SYSTEM_CONFIG]
      }
    ] : [])
  ];

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

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'error';
      case 'user': return 'primary';
      case 'viewer': return 'secondary';
      default: return 'default';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <AdminPanelSettings />;
      case 'user': return <PersonOutline />;
      default: return <PersonOutline />;
    }
  };

  const drawer = (
    <div>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            {getRoleIcon(user.role)}
          </Avatar>
          <Box>
            <Typography variant="h6" noWrap component="div">
              Reebok IC
            </Typography>
            <Chip
              label={user.role.toUpperCase()}
              size="small"
              color={getRoleColor(user.role) as any}
              variant="outlined"
            />
          </Box>
        </Box>
      </Toolbar>
      
      <Divider />
      
      <List>
        {navigationItems
          .filter(item => 
            item.permissions.length === 0 || 
            item.permissions.some(permission => hasPermission(user.role, permission))
          )
          .map((item) => (
            <ListItem key={item.id} disablePadding>
              <ListItemButton
                component="a"
                href={item.path}
                sx={{
                  minHeight: 48,
                  '&:hover': {
                    backgroundColor: 'primary.light',
                    '& .MuiListItemIcon-root': {
                      color: 'primary.contrastText',
                    },
                    '& .MuiListItemText-primary': {
                      color: 'primary.contrastText',
                    }
                  }
                }}
              >
                <ListItemIcon>
                  <Badge badgeContent={item.badge} color="error">
                    {item.icon}
                  </Badge>
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
      </List>

      <Divider />

      {/* Módulos disponibles */}
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Módulos Disponibles
        </Typography>
        {availableModules
          .filter(module => module.hasAccess)
          .map((module) => (
            <Chip
              key={module.moduleId}
              label={module.moduleName}
              size="small"
              variant="outlined"
              sx={{ mr: 1, mb: 1 }}
            />
          ))}
      </Box>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'primary.main'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Sistema de Gestión IC - Reebok
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              avatar={<Avatar>{user.username.charAt(0).toUpperCase()}</Avatar>}
              label={user.username}
              color="secondary"
              onClick={handleMenuOpen}
              sx={{ cursor: 'pointer' }}
            />
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem disabled>
              <Box>
                <Typography variant="body2">{user.username}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {user.role}
                </Typography>
              </Box>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Cerrar Sesión
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: 'grey.50'
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}