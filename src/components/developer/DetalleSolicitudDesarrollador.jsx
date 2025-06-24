import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  IconButton,
  Tooltip,

  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Avatar,
  Stack,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import {
  ArrowBack,
  PlayArrow,
  Pause,
  Done,
  GitHub,
  Comment,
  Schedule,
  Person,
  Business,
  Flag,
  BugReport,
  Assignment,
  Save,
  Send,
  ExpandMore,
  CheckCircle,
  RadioButtonUnchecked,
  Engineering,
  AdminPanelSettings,
  Chat,
  History,
  Visibility,
  Edit,
  Cancel
} from '@mui/icons-material';
import desarrolladorService from '../../services/desarrolladorService';

const DetalleSolicitudDesarrollador = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [solicitud, setSolicitud] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comentarioDialog, setComentarioDialog] = useState(false);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [procesando, setProcesando] = useState(false);
  




  useEffect(() => {
    cargarSolicitud();
  }, [id]);

  const cargarSolicitud = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await desarrolladorService.obtenerSolicitudEspecifica(id);
      setSolicitud(response.data);
      
    } catch (error) {
      console.error('Error cargando solicitud:', error);
      setError('Error al cargar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  // Funciones específicas para cada acción
  const handleIniciarDesarrollo = async () => {
    try {
      setProcesando(true);
      await desarrolladorService.iniciarDesarrollo(id);
      await cargarSolicitud();
    } catch (error) {
      console.error('Error iniciando desarrollo:', error);
      setError('Error al iniciar el desarrollo');
    } finally {
      setProcesando(false);
    }
  };

  const handlePasarATesting = async () => {
    try {
      setProcesando(true);
      await desarrolladorService.pasarATesting(id);
      await cargarSolicitud();
    } catch (error) {
      console.error('Error pasando a testing:', error);
      setError('Error al pasar a testing');
    } finally {
      setProcesando(false);
    }
  };

  const handlePasarADespliegue = async () => {
    try {
      setProcesando(true);
      await desarrolladorService.pasarADespliegue(id);
      await cargarSolicitud();
    } catch (error) {
      console.error('Error pasando a despliegue:', error);
      setError('Error al pasar a despliegue');
    } finally {
      setProcesando(false);
    }
  };

  const handleCompletarSolicitud = async (exito) => {
    try {
      setProcesando(true);
      await desarrolladorService.completarSolicitud(id, {
        exito_implementacion: exito,
        comentarios_tecnicos_sol: `Solicitud ${exito ? 'completada exitosamente' : 'marcada como fallida'} el ${new Date().toLocaleString('es-ES')}`
      });
      await cargarSolicitud();
    } catch (error) {
      console.error('Error completando solicitud:', error);
      setError('Error al completar la solicitud');
    } finally {
      setProcesando(false);
    }
  };

  const handleReportarBug = async () => {
    try {
      setProcesando(true);
      await desarrolladorService.actualizarEstado(id, 'EN_DESARROLLO', 'Bug reportado - regresando a desarrollo');
      await cargarSolicitud();
    } catch (error) {
      console.error('Error reportando bug:', error);
      setError('Error al reportar bug');
    } finally {
      setProcesando(false);
    }
  };

  const handleVerGitHub = () => {
    if (solicitud.github_repo_url) {
      window.open(solicitud.github_repo_url, '_blank');
    } else {
      alert('No hay repositorio asociado a esta solicitud aún.');
    }
  };

  const handleAgregarComentario = async () => {
    if (!nuevoComentario.trim()) return;

    try {
      setProcesando(true);
      await desarrolladorService.agregarComentario(id, nuevoComentario);
      setNuevoComentario('');
      setComentarioDialog(false);
      await cargarSolicitud();
    } catch (error) {
      console.error('Error agregando comentario:', error);
      setError('Error al agregar comentario');
    } finally {
      setProcesando(false);
    }
  };



  const getEstadoColor = (estado) => {
    const colores = {
      'APROBADA': 'success',
      'EN_DESARROLLO': 'primary',
      'PLANES_PENDIENTES_APROBACION': 'warning',
      'LISTO_PARA_IMPLEMENTAR': 'success',
      'EN_TESTING': 'info',
      'EN_PAUSA': 'default',
      'COMPLETADA': 'success'
    };
    return colores[estado] || 'default';
  };

  const getPrioridadColor = (prioridad) => {
    const colores = {
      'BAJA': 'default',
      'MEDIA': 'primary',
      'ALTA': 'warning',
      'CRITICA': 'error',
      'URGENTE': 'error'
    };
    return colores[prioridad] || 'default';
  };

  const getProgresoSegunEstado = (estado) => {
    const progreso = {
      'APROBADA': 20,
      'EN_DESARROLLO': 40,
      'LISTO_PARA_IMPLEMENTAR': 60,
      'EN_TESTING': 80,
      'EN_DESPLIEGUE': 90,
      'COMPLETADA': 100,
      'EN_PAUSA': 25
    };
    return progreso[estado] || 0;
  };

  const getTimelineData = () => {
    const timeline = [];
    
    // Creación
    timeline.push({
      fecha: solicitud.fec_creacion_sol,
      titulo: 'Solicitud Creada',
      descripcion: `Creada por ${solicitud.solicitante}`,
      tipo: 'creacion',
      icono: <Assignment />,
      color: 'primary'
    });

    // Aprobación
    if (solicitud.fec_respuesta_sol) {
      timeline.push({
        fecha: solicitud.fec_respuesta_sol,
        titulo: 'Solicitud Aprobada',
        descripcion: 'Aprobada por el administrador',
        tipo: 'aprobacion',
        icono: <CheckCircle />,
        color: 'success'
      });
    }

    // Asignación a desarrollador
    if (solicitud.desarrollador_asignado) {
      timeline.push({
        fecha: solicitud.fec_respuesta_sol, // Usar la misma fecha por ahora
        titulo: 'Asignada a Desarrollador',
        descripcion: `Asignada a ${solicitud.desarrollador_asignado}`,
        tipo: 'asignacion',
        icono: <Engineering />,
        color: 'info'
      });
    }

    // Envío de planes
    if (solicitud.fecha_envio_planes) {
      timeline.push({
        fecha: solicitud.fecha_envio_planes,
        titulo: 'Planes Enviados a Revisión',
        descripcion: 'Planes técnicos enviados al MASTER',
        tipo: 'planes_enviados',
        icono: <Send />,
        color: 'warning'
      });
    }

    // Aprobación de planes
    if (solicitud.fecha_aprobacion_planes) {
      timeline.push({
        fecha: solicitud.fecha_aprobacion_planes,
        titulo: solicitud.planes_aprobados ? 'Planes Aprobados' : 'Planes Rechazados',
        descripcion: solicitud.comentarios_aprobacion_planes || 'Sin comentarios',
        tipo: 'planes_aprobados',
        icono: solicitud.planes_aprobados ? <CheckCircle /> : <Cancel />,
        color: solicitud.planes_aprobados ? 'success' : 'error'
      });
    }

    return timeline.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'No especificada';
    return new Date(fecha).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSteps = () => {
    return [
      {
        label: 'Solicitud Creada',
        completed: true,
        active: false
      },
      {
        label: 'Aprobada por Admin',
        completed: !!solicitud.fec_respuesta_sol,
        active: false
      },
      {
        label: 'En Desarrollo',
        completed: ['EN_DESARROLLO', 'PLANES_PENDIENTES_APROBACION', 'LISTO_PARA_IMPLEMENTAR', 'EN_TESTING', 'COMPLETADA'].includes(solicitud.estado_sol),
        active: solicitud.estado_sol === 'EN_DESARROLLO'
      },
      {
        label: 'Planes en Revisión',
        completed: ['LISTO_PARA_IMPLEMENTAR', 'EN_TESTING', 'COMPLETADA'].includes(solicitud.estado_sol),
        active: solicitud.estado_sol === 'PLANES_PENDIENTES_APROBACION'
      },
      {
        label: 'Listo para Implementar',
        completed: ['EN_TESTING', 'COMPLETADA'].includes(solicitud.estado_sol),
        active: solicitud.estado_sol === 'LISTO_PARA_IMPLEMENTAR'
      },
      {
        label: 'En Testing',
        completed: solicitud.estado_sol === 'COMPLETADA',
        active: solicitud.estado_sol === 'EN_TESTING'
      },
      {
        label: 'Completada',
        completed: solicitud.estado_sol === 'COMPLETADA',
        active: false
      }
    ];
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !solicitud) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {error || 'Solicitud no encontrada'}
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/developer/solicitudes')}
          sx={{ mt: 2 }}
        >
          Volver
        </Button>
      </Box>
    );
  }

  const timelineData = getTimelineData();
  const steps = getSteps();

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/developer/solicitudes')}>
          <ArrowBack />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
            {solicitud.titulo_sol}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            ID: {solicitud.id_sol}
          </Typography>
        </Box>
        <Chip
          label={solicitud.estado_sol.replace(/_/g, ' ')}
          color={getEstadoColor(solicitud.estado_sol)}
          size="large"
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Columna Principal */}
        <Grid item xs={12} lg={8}>
          {/* Progreso Visual */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Schedule />
                Progreso del Desarrollo
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <LinearProgress
                  variant="determinate"
                  value={getProgresoSegunEstado(solicitud.estado_sol)}
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {getProgresoSegunEstado(solicitud.estado_sol)}% completado
                </Typography>
              </Box>

              {/* Stepper Horizontal */}
              <Stepper activeStep={steps.findIndex(step => step.active)} alternativeLabel>
                {steps.map((step) => (
                  <Step key={step.label} completed={step.completed}>
                    <StepLabel>{step.label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>

          {/* Información de la Solicitud */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Assignment />
                Detalles de la Solicitud
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Solicitante:</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{solicitud.solicitante}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Prioridad:</Typography>
                  <Chip 
                    label={solicitud.prioridad_sol} 
                    color={getPrioridadColor(solicitud.prioridad_sol)}
                    size="small"
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Tipo de Cambio:</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{solicitud.tipo_cambio_sol}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Fecha de Creación:</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{formatearFecha(solicitud.fec_creacion_sol)}</Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="body2" color="text.secondary">Descripción:</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>{solicitud.descripcion_sol}</Typography>

              <Typography variant="body2" color="text.secondary">Justificación:</Typography>
              <Typography variant="body1">{solicitud.justificacion_sol}</Typography>
            </CardContent>
          </Card>

          {/* Comentarios y Comunicación */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chat />
                  Comunicación
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Comment />}
                  onClick={() => setComentarioDialog(true)}
                  disabled={procesando}
                >
                  Agregar Comentario
                </Button>
              </Box>

              {/* Comentarios del Admin */}
              {solicitud.comentarios_admin_sol && (
                <Paper sx={{ p: 2, mb: 2, bgcolor: '#f3e5f5' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Avatar sx={{ bgcolor: '#7b1fa2', width: 24, height: 24 }}>
                      <AdminPanelSettings sx={{ fontSize: 16 }} />
                    </Avatar>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      Administrador
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatearFecha(solicitud.fec_respuesta_sol)}
                    </Typography>
                  </Box>
                  <Typography variant="body2">
                    {solicitud.comentarios_admin_sol}
                  </Typography>
                </Paper>
              )}

              {/* Comentarios de aprobación de planes */}
              {solicitud.comentarios_aprobacion_planes && (
                <Paper sx={{ p: 2, mb: 2, bgcolor: solicitud.planes_aprobados ? '#e8f5e8' : '#ffebee' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Avatar sx={{ bgcolor: solicitud.planes_aprobados ? '#4caf50' : '#f44336', width: 24, height: 24 }}>
                      <AdminPanelSettings sx={{ fontSize: 16 }} />
                    </Avatar>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      MASTER - Revisión de Planes
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatearFecha(solicitud.fecha_aprobacion_planes)}
                    </Typography>
                  </Box>
                  <Typography variant="body2">
                    {solicitud.comentarios_aprobacion_planes}
                  </Typography>
                </Paper>
              )}

              {/* Comentarios de desarrollo */}
              {solicitud.comentarios_desarrollo_sol && (
                <Paper sx={{ p: 2, mb: 2, bgcolor: '#e3f2fd' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Avatar sx={{ bgcolor: '#1976d2', width: 24, height: 24 }}>
                      <Engineering sx={{ fontSize: 16 }} />
                    </Avatar>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      Desarrollador
                    </Typography>
                  </Box>
                  <Typography variant="body2">
                    {solicitud.comentarios_desarrollo_sol}
                  </Typography>
                </Paper>
              )}

              {(!solicitud.comentarios_admin_sol && !solicitud.comentarios_desarrollo_sol && !solicitud.comentarios_aprobacion_planes) && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No hay comentarios aún
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Planes Técnicos */}
          {(['EN_DESARROLLO', 'LISTO_PARA_IMPLEMENTAR', 'EN_TESTING', 'EN_DESPLIEGUE', 'COMPLETADA'].includes(solicitud.estado_sol)) && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Assignment />
                  Planes Técnicos (Definidos por MASTER)
                </Typography>

                <Alert severity="info" sx={{ mb: 3 }}>
                  Estos planes técnicos fueron definidos por el MASTER durante la aprobación de la solicitud.
                </Alert>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#1976d2' }}>
                      📋 Plan de Implementación:
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: '#f8f9fa', minHeight: 120, border: '1px solid #e0e0e0' }}>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {solicitud.plan_implementacion_sol || 'No especificado por el MASTER'}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#2e7d32' }}>
                      🚀 Plan de Roll-out:
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: '#f8f9fa', minHeight: 120, border: '1px solid #e0e0e0' }}>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {solicitud.plan_rollout_sol || 'No especificado por el MASTER'}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#d32f2f' }}>
                      🔄 Plan de Back-out:
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: '#f8f9fa', minHeight: 120, border: '1px solid #e0e0e0' }}>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {solicitud.plan_backout_sol || 'No especificado por el MASTER'}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#ed6c02' }}>
                      🧪 Plan de Testing:
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: '#f8f9fa', minHeight: 120, border: '1px solid #e0e0e0' }}>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {solicitud.plan_testing_sol || 'No especificado por el MASTER'}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Acciones según Estado */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Acciones Disponibles
              </Typography>
              
              <Stack spacing={2}>
                {/* Estado: EN_DESARROLLO */}
                {solicitud.estado_sol === 'EN_DESARROLLO' && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      La solicitud está asignada para desarrollo. Sigue los planes técnicos definidos por el MASTER.
                    </Typography>
                    <Stack direction="row" spacing={2} flexWrap="wrap">
                      <Button
                        variant="contained"
                        startIcon={<BugReport />}
                        onClick={handlePasarATesting}
                        disabled={procesando}
                        sx={{ bgcolor: '#ff9800', '&:hover': { bgcolor: '#f57c00' } }}
                      >
                        Pasar a Testing
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<GitHub />}
                        onClick={handleVerGitHub}
                        disabled={procesando || !solicitud.github_repo_url}
                      >
                        Ver en GitHub
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Comment />}
                        onClick={() => setComentarioDialog(true)}
                        disabled={procesando}
                      >
                        Agregar Comentario
                      </Button>
                    </Stack>
                  </Box>
                )}

                {/* Estado: LISTO_PARA_IMPLEMENTAR */}
                {solicitud.estado_sol === 'LISTO_PARA_IMPLEMENTAR' && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Los planes han sido definidos. Puedes continuar con la implementación.
                    </Typography>
                    <Stack direction="row" spacing={2} flexWrap="wrap">
                      <Button
                        variant="contained"
                        startIcon={<PlayArrow />}
                        onClick={handleIniciarDesarrollo}
                        disabled={procesando}
                        sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#388e3c' } }}
                      >
                        Continuar Implementación
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<GitHub />}
                        onClick={handleVerGitHub}
                        disabled={procesando || !solicitud.github_repo_url}
                      >
                        Ver en GitHub
                      </Button>
                    </Stack>
                  </Box>
                )}

                {/* Estado: EN_TESTING */}
                {solicitud.estado_sol === 'EN_TESTING' && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      En fase de testing. Puedes pasar a despliegue o reportar bugs.
                    </Typography>
                    <Stack direction="row" spacing={2} flexWrap="wrap">
                      <Button
                        variant="contained"
                        startIcon={<Assignment />}
                        onClick={handlePasarADespliegue}
                        disabled={procesando}
                        sx={{ bgcolor: '#9c27b0', '&:hover': { bgcolor: '#7b1fa2' } }}
                      >
                        Pasar a Despliegue
                      </Button>
                      <Button
                        variant="outlined"
                        color="warning"
                        startIcon={<BugReport />}
                        onClick={() => handleReportarBug()}
                        disabled={procesando}
                      >
                        Reportar Bug
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Comment />}
                        onClick={() => setComentarioDialog(true)}
                        disabled={procesando}
                      >
                        Agregar Comentario
                      </Button>
                    </Stack>
                  </Box>
                )}

                {/* Estado: EN_DESPLIEGUE */}
                {solicitud.estado_sol === 'EN_DESPLIEGUE' && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      En fase de despliegue. Puedes completar la solicitud o marcarla como fallida.
                    </Typography>
                    <Stack direction="row" spacing={2} flexWrap="wrap">
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircle />}
                        onClick={() => handleCompletarSolicitud(true)}
                        disabled={procesando}
                      >
                        Completar Exitosamente
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<Cancel />}
                        onClick={() => handleCompletarSolicitud(false)}
                        disabled={procesando}
                      >
                        Marcar como Fallida
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Comment />}
                        onClick={() => setComentarioDialog(true)}
                        disabled={procesando}
                      >
                        Agregar Comentario
                      </Button>
                    </Stack>
                  </Box>
                )}

                {/* Estados finales */}
                {(solicitud.estado_sol === 'COMPLETADA' || solicitud.estado_sol === 'FALLIDA') && (
                  <Box>
                    <Alert severity={solicitud.estado_sol === 'COMPLETADA' ? 'success' : 'error'} sx={{ mb: 2 }}>
                      Solicitud {solicitud.estado_sol === 'COMPLETADA' ? 'completada exitosamente' : 'marcada como fallida'}.
                    </Alert>
                    <Button
                      variant="outlined"
                      startIcon={<Visibility />}
                      onClick={() => {/* Ver resumen final */}}
                      disabled={procesando}
                    >
                      Ver Resumen Final
                    </Button>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar Derecho */}
        <Grid item xs={12} lg={4}>
          {/* Timeline */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <History />
                Historial
              </Typography>
              
                                            <Box sx={{ position: 'relative' }}>
                 {timelineData.map((item, index) => (
                   <Box key={item.tipo} sx={{ display: 'flex', mb: 3, position: 'relative' }}>
                     {/* Línea vertical */}
                     {index < timelineData.length - 1 && (
                       <Box
                         sx={{
                           position: 'absolute',
                           left: 20,
                           top: 40,
                           width: 2,
                           height: 40,
                           bgcolor: '#e0e0e0'
                         }}
                       />
                     )}
                     
                     {/* Icono */}
                     <Avatar
                       sx={{
                         bgcolor: item.color === 'success' ? '#4caf50' : 
                                  item.color === 'error' ? '#f44336' :
                                  item.color === 'warning' ? '#ff9800' :
                                  item.color === 'info' ? '#2196f3' : '#1976d2',
                         width: 40,
                         height: 40,
                         mr: 2
                       }}
                     >
                       {item.icono}
                     </Avatar>
                     
                     {/* Contenido */}
                     <Box sx={{ flex: 1 }}>
                       <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                         {item.titulo}
                       </Typography>
                       <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                         {item.descripcion}
                       </Typography>
                       <Typography variant="caption" color="text.secondary">
                         {formatearFecha(item.fecha)}
                       </Typography>
                     </Box>
                   </Box>
                 ))}
               </Box>
            </CardContent>
          </Card>

          {/* Información Adicional */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Información Adicional
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Estado:</Typography>
                <Chip 
                  label={solicitud.estado_sol.replace(/_/g, ' ')} 
                  color={getEstadoColor(solicitud.estado_sol)}
                  sx={{ mt: 0.5 }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Desarrollador Asignado:</Typography>
                <Typography variant="body1">{solicitud.desarrollador_asignado || 'No asignado'}</Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Última Actualización:</Typography>
                <Typography variant="body1">{formatearFecha(solicitud.fec_ultima_actualizacion)}</Typography>
              </Box>

              {solicitud.urgencia_sol && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Urgencia:</Typography>
                  <Typography variant="body1">{solicitud.urgencia_sol}</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog para Agregar Comentario */}
      <Dialog open={comentarioDialog} onClose={() => setComentarioDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Agregar Comentario de Desarrollo</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Comentario"
            value={nuevoComentario}
            onChange={(e) => setNuevoComentario(e.target.value)}
            placeholder="Describe el progreso, problemas encontrados, etc..."
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setComentarioDialog(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleAgregarComentario}
            variant="contained"
            disabled={!nuevoComentario.trim() || procesando}
          >
            Agregar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DetalleSolicitudDesarrollador; 