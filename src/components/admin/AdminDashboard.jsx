import React, { useEffect, useState } from 'react';
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
  Chip
} from '@mui/material';
import { 
  People,
  Event,
  School,
  RequestPage,
  BarChart,
  TrendingUp,
  CheckCircle,
  AdminPanelSettings
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

const AdminDashboard = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    eventosActivos: 0,
    cursosDisponibles: 0,
    solicitudesPendientes: 0
  });

  useEffect(() => {
    // Simular carga de estadísticas
    const loadStats = async () => {
      try {
        setLoading(true);
        // Aquí irían las llamadas reales a la API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStats({
          totalUsuarios: 1234,
          eventosActivos: 42,
          cursosDisponibles: 18,
          solicitudesPendientes: 7
        });
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const statsCards = [
    {
      title: 'Total Usuarios',
      value: stats.totalUsuarios,
      icon: <People />,
      color: '#3b82f6',
      path: '/admin/usuarios'
    },
    {
      title: 'Eventos Activos',
      value: stats.eventosActivos,
      icon: <Event />,
      color: '#10b981',
      path: '/admin/eventos'
    },
    {
      title: 'Cursos Disponibles',
      value: stats.cursosDisponibles,
      icon: <School />,
      color: '#f59e0b',
      path: '/admin/cursos'
    },
    {
      title: 'Solicitudes Pendientes',
      value: stats.solicitudesPendientes,
      icon: <RequestPage />,
      color: '#ef4444',
      path: '/admin/solicitudes'
    },
  ];

  const quickActions = [
    {
      title: 'Gestionar Usuarios',
      description: 'Ver, crear y administrar usuarios del sistema',
      icon: <People />,
      color: '#3b82f6',
      path: '/admin/usuarios'
    },
    {
      title: 'Crear Evento',
      description: 'Crear y configurar nuevos eventos',
      icon: <Event />,
      color: '#10b981',
      path: '/admin/eventos'
    },
    {
      title: 'Crear Curso',
      description: 'Crear y configurar nuevos cursos',
      icon: <School />,
      color: '#f59e0b',
      path: '/admin/cursos'
    },
    {
      title: 'Ver Solicitudes',
      description: 'Revisar solicitudes de cambio pendientes',
      icon: <RequestPage />,
      color: '#ef4444',
      path: '/admin/solicitudes'
    },
    {
      title: 'Reportes',
      description: 'Ver estadísticas y generar reportes',
      icon: <BarChart />,
      color: '#8b5cf6',
      path: '/admin/reportes'
    },
    {
      title: 'Configuración',
      description: 'Configurar parámetros del sistema',
      icon: <AdminPanelSettings />,
      color: '#6b7280',
      path: '/admin/configuracion'
    }
  ];

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f5f5f5' }}>
      <AdminSidebar />

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <Container maxWidth="xl" sx={{ py: 4, px: 3 }}>
          {/* Welcome Header */}
          <Box sx={{ mb: 6, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {new Date().getHours() < 12 ? 'Buenos días' : new Date().getHours() < 18 ? 'Buenas tardes' : 'Buenas noches'}
            </Typography>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 700, 
                mb: 1,
                background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                fontSize: { xs: '2rem', md: '3rem' }
              }}
            >
              ¡Bienvenido, {user?.nombre}!
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Panel de Administración - {new Date().toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Typography>
            <Chip
              label={user?.rol}
              sx={{
                mt: 2,
                bgcolor: '#f3e8ff',
                color: '#7c3aed',
                fontWeight: 600,
                px: 2
              }}
            />
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
              <CircularProgress size={60} sx={{ color: '#7c3aed' }} />
            </Box>
          ) : (
            <>
              {/* Statistics Cards */}
              <Box sx={{ mb: 6 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
                  Estadísticas del Sistema
                </Typography>
                <Grid container spacing={3}>
                  {statsCards.map((card, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                      <Card
                        component={Link}
                        to={card.path}
                        sx={{
                          textDecoration: 'none',
                          height: '100%',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                          },
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar
                              sx={{
                                bgcolor: card.color,
                                width: 48,
                                height: 48,
                                mr: 2,
                              }}
                            >
                              {card.icon}
                            </Avatar>
                            <Box>
                              <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                {card.value.toLocaleString()}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {card.title}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Quick Actions */}
              <Box sx={{ mb: 6 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
                  Acciones Rápidas
                </Typography>
                <Grid container spacing={3}>
                  {quickActions.map((action, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card
                        component={Link}
                        to={action.path}
                        sx={{
                          textDecoration: 'none',
                          height: '100%',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                          },
                        }}
                      >
                        <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar
                              sx={{
                                bgcolor: action.color,
                                width: 40,
                                height: 40,
                                mr: 2,
                              }}
                            >
                              {action.icon}
                            </Avatar>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                              {action.title}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                            {action.description}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Recent Activity */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
                  Actividad Reciente
                </Typography>
                <Paper 
                  elevation={2}
                  sx={{ 
                    p: 4, 
                    textAlign: 'center',
                    borderRadius: 3,
                    bgcolor: '#fafafa'
                  }}
                >
                  <TrendingUp sx={{ fontSize: '3rem', color: '#cbd5e1', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Panel de actividad en desarrollo
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Próximamente: Registro de actividades recientes del sistema
                  </Typography>
                </Paper>
              </Box>
            </>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default AdminDashboard;