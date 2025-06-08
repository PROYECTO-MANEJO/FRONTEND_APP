import React, { useContext } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar
} from '@mui/material';
import {
  Person,
  Dashboard as DashboardIcon,
  Assignment,
  People,
  Event,
  School,
  BarChart,
  Settings,
  Logout,
  AdminPanelSettings,
  AccountCircle,
  EventNote,
  RequestPage
} from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const AdminSidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
    ...(user?.rol === 'MASTER' ? [{ text: 'Usuarios', icon: <People />, path: '/admin/usuarios' }] : []),
    { text: 'Eventos', icon: <Event />, path: '/admin/eventos' },
    { text: 'Cursos', icon: <School />, path: '/admin/cursos' },
    { text: 'Solicitudes', icon: <RequestPage />, path: '/admin/solicitudes' },
    { text: 'Reportes', icon: <BarChart />, path: '/admin/reportes' },
    { text: 'Configuración', icon: <Settings />, path: '/admin/configuracion' },
  ];

  return (
    <Box 
      sx={{ 
        width: 280, 
        bgcolor: '#6d1313',
        color: 'white',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Logo/Header */}
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <AdminPanelSettings sx={{ fontSize: '3rem', mb: 1 }} />
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
          Admin Panel
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          Sistema de Gestión
        </Typography>
      </Box>

      {/* Navigation Menu */}
      <List sx={{ px: 2, flexGrow: 1 }}>
        {menuItems.map((item) => (
          <ListItem 
            key={item.text}
            component={Link}
            to={item.path}
            sx={{ 
              mb: 1, 
              borderRadius: 2,
              color: 'white',
              textDecoration: 'none',
              bgcolor: isActive(item.path) ? 'rgba(255,255,255,0.1)' : 'transparent',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
            }}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>

      {/* User Info */}
      <Box sx={{ p: 3, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
        {/* Logout Button */}
        <ListItem 
          onClick={handleLogout}
          sx={{ 
            mb: 2,
            borderRadius: 2,
            cursor: 'pointer',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
          }}
        >
          <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
            <Logout />
          </ListItemIcon>
          <ListItemText primary="Cerrar Sesión" />
        </ListItem>

        {/* User Profile */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            sx={{ 
              width: 40, 
              height: 40, 
              bgcolor: 'rgba(255,255,255,0.2)',
              mr: 2
            }}
          >
            <Person />
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              {user?.nombre} {user?.apellido}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {user?.rol}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminSidebar; 