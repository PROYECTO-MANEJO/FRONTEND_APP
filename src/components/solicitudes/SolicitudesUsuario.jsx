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
  CardContent
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
  Assignment
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
    borrador: 0,
    pendiente: 0,
    aprobada: 0,
    rechazada: 0,
    en_desarrollo: 0,
    completada: 0
  });

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const cargarSolicitudes = async () => {
    try {
      setLoading(true);
      const response = await solicitudesService.obtenerMisSolicitudes();
      setSolicitudes(response.data || []);
      
      // Calcular estadísticas
      const stats = response.data.reduce((acc, sol) => {
        acc.total++;
        acc[sol.estado_sol.toLowerCase()]++;
        return acc;
      }, {
        total: 0,
        borrador: 0,
        pendiente: 0,
        aprobada: 0,
        rechazada: 0,
        en_desarrollo: 0,
        completada: 0
      });
      
      setEstadisticas(stats);
    } catch (error) {
      setError('Error al cargar solicitudes: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEnviarSolicitud = async (id) => {
    try {
      await solicitudesService.enviarSolicitud(id);
      await cargarSolicitudes(); // Recargar lista
    } catch (error) {
      setError('Error al enviar solicitud: ' + error.message);
    }
  };

  const handleEliminarBorrador = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este borrador?')) {
      try {
        await solicitudesService.eliminarSolicitud(id);
        await cargarSolicitudes(); // Recargar lista
      } catch (error) {
        setError('Error al eliminar borrador: ' + error.message);
      }
    }
  };

  const getEstadoInfo = (estado) => {
    const estados = {
      'BORRADOR': { color: '#9e9e9e', icon: <Edit />, label: 'Borrador' },
      'PENDIENTE': { color: '#ff9800', icon: <Schedule />, label: 'Pendiente' },
      'APROBADA': { color: '#2196f3', icon: <CheckCircle />, label: 'Aprobada' },
      'RECHAZADA': { color: '#f44336', icon: <Cancel />, label: 'Rechazada' },
      'EN_DESARROLLO': { color: '#9c27b0', icon: <Build />, label: 'En Desarrollo' },
      'EN_TESTING': { color: '#ff5722', icon: <Assignment />, label: 'En Testing' },
      'COMPLETADA': { color: '#4caf50', icon: <CheckCircle />, label: 'Completada' }
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
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#1976d2' }}>
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
              sx={{ bgcolor: '#1976d2' }}
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
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                    {estadisticas.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Solicitudes
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ color: '#9e9e9e', fontWeight: 'bold' }}>
                    {estadisticas.borrador}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Borradores
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ color: '#ff9800', fontWeight: 'bold' }}>
                    {estadisticas.pendiente}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pendientes
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                    {estadisticas.completada}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completadas
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Tabla de Solicitudes */}
          <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Lista de Solicitudes ({solicitudes.length})
              </Typography>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Título</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Prioridad</TableCell>
                    <TableCell>Fecha Creación</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {solicitudes.length === 0 ? (
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
                            <Chip
                              label={solicitud.prioridad_sol}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          
                          <TableCell>
                            <Typography variant="body2">
                              {new Date(solicitud.fecha_creacion_sol).toLocaleDateString('es-ES')}
                            </Typography>
                          </TableCell>
                          
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                              {puedeEditar(solicitud.estado_sol) && (
                                <Tooltip title="Editar">
                                  <IconButton
                                    size="small"
                                    onClick={() => navigate(`/solicitudes/editar/${solicitud.id_sol}`)}
                                    sx={{ color: '#1976d2' }}
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
                                <Tooltip title="Eliminar Borrador">
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
                                  onClick={() => {/* TODO: Implementar vista de detalles */}}
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
    </Box>
  );
};

export default SolicitudesUsuario;