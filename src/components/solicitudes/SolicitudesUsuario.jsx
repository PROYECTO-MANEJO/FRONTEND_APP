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
  Close
} from '@mui/icons-material';
import UserSidebar from '../user/UserSidebar';
import { useUserSidebarLayout } from '../../hooks/useUserSidebarLayout';
import solicitudesService from '../../services/solicitudesService';

const SolicitudesUsuario = () => {
  const { getMainContentStyle } = useUserSidebarLayout();
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
    navigate(`/solicitudes/editar/${id}`);
  };

  const getEstadoInfo = (estado) => {
    const estados = {
      'BORRADOR': { color: '#9e9e9e', icon: <Edit />, label: 'Borrador' },
      'PENDIENTE': { color: '#ff9800', icon: <Schedule />, label: 'Pendiente' },
      'EN_REVISION': { color: '#2196f3', icon: <Assignment />, label: 'En Revisión' },
      'APROBADA': { color: '#2196f3', icon: <CheckCircle />, label: 'Aprobada' },
      'RECHAZADA': { color: '#f44336', icon: <Cancel />, label: 'Rechazada' },
      'CANCELADA': { color: '#757575', icon: <Cancel />, label: 'Cancelada' },
      'EN_DESARROLLO': { color: '#9c27b0', icon: <Build />, label: 'En Desarrollo' },
      'PLANES_PENDIENTES_APROBACION': { color: '#ff9800', icon: <Schedule />, label: 'Planes Pendientes' },
      'LISTO_PARA_IMPLEMENTAR': { color: '#3f51b5', icon: <Assignment />, label: 'Listo para Implementar' },
      'EN_TESTING': { color: '#ff5722', icon: <Assignment />, label: 'En Testing' },
      'EN_DESPLIEGUE': { color: '#e91e63', icon: <Build />, label: 'En Despliegue' },
      'COMPLETADA': { color: '#4caf50', icon: <CheckCircle />, label: 'Completada' },
      'FALLIDA': { color: '#d32f2f', icon: <Cancel />, label: 'Fallida' }
    };
    return estados[estado] || estados['BORRADOR'];
  };

  const puedeEditar = (estado) => {
    return ['BORRADOR', 'RECHAZADA'].includes(estado);
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
      console.log('Cargando detalles de solicitud:', id);
      
      const response = await solicitudesService.obtenerMiSolicitud(id);
      console.log('Detalles cargados:', response);
      
      if (response.success && response.data) {
        setSolicitudSeleccionada(response.data);
        setDialogDetalles(true);
      } else {
        setError('No se pudieron cargar los detalles de la solicitud');
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
        <UserSidebar />
        <Box component="main" sx={{ flexGrow: 1, ...getMainContentStyle(), display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <UserSidebar />
      
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,
          ...getMainContentStyle()
        }}
      >
        {/* Main Content */}
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          {/* Page Header */}
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#333' }}>
                Mis Solicitudes de Cambio
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Gestiona tus solicitudes de cambio para mejorar la aplicación
              </Typography>
            </Box>
            
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/solicitudes/crear')}
              sx={{ bgcolor: '#333', '&:hover': { bgcolor: '#555' } }}
            >
              Nueva Solicitud
            </Button>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Estadísticas */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={2}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ color: '#333', fontWeight: 'bold' }}>
                    {estadisticas.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ color: '#9e9e9e', fontWeight: 'bold' }}>
                    {estadisticas.borradores}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Borradores
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ color: '#ff9800', fontWeight: 'bold' }}>
                    {estadisticas.pendientes}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pendientes
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ color: '#2196f3', fontWeight: 'bold' }}>
                    {estadisticas.en_proceso}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    En Proceso
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                    {estadisticas.completadas}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completadas
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ color: '#757575', fontWeight: 'bold' }}>
                    {estadisticas.canceladas}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Canceladas
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Tabla de Solicitudes */}
          <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Lista de Solicitudes ({Array.isArray(solicitudes) ? solicitudes.length : 0})
              </Typography>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Título</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Fecha Creación</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {!Array.isArray(solicitudes) || solicitudes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          No tienes solicitudes aún. ¡Crea tu primera solicitud!
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    solicitudes.map((solicitud) => {
                      const estadoInfo = getEstadoInfo(solicitud.estado_sol);
                      return (
                        <TableRow key={solicitud.id_sol} hover>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {solicitud.titulo_sol}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              #{solicitud.id_sol}
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
                              size="small"
                              sx={{
                                bgcolor: estadoInfo.color,
                                color: 'white',
                                fontWeight: 'bold'
                              }}
                            />
                          </TableCell>
                          
                          <TableCell>
                            <Typography variant="body2">
                              {new Date(solicitud.fec_creacion_sol).toLocaleDateString('es-ES')}
                            </Typography>
                          </TableCell>
                          
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                              {puedeEditar(solicitud.estado_sol) && (
                                <Tooltip title="Editar">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleEditarSolicitud(solicitud.id_sol)}
                                    sx={{ color: '#666' }}
                                  >
                                    <Edit />
                                  </IconButton>
                                </Tooltip>
                              )}
                              
                              {puedeEnviar(solicitud.estado_sol) && (
                                <Tooltip title="Enviar para Revisión">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleEnviarSolicitud(solicitud.id_sol)}
                                    sx={{ color: '#4caf50' }}
                                  >
                                    <Send />
                                  </IconButton>
                                </Tooltip>
                              )}
                              
                              {puedeEliminar(solicitud.estado_sol) && (
                                <Tooltip title="Cancelar Borrador">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleEliminarBorrador(solicitud.id_sol)}
                                    sx={{ color: '#f44336' }}
                                  >
                                    <Delete />
                                  </IconButton>
                                </Tooltip>
                              )}
                              
                              <Tooltip title="Ver Detalles">
                                <IconButton
                                  size="small"
                                  onClick={() => handleVerDetalles(solicitud.id_sol)}
                                  disabled={loadingDetalles}
                                  sx={{ color: '#9e9e9e' }}
                                >
                                  <Visibility />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </Box>

      {/* Modal de Detalles */}
      <Dialog
        open={dialogDetalles}
        onClose={handleCerrarDetalles}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          bgcolor: '#333',
          color: 'white'
        }}>
          <Typography variant="h6">
            Detalles de Solicitud
          </Typography>
          <IconButton
            onClick={handleCerrarDetalles}
            sx={{ color: 'white' }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {solicitudSeleccionada && (
            <Box sx={{ py: 2 }}>
              <Grid container spacing={3}>
                {/* Información básica */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
                    Información Básica
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        ID de Solicitud
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        #{solicitudSeleccionada.id_sol}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Estado
                      </Typography>
                      <Chip
                        icon={getEstadoInfo(solicitudSeleccionada.estado_sol).icon}
                        label={getEstadoInfo(solicitudSeleccionada.estado_sol).label}
                        size="small"
                        sx={{
                          bgcolor: getEstadoInfo(solicitudSeleccionada.estado_sol).color,
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Título
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {solicitudSeleccionada.titulo_sol}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Descripción
                      </Typography>
                      <Typography variant="body1">
                        {solicitudSeleccionada.descripcion_sol}
                      </Typography>
                    </Grid>
                    
                    {solicitudSeleccionada.justificacion_sol && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          Justificación
                        </Typography>
                        <Typography variant="body1">
                          {solicitudSeleccionada.justificacion_sol}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Grid>
                
                {/* Información adicional */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
                    Información Adicional
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Tipo de Cambio
                      </Typography>
                      <Typography variant="body1">
                        {solicitudSeleccionada.tipo_cambio_sol}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
                
                {/* Fechas importantes */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
                    Fechas
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Fecha de Creación
                      </Typography>
                      <Typography variant="body1">
                        {new Date(solicitudSeleccionada.fec_creacion_sol).toLocaleString('es-ES')}
                      </Typography>
                    </Grid>
                    
                    {solicitudSeleccionada.fecha_limite_deseada_sol && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Fecha Límite Deseada
                        </Typography>
                        <Typography variant="body1">
                          {new Date(solicitudSeleccionada.fecha_limite_deseada_sol).toLocaleString('es-ES')}
                        </Typography>
                      </Grid>
                    )}
                    
                    {solicitudSeleccionada.fecha_ultima_actualizacion_sol && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Última Actualización
                        </Typography>
                        <Typography variant="body1">
                          {new Date(solicitudSeleccionada.fecha_ultima_actualizacion_sol).toLocaleString('es-ES')}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleCerrarDetalles} 
            variant="contained"
            sx={{ bgcolor: '#333', '&:hover': { bgcolor: '#555' } }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SolicitudesUsuario;