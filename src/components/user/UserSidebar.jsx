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
  Event
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
        <ListItem 
          component={Link}
          to="/dashboard"
          sx={{ 
            mb: 1, 
            borderRadius: 2,
            color: 'white',
            textDecoration: 'none',
            bgcolor: isActive('/dashboard') ? 'rgba(255,255,255,0.1)' : 'transparent',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
          }}
        >
          <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>

        <ListItem 
          component={Link}
          to="/cursos"
          sx={{ 
            mb: 1, 
            borderRadius: 2,
            color: 'white',
            textDecoration: 'none',
            bgcolor: isActive('/cursos') ? 'rgba(255,255,255,0.1)' : 'transparent',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
          }}
        >
          <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
            <School />
          </ListItemIcon>
          <ListItemText primary="Cursos" />
        </ListItem>

        <ListItem 
          component={Link}
          to="/eventos"
          sx={{ 
            mb: 1, 
            borderRadius: 2,
            color: 'white',
            textDecoration: 'none',
            bgcolor: isActive('/eventos') ? 'rgba(255,255,255,0.1)' : 'transparent',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
          }}
        >
          <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
            <Event />
          </ListItemIcon>
          <ListItemText primary="Eventos" />
        </ListItem>

        <ListItem 
          component={Link}
          to="/solicitudes"
          sx={{ 
            mb: 1, 
            borderRadius: 2,
            color: 'white',
            textDecoration: 'none',
            bgcolor: isActive('/solicitudes') ? 'rgba(255,255,255,0.1)' : 'transparent',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
          }}
        >
          <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
            <Assignment />
          </ListItemIcon>
          <ListItemText primary="Solicitudes" />
        </ListItem>

        <ListItem 
          sx={{ 
            mb: 1, 
            borderRadius: 2,
            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
          }}
        >
          <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
            <Settings />
          </ListItemIcon>
          <ListItemText primary="Configuración" />
        </ListItem>
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