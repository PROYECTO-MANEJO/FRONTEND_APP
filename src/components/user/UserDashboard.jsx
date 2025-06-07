import React, { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  Grid,
  CircularProgress,
  Paper,
  Container,
  Button
} from '@mui/material';
import { 
  ArrowForward,
  Event,
  School
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { eventoService } from '../../services/eventoService';
import { cursoService } from '../../services/cursoService';
import CursoCard from '../shared/CursoCard';
import EventoCard from '../shared/EventoCard';
import UserSidebar from './UserSidebar';

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
      <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f5f5f5' }}>
        <UserSidebar />
        <Box sx={{ flexGrow: 1, p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography color="error" variant="h6">{error}</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f5f5f5' }}>
      <UserSidebar />

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <Container maxWidth="xl" sx={{ py: 4, px: 3 }}>
          {/* Welcome Header mejorado */}
          <Box sx={{ mb: 6, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {new Date().getHours() < 12 ? 'Buenos días' : new Date().getHours() < 18 ? 'Buenas tardes' : 'Buenas noches'}
            </Typography>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 700, 
                mb: 1,
                background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                fontSize: { xs: '2rem', md: '3rem' }
              }}
            >
              ¡Bienvenido, {user?.nombre}!
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              {new Date().toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
              <CircularProgress size={60} sx={{ color: '#b91c1c' }} />
            </Box>
          ) : (
            <Grid container spacing={4}>
              {/* Sección de Eventos */}
              <Grid item xs={12}>
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mb: 3,
                    flexWrap: 'wrap',
                    gap: 2
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Event sx={{ color: '#b91c1c', fontSize: '2rem' }} />
                      <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        Últimos Eventos
                      </Typography>
                    </Box>
                    <Button
                      component={Link}
                      to="/eventos"
                      variant="outlined"
                      endIcon={<ArrowForward />}
                      sx={{
                        borderColor: '#b91c1c',
                        color: '#b91c1c',
                        '&:hover': {
                          borderColor: '#991b1b',
                          backgroundColor: '#fef2f2',
                        },
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3
                      }}
                    >
                      Ver Todos
                    </Button>
                  </Box>
                  
                  {eventos.length === 0 ? (
                    <Paper 
                      elevation={2}
                      sx={{ 
                        p: 4, 
                        textAlign: 'center',
                        borderRadius: 3,
                        bgcolor: '#fafafa'
                      }}
                    >
                      <Event sx={{ fontSize: '3rem', color: '#cbd5e1', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No hay eventos disponibles
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Actualmente no hay eventos programados
                      </Typography>
                    </Paper>
                  ) : (
                    <Grid 
                      container 
                      spacing={{ xs: 2, sm: 3, md: 4 }}
                    >
                      {eventos.slice(0, 6).map((evento) => (
                        <Grid 
                          item 
                          xs={12} 
                          sm={6} 
                          md={4} 
                          lg={4}
                          key={evento.id_eve}
                          sx={{ height: '280px' }} // ALTURA FIJA IGUAL
                        >
                          <EventoCard evento={evento} />
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Box>
              </Grid>

              {/* Sección de Cursos */}
              <Grid item xs={12}>
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mb: 3,
                    flexWrap: 'wrap',
                    gap: 2
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <School sx={{ color: '#b91c1c', fontSize: '2rem' }} />
                      <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        Cursos Disponibles
                      </Typography>
                    </Box>
                    <Button
                      component={Link}
                      to="/cursos"
                      variant="outlined"
                      endIcon={<ArrowForward />}
                      sx={{
                        borderColor: '#b91c1c',
                        color: '#b91c1c',
                        '&:hover': {
                          borderColor: '#991b1b',
                          backgroundColor: '#fef2f2',
                        },
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3
                      }}
                    >
                      Ver Todos
                    </Button>
                  </Box>
                  
                  {cursos.length === 0 ? (
                    <Paper 
                      elevation={2}
                      sx={{ 
                        p: 4, 
                        textAlign: 'center',
                        borderRadius: 3,
                        bgcolor: '#fafafa'
                      }}
                    >
                      <School sx={{ fontSize: '3rem', color: '#cbd5e1', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No hay cursos disponibles
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Actualmente no hay cursos programados
                      </Typography>
                    </Paper>
                  ) : (
                    <Grid 
                      container 
                      spacing={{ xs: 2, sm: 3, md: 4 }}
                    >
                      {cursos.slice(0, 6).map((curso) => (
                        <Grid 
                          item 
                          xs={12} 
                          sm={1} 
                          md={4} 
                          lg={4}
                          key={curso.id_cur || curso.id}
                          sx={{ height: '280px' }} // ALTURA FIJA IGUAL
                        >
                          <CursoCard curso={curso} />
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Box>
              </Grid>
            </Grid>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default UserDashboard;