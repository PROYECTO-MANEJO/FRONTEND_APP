import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  useTheme,
  Skeleton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  IconButton,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  EventAvailable, 
  School, 
  Public, 
  Groups, 
  Close,
  CalendarToday,
  AccessTime,
  LocationOn,
  Person,
  AttachMoney,
  Category,
  DateRange,
  Timer,
  AccountBalance
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import paginaPrincipalService from '../services/paginaPrincipalService';

const CarreraEventosCursos = () => {
  const theme = useTheme();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({ eventos: [], cursos: [], carrera: null });
  
  // Estados para modales
  const [eventoModalOpen, setEventoModalOpen] = useState(false);
  const [cursoModalOpen, setCursoModalOpen] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState(null);
  const [selectedCurso, setSelectedCurso] = useState(null);

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

  // Funciones para abrir modales
  const handleEventoDetalles = (evento) => {
    setSelectedEvento(evento);
    setEventoModalOpen(true);
  };

  const handleCursoDetalles = (curso) => {
    setSelectedCurso(curso);
    setCursoModalOpen(true);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'No especificada';
    return new Date(fecha).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatearHora = (hora) => {
    if (!hora) return 'No especificada';
    // La hora puede venir como un objeto Date o como un string en formato ISO
    try {
      if (typeof hora === 'string' && hora.includes('T')) {
        // Es un string ISO completo
        return new Date(hora).toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit'
        });
      } else if (hora instanceof Date) {
        // Es un objeto Date
        return hora.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit'
        });
      } else {
        // Es solo la parte de la hora (como viene del backend)
        return hora;
      }
    } catch (error) {
      console.error("Error al formatear hora:", error);
      return hora || 'No especificada';
    }
  };

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
                  <CardContent>
                    <Skeleton variant="text" height={32} />
                    <Skeleton variant="text" height={20} />
                    <Skeleton variant="text" height={20} />
                    <Skeleton variant="text" height={40} />
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
                        transform: 'translateY(-4px)',
                        boxShadow: theme.shadows[8]
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Typography gutterBottom variant="h6" component="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
                        {evento.nom_eve}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 2, minHeight: 60 }}>
                        {evento.des_eve.length > 100 ? `${evento.des_eve.substring(0, 100)}...` : evento.des_eve}
                      </Typography>

                      {/* Información clave del evento */}
                      <Stack spacing={1} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarToday fontSize="small" color="primary" />
                          <Typography variant="body2">
                            {formatearFecha(evento.fec_ini_eve)}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccessTime fontSize="small" color="primary" />
                          <Typography variant="body2">
                            {formatearHora(evento.hor_ini_eve)} - {formatearHora(evento.hor_fin_eve)}
                          </Typography>
                        </Box>

                        {evento.ubi_eve && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocationOn fontSize="small" color="primary" />
                            <Typography variant="body2" noWrap>
                              {evento.ubi_eve}
                            </Typography>
                          </Box>
                        )}

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Person fontSize="small" color="primary" />
                          <Typography variant="body2">
                            {evento.inscripciones?.length || 0} / {evento.capacidad_max_eve} cupos
                          </Typography>
                        </Box>
                      </Stack>

                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip 
                          label={evento.es_gratuito ? 'Gratuito' : `$${evento.precio}`}
                          color={evento.es_gratuito ? 'success' : 'primary'}
                          size="small"
                          icon={<AttachMoney fontSize="small" />}
                        />
                        <Chip 
                          icon={getAudienciaIcon(evento.tipo_audiencia_eve)}
                          label={getAudienciaTexto(evento.tipo_audiencia_eve)}
                          variant="outlined"
                          size="small"
                        />
                      </Box>
                    </CardContent>
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button 
                        size="small" 
                        color="primary" 
                        variant="contained"
                        fullWidth
                        onClick={() => handleEventoDetalles(evento)}
                      >
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
                        transform: 'translateY(-4px)',
                        boxShadow: theme.shadows[8]
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Typography gutterBottom variant="h6" component="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
                        {curso.nom_cur}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 2, minHeight: 60 }}>
                        {curso.des_cur.length > 100 ? `${curso.des_cur.substring(0, 100)}...` : curso.des_cur}
                      </Typography>

                      {/* Información clave del curso */}
                      <Stack spacing={1} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <DateRange fontSize="small" color="primary" />
                          <Typography variant="body2">
                            {formatearFecha(curso.fec_ini_cur)} - {formatearFecha(curso.fec_fin_cur)}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Timer fontSize="small" color="primary" />
                          <Typography variant="body2">
                            {curso.dur_cur} horas académicas
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Person fontSize="small" color="primary" />
                          <Typography variant="body2">
                            {curso.inscripcionesCurso?.length || 0} / {curso.capacidad_max_cur} cupos
                          </Typography>
                        </Box>

                        {curso.modalidad_cur && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AccountBalance fontSize="small" color="primary" />
                            <Typography variant="body2">
                              {curso.modalidad_cur}
                            </Typography>
                          </Box>
                        )}
                      </Stack>

                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip 
                          label={curso.es_gratuito ? 'Gratuito' : `$${curso.precio}`}
                          color={curso.es_gratuito ? 'success' : 'primary'}
                          size="small"
                          icon={<AttachMoney fontSize="small" />}
                        />
                        <Chip 
                          icon={getAudienciaIcon(curso.tipo_audiencia_cur)}
                          label={getAudienciaTexto(curso.tipo_audiencia_cur)}
                          variant="outlined"
                          size="small"
                        />
                      </Box>
                    </CardContent>
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button 
                        size="small" 
                        color="primary" 
                        variant="contained"
                        fullWidth
                        onClick={() => handleCursoDetalles(curso)}
                      >
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

      {/* Modal de Detalles del Evento */}
      <Dialog
        open={eventoModalOpen}
        onClose={() => setEventoModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backgroundColor: theme.palette.primary.main,
          color: 'white'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EventAvailable />
            <Typography variant="h6" component="span">
              Detalles del Evento
            </Typography>
          </Box>
          <IconButton 
            onClick={() => setEventoModalOpen(false)}
            sx={{ color: 'white' }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        
        {selectedEvento && (
          <DialogContent sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: theme.palette.primary.main }}>
              {selectedEvento.nom_eve}
            </Typography>
            
            <Typography variant="body1" paragraph sx={{ mb: 3 }}>
              {selectedEvento.des_eve}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 2, color: theme.palette.secondary.main }}>
                  📅 Información del Evento
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Fecha de inicio:</Typography>
                    <Typography variant="body1">{formatearFecha(selectedEvento.fec_ini_eve)}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Fecha de fin:</Typography>
                    <Typography variant="body1">{formatearFecha(selectedEvento.fec_fin_eve)}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Horario:</Typography>
                    <Typography variant="body1">
                      {formatearHora(selectedEvento.hor_ini_eve)} - {formatearHora(selectedEvento.hor_fin_eve)}
                    </Typography>
                  </Box>
                  {selectedEvento.ubi_eve && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Ubicación:</Typography>
                      <Typography variant="body1">{selectedEvento.ubi_eve}</Typography>
                    </Box>
                  )}
                </Stack>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 2, color: theme.palette.secondary.main }}>
                  ℹ️ Detalles Adicionales
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Precio:</Typography>
                    <Typography variant="body1">
                      {selectedEvento.es_gratuito ? 'Gratuito' : `$${selectedEvento.precio}`}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Cupos disponibles:</Typography>
                    <Typography variant="body1">{selectedEvento.inscripciones?.length || 0} / {selectedEvento.capacidad_max_eve} cupos</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Dirigido a:</Typography>
                    {selectedEvento.tipo_audiencia_eve === 'CARRERA_ESPECIFICA' && selectedEvento.eventosPorCarrera?.length > 0 ? (
                      <Box>
                        <Typography variant="body1">Carreras específicas:</Typography>
                        <List dense sx={{ pl: 2 }}>
                          {selectedEvento.eventosPorCarrera.map((item, index) => (
                            <ListItem key={index} sx={{ py: 0 }}>
                              <ListItemIcon sx={{ minWidth: 30 }}>
                                <School fontSize="small" />
                              </ListItemIcon>
                              <ListItemText primary={item.carrera.nom_car} />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    ) : (
                      <Typography variant="body1">{getAudienciaTexto(selectedEvento.tipo_audiencia_eve)}</Typography>
                    )}
                  </Box>
                  {selectedEvento.categoria && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Categoría:</Typography>
                      <Typography variant="body1">{selectedEvento.categoria.nom_cat}</Typography>
                    </Box>
                  )}
                </Stack>
              </Grid>
            </Grid>

            {selectedEvento.objetivos_eve && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" sx={{ mb: 2, color: theme.palette.secondary.main }}>
                  🎯 Objetivos
                </Typography>
                <Typography variant="body1">
                  {selectedEvento.objetivos_eve}
                </Typography>
              </>
            )}

            {selectedEvento.contenido_eve && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" sx={{ mb: 2, color: theme.palette.secondary.main }}>
                  📚 Contenido
                </Typography>
                <Typography variant="body1">
                  {selectedEvento.contenido_eve}
                </Typography>
              </>
            )}
          </DialogContent>
        )}
        
        <DialogActions sx={{ p: 3, backgroundColor: theme.palette.grey[50] }}>
          <Button onClick={() => setEventoModalOpen(false)} variant="outlined">
            Cerrar
          </Button>
          {isAuthenticated && (
            <Button variant="contained" color="primary" disabled>
              Inscribirse (Disponible al iniciar sesión)
            </Button>
          )}
          {!isAuthenticated && (
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => window.location.href = '/login'}
            >
              Iniciar Sesión para Inscribirse
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Modal de Detalles del Curso */}
      <Dialog
        open={cursoModalOpen}
        onClose={() => setCursoModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backgroundColor: theme.palette.primary.main,
          color: 'white'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <School />
            <Typography variant="h6" component="span">
              Detalles del Curso
            </Typography>
          </Box>
          <IconButton 
            onClick={() => setCursoModalOpen(false)}
            sx={{ color: 'white' }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        
        {selectedCurso && (
          <DialogContent sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: theme.palette.primary.main }}>
              {selectedCurso.nom_cur}
            </Typography>
            
            <Typography variant="body1" paragraph sx={{ mb: 3 }}>
              {selectedCurso.des_cur}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 2, color: theme.palette.secondary.main }}>
                  📅 Información del Curso
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Fecha de inicio:</Typography>
                    <Typography variant="body1">{formatearFecha(selectedCurso.fec_ini_cur)}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Fecha de fin:</Typography>
                    <Typography variant="body1">{formatearFecha(selectedCurso.fec_fin_cur)}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Duración:</Typography>
                    <Typography variant="body1">{selectedCurso.dur_cur} horas académicas</Typography>
                  </Box>
                  {selectedCurso.modalidad_cur && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Modalidad:</Typography>
                      <Typography variant="body1">{selectedCurso.modalidad_cur}</Typography>
                    </Box>
                  )}
                </Stack>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 2, color: theme.palette.secondary.main }}>
                  ℹ️ Detalles Adicionales
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Precio:</Typography>
                    <Typography variant="body1">
                      {selectedCurso.es_gratuito ? 'Gratuito' : `$${selectedCurso.precio}`}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Cupos disponibles:</Typography>
                    <Typography variant="body1">{selectedCurso.inscripcionesCurso?.length || 0} / {selectedCurso.capacidad_max_cur} cupos</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Dirigido a:</Typography>
                    {selectedCurso.tipo_audiencia_cur === 'CARRERA_ESPECIFICA' && selectedCurso.cursosPorCarrera?.length > 0 ? (
                      <Box>
                        <Typography variant="body1">Carreras específicas:</Typography>
                        <List dense sx={{ pl: 2 }}>
                          {selectedCurso.cursosPorCarrera.map((item, index) => (
                            <ListItem key={index} sx={{ py: 0 }}>
                              <ListItemIcon sx={{ minWidth: 30 }}>
                                <School fontSize="small" />
                              </ListItemIcon>
                              <ListItemText primary={item.carrera.nom_car} />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    ) : (
                      <Typography variant="body1">{getAudienciaTexto(selectedCurso.tipo_audiencia_cur)}</Typography>
                    )}
                  </Box>
                  {selectedCurso.categoria && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Categoría:</Typography>
                      <Typography variant="body1">{selectedCurso.categoria.nom_cat}</Typography>
                    </Box>
                  )}
                </Stack>
              </Grid>
            </Grid>

            {selectedCurso.objetivos_cur && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" sx={{ mb: 2, color: theme.palette.secondary.main }}>
                  🎯 Objetivos
                </Typography>
                <Typography variant="body1">
                  {selectedCurso.objetivos_cur}
                </Typography>
              </>
            )}

            {selectedCurso.contenido_cur && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" sx={{ mb: 2, color: theme.palette.secondary.main }}>
                  📚 Contenido
                </Typography>
                <Typography variant="body1">
                  {selectedCurso.contenido_cur}
                </Typography>
              </>
            )}

            {selectedCurso.requisitos_cur && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" sx={{ mb: 2, color: theme.palette.secondary.main }}>
                  📋 Requisitos
                </Typography>
                <Typography variant="body1">
                  {selectedCurso.requisitos_cur}
                </Typography>
              </>
            )}
          </DialogContent>
        )}
        
        <DialogActions sx={{ p: 3, backgroundColor: theme.palette.grey[50] }}>
          <Button onClick={() => setCursoModalOpen(false)} variant="outlined">
            Cerrar
          </Button>
          {isAuthenticated && (
            <Button variant="contained" color="primary" disabled>
              Inscribirse (Disponible al iniciar sesión)
            </Button>
          )}
          {!isAuthenticated && (
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => window.location.href = '/login'}
            >
              Iniciar Sesión para Inscribirse
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CarreraEventosCursos; 