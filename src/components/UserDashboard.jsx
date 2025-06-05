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
import { Link } from 'react-router-dom';
import { eventoService } from '../services/eventoService';
import { cursoService } from '../services/cursoService';
import CursoCard from './CursoCard';
import EventoCard from './EventoCard';

const UserDashboard = ({ user }) => {
  const [eventos, setEventos] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          bgcolor: '#5855D6', 
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
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
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
                  <Button variant="text" size="small">
                    Ver todos
                  </Button>
                </Box>
                <Grid container spacing={2}>
                  {cursos.slice(0, 2).map((curso) => (
                    <Grid item xs={12} key={curso.id_cur}>
                      <CursoCard curso={curso} />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Grid>

            {/* Right Column - Progress & Tasks */}
            <Grid item xs={12} md={6}>
              {/* Progress Card */}
              <Paper sx={{ p: 3, mb: 3, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  Progreso de Aprendizaje
                </Typography>
                <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                  <CircularProgress
                    variant="determinate"
                    value={75}
                    size={120}
                    thickness={4}
                    sx={{ color: '#5855D6' }}
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="h6" component="div" color="text.secondary">
                      75%
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Total completado: 3 de 4 cursos
                </Typography>
              </Paper>

              {/* Stats Cards */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                      {eventos.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Eventos
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="secondary" sx={{ fontWeight: 'bold' }}>
                      {cursos.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Cursos
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

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
                      '&:hover': { bgcolor: 'rgba(88, 85, 214, 0.04)' }
                    }}
                  >
                    <ListItemIcon>
                      <RequestPage color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Ver Solicitudes" />
                  </ListItem>
                  <ListItem 
                    sx={{ 
                      borderRadius: 1,
                      '&:hover': { bgcolor: 'rgba(88, 85, 214, 0.04)' }
                    }}
                  >
                    <ListItemIcon>
                      <School color="secondary" />
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