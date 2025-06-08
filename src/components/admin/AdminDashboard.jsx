import React, { useEffect, useState, useContext } from 'react';
import {
  Typography,
  Box,
  Grid,
  CircularProgress,
  Paper,
  Container,
  Card,
  CardContent,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar
} from '@mui/material';
import { 
  People,
  Event,
  School,
  RequestPage,
  BarChart,
  TrendingUp,
  CheckCircle,
  AdminPanelSettings,
  Assignment,
  Notifications,
  Person,
  EventNote
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { AuthContext } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalCourses: 0,
    pendingRequests: 0
  });

  useEffect(() => {
    // Simular carga de estadísticas
    setTimeout(() => {
      setStats({
        totalUsers: 156,
        totalEvents: 23,
        totalCourses: 12,
        pendingRequests: 8
      });
      setLoading(false);
    }, 1000);
  }, []);

  const quickActions = [
    {
      title: 'Gestionar Usuarios',
      description: 'Administrar cuentas de usuario',
      icon: <People />,
      path: '/admin/usuarios',
      color: '#6d1313'
    },
    {
      title: 'Gestionar Eventos',
      description: 'Crear y administrar eventos',
      icon: <Event />,
      path: '/admin/eventos',
      color: '#6d1313'
    },
    {
      title: 'Crear Cursos',
      description: 'Administrar cursos disponibles',
      icon: <School />,
      path: '/admin/cursos',
      color: '#6d1313'
    },
    {
      title: 'Ver Solicitudes',
      description: 'Revisar solicitudes pendientes',
      icon: <RequestPage />,
      path: '/admin/solicitudes',
      color: '#6d1313'
    },
    {
      title: 'Reportes',
      description: 'Generar reportes del sistema',
      icon: <TrendingUp />,
      path: '/admin/reportes',
      color: '#6d1313'
    },
    {
      title: 'Configuración',
      description: 'Configurar el sistema',
      icon: <Assignment />,
      path: '/admin/configuracion',
      color: '#6d1313'
    }
  ];

  const recentActivities = [
    { id: 1, type: 'user', message: 'Nuevo usuario registrado: Juan Pérez', time: '2 min ago' },
    { id: 2, type: 'event', message: 'Evento "Conferencia Tech" creado', time: '15 min ago' },
    { id: 3, type: 'request', message: 'Nueva solicitud de cambio recibida', time: '1 hora ago' },
    { id: 4, type: 'course', message: 'Curso "React Avanzado" actualizado', time: '2 horas ago' }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user': return <Person />;
      case 'event': return <EventNote />;
      case 'request': return <RequestPage />;
      case 'course': return <School />;
      default: return <Notifications />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'user': return '#6d1313';
      case 'event': return '#6d1313';
      case 'request': return '#6d1313';
      case 'course': return '#6d1313';
      default: return '#6d1313';
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <AdminSidebar />
      
      <Box sx={{ flexGrow: 1, p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box 
      sx={{
              background: 'linear-gradient(135deg, #6d1313 0%, #8b1a1a 100%)',
              borderRadius: 3,
              p: 4,
              color: 'white',
              mb: 3
      }}
    >
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              ¡Bienvenido, {user?.nombre}!
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Panel de Administración - Sistema de Gestión
            </Typography>
          </Box>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#6d1313', mr: 2 }}>
                    <People />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#6d1313' }}>
                      {loading ? <CircularProgress size={24} /> : stats.totalUsers}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Usuarios
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#6d1313', mr: 2 }}>
                    <Event />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#6d1313' }}>
                      {loading ? <CircularProgress size={24} /> : stats.totalEvents}
                    </Typography>
            <Typography variant="body2" color="text.secondary">
                      Eventos Activos
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#6d1313', mr: 2 }}>
                    <School />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#6d1313' }}>
                      {loading ? <CircularProgress size={24} /> : stats.totalCourses}
            </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Cursos Disponibles
            </Typography>
          </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#6d1313', mr: 2 }}>
                    <Assignment />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#6d1313' }}>
                      {loading ? <CircularProgress size={24} /> : stats.pendingRequests}
                    </Typography>
            <Typography variant="body2" color="text.secondary">
                      Solicitudes Pendientes
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Card sx={{ borderRadius: 3, boxShadow: 3, mb: 4 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', color: '#6d1313' }}>
              Acciones Rápidas
            </Typography>
            <Grid container spacing={2}>
              {quickActions.map((action, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card 
        sx={{
          borderRadius: 2,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': { 
                        transform: 'translateY(-4px)',
                        boxShadow: 6
                      }
                    }}
                    onClick={() => navigate(action.path)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ bgcolor: action.color, mr: 2 }}>
                          {action.icon}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {action.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {action.description}
                          </Typography>
                        </Box>
    </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', color: '#6d1313' }}>
              Actividad Reciente
      </Typography>
            <List>
              {recentActivities.map((activity) => (
                <ListItem key={activity.id} sx={{ borderRadius: 2, mb: 1 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: getActivityColor(activity.type) }}>
                      {getActivityIcon(activity.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={activity.message}
                    secondary={activity.time}
                  />
                  <Chip 
                    label={activity.type.toUpperCase()} 
                    size="small" 
                    sx={{ bgcolor: '#6d1313', color: 'white' }}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Box>
    </Box>
);
};

export default AdminDashboard;