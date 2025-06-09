import React, { useContext, useEffect, useState } from 'react';
import {
  Typography,
  Box,
  Grid,
  CircularProgress,
  Paper,
  Container,
  Button,
  Alert,
  AlertTitle,
  Chip
} from '@mui/material';
import { 
  ArrowForward,
  Event,
  School,
  ListAlt,
  CardMembership,
  Assignment,
  CheckCircle,
  Person,
  Refresh
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { eventoService } from '../../services/eventoService';
import { cursoService } from '../../services/cursoService';
import CursoCard from '../shared/CursoCard';
import EventoCard from '../shared/EventoCard';
import UserSidebar from './UserSidebar';
import { useUserSidebarLayout } from '../../hooks/useUserSidebarLayout';
import { AuthContext } from '../../context/AuthContext';
import { userService } from '../../services/userService';

const UserDashboard = () => {
  const { getMainContentStyle } = useUserSidebarLayout();
  const { user, updateUser } = useContext(AuthContext);
  const [eventos, setEventos] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshingUser, setRefreshingUser] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [eventosData, cursosData] = await Promise.all([
          eventoService.getEventosDisponibles(),
          cursoService.getCursosDisponibles()
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

  // Función para actualizar datos del usuario
  const handleRefreshUserData = async () => {
    try {
      setRefreshingUser(true);
      const userData = await userService.getProfile();
      updateUser(userData);
    } catch (error) {
      console.error('Error refreshing user data:', error);
    } finally {
      setRefreshingUser(false);
    }
  };

  if (error) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
        <UserSidebar />
        <Box sx={{ 
          flexGrow: 1,
          p: 3, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          ...getMainContentStyle()
        }}>
          <Typography color="error" variant="h6">{error}</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <UserSidebar />

      {/* Main Content */}
      <Box sx={{ 
        flexGrow: 1,
        ...getMainContentStyle()
      }}>
        <Container maxWidth="xl" sx={{ py: 4, px: 3 }}>
          {/* Header del dashboard */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 700, 
                mb: 2,
                color: 'text.primary',
                fontSize: { xs: '2rem', md: '3rem' }
              }}
            >
              ¡Bienvenido, {user?.nombre}!
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary"
              sx={{ maxWidth: 600, mx: 'auto' }}
            >
              Descubre nuevos eventos disponibles para ti
            </Typography>
          </Box>

          {/* ✅ ALERTA DE DOCUMENTOS NO VERIFICADOS */}
          {user?.documentos && (
            (() => {
              const isEstudiante = user.rol === 'ESTUDIANTE';
              const documentosCompletos = isEstudiante 
                ? (user.documentos.cedula_subida && user.documentos.matricula_subida)
                : user.documentos.cedula_subida;
              const documentosVerificados = user.documentos.documentos_verificados;
              
              if (!documentosCompletos || !documentosVerificados) {
                return (
                  <Alert 
                    severity="warning" 
                    sx={{ 
                      mb: 4, 
                      borderRadius: 2,
                      '& .MuiAlert-message': { width: '100%' }
                    }}
                  >
                    <AlertTitle sx={{ fontWeight: 700 }}>
                      📄 Verificación de Documentos Requerida
                    </AlertTitle>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        <strong>Para inscribirte en cualquier evento o curso necesitas:</strong>
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                        <Chip 
                          label={`${!user.documentos.cedula_subida ? '❌' : '✅'} Cédula`}
                          size="small"
                          color={user.documentos.cedula_subida ? "success" : "error"}
                          variant="outlined"
                        />
                        {isEstudiante && (
                          <Chip 
                            label={`${!user.documentos.matricula_subida ? '❌' : '✅'} Matrícula`}
                            size="small"
                            color={user.documentos.matricula_subida ? "success" : "error"}
                            variant="outlined"
                          />
                        )}
                        <Chip 
                          label={`${!documentosVerificados ? '❌' : '✅'} Verificación Admin`}
                          size="small"
                          color={documentosVerificados ? "success" : "error"}
                          variant="outlined"
                        />
                      </Box>
                      <Button
                        component={Link}
                        to="/perfil"
                        variant="contained"
                        size="small"
                        sx={{ 
                          textTransform: 'none',
                          fontWeight: 600
                        }}
                      >
                        Gestionar Documentos
                      </Button>
                      <Button
                        onClick={handleRefreshUserData}
                        disabled={refreshingUser}
                        variant="outlined"
                        size="small"
                        startIcon={<Refresh />}
                        sx={{ 
                          textTransform: 'none',
                          fontWeight: 600,
                          ml: 1
                        }}
                      >
                        {refreshingUser ? 'Actualizando...' : 'Actualizar Estado'}
                      </Button>
                    </Box>
                  </Alert>
                );
              }
              return null;
            })()
          )}
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
              <CircularProgress size={60} sx={{ color: '#b91c1c' }} />
            </Box>
          ) : (
            <Grid container spacing={4}>
              {/* Sección de Eventos Disponibles */}
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
                        Eventos Disponibles
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
                        No hay eventos nuevos disponibles
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Ya estás inscrito en todos los eventos disponibles o no hay eventos nuevos programados
                      </Typography>
                    </Paper>
                  ) : (
                    <Grid 
                      container 
                      spacing={{ xs: 2, sm: 3, md: 4 }}
                      justifyContent="flex-start"
                    >
                      {eventos.slice(0, 6).map((evento) => (
                        <Grid 
                          item 
                          xs={12} 
                          sm={6} 
                          md={4} 
                          lg={4}
                          key={evento.id_eve}
                          sx={{ 
                            height: '280px', // ALTURA FIJA IGUAL
                            display: 'flex',
                            justifyContent: 'center'
                          }}
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
                      <School sx={{ color: '#16a34a', fontSize: '2rem' }} />
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
                        borderColor: '#16a34a',
                        color: '#16a34a',
                        '&:hover': {
                          borderColor: '#15803d',
                          backgroundColor: '#f0fdf4',
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
                      justifyContent="flex-start"
                    >
                      {cursos.slice(0, 6).map((curso) => (
                        <Grid 
                          item 
                          xs={12} 
                          sm={6} 
                          md={4} 
                          lg={4}
                          key={curso.id_cur}
                          sx={{ 
                            height: '280px', // ALTURA FIJA IGUAL
                            display: 'flex',
                            justifyContent: 'center'
                          }}
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