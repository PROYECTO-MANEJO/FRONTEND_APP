import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
  Avatar,
  Button,
  Collapse
} from '@mui/material';
import {
  Assignment,
  Code,
  BugReport,
  Logout,
  ExpandLess,
  ExpandMore,
  PlayArrow,
  CheckCircle
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 280;

const DeveloperSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [solicitudesOpen, setSolicitudesOpen] = useState(true);
  const [misSolicitudesPersonalesOpen, setMisSolicitudesPersonalesOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      text: 'Solicitudes Asignadas',
      icon: <Assignment />,
      path: '/developer/solicitudes',
      color: '#7b1fa2',
      submenu: [
        {
          text: 'Todas',
          icon: <Assignment />,
          path: '/developer/solicitudes',
          color: '#7b1fa2'
        },
        {
          text: 'Pendientes',
          icon: <PlayArrow />,
          path: '/developer/solicitudes?estado=APROBADA',
          color: '#f57c00'
        },
        {
          text: 'En Desarrollo',
          icon: <Code />,
          path: '/developer/solicitudes?estado=EN_DESARROLLO',
          color: '#1976d2'
        },
        {
          text: 'En Testing',
          icon: <BugReport />,
          path: '/developer/solicitudes?estado=EN_TESTING',
          color: '#9c27b0'
        },
        {
          text: 'Completadas',
          icon: <CheckCircle />,
          path: '/developer/solicitudes?estado=COMPLETADA',
          color: '#388e3c'
        }
      ]
    },
    {
      text: 'Mis Solicitudes Personales',
      icon: <Assignment />,
      path: '/developer/mis-solicitudes',
      color: '#1976d2',
      submenu: []
    }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isParentActive = (item) => {
    if (item.submenu) {
      return item.submenu.some(subItem => isActive(subItem.path));
    }
    return isActive(item.path);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          bgcolor: '#1e1e2e',
          color: 'white'
        },
      }}
    >
      {/* Header */}
      <Box sx={{ p: 3, textAlign: 'center', bgcolor: '#181825' }}>
        <Avatar
          sx={{
            width: 60,
            height: 60,
            mx: 'auto',
            mb: 2,
            bgcolor: '#7b1fa2',
            fontSize: '1.5rem',
            fontWeight: 'bold'
          }}
        >
          {user?.nombre?.charAt(0) || 'D'}
        </Avatar>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
          {user?.nombre || 'Desarrollador'}
        </Typography>
        <Typography variant="body2" sx={{ color: '#a6adc8', mb: 1 }}>
          {user?.email}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            bgcolor: '#7b1fa2',
            px: 2,
            py: 0.5,
            borderRadius: 2,
            fontWeight: 'bold'
          }}
        >
          DESARROLLADOR
        </Typography>
        <Typography variant="caption" sx={{ color: '#a6adc8', display: 'block', mt: 1 }}>
          Gestión de Solicitudes de Cambio
        </Typography>
      </Box>

      <Divider sx={{ bgcolor: '#313244' }} />

      {/* Menu Items */}
      <List sx={{ px: 1, py: 2 }}>
        {menuItems.map((item) => (
          <React.Fragment key={item.text}>
            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  if (item.submenu && item.submenu.length > 0) {
                    if (item.text === 'Solicitudes Asignadas') {
                      setSolicitudesOpen(!solicitudesOpen);
                    } else if (item.text === 'Mis Solicitudes Personales') {
                      setMisSolicitudesPersonalesOpen(!misSolicitudesPersonalesOpen);
                    }
                  } else {
                    navigate(item.path);
                  }
                }}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  bgcolor: isParentActive(item) ? 'rgba(123, 31, 162, 0.2)' : 'transparent',
                  '&:hover': {
                    bgcolor: 'rgba(123, 31, 162, 0.1)',
                  },
                  border: isParentActive(item) ? '1px solid rgba(123, 31, 162, 0.3)' : '1px solid transparent'
                }}
              >
                <ListItemIcon sx={{ color: item.color, minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontWeight: isParentActive(item) ? 'bold' : 'normal',
                      fontSize: '0.9rem'
                    }
                  }}
                />
                {item.submenu && item.submenu.length > 0 && (
                  item.text === 'Solicitudes Asignadas' ? 
                    (solicitudesOpen ? <ExpandLess /> : <ExpandMore />) : 
                  item.text === 'Mis Solicitudes Personales' ? 
                    (misSolicitudesPersonalesOpen ? <ExpandLess /> : <ExpandMore />) : null
                )}
              </ListItemButton>
            </ListItem>

            {/* Submenu */}
            {item.submenu && item.text === 'Solicitudes Asignadas' && (
              <Collapse in={solicitudesOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.submenu.map((subItem) => (
                    <ListItem key={subItem.text} disablePadding sx={{ pl: 2 }}>
                      <ListItemButton
                        onClick={() => navigate(subItem.path)}
                        sx={{
                          borderRadius: 2,
                          mx: 1,
                          bgcolor: isActive(subItem.path) ? 'rgba(123, 31, 162, 0.2)' : 'transparent',
                          '&:hover': {
                            bgcolor: 'rgba(123, 31, 162, 0.1)',
                          },
                          border: isActive(subItem.path) ? '1px solid rgba(123, 31, 162, 0.3)' : '1px solid transparent'
                        }}
                      >
                        <ListItemIcon sx={{ color: subItem.color, minWidth: 35 }}>
                          {subItem.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={subItem.text}
                          sx={{
                            '& .MuiListItemText-primary': {
                              fontWeight: isActive(subItem.path) ? 'bold' : 'normal',
                              fontSize: '0.85rem'
                            }
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>

      {/* Footer */}
      <Box sx={{ mt: 'auto', p: 2 }}>
        <Divider sx={{ bgcolor: '#313244', mb: 2 }} />
        <Button
          fullWidth
          startIcon={<Logout />}
          onClick={handleLogout}
          sx={{
            color: '#f38ba8',
            '&:hover': {
              bgcolor: 'rgba(243, 139, 168, 0.1)',
            },
            justifyContent: 'flex-start',
            textTransform: 'none',
            fontWeight: 'bold'
          }}
        >
          Cerrar Sesión
        </Button>
      </Box>
    </Drawer>
  );
};

export default DeveloperSidebar; 