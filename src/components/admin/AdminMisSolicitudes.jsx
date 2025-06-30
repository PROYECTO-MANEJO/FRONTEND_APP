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
  Divider
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
  Description
} from '@mui/icons-material';
import AdminSidebar from './AdminSidebar';
import { useSidebarLayout } from '../../hooks/useSidebarLayout';
import solicitudesService from '../../services/solicitudesService';

const AdminMisSolicitudes = () => {
  const { getMainContentStyle } = useSidebarLayout();
  const navigate = useNavigate();
  
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    borradores: 0,
    pendientes: 0,
    en_proceso: 0,
    rechazadas: 0,
    completadas: 0,
    canceladas: 0
  });
  const [dialogDetalles, setDialogDetalles] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [loadingDetalles, setLoadingDetalles] = useState(false);

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const cargarSolicitudes = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      
      const response = await solicitudesService.obtenerMisSolicitudes();
      console.log('Response from API:', response); // Debug log
      
      // Extract solicitudes from the correct path in the response
      const solicitudesData = Array.isArray(response.data?.solicitudes) ? response.data.solicitudes : [];
      setSolicitudes(solicitudesData);
      
      // Calcular estadísticas only if we have data
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
    } catch (error) {
      console.error('Error loading solicitudes:', error); // Debug log
      setError('Error al cargar solicitudes: ' + error.message);
      setSolicitudes([]); // Ensure solicitudes is always an array
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
      setError(null);
      console.log('Enviando solicitud con ID:', id);
      
      const result = await solicitudesService.enviarSolicitud(id);
      console.log('Solicitud enviada exitosamente:', result);
      
      // Mostrar mensaje de éxito
      if (result.success) {
        // Aquí podrías mostrar un toast o mensaje de éxito
        console.log('✅ Solicitud enviada:', result.message);
      }
      
      await cargarSolicitudes(); // Recargar lista
    } catch (error) {
      console.error('Error enviando solicitud:', error);
      setError('Error al enviar solicitud: ' + error.message);
    }
  };

  const handleEliminarBorrador = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres cancelar este borrador? Esta acción no se puede deshacer.')) {
      try {
        setError(null);
        console.log('Cancelando solicitud con ID:', id);
        
        const result = await solicitudesService.cancelarSolicitud(id);
        console.log('Solicitud cancelada exitosamente:', result);
        
        // Mostrar mensaje de éxito
        if (result.success) {
          console.log('✅ Solicitud cancelada:', result.message);
        }
        
        await cargarSolicitudes(); // Recargar lista
      } catch (error) {
        console.error('Error cancelando solicitud:', error);
        setError('Error al cancelar borrador: ' + error.message);
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
      setError(null);
      
      const response = await solicitudesService.obtenerMiSolicitud(id);
      
      if (response.success) {
        setSolicitudSeleccionada(response.data);
        setDialogDetalles(true);
      } else {
        setError('Error al cargar detalles de la solicitud');
      }
    } catch (error) {
      console.error('Error cargando detalles:', error);
      setError('Error al cargar detalles: ' + error.message);
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
    } catch (error) {
      return 'Fecha inválida';
    }
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

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

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

        {/* Dialog de Detalles */}
        <Dialog
          open={dialogDetalles}
          onClose={handleCerrarDetalles}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { minHeight: '500px' }
          }}
        >
          <DialogTitle sx={{ 
            bgcolor: '#6d1313', 
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Typography variant="h6">
              Detalles de la Solicitud #{solicitudSeleccionada?.id_sol}
            </Typography>
            <IconButton
              onClick={handleCerrarDetalles}
              sx={{ color: 'white' }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          
          <DialogContent sx={{ p: 3 }}>
            {loadingDetalles ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress />
                <Typography variant="body2" sx={{ mt: 2 }}>
                  Cargando detalles...
                </Typography>
              </Box>
            ) : solicitudSeleccionada ? (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {solicitudSeleccionada.titulo_sol}
                  </Typography>
                  <Chip
                    icon={getEstadoInfo(solicitudSeleccionada.estado_sol).icon}
                    label={getEstadoInfo(solicitudSeleccionada.estado_sol).label}
                    sx={{
                      bgcolor: getEstadoInfo(solicitudSeleccionada.estado_sol).color,
                      color: 'white',
                      fontWeight: 'bold',
                      mb: 2
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Tipo de Cambio
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {solicitudSeleccionada.tipo_cambio_sol}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Prioridad
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {solicitudSeleccionada.prioridad_sol}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Descripción
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {solicitudSeleccionada.descripcion_sol}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Justificación
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {solicitudSeleccionada.justificacion_sol}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Fecha de Creación
                  </Typography>
                  <Typography variant="body1">
                    {formatearFecha(solicitudSeleccionada.fecha_creacion_sol)}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Última Actualización
                  </Typography>
                  <Typography variant="body1">
                    {formatearFecha(solicitudSeleccionada.fecha_actualizacion_sol)}
                  </Typography>
                </Grid>
              </Grid>
            ) : (
              <Typography>No se pudieron cargar los detalles</Typography>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCerrarDetalles} variant="outlined">
              Cerrar
            </Button>
            {solicitudSeleccionada && puedeEditar(solicitudSeleccionada.estado_sol) && (
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={() => {
                  handleCerrarDetalles();
                  handleEditarSolicitud(solicitudSeleccionada.id_sol);
                }}
                sx={{
                  bgcolor: '#6d1313',
                  '&:hover': { bgcolor: '#5a0f0f' }
                }}
              >
                Editar
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default AdminMisSolicitudes; 