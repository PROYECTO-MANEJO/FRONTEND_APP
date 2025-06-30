import React, { useContext } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  IconButton,
  Tooltip
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
  CardMembership,
  Menu,
  MenuOpen
} from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useUserSidebar } from '../../context/UserSidebarContext';

const UserSidebar = () => {
  const { isCollapsed, toggleSidebar } = useUserSidebar();
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
   // { text: 'Mis Cursos', icon: <School />, path: '/cursos' },
    //{ text: 'Mis Eventos', icon: <Event />, path: '/eventos' },
    //{ text: 'Mis Inscripciones', icon: <ListAlt />, path: '/mis-inscripciones' },
    { text: 'Mis Certificados', icon: <CardMembership />, path: '/certificados' },
    { text: 'Solicitudes', icon: <Assignment />, path: '/solicitudes' },
    { text: 'Mi Perfil', icon: <AccountCircle />, path: '/perfil' },
  ];

  return (
    <Box 
      sx={{ 
        width: isCollapsed ? 70 : 280,
        bgcolor: '#6d1313',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        zIndex: 1200,
        transition: 'width 0.3s ease',
        overflow: 'hidden'
      }}
    >
      {/* Logo/Header */}
      <Box sx={{ p: isCollapsed ? 1 : 3, textAlign: 'center', position: 'relative', minHeight: 100 }}>
        {/* Botón de colapso */}
        <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
          <Tooltip title={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"} placement="right">
            <IconButton
              onClick={toggleSidebar}
              sx={{
                color: 'white',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
              }}
            >
              {isCollapsed ? <MenuOpen /> : <Menu />}
            </IconButton>
          </Tooltip>
        </Box>
        
        {!isCollapsed ? (
          <Box sx={{ mt: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
              MyStudy
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Sistema de Gestión
            </Typography>
          </Box>
        ) : (
          <Box sx={{ mt: 5 }}>
            <DashboardIcon sx={{ fontSize: '2rem' }} />
          </Box>
        )}
      </Box>

      {/* Navigation Menu */}
      <List sx={{ px: isCollapsed ? 0.5 : 2, flexGrow: 1 }}>
        {menuItems.map((item) => (
          <Tooltip key={item.text} title={isCollapsed ? item.text : ""} placement="right">
            <ListItem 
              component={Link}
              to={item.path}
              sx={{ 
                mb: 1, 
                borderRadius: 2,
                color: 'white',
                textDecoration: 'none',
                bgcolor: isActive(item.path) ? 'rgba(255,255,255,0.1)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                px: isCollapsed ? 1 : 2
              }}
            >
              <ListItemIcon sx={{ 
                color: 'white', 
                minWidth: isCollapsed ? 'auto' : 40,
                justifyContent: 'center'
              }}>
                {item.icon}
              </ListItemIcon>
              {!isCollapsed && <ListItemText primary={item.text} />}
            </ListItem>
          </Tooltip>
        ))}
      </List>

      {/* User Info */}
      <Box sx={{ p: isCollapsed ? 1 : 3, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
        {/* Logout Button */}
        <Tooltip title={isCollapsed ? "Cerrar Sesión" : ""} placement="right">
          <ListItem 
            onClick={handleLogout}
            sx={{ 
              mb: isCollapsed ? 1 : 2,
              borderRadius: 2,
              cursor: 'pointer',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              px: isCollapsed ? 1 : 2
            }}
          >
            <ListItemIcon sx={{ 
              color: 'white', 
              minWidth: isCollapsed ? 'auto' : 40,
              justifyContent: 'center'
            }}>
              <Logout />
            </ListItemIcon>
            {!isCollapsed && <ListItemText primary="Cerrar Sesión" />}
          </ListItem>
        </Tooltip>

        {/* User Profile */}
        {!isCollapsed && (
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
                {user?.nom_usu1} {user?.ape_usu1}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {user?.rol}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default UserSidebar;