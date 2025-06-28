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
  Cancel,
  Warning,
  Close,
  Info,
  Key
} from '@mui/icons-material';
import desarrolladorService from '../../services/desarrolladorService';
import GitHubSection from './GitHubSection';
import Snackbar from '@mui/material/Snackbar';

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
      'ESPERANDO_APROBACION': 'warning',
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
      'ESPERANDO_APROBACION': 70,
      'LISTO_PARA_IMPLEMENTAR': 60,
      'EN_TESTING': 80,
      'EN_DESPLIEGUE': 90,
      'COMPLETADA': 100,
      'EN_PAUSA': 25
    };
    return progreso[estado] || 0;
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'No especificada';
    return new Date(fecha).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!solicitud) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">No se encontró la solicitud</Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/developer/solicitudes')}
          sx={{ mt: 2 }}
        >
          Volver
        </Button>
      </Box>
    );
  }

  const steps = getSteps();

  return (
    <Box sx={{ p: 3 }}>
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

      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Contenido Principal */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
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

          {/* Comunicación y Acciones */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Chat />
                Comunicación y Acciones
                </Typography>

              {/* Botón para agregar comentario */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Comment />}
                  onClick={() => setComentarioDialog(true)}
                  disabled={procesando}
                >
                  Agregar Comentario
                </Button>
              </Box>

              {/* Historial de Comunicación */}
              {solicitud.comentarios_tecnicos_sol && (
                <Paper sx={{ p: 2, mb: 2, bgcolor: '#f8f9fa' }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Engineering />
                    Comentarios del Desarrollador:
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {solicitud.comentarios_tecnicos_sol}
                  </Typography>
                </Paper>
              )}

              {/* Diálogo para agregar comentario */}
              <Dialog 
                open={comentarioDialog} 
                onClose={() => setComentarioDialog(false)}
                fullWidth
                maxWidth="md"
              >
                <DialogTitle>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Comment />
                    Agregar Comentario Técnico
                  </Box>
                </DialogTitle>
                <DialogContent>
                  <TextField
                    autoFocus
                    multiline
                    rows={4}
                    fullWidth
                    variant="outlined"
                    placeholder="Escribe tu comentario técnico aquí..."
                    value={nuevoComentario}
                    onChange={(e) => setNuevoComentario(e.target.value)}
                    sx={{ mt: 2 }}
                  />
                </DialogContent>
                <DialogActions>
                  <Button 
                    onClick={() => setComentarioDialog(false)} 
                    disabled={procesando}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleAgregarComentario}
                    variant="contained" 
                    disabled={procesando || !nuevoComentario.trim()}
                  >
                    {procesando ? 'Guardando...' : 'Guardar Comentario'}
                  </Button>
                </DialogActions>
              </Dialog>

              {/* Estado: EN_DESARROLLO con comentarios internos */}
              {solicitud.estado_sol === 'EN_DESARROLLO' && solicitud.comentarios_internos_sol && (
                <Paper sx={{ p: 2, mb: 3, bgcolor: '#fff8e1', border: '1px solid #ffcc02' }}>
                  {/* Encabezado del mensaje */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Avatar sx={{ bgcolor: '#f57c00', width: 32, height: 32 }}>
                      <AdminPanelSettings />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#f57c00' }}>
                          MASTER - Comentarios Técnicos
                    </Typography>
                        <Chip 
                          label="Solo para Desarrollador" 
                          size="small" 
                          sx={{ 
                            bgcolor: '#f57c00', 
                            color: 'white',
                            fontSize: '0.7rem',
                            height: '20px'
                          }} 
                        />
                      </Box>
                    <Typography variant="caption" color="text.secondary">
                        {formatearFecha(solicitud.fec_ultima_actualizacion)}
                    </Typography>
                  </Box>
                  </Box>

                  {/* Mensaje principal */}
                  <Alert 
                    severity="warning" 
                    sx={{ 
                      mb: 2,
                      '& .MuiAlert-message': {
                        width: '100%'
                      }
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Warning fontSize="small" />
                      El MASTER ha rechazado el Pull Request anterior
                  </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Por favor revisa los comentarios técnicos y realiza las correcciones necesarias:
                    </Typography>
                    <Typography variant="body2" sx={{ fontStyle: 'italic', pl: 2, borderLeft: '2px solid #f57c00' }}>
                      {solicitud.comentarios_internos_sol}
                    </Typography>
                  </Alert>

                  {/* Acciones */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<Send />}
                      onClick={async () => {
                        try {
                          setProcesando(true);
                          await desarrolladorService.pasarATesting(solicitud.id_sol, 
                            'Cambios solicitados por el MASTER implementados. PR listo para nueva revisión.'
                          );
                          await cargarSolicitud();
                        } catch (error) {
                          console.error('Error enviando a testing:', error);
                          setError('Error al enviar a testing: ' + error.message);
                        } finally {
                          setProcesando(false);
                        }
                      }}
                      disabled={procesando}
                      sx={{ 
                        bgcolor: '#2196f3', 
                        '&:hover': { bgcolor: '#1976d2' }
                      }}
                    >
                      Enviar a Nueva Revisión
                    </Button>
                  </Box>
                </Paper>
              )}

              {/* Estado: EN_DESARROLLO sin comentarios internos */}
              {solicitud.estado_sol === 'EN_DESARROLLO' && !solicitud.comentarios_internos_sol && (
                <Alert severity="info" sx={{ mb: 3 }}>
                  La solicitud está en desarrollo. Crea un Pull Request para que pase automáticamente a revisión del MASTER.
                  Sigue los planes técnicos definidos por el MASTER.
                </Alert>
              )}

              {/* Estado: EN_TESTING */}
              {solicitud.estado_sol === 'EN_TESTING' && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                  El Pull Request está siendo revisado por el MASTER. Espera la aprobación o feedback.
                </Alert>
              )}

              {/* Estado: ESPERANDO_APROBACION */}
              {solicitud.estado_sol === 'ESPERANDO_APROBACION' && (
                <Alert severity="info" sx={{ mb: 3 }}>
                  Tu desarrollo está listo y esperando aprobación del MASTER. El PR será revisado pronto.
                </Alert>
              )}

              {/* Comentarios del Admin */}
              {solicitud.comentarios_admin_sol && !solicitud.comentarios_internos_sol && (
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

              {(!solicitud.comentarios_admin_sol && !solicitud.comentarios_desarrollo_sol && !solicitud.comentarios_internos_sol) && (
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
            </Box>

        {/* Sidebar */}
        <Box sx={{ width: '300px', flexShrink: 0 }}>
          {/* Historial */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <History />
                Historial
              </Typography>
              
                                            <Box sx={{ position: 'relative' }}>
                {[
                  {
                    titulo: 'Solicitud Creada',
                    descripcion: `Creada por ${solicitud.solicitante}`,
                    fecha: solicitud.fec_creacion_sol,
                    icono: <Assignment />,
                    color: 'primary'
                  },
                  solicitud.fec_respuesta_sol && {
                    titulo: 'Solicitud Aprobada',
                    descripcion: 'Aprobada por el administrador',
                    fecha: solicitud.fec_respuesta_sol,
                    icono: <CheckCircle />,
                    color: 'success'
                  },
                  solicitud.desarrollador_asignado && {
                    titulo: 'Asignada a Desarrollador',
                    descripcion: `Asignada a ${solicitud.desarrollador_asignado}`,
                    fecha: solicitud.fec_respuesta_sol,
                    icono: <Engineering />,
                    color: 'info'
                  }
                ].filter(Boolean).map((item, index, array) => (
                  <Box key={item.titulo} sx={{ display: 'flex', mb: index < array.length - 1 ? 3 : 0, position: 'relative' }}>
                     {/* Línea vertical */}
                    {index < array.length - 1 && (
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
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Info />
                Información Adicional
              </Typography>
              
              <Stack spacing={2}>
                <Box>
                <Typography variant="body2" color="text.secondary">Estado:</Typography>
                  <Typography variant="body1" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                    {solicitud.estado_sol.replace(/_/g, ' ')}
                  </Typography>
              </Box>

                <Box>
                <Typography variant="body2" color="text.secondary">Desarrollador Asignado:</Typography>
                  <Typography variant="body1">{solicitud.desarrollador_asignado}</Typography>
              </Box>

                <Box>
                <Typography variant="body2" color="text.secondary">Última Actualización:</Typography>
                <Typography variant="body1">{formatearFecha(solicitud.fec_ultima_actualizacion)}</Typography>
              </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">Prioridad:</Typography>
                  <Chip 
                    label={solicitud.prioridad_sol}
                    color={getPrioridadColor(solicitud.prioridad_sol)}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Sección de GitHub */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <GitHub />
                Gestión de GitHub
              </Typography>
              
              <Stack spacing={2}>
                {/* Botones principales */}
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<GitHub />}
                    onClick={handleVerGitHub}
                    disabled={procesando || !solicitud.github_repo_url}
            fullWidth
                  >
                    Ver en GitHub
          </Button>
          <Button 
                    variant="outlined"
                    startIcon={<Key />}
                    onClick={() => {/* Validar Token */}}
                    disabled={procesando}
                    fullWidth
                  >
                    Validar Token
          </Button>
                </Stack>

                {/* Botones de acción */}
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() => {/* Crear Branch */}}
                  disabled={procesando}
                  fullWidth
                >
                  Crear Branch
                </Button>
                <Button
                  variant="outlined"
                  color="success"
                  startIcon={<GitHub />}
                  onClick={() => {/* Crear PR */}}
                  disabled={procesando}
                  fullWidth
                  sx={{ borderColor: '#2da44e', color: '#2da44e', '&:hover': { borderColor: '#2c974b', bgcolor: 'rgba(45, 164, 78, 0.08)' } }}
                >
                  Crear PR
                </Button>

                {/* Información de Branch y PR */}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Branch:
                  </Typography>
                  <Chip 
                    label="feature/c3374_solicitud_1"
                    size="small"
                    sx={{ mt: 0.5, bgcolor: '#fff1f2', color: '#cf222e', borderColor: '#ff818a' }}
                  />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Pull Request:
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<GitHub />}
                    onClick={handleVerGitHub}
                    sx={{ ml: 1 }}
                  >
                    #40
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Snackbar para errores */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        message={error}
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={() => setError(null)}
          >
            <Close fontSize="small" />
          </IconButton>
        }
      />
    </Box>
  );
};

export default DetalleSolicitudDesarrollador; 