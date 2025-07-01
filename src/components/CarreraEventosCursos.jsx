import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Chip,
  useTheme,
  Skeleton,
  Alert
} from '@mui/material';
import { EventAvailable, School, Public, Groups } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import paginaPrincipalService from '../services/paginaPrincipalService';

const CarreraEventosCursos = () => {
  const theme = useTheme();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({ eventos: [], cursos: [], carrera: null });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Usuario actual:', user);
        console.log('Está autenticado:', isAuthenticated);
        
        let response;
        
        if (!isAuthenticated) {
          // Usuario no autenticado - mostrar todos los eventos/cursos
          console.log('Obteniendo eventos y cursos públicos (no autenticado)...');
          response = await paginaPrincipalService.getEventosCursosPublicos();
        } else if (user?.rol === 'ESTUDIANTE') {
          // Estudiante - mostrar por carrera + públicos
          console.log('Obteniendo eventos y cursos por carrera (estudiante)...');
          response = await paginaPrincipalService.getEventosCursosCarrera();
        } else if (user?.rol === 'USUARIO') {
          // Usuario externo - solo públicos
          console.log('Obteniendo eventos y cursos disponibles (usuario externo)...');
          response = await paginaPrincipalService.getEventosCursosDisponibles();
        } else {
          // Otros roles (ADMIN, MASTER, DESARROLLADOR) - no mostrar nada
          console.log('Rol no permitido para esta sección:', user?.rol);
          setLoading(false);
          return;
        }
        
        console.log('Respuesta del servidor:', response);
        setData(response);
        
      } catch (error) {
        console.error('Error detallado:', error);
        setError('No se pudieron cargar los eventos y cursos. Por favor, intenta más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, isAuthenticated]);

  // No mostrar para roles administrativos
  if (isAuthenticated && !['ESTUDIANTE', 'USUARIO'].includes(user?.rol)) {
    return null;
  }

  if (loading) {
    return (
      <Box sx={{ py: 8, backgroundColor: theme.palette.grey[50] }}>
        <Container maxWidth="lg">
          <Skeleton variant="text" height={60} sx={{ mb: 4 }} />
          <Grid container spacing={4}>
            {[1, 2, 3, 4].map((item) => (
              <Grid item xs={12} sm={6} md={3} key={item}>
                <Card>
                  <Skeleton variant="rectangular" height={140} />
                  <CardContent>
                    <Skeleton variant="text" height={32} />
                    <Skeleton variant="text" height={20} />
                    <Skeleton variant="text" height={20} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 8, backgroundColor: theme.palette.grey[50] }}>
        <Container maxWidth="lg">
          <Alert severity="error">{error}</Alert>
        </Container>
      </Box>
    );
  }

  // Función para obtener el título según el tipo de usuario
  const getTitulo = () => {
    if (!isAuthenticated) {
      return 'Eventos y Cursos Disponibles';
    } else if (user?.rol === 'ESTUDIANTE') {
      return data.carrera ? `Eventos y Cursos para ${data.carrera}` : 'Eventos y Cursos de tu Carrera';
    } else if (user?.rol === 'USUARIO') {
      return 'Eventos y Cursos Abiertos al Público';
    }
    return 'Eventos y Cursos';
  };

  // Función para obtener el ícono del tipo de audiencia
  const getAudienciaIcon = (tipoAudiencia) => {
    switch (tipoAudiencia) {
      case 'PUBLICO_GENERAL':
        return <Public fontSize="small" />;
      case 'TODAS_CARRERAS':
        return <Groups fontSize="small" />;
      case 'CARRERA_ESPECIFICA':
        return <School fontSize="small" />;
      default:
        return null;
    }
  };

  // Función para obtener el texto del tipo de audiencia
  const getAudienciaTexto = (tipoAudiencia) => {
    switch (tipoAudiencia) {
      case 'PUBLICO_GENERAL':
        return 'Público General';
      case 'TODAS_CARRERAS':
        return 'Todas las Carreras';
      case 'CARRERA_ESPECIFICA':
        return 'Carrera Específica';
      default:
        return 'Sin especificar';
    }
  };

  return (
    <Box sx={{ py: 8, backgroundColor: theme.palette.grey[50] }}>
      <Container maxWidth="lg">
        <Typography
          variant="h3"
          component="h2"
          sx={{
            textAlign: 'center',
            mb: 2,
            fontWeight: 'bold',
            color: theme.palette.primary.main
          }}
        >
          {getTitulo()}
        </Typography>
        
        {/* Eventos */}
        {data.eventos.length > 0 && (
          <>
            <Typography
              variant="h5"
              sx={{
                mt: 6,
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: theme.palette.secondary.main
              }}
            >
              <EventAvailable /> Próximos Eventos
            </Typography>
            <Grid container spacing={4}>
              {data.eventos.map((evento) => (
                <Grid item xs={12} sm={6} md={4} key={evento.id_eve}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)'
                      }
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="140"
                      image="https://source.unsplash.com/400x200/?conference,event"
                      alt={evento.nom_eve}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h6" component="h3">
                        {evento.nom_eve}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {evento.des_eve}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip 
                          label={evento.es_gratuito ? 'Gratuito' : `$${evento.precio}`}
                          color={evento.es_gratuito ? 'success' : 'primary'}
                          size="small"
                        />
                        <Chip 
                          icon={getAudienciaIcon(evento.tipo_audiencia_eve)}
                          label={getAudienciaTexto(evento.tipo_audiencia_eve)}
                          variant="outlined"
                          size="small"
                        />
                        {evento.categoria && (
                          <Chip 
                            label={evento.categoria.nom_cat}
                            variant="outlined"
                            size="small"
                            color="secondary"
                          />
                        )}
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button size="small" color="primary">
                        Ver Detalles
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}

        {/* Cursos */}
        {data.cursos.length > 0 && (
          <>
            <Typography
              variant="h5"
              sx={{
                mt: 6,
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: theme.palette.secondary.main
              }}
            >
              <School /> Cursos Disponibles
            </Typography>
            <Grid container spacing={4}>
              {data.cursos.map((curso) => (
                <Grid item xs={12} sm={6} md={4} key={curso.id_cur}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)'
                      }
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="140"
                      image="https://source.unsplash.com/400x200/?course,education"
                      alt={curso.nom_cur}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h6" component="h3">
                        {curso.nom_cur}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {curso.des_cur}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip 
                          label={curso.es_gratuito ? 'Gratuito' : `$${curso.precio}`}
                          color={curso.es_gratuito ? 'success' : 'primary'}
                          size="small"
                        />
                        <Chip 
                          icon={getAudienciaIcon(curso.tipo_audiencia_cur)}
                          label={getAudienciaTexto(curso.tipo_audiencia_cur)}
                          variant="outlined"
                          size="small"
                        />
                        {curso.categoria && (
                          <Chip 
                            label={curso.categoria.nom_cat}
                            variant="outlined"
                            size="small"
                            color="secondary"
                          />
                        )}
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button size="small" color="primary">
                        Ver Detalles
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}

        {/* Mensaje cuando no hay datos */}
        {data.eventos.length === 0 && data.cursos.length === 0 && (
          <Alert severity="info" sx={{ mt: 4 }}>
            {!isAuthenticated 
              ? "No hay eventos ni cursos disponibles en este momento."
              : user?.rol === 'ESTUDIANTE'
              ? "No hay eventos ni cursos disponibles para tu carrera en este momento."
              : "No hay eventos ni cursos abiertos al público en este momento."
            }
          </Alert>
        )}
      </Container>
    </Box>
  );
};

export default CarreraEventosCursos; 