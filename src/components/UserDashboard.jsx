import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Box,
  Button,
  Grid,
  CircularProgress,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { 
  Person, 
  CheckCircle, 
  RequestPage, 
  Event, 
  School,
  Dashboard as DashboardIcon,
  Assignment,
  Settings,
  Logout
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { eventoService } from '../services/eventoService';
import { cursoService } from '../services/cursoService';
import CursoCard from './CursoCard';
import EventoCard from './EventoCard';

const UserDashboard = ({ user }) => {
  const [eventos, setEventos] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Limpiar el localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirigir al login
    navigate('/login');
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [eventosData, cursosData] = await Promise.all([
          eventoService.getAll(),
          cursoService.getAll()
        ]);
        setEventos(eventosData);
        setCursos(cursosData);
      } catch (err) {
        setError('Error al cargar los datos');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );   
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Sidebar */}
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
            sx={{ 
              mb: 1, 
              borderRadius: 2, 
              bgcolor: 'rgba(255,255,255,0.1)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
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

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, p: 3, overflow: 'auto' }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Buenos días
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            ¡Bienvenido, {user?.nombre}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {/* Left Column - Events */}
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Últimos Eventos
                </Typography>
                <Grid container spacing={2}>
                  {eventos.length === 0 ? (
                    <Grid item xs={12}>
                      <Paper sx={{ p: 3, textAlign: 'center' }}>
                        <Typography color="text.secondary">
                          No hay eventos disponibles
                        </Typography>
                      </Paper>
                    </Grid>
                  ) : (
                    eventos.slice(0, 4).map((evento) => (
                      <Grid item xs={12} key={evento.id_eve}>
                        <EventoCard evento={evento} />
                      </Grid>
                    ))
                  )}
                </Grid>
              </Box>

              {/* Your Courses Section */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Tus Cursos
                  </Typography>
                  <Button 
                    component={Link}
                    to="/cursos"
                    variant="text" 
                    size="small"
                    sx={{ color: '#6d1313' }}
                  >
                    Ver todos
                  </Button>
                </Box>
                <Grid container spacing={2}>
                  {cursos.length === 0 ? (
                    <Grid item xs={12}>
                      <Paper sx={{ p: 3, textAlign: 'center' }}>
                        <Typography color="text.secondary">
                          No estás inscrito en ningún curso
                        </Typography>
                        <Button 
                          component={Link}
                          to="/cursos"
                          variant="outlined"
                          sx={{ 
                            mt: 2,
                            borderColor: '#6d1313',
                            color: '#6d1313',
                            '&:hover': {
                              bgcolor: 'rgba(109, 19, 19, 0.04)',
                              borderColor: '#6d1313'
                            }
                          }}
                        >
                          Explorar Cursos
                        </Button>
                      </Paper>
                    </Grid>
                  ) : (
                    cursos.slice(0, 2).map((curso) => (
                      <Grid item xs={12} key={curso.id_cur}>
                        <CursoCard curso={curso} />
                      </Grid>
                    ))
                  )}
                </Grid>
              </Box>
            </Grid>

            {/* Right Column - Progress & Tasks */}
            <Grid item xs={12} md={6}>
              {/* Quick Actions */}
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Acciones Rápidas
                </Typography>
                <List dense>
                  <ListItem 
                    component={Link}
                    to="/solicitudes"
                    sx={{ 
                      borderRadius: 1,
                      '&:hover': { bgcolor: 'rgba(109, 19, 19, 0.04)' }
                    }}
                  >
                    <ListItemIcon>
                      <RequestPage sx={{ color: '#6d1313' }} />
                    </ListItemIcon>
                    <ListItemText primary="Ver Solicitudes" />
                  </ListItem>
                  <ListItem 
                    sx={{ 
                      borderRadius: 1,
                      '&:hover': { bgcolor: 'rgba(109, 19, 19, 0.04)' }
                    }}
                  >
                    <ListItemIcon>
                      <School sx={{ color: '#6d1313' }} />
                    </ListItemIcon>
                    <ListItemText primary="Explorar Cursos" />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default UserDashboard;