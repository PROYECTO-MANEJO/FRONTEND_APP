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

  Paper,
  Avatar,
  Stack,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
} from '@mui/material';
import {
  ArrowBack,
  Assignment,
  Person,
  Business,
  Flag,
  Comment,
  Engineering,
  AdminPanelSettings,
  CheckCircle,
  Cancel,
  Send,
  Edit,
  Save,
  Schedule,
  History,
  Chat,
  Visibility,
  GitHub,
  PriorityHigh,
  Done,
  CallMerge,
  CheckCircleOutline,
  Error
} from '@mui/icons-material';
// Timeline components - usando alternativa si @mui/lab no está disponible
import solicitudesService from '../../services/solicitudesService';
import { actualizarSolicitudMaster } from '../../services/solicitudesAdminService';

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const DetalleSolicitudAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [solicitud, setSolicitud] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  // Estados para diálogos
  const [comentarioDialog, setComentarioDialog] = useState(false);
  const [respuestaDialog, setRespuestaDialog] = useState(false);
  const [asignacionDialog, setAsignacionDialog] = useState(false);
  
  // Estados para formularios
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [respuestaForm, setRespuestaForm] = useState({
    estado_sol: '',
    prioridad_sol: '',
    comentarios_admin_sol: '',
    comentarios_internos_sol: ''
  });
  const [desarrolladores, setDesarrolladores] = useState([]);
  const [desarrolladorSeleccionado, setDesarrolladorSeleccionado] = useState('');

  useEffect(() => {
    cargarSolicitud();
  }, [id]);

  const cargarSolicitud = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await solicitudesService.obtenerSolicitudAdmin(id);
      setSolicitud(response.data);
      
      // Inicializar formulario de respuesta
      setRespuestaForm({
        estado_sol: response.data.estado_sol,
        prioridad_sol: response.data.prioridad_sol,
        comentarios_admin_sol: response.data.comentarios_admin_sol || '',
        comentarios_internos_sol: response.data.comentarios_internos_sol || ''
      });
      
    } catch (error) {
      console.error('Error cargando solicitud:', error);
      setError('Error al cargar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const cargarDesarrolladores = async () => {
    try {
      const response = await solicitudesService.obtenerDesarrolladoresDisponibles();
      setDesarrolladores(response.data);
    } catch (error) {
      console.error('Error cargando desarrolladores:', error);
      setError('Error al cargar desarrolladores');
    }
  };

  const handleAgregarComentario = async () => {
    if (!nuevoComentario.trim()) return;

    try {
      setProcesando(true);
      await solicitudesService.agregarComentarioAdmin(id, nuevoComentario);
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

  const handleRespuestaSubmit = async () => {
    try {
      setProcesando(true);
      await solicitudesService.responderSolicitud(id, respuestaForm);
      setRespuestaDialog(false);
      await cargarSolicitud();
    } catch (error) {
      console.error('Error enviando respuesta:', error);
      setError('Error al enviar respuesta');
    } finally {
      setProcesando(false);
    }
  };

  const handleAsignarDesarrollador = async () => {
    if (!desarrolladorSeleccionado) return;

    try {
      setProcesando(true);
      console.log('Asignando desarrollador:', desarrolladorSeleccionado, 'a solicitud:', id);
      await solicitudesService.asignarDesarrollador(id, desarrolladorSeleccionado);
      setAsignacionDialog(false);
      await cargarSolicitud();
    } catch (error) {
      console.error('Error asignando desarrollador:', error);
      setError('Error al asignar desarrollador');
    } finally {
      setProcesando(false);
    }
  };

  const handleCambiarEstado = async (nuevoEstado) => {
    try {
      setProcesando(true);
      await solicitudesService.actualizarEstadoSolicitud(id, nuevoEstado);
      await cargarSolicitud();
    } catch (error) {
      console.error('Error cambiando estado:', error);
      setError('Error al cambiar el estado');
    } finally {
      setProcesando(false);
    }
  };

  const getEstadoColor = (estado) => {
    const colores = {
      'BORRADOR': 'default',
      'PENDIENTE': 'warning',
      'APROBADA': 'success',
      'RECHAZADA': 'error',
      'EN_DESARROLLO': 'primary',
      'PLANES_PENDIENTES_APROBACION': 'warning',
      'LISTO_PARA_IMPLEMENTAR': 'success',
      'EN_TESTING': 'info',
      'EN_PAUSA': 'default',
      'COMPLETADA': 'success',
      'CANCELADA': 'error'
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
      'BORRADOR': 0,
      'PENDIENTE': 15,
      'APROBADA': 30,
      'EN_DESARROLLO': 50,
      'LISTO_PARA_IMPLEMENTAR': 70,
      'EN_TESTING': 85,
      'COMPLETADA': 100,
      'RECHAZADA': 0,
      'CANCELADA': 0,
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

    // Respuesta del admin
    if (solicitud.fec_respuesta_sol) {
      timeline.push({
        fecha: solicitud.fec_respuesta_sol,
        titulo: solicitud.estado_sol === 'APROBADA' ? 'Solicitud Aprobada' : 'Solicitud Respondida',
        descripcion: solicitud.comentarios_admin_sol || 'Sin comentarios',
        tipo: 'respuesta_admin',
        icono: solicitud.estado_sol === 'APROBADA' ? <CheckCircle /> : <AdminPanelSettings />,
        color: solicitud.estado_sol === 'APROBADA' ? 'success' : 'warning'
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
        descripcion: 'Planes técnicos enviados por el desarrollador',
        tipo: 'planes_enviados',
        icono: <Send />,
        color: 'warning'
      });
    }

    // Aprobación/Rechazo de planes
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
        label: 'Pendiente de Revisión',
        completed: !!solicitud.fec_respuesta_sol,
        active: solicitud.estado_sol === 'PENDIENTE'
      },
      {
        label: 'Aprobada',
        completed: ['APROBADA', 'EN_DESARROLLO', 'LISTO_PARA_IMPLEMENTAR', 'EN_TESTING', 'COMPLETADA'].includes(solicitud.estado_sol),
        active: solicitud.estado_sol === 'APROBADA'
      },
      {
        label: 'En Desarrollo',
        completed: ['EN_DESARROLLO', 'LISTO_PARA_IMPLEMENTAR', 'EN_TESTING', 'COMPLETADA'].includes(solicitud.estado_sol),
        active: solicitud.estado_sol === 'EN_DESARROLLO'
      },
      {
        label: 'Lista para Implementar',
        completed: ['LISTO_PARA_IMPLEMENTAR', 'EN_TESTING', 'COMPLETADA'].includes(solicitud.estado_sol),
        active: solicitud.estado_sol === 'LISTO_PARA_IMPLEMENTAR'
      },
      {
        label: 'En Testing',
        completed: ['EN_TESTING', 'COMPLETADA'].includes(solicitud.estado_sol),
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
          onClick={() => navigate('/admin/solicitudes')}
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
        <IconButton onClick={() => navigate('/admin/solicitudes')}>
          <ArrowBack />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
            {solicitud.titulo_sol}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            ID: {solicitud.id_sol} • Solicitante: {solicitud.solicitante}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Chip
            label={solicitud.prioridad_sol}
            color={getPrioridadColor(solicitud.prioridad_sol)}
            size="small"
          />
          <Chip
            label={solicitud.estado_sol.replace(/_/g, ' ')}
            color={getEstadoColor(solicitud.estado_sol)}
            size="large"
          />
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Información General" />
          <Tab label="Comunicación" />
          <Tab label="Planes Técnicos" />
          <Tab label="Historial" />
        </Tabs>
      </Card>

      {/* Tab Content */}
      <CustomTabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          {/* Columna Principal */}
          <Grid item xs={12} lg={8}>
            {/* Progreso Visual */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Schedule />
                  Progreso de la Solicitud
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
                    <Typography variant="body2" color="text.secondary">Tipo de Cambio:</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>{solicitud.tipo_cambio_sol}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Fecha de Creación:</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>{formatearFecha(solicitud.fec_creacion_sol)}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Fecha Límite Deseada:</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {solicitud.fecha_limite_deseada ? formatearFecha(solicitud.fecha_limite_deseada) : 'No especificada'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Desarrollador Asignado:</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {solicitud.desarrollador_asignado || 'No asignado'}
                    </Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Typography variant="body2" color="text.secondary">Descripción:</Typography>
                <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                  {solicitud.descripcion_sol}
                </Typography>

                <Typography variant="body2" color="text.secondary">Justificación:</Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {solicitud.justificacion_sol}
                </Typography>
              </CardContent>
            </Card>

            {/* Acciones Administrativas */}
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Acciones Administrativas
                </Typography>
                
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  {solicitud.estado_sol === 'PENDIENTE' && (
                    <>
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircle />}
                        onClick={() => setRespuestaDialog(true)}
                        disabled={procesando}
                      >
                        Aprobar/Responder
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<Cancel />}
                        onClick={() => handleCambiarEstado('RECHAZADA')}
                        disabled={procesando}
                      >
                        Rechazar
                      </Button>
                    </>
                  )}

                  {solicitud.estado_sol === 'APROBADA' && !solicitud.desarrollador_asignado && (
                    <Button
                      variant="contained"
                      startIcon={<Engineering />}
                      onClick={() => {
                        cargarDesarrolladores();
                        setAsignacionDialog(true);
                      }}
                      disabled={procesando}
                    >
                      Asignar Desarrollador
                    </Button>
                  )}

                  {/* BOTÓN TEMPORAL PARA PRUEBAS - Simular estado EN_TESTING */}
                  {(solicitud.estado_sol === 'EN_DESARROLLO' || solicitud.estado_sol === 'APROBADA') && (
                    <Button
                      variant="contained"
                      color="warning"
                      onClick={async () => {
                        try {
                          setProcesando(true);
                          await actualizarSolicitudMaster(solicitud.id_sol, {
                            estado_sol: 'EN_TESTING',
                            github_pr_number: 123,
                            github_pr_url: 'https://github.com/PROYECTO-MANEJO/FRONTEND_APP/pull/123',
                            github_repo_url: 'https://github.com/PROYECTO-MANEJO/FRONTEND_APP',
                            comentarios_internos_sol: 'Estado EN_TESTING simulado para pruebas - PR ficticio #123'
                          });
                          await cargarSolicitud();
                        } catch (error) {
                          setError('Error al simular estado EN_TESTING: ' + error.message);
                        } finally {
                          setProcesando(false);
                        }
                      }}
                      disabled={procesando}
                      sx={{ 
                        bgcolor: '#ff9800',
                        '&:hover': { bgcolor: '#f57c00' }
                      }}
                    >
                      🧪 SIMULAR EN_TESTING (Prueba)
                    </Button>
                  )}

                  {solicitud.estado_sol === 'EN_TESTING' && solicitud.github_pr_number && (
                    <></>
                  )}

                  <Button
                    variant="outlined"
                    startIcon={<Comment />}
                    onClick={() => setComentarioDialog(true)}
                    disabled={procesando}
                  >
                    Agregar Comentario
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={() => setRespuestaDialog(true)}
                    disabled={procesando}
                  >
                    Editar Solicitud
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Sidebar Derecho */}
          <Grid item xs={12} lg={4}>
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
                  <Typography variant="body2" color="text.secondary">Última Actualización:</Typography>
                  <Typography variant="body1">{formatearFecha(solicitud.fec_ultima_actualizacion)}</Typography>
                </Box>

                {solicitud.urgencia_sol && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Urgencia:</Typography>
                    <Typography variant="body1">{solicitud.urgencia_sol}</Typography>
                  </Box>
                )}

                {solicitud.github_repo_url && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Repositorio GitHub:</Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<GitHub />}
                      onClick={() => window.open(solicitud.github_repo_url, '_blank')}
                    >
                      Ver Repositorio
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </CustomTabPanel>

      {/* Tab Comunicación */}
      <CustomTabPanel value={activeTab} index={1}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chat />
                Historial de Comunicación
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
              <Paper sx={{ p: 3, mb: 2, bgcolor: '#f3e5f5' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#7b1fa2', width: 32, height: 32 }}>
                    <AdminPanelSettings />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      Administrador
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatearFecha(solicitud.fec_respuesta_sol)}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body1">
                  {solicitud.comentarios_admin_sol}
                </Typography>
              </Paper>
            )}

            {/* Comentarios Internos */}
            {solicitud.comentarios_internos_sol && (
              <Paper sx={{ p: 3, mb: 2, bgcolor: '#fff3e0', border: '1px solid #ffb74d' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#ff9800', width: 32, height: 32 }}>
                    <AdminPanelSettings />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      Comentario Interno - Administrador
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Solo visible para el equipo administrativo
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body1">
                  {solicitud.comentarios_internos_sol}
                </Typography>
              </Paper>
            )}

            {/* Comentarios de aprobación de planes */}
            {solicitud.comentarios_aprobacion_planes && (
              <Paper sx={{ p: 3, mb: 2, bgcolor: solicitud.planes_aprobados ? '#e8f5e8' : '#ffebee' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Avatar sx={{ bgcolor: solicitud.planes_aprobados ? '#4caf50' : '#f44336', width: 32, height: 32 }}>
                    <AdminPanelSettings />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      MASTER - Revisión de Planes Técnicos
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatearFecha(solicitud.fecha_aprobacion_planes)}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body1">
                  {solicitud.comentarios_aprobacion_planes}
                </Typography>
              </Paper>
            )}

            {/* Comentarios de desarrollo */}
            {solicitud.comentarios_desarrollo_sol && (
              <Paper sx={{ p: 3, mb: 2, bgcolor: '#e3f2fd' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#1976d2', width: 32, height: 32 }}>
                    <Engineering />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      Desarrollador
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {solicitud.desarrollador_asignado}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body1">
                  {solicitud.comentarios_desarrollo_sol}
                </Typography>
              </Paper>
            )}

            {(!solicitud.comentarios_admin_sol && !solicitud.comentarios_desarrollo_sol && !solicitud.comentarios_aprobacion_planes && !solicitud.comentarios_internos_sol) && (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No hay comentarios aún
              </Typography>
            )}
          </CardContent>
        </Card>
      </CustomTabPanel>

      {/* Tab Planes Técnicos */}
      <CustomTabPanel value={activeTab} index={2}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Assignment />
              Planes Técnicos del Desarrollador
            </Typography>

            {/* Verificar si existen planes técnicos */}
            {(solicitud.plan_implementacion_sol || solicitud.plan_rollout_sol || solicitud.plan_backout_sol || solicitud.plan_testing_sol) ? (
              <>
                {/* Estado de los planes */}
                {solicitud.estado_sol === 'PLANES_PENDIENTES_APROBACION' && (
                  <Alert severity="warning" sx={{ mb: 3 }}>
                    <strong>Planes pendientes de aprobación</strong> - El desarrollador ha enviado los planes técnicos para revisión.
                    {solicitud.fecha_envio_planes && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Enviados el {formatearFecha(solicitud.fecha_envio_planes)}
                      </Typography>
                    )}
                  </Alert>
                )}

                {solicitud.planes_aprobados === true && (
                  <Alert severity="success" sx={{ mb: 3 }}>
                    <strong>Planes aprobados</strong> - Los planes técnicos han sido revisados y aprobados.
                    {solicitud.fecha_aprobacion_planes && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Aprobados el {formatearFecha(solicitud.fecha_aprobacion_planes)}
                      </Typography>
                    )}
                  </Alert>
                )}

                {solicitud.planes_aprobados === false && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    <strong>Planes rechazados</strong> - Los planes técnicos requieren revisión.
                    {solicitud.fecha_aprobacion_planes && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Revisados el {formatearFecha(solicitud.fecha_aprobacion_planes)}
                      </Typography>
                    )}
                  </Alert>
                )}

                {/* Planes técnicos */}
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#1976d2' }}>
                      📋 Plan de Implementación:
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: '#f8f9fa', minHeight: 120, border: '1px solid #e0e0e0' }}>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {solicitud.plan_implementacion_sol || 'No especificado'}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#2e7d32' }}>
                      🚀 Plan de Roll-out:
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: '#f8f9fa', minHeight: 120, border: '1px solid #e0e0e0' }}>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {solicitud.plan_rollout_sol || 'No especificado'}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#d32f2f' }}>
                      🔄 Plan de Back-out:
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: '#f8f9fa', minHeight: 120, border: '1px solid #e0e0e0' }}>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {solicitud.plan_backout_sol || 'No especificado'}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#ed6c02' }}>
                      🧪 Plan de Testing:
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: '#f8f9fa', minHeight: 120, border: '1px solid #e0e0e0' }}>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {solicitud.plan_testing_sol || 'No especificado'}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>



                {/* Comentarios de aprobación existentes */}
                {solicitud.comentarios_aprobacion_planes && (
                  <Paper sx={{ 
                    mt: 3, 
                    p: 3, 
                    bgcolor: solicitud.planes_aprobados ? '#e8f5e8' : '#ffebee',
                    border: `1px solid ${solicitud.planes_aprobados ? '#4caf50' : '#f44336'}`
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Avatar sx={{ 
                        bgcolor: solicitud.planes_aprobados ? '#4caf50' : '#f44336', 
                        width: 32, 
                        height: 32 
                      }}>
                        <AdminPanelSettings />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          MASTER - {solicitud.planes_aprobados ? 'Planes Aprobados' : 'Planes Rechazados'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatearFecha(solicitud.fecha_aprobacion_planes)}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {solicitud.comentarios_aprobacion_planes}
                    </Typography>
                  </Paper>
                )}
              </>
            ) : (
              <Alert severity="info" sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  No hay planes técnicos disponibles
                </Typography>
                <Typography variant="body2">
                  Los planes técnicos aparecerán aquí cuando el desarrollador los haya creado y enviado para revisión.
                </Typography>
              </Alert>
            )}
          </CardContent>
        </Card>
      </CustomTabPanel>

      {/* Tab Historial */}
      <CustomTabPanel value={activeTab} index={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <History />
              Timeline de la Solicitud
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
      </CustomTabPanel>

      {/* Dialog para Agregar Comentario */}
      <Dialog open={comentarioDialog} onClose={() => setComentarioDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Agregar Comentario Administrativo</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Comentario"
            value={nuevoComentario}
            onChange={(e) => setNuevoComentario(e.target.value)}
            placeholder="Agregar comentario visible para el solicitante..."
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

      {/* Dialog para Respuesta/Edición */}
      <Dialog open={respuestaDialog} onClose={() => setRespuestaDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Responder Solicitud</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={respuestaForm.estado_sol}
                  onChange={(e) => setRespuestaForm({...respuestaForm, estado_sol: e.target.value})}
                >
                  <MenuItem value="APROBADA">Aprobar</MenuItem>
                  <MenuItem value="RECHAZADA">Rechazar</MenuItem>
                  <MenuItem value="PENDIENTE">Mantener Pendiente</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Prioridad</InputLabel>
                <Select
                  value={respuestaForm.prioridad_sol}
                  onChange={(e) => setRespuestaForm({...respuestaForm, prioridad_sol: e.target.value})}
                >
                  <MenuItem value="BAJA">Baja</MenuItem>
                  <MenuItem value="MEDIA">Media</MenuItem>
                  <MenuItem value="ALTA">Alta</MenuItem>
                  <MenuItem value="CRITICA">Crítica</MenuItem>
                  <MenuItem value="URGENTE">Urgente</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Comentario Público"
                value={respuestaForm.comentarios_admin_sol}
                onChange={(e) => setRespuestaForm({...respuestaForm, comentarios_admin_sol: e.target.value})}
                placeholder="Comentario visible para el solicitante..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Comentario Interno"
                value={respuestaForm.comentarios_internos_sol}
                onChange={(e) => setRespuestaForm({...respuestaForm, comentarios_internos_sol: e.target.value})}
                placeholder="Comentario interno solo para el equipo administrativo..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRespuestaDialog(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleRespuestaSubmit}
            variant="contained"
            disabled={!respuestaForm.estado_sol || procesando}
          >
            Enviar Respuesta
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para Asignación de Desarrollador */}
      <Dialog open={asignacionDialog} onClose={() => setAsignacionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Asignar Desarrollador</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Desarrollador</InputLabel>
            <Select
              value={desarrolladorSeleccionado}
              onChange={(e) => setDesarrolladorSeleccionado(e.target.value)}
            >
              {desarrolladores.map((dev) => (
                <MenuItem key={dev.id_usu} value={dev.id_usu}>
                  {dev.nom_usu} {dev.ape_usu} - {dev.email_usu}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAsignacionDialog(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleAsignarDesarrollador}
            variant="contained"
            disabled={!desarrolladorSeleccionado || procesando}
          >
            Asignar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DetalleSolicitudAdmin; 