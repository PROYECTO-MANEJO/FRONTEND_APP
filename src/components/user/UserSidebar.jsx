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
  Settings,
  Logout,
  School,
  Event,
  AccountCircle,
  ListAlt,
  CardMembership
} from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const UserSidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Mis Cursos', icon: <School />, path: '/cursos' },
    { text: 'Mis Eventos', icon: <Event />, path: '/eventos' },
    { text: 'Mis Inscripciones', icon: <ListAlt />, path: '/mis-inscripciones' },
    { text: 'Mis Certificados', icon: <CardMembership />, path: '/certificados' },
    { text: 'Solicitudes', icon: <Assignment />, path: '/solicitudes' },
    { text: 'Mi Perfil', icon: <AccountCircle />, path: '/perfil' },
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
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
          MyStudy
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

export default UserSidebar;