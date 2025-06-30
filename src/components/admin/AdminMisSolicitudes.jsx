import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Snackbar
} from '@mui/material';
import {
  Add,
  Edit,
  Visibility,
  Send,
  Delete,
  Schedule,
  CheckCircle,
  Cancel,
  Build,
  Assignment,
  Close,
  Help,
  Description,
  PriorityHigh
} from '@mui/icons-material';
import AdminSidebar from './AdminSidebar';
import { useSidebarLayout } from '../../hooks/useSidebarLayout';
import solicitudesService from '../../services/solicitudesService';

const AdminMisSolicitudes = () => {
  const { getMainContentStyle } = useSidebarLayout();
  const navigate = useNavigate();
  
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogDetalles, setDialogDetalles] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [loadingDetalles, setLoadingDetalles] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    borradores: 0,
    pendientes: 0,
    en_proceso: 0,
    rechazadas: 0,
    completadas: 0,
    canceladas: 0
  });

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const showError = (message) => {
    setSnackbar({
      open: true,
      message,
      severity: 'error'
    });
  };

  const showSuccess = (message) => {
    setSnackbar({
      open: true,
      message,
      severity: 'success'
    });
  };

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const cargarSolicitudes = async () => {
    try {
      setLoading(true);
      
      const response = await solicitudesService.obtenerMisSolicitudes();
      console.log('Response from API:', response);
      
      const solicitudesData = Array.isArray(response.data?.solicitudes) ? response.data.solicitudes : [];
      setSolicitudes(solicitudesData);
      
      const stats = solicitudesData.reduce((acc, sol) => {
        acc.total++;
        switch (sol.estado_sol) {
          case 'BORRADOR':
            acc.borradores++;
            break;
          case 'PENDIENTE':
            acc.pendientes++;
            break;
          case 'APROBADA':
          case 'EN_REVISION':
          case 'EN_DESARROLLO':
          case 'EN_TESTING':
          case 'EN_DESPLIEGUE':
            acc.en_proceso++;
            break;
          case 'RECHAZADA':
            acc.rechazadas++;
            break;
          case 'COMPLETADA':
            acc.completadas++;
            break;
          case 'CANCELADA':
            acc.canceladas++;
            break;
          default:
            break;
        }
        return acc;
      }, {
        total: 0,
        borradores: 0,
        pendientes: 0,
        en_proceso: 0,
        rechazadas: 0,
        completadas: 0,
        canceladas: 0
      });
      
      setEstadisticas(stats);
    } catch (err) {
      console.error('Error loading solicitudes:', err);
      showError('Error al cargar solicitudes: ' + err.message);
      setSolicitudes([]);
      setEstadisticas({
        total: 0,
        borradores: 0,
        pendientes: 0,
        en_proceso: 0,
        rechazadas: 0,
        completadas: 0,
        canceladas: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEnviarSolicitud = async (id) => {
    try {
      console.log('Enviando solicitud con ID:', id);
      
      const result = await solicitudesService.enviarSolicitud(id);
      console.log('Solicitud enviada exitosamente:', result);
      
      if (result.success) {
        showSuccess('Solicitud enviada exitosamente');
        await cargarSolicitudes();
      }
    } catch (err) {
      console.error('Error enviando solicitud:', err);
      showError('Error al enviar solicitud: ' + err.message);
    }
  };

  const handleEliminarBorrador = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres cancelar este borrador? Esta acción no se puede deshacer.')) {
      try {
        console.log('Cancelando solicitud con ID:', id);
        
        const result = await solicitudesService.cancelarSolicitud(id);
        console.log('Solicitud cancelada exitosamente:', result);
        
        if (result.success) {
          showSuccess('Solicitud cancelada exitosamente');
          await cargarSolicitudes();
        }
      } catch (err) {
        console.error('Error cancelando solicitud:', err);
        showError('Error al cancelar borrador: ' + err.message);
      }
    }
  };

  const handleEditarSolicitud = (id) => {
    console.log('Navegando a editar solicitud:', id);
    navigate(`/admin/mis-solicitudes/editar/${id}`);
  };

  const getEstadoInfo = (estado) => {
    const estadosInfo = {
      'BORRADOR': { color: '#9e9e9e', icon: <Edit />, label: 'Borrador' },
      'PENDIENTE': { color: '#ff9800', icon: <Schedule />, label: 'Pendiente' },
      'EN_REVISION': { color: '#2196f3', icon: <Assignment />, label: 'En Revisión' },
      'APROBADA': { color: '#4caf50', icon: <CheckCircle />, label: 'Aprobada' },
      'RECHAZADA': { color: '#f44336', icon: <Cancel />, label: 'Rechazada' },
      'CANCELADA': { color: '#6b7280', icon: <Cancel />, label: 'Cancelada' },
      'EN_DESARROLLO': { color: '#9c27b0', icon: <Build />, label: 'En Desarrollo' },
      'PLANES_PENDIENTES_APROBACION': { color: '#ff5722', icon: <Schedule />, label: 'Planes Pendientes' },
      'LISTO_PARA_IMPLEMENTAR': { color: '#00bcd4', icon: <Assignment />, label: 'Listo para Implementar' },
      'EN_TESTING': { color: '#ffc107', icon: <Assignment />, label: 'En Testing' },
      'EN_DESPLIEGUE': { color: '#e91e63', icon: <Build />, label: 'En Despliegue' },
      'COMPLETADA': { color: '#4caf50', icon: <CheckCircle />, label: 'Completada' },
      'FALLIDA': { color: '#f44336', icon: <Cancel />, label: 'Fallida' }
    };
    
    return estadosInfo[estado] || { color: '#9e9e9e', icon: <Help />, label: 'Desconocido' };
  };

  const puedeEditar = (estado) => {
    return estado === 'BORRADOR';
  };

  const puedeEnviar = (estado) => {
    return estado === 'BORRADOR';
  };

  const puedeEliminar = (estado) => {
    return estado === 'BORRADOR';
  };

  const handleVerDetalles = async (id) => {
    try {
      setLoadingDetalles(true);
      const response = await solicitudesService.obtenerMiSolicitud(id);
      setSolicitudSeleccionada(response.data);
      setDialogDetalles(true);
    } catch (err) {
      console.error('Error cargando detalles:', err);
      showError('Error al cargar los detalles de la solicitud');
    } finally {
      setLoadingDetalles(false);
    }
  };

  const handleCerrarDetalles = () => {
    setDialogDetalles(false);
    setSolicitudSeleccionada(null);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  // Función para traducir el tipo de cambio
  const traducirTipoCambio = (tipo) => {
    const tipos = {
      'NUEVA_FUNCIONALIDAD': 'Nueva Funcionalidad',
      'MEJORA_EXISTENTE': 'Mejora de Funcionalidad Existente',
      'CORRECCION_ERROR': 'Corrección de Error',
      'CAMBIO_INTERFAZ': 'Cambio de Interfaz de Usuario',
      'OPTIMIZACION': 'Optimización de Rendimiento',
      'ACTUALIZACION_DATOS': 'Actualización de Datos',
      'CAMBIO_SEGURIDAD': 'Cambio de Seguridad',
      'INTEGRACION_EXTERNA': 'Integración Externa',
      'OTRO': 'Otro'
    };
    return tipos[tipo] || tipo;
  };

  // Función para traducir la prioridad
  const traducirPrioridad = (prioridad) => {
    const prioridades = {
      'BAJA': 'Baja',
      'MEDIA': 'Media',
      'ALTA': 'Alta',
      'CRITICA': 'Crítica',
      'URGENTE': 'Urgente'
    };
    return prioridades[prioridad] || prioridad;
  };



  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <AdminSidebar />
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,
          ...getMainContentStyle(),
          p: { xs: 2, sm: 3 },
          minHeight: '100vh'
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#6d1313' }}>
            Mis Solicitudes de Cambio
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestiona tus solicitudes de cambio para mejorar la aplicación
          </Typography>
        </Box>

        {/* Estadísticas Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ textAlign: 'center', bgcolor: '#e3f2fd' }}>
              <CardContent>
                <Typography variant="h4" component="div" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                  {estadisticas.total}
                </Typography>
                <Typography color="text.secondary">
                  Total
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ textAlign: 'center', bgcolor: '#f3e5f5' }}>
              <CardContent>
                <Typography variant="h4" component="div" sx={{ color: '#7b1fa2', fontWeight: 'bold' }}>
                  {estadisticas.borradores}
                </Typography>
                <Typography color="text.secondary">
                  Borradores
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ textAlign: 'center', bgcolor: '#fff3e0' }}>
              <CardContent>
                <Typography variant="h4" component="div" sx={{ color: '#f57c00', fontWeight: 'bold' }}>
                  {estadisticas.pendientes}
                </Typography>
                <Typography color="text.secondary">
                  Pendientes
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ textAlign: 'center', bgcolor: '#e8f5e8' }}>
              <CardContent>
                <Typography variant="h4" component="div" sx={{ color: '#388e3c', fontWeight: 'bold' }}>
                  {estadisticas.en_proceso}
                </Typography>
                <Typography color="text.secondary">
                  En Proceso
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ textAlign: 'center', bgcolor: '#ffebee' }}>
              <CardContent>
                <Typography variant="h4" component="div" sx={{ color: '#d32f2f', fontWeight: 'bold' }}>
                  {estadisticas.rechazadas}
                </Typography>
                <Typography color="text.secondary">
                  Rechazadas
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ textAlign: 'center', bgcolor: '#e8f5e8' }}>
              <CardContent>
                <Typography variant="h4" component="div" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                  {estadisticas.completadas}
                </Typography>
                <Typography color="text.secondary">
                  Completadas
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Botón Crear Nueva Solicitud */}
        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/admin/mis-solicitudes/crear')}
            sx={{
              bgcolor: '#6d1313',
              '&:hover': { bgcolor: '#5a0f0f' },
              px: 3,
              py: 1.5
            }}
          >
            Crear Nueva Solicitud
          </Button>
        </Box>

        {/* Tabla de Solicitudes */}
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
              Lista de Solicitudes ({solicitudes.length})
            </Typography>
          </Box>
          
          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress />
              <Typography variant="body2" sx={{ mt: 2 }}>
                Cargando solicitudes...
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Título</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Tipo</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Prioridad</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Fecha Creación</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {solicitudes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Box>
                          <Description sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                          <Typography variant="h6" color="text.secondary">
                            No tienes solicitudes aún
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            ¡Crea tu primera solicitud de cambio!
                          </Typography>
                          <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => navigate('/admin/mis-solicitudes/crear')}
                            sx={{
                              bgcolor: '#6d1313',
                              '&:hover': { bgcolor: '#5a0f0f' }
                            }}
                          >
                            Crear Solicitud
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    solicitudes.map((solicitud) => {
                      const estadoInfo = getEstadoInfo(solicitud.estado_sol);
                      
                      return (
                        <TableRow key={solicitud.id_sol} hover>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#6d1313' }}>
                              #{solicitud.id_sol}
                            </Typography>
                          </TableCell>
                          
                          <TableCell>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {solicitud.titulo_sol}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatearFecha(solicitud.fecha_creacion_sol)}
                            </Typography>
                          </TableCell>
                          
                          <TableCell>
                            <Typography variant="body2">
                              {solicitud.tipo_cambio_sol}
                            </Typography>
                          </TableCell>
                          
                          <TableCell>
                            <Chip
                              icon={estadoInfo.icon}
                              label={estadoInfo.label}
                              sx={{
                                bgcolor: estadoInfo.color,
                                color: 'white',
                                fontWeight: 'bold'
                              }}
                              size="small"
                            />
                          </TableCell>
                          
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {solicitud.prioridad_sol}
                            </Typography>
                          </TableCell>
                          
                          <TableCell>
                            <Typography variant="body2">
                              {formatearFecha(solicitud.fecha_creacion_sol)}
                            </Typography>
                          </TableCell>
                          
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                              <Tooltip title="Ver detalles">
                                <IconButton
                                  size="small"
                                  onClick={() => handleVerDetalles(solicitud.id_sol)}
                                  sx={{ color: '#1976d2' }}
                                >
                                  <Visibility fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              
                              {puedeEditar(solicitud.estado_sol) && (
                                <Tooltip title="Editar">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleEditarSolicitud(solicitud.id_sol)}
                                    sx={{ color: '#ed6c02' }}
                                  >
                                    <Edit fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              
                              {puedeEnviar(solicitud.estado_sol) && (
                                <Tooltip title="Enviar">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleEnviarSolicitud(solicitud.id_sol)}
                                    sx={{ color: '#2e7d32' }}
                                  >
                                    <Send fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              
                              {puedeEliminar(solicitud.estado_sol) && (
                                <Tooltip title="Cancelar">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleEliminarBorrador(solicitud.id_sol)}
                                    sx={{ color: '#d32f2f' }}
                                  >
                                    <Delete fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {/* Modal de Detalles */}
        <Dialog
          open={dialogDetalles}
          onClose={handleCerrarDetalles}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            bgcolor: '#6d1313',
            color: 'white',
            py: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Assignment sx={{ fontSize: 28 }} />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, color: 'white' }}>
                  Solicitud #{solicitudSeleccionada?.id_sol || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ color: 'white', fontStyle: 'italic', opacity: 0.9 }}>
                  Detalles de mi solicitud de cambio
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={handleCerrarDetalles}
              sx={{ color: 'white' }}
            >
              <Close />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers sx={{ p: 0 }}>
            {loadingDetalles ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : solicitudSeleccionada && (
              <Box>
                {/* Header con información clave */}
                <Box sx={{ 
                  bgcolor: '#fef2f2', 
                  p: 3, 
                  borderBottom: '1px solid #fecaca'
                }}>
                  <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Typography variant="h5" sx={{ fontWeight: 600, color: '#6d1313' }}>
                          {solicitudSeleccionada.titulo_sol}
                        </Typography>
                        <Chip
                          label={getEstadoInfo(solicitudSeleccionada.estado_sol).label}
                          sx={{
                            bgcolor: getEstadoInfo(solicitudSeleccionada.estado_sol).color,
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <strong>ID:</strong> #{solicitudSeleccionada.id_sol}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Fecha de creación:</strong> {new Date(solicitudSeleccionada.fec_creacion_sol).toLocaleDateString('es-ES')}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Assignment sx={{ fontSize: 16, color: '#b91c1c' }} />
                          <Typography variant="body2">
                            <strong>Tipo:</strong> {traducirTipoCambio(solicitudSeleccionada.tipo_cambio_sol)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Schedule sx={{ fontSize: 16, color: '#b91c1c' }} />
                          <Typography variant="body2">
                            <strong>Prioridad:</strong> {traducirPrioridad(solicitudSeleccionada.prioridad_sol)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Help sx={{ fontSize: 16, color: '#b91c1c' }} />
                          <Typography variant="body2">
                            <strong>Urgencia:</strong> {solicitudSeleccionada.urgencia_sol || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>

                {/* Contenido principal - DISEÑO ESTÁTICO 50-50 */}
                <Box sx={{ p: 2 }}>
                  <Box sx={{ 
                    display: 'flex',
                    height: '600px',
                    gap: 2
                  }}>
                    {/* Columna izquierda - EXACTAMENTE 50% */}
                    <Box sx={{ 
                      width: '50%',
                      height: '600px'
                    }}>
                      <Paper elevation={1} sx={{ 
                        p: 2.5, 
                        height: '600px',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                      }}>
                        <Typography variant="h6" sx={{ 
                          mb: 2, 
                          color: '#6d1313', 
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          height: '40px'
                        }}>
                          <Description sx={{ color: '#b91c1c' }} />
                          Mi Solicitud
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        
                        <Box sx={{ 
                          height: '530px',
                          display: 'flex',
                          flexDirection: 'column'
                        }}>
                          {/* Descripción - Reducida */}
                          <Box sx={{ height: '220px', mb: 3 }}>
                            <Typography variant="subtitle2" sx={{ 
                              color: '#6d1313', 
                              fontWeight: 600, 
                              mb: 1,
                              height: '25px',
                              display: 'flex',
                              alignItems: 'center'
                            }}>
                              Descripción del Cambio
                            </Typography>
                            <Paper variant="outlined" sx={{ 
                              p: 2, 
                              bgcolor: '#fef2f2',
                              height: '185px',
                              overflow: 'auto',
                              borderRadius: 2
                            }}>
                              <Typography variant="body2" sx={{ 
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                                lineHeight: 1.5
                              }}>
                                {solicitudSeleccionada.descripcion_sol || 'Sin descripción'}
                              </Typography>
                            </Paper>
                          </Box>

                          {/* Justificación - Reducida */}
                          <Box sx={{ height: '220px' }}>
                            <Typography variant="subtitle2" sx={{ 
                              color: '#6d1313', 
                              fontWeight: 600, 
                              mb: 1,
                              height: '25px',
                              display: 'flex',
                              alignItems: 'center'
                            }}>
                              Justificación del Negocio
                            </Typography>
                            <Paper variant="outlined" sx={{ 
                              p: 2, 
                              bgcolor: '#fef2f2',
                              height: '185px',
                              overflow: 'auto',
                              borderRadius: 2
                            }}>
                              <Typography variant="body2" sx={{ 
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                                lineHeight: 1.5
                              }}>
                                {solicitudSeleccionada.justificacion_sol || 'Sin justificación'}
                              </Typography>
                            </Paper>
                          </Box>
                        </Box>
                      </Paper>
                    </Box>

                    {/* Columna derecha - EXACTAMENTE 50% */}
                    <Box sx={{ 
                      width: '50%',
                      height: '600px'
                    }}>
                      <Paper elevation={1} sx={{ 
                        p: 2.5, 
                        height: '600px',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                      }}>
                        <Typography variant="h6" sx={{ 
                          mb: 2, 
                          color: '#6d1313', 
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          height: '40px'
                        }}>
                          <Schedule sx={{ color: '#b91c1c' }} />
                          Estado y Seguimiento
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
                          {/* Estado y Fechas - En una sola sección compacta */}
                          <Box sx={{ height: '160px' }}>
                            <Typography variant="subtitle2" sx={{ 
                              color: '#6d1313', 
                              fontWeight: 600, 
                              mb: 2,
                              height: '20px'
                            }}>
                              Estado y Fechas
                            </Typography>
                            <Box sx={{ 
                              height: '130px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 1.5
                            }}>
                              {/* Estado actual */}
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, height: '32px' }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, minWidth: '60px' }}>
                                  <strong>Estado:</strong>
                                </Typography>
                                <Chip
                                  icon={getEstadoInfo(solicitudSeleccionada.estado_sol).icon}
                                  label={getEstadoInfo(solicitudSeleccionada.estado_sol).label}
                                  sx={{
                                    bgcolor: getEstadoInfo(solicitudSeleccionada.estado_sol).color,
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: '12px',
                                    height: '28px'
                                  }}
                                />
                              </Box>
                              
                              {/* Fecha de aprobación */}
                              {solicitudSeleccionada.fec_respuesta_sol && (
                                <Typography variant="body2" sx={{ height: '20px', display: 'flex', alignItems: 'center' }}>
                                  <strong>Aprobada:</strong> {new Date(solicitudSeleccionada.fec_respuesta_sol).toLocaleDateString('es-ES')} {new Date(solicitudSeleccionada.fec_respuesta_sol).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                </Typography>
                              )}
                              
                              {/* Fecha deseada */}
                              {solicitudSeleccionada.fecha_limite_deseada_sol && (
                                <Typography variant="body2" sx={{ height: '20px', display: 'flex', alignItems: 'center' }}>
                                  <strong>Fecha deseada:</strong> {new Date(solicitudSeleccionada.fecha_limite_deseada_sol).toLocaleDateString('es-ES')}
                                </Typography>
                              )}
                            </Box>
                          </Box>

                          {/* Comentarios del administrador si existen - Espacio reducido */}
                          {solicitudSeleccionada.comentarios_admin_sol && (
                            <Box sx={{ height: '300px' }}>
                              <Typography variant="subtitle2" sx={{ 
                                color: '#6d1313', 
                                fontWeight: 600, 
                                mb: 2,
                                height: '20px'
                              }}>
                                Comentarios del Administrador
                              </Typography>
                              <Paper variant="outlined" sx={{ 
                                p: 2, 
                                bgcolor: '#f0fdf4',
                                height: '270px',
                                overflow: 'auto',
                                borderRadius: 2
                              }}>
                                <Typography variant="body2" sx={{ 
                                  whiteSpace: 'pre-wrap',
                                  wordBreak: 'break-word',
                                  lineHeight: 1.5
                                }}>
                                  {solicitudSeleccionada.comentarios_admin_sol}
                                </Typography>
                              </Paper>
                            </Box>
                          )}
                        </Box>
                      </Paper>
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}
          </DialogContent>

          <DialogActions sx={{ 
            p: 3, 
            gap: 2, 
            bgcolor: '#fef2f2',
            borderTop: '1px solid #fecaca'
          }}>
            <Button 
              onClick={handleCerrarDetalles} 
              variant="outlined"
              sx={{ 
                color: '#6d1313', 
                borderColor: '#b91c1c',
                '&:hover': { borderColor: '#991b1b', color: '#991b1b' }
              }}
            >
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminMisSolicitudes; 