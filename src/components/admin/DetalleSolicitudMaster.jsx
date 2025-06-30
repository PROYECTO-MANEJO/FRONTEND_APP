import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  IconButton,
  Snackbar,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider
} from '@mui/material';
import {
  Close,
  Description,
  Schedule,
  Assignment,
  Help,
  Edit
} from '@mui/icons-material';
import solicitudesAdminService from '../../services/solicitudesAdminService';

const DetalleSolicitudMaster = ({ solicitudId, onClose, open }) => {
  const [solicitud, setSolicitud] = useState(null);
  const [loading, setLoading] = useState(true);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [comentariosTecnicos, setComentariosTecnicos] = useState('');

  useEffect(() => {
    if (solicitudId) {
      cargarSolicitud();
    }
  }, [solicitudId]);

  const cargarSolicitud = async () => {
    try {
      setLoading(true);
      const response = await solicitudesAdminService.obtenerSolicitudParaAdmin(solicitudId);
      setSolicitud(response.data);
    } catch (err) {
      console.error('Error cargando detalles:', err);
      setSnackbar({
        open: true,
        message: 'Error al cargar los detalles de la solicitud',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };



  if (!open) return null;

  const getEstadoInfo = (estado) => {
    const estadosInfo = {
      'BORRADOR': { color: '#9e9e9e', icon: <Assignment />, label: 'Borrador' },
      'PENDIENTE': { color: '#ff9800', icon: <Schedule />, label: 'Pendiente' },
      'EN_REVISION': { color: '#2196f3', icon: <Assignment />, label: 'En Revisión' },
      'APROBADA': { color: '#4caf50', icon: <Assignment />, label: 'Aprobada' },
      'RECHAZADA': { color: '#f44336', icon: <Assignment />, label: 'Rechazada' },
      'CANCELADA': { color: '#6b7280', icon: <Assignment />, label: 'Cancelada' },
      'EN_DESARROLLO': { color: '#9c27b0', icon: <Assignment />, label: 'En Desarrollo' },
      'PLANES_PENDIENTES_APROBACION': { color: '#ff5722', icon: <Schedule />, label: 'Planes Pendientes' },
      'LISTO_PARA_IMPLEMENTAR': { color: '#00bcd4', icon: <Assignment />, label: 'Listo para Implementar' },
      'EN_TESTING': { color: '#ffc107', icon: <Assignment />, label: 'En Testing' },
      'EN_DESPLIEGUE': { color: '#e91e63', icon: <Assignment />, label: 'En Despliegue' },
      'COMPLETADA': { color: '#8bc34a', icon: <Assignment />, label: 'Completada' }
    };
    return estadosInfo[estado] || { color: '#9e9e9e', icon: <Assignment />, label: estado };
  };

  const traducirTipo = (tipo) => {
    const traducciones = {
      'NUEVA_FUNCIONALIDAD': 'Nueva Funcionalidad',
      'CORRECCION_ERROR': 'Corrección de Error',
      'MEJORA_RENDIMIENTO': 'Mejora de Rendimiento',
      'ACTUALIZACION_SEGURIDAD': 'Actualización de Seguridad',
      'CAMBIO_CONFIGURACION': 'Cambio de Configuración',
      'OTRO': 'Otro'
    };
    return traducciones[tipo] || tipo;
  };

  const traducirPrioridad = (prioridad) => {
    const traducciones = {
      'BAJA': 'Baja',
      'MEDIA': 'Media',
      'ALTA': 'Alta',
      'CRITICA': 'Crítica'
    };
    return traducciones[prioridad] || prioridad;
  };

  const traducirUrgencia = (urgencia) => {
    const traducciones = {
      'BAJA': 'Baja',
      'MEDIA': 'Media',
      'ALTA': 'Alta',
      'CRITICA': 'Crítica'
    };
    return traducciones[urgencia] || urgencia;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
              Solicitud #{solicitudId}
            </Typography>
            <Typography variant="body2" sx={{ color: 'white', fontStyle: 'italic', opacity: 0.9 }}>
              Detalles de mi solicitud de cambio
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{ color: 'white' }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <Typography>Cargando detalles...</Typography>
          </Box>
        ) : solicitud && (
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
                      {solicitud.titulo_sol}
                    </Typography>
                    <Chip
                      label={getEstadoInfo(solicitud.estado_sol).label}
                      sx={{
                        bgcolor: getEstadoInfo(solicitud.estado_sol).color,
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>ID:</strong> #{solicitud.id_sol}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Fecha de creación:</strong> {new Date(solicitud.fec_creacion_sol).toLocaleDateString('es-ES')}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Assignment sx={{ fontSize: 16, color: '#b91c1c' }} />
                      <Typography variant="body2">
                        <strong>Tipo:</strong> {traducirTipo(solicitud.tipo_cambio_sol)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Schedule sx={{ fontSize: 16, color: '#b91c1c' }} />
                      <Typography variant="body2">
                        <strong>Prioridad:</strong> {traducirPrioridad(solicitud.prioridad_sol)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Help sx={{ fontSize: 16, color: '#b91c1c' }} />
                      <Typography variant="body2">
                        <strong>Urgencia:</strong> {traducirUrgencia(solicitud.urgencia_sol)}
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
                            {solicitud.descripcion_sol || 'Sin descripción'}
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
                            {solicitud.justificacion_sol || 'Sin justificación'}
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
                              icon={getEstadoInfo(solicitud.estado_sol).icon}
                              label={getEstadoInfo(solicitud.estado_sol).label}
                              sx={{
                                bgcolor: getEstadoInfo(solicitud.estado_sol).color,
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '12px',
                                height: '28px'
                              }}
                            />
                          </Box>
                          
                          {/* Fecha de aprobación */}
                          {solicitud.fec_respuesta_sol && (
                            <Typography variant="body2" sx={{ height: '20px', display: 'flex', alignItems: 'center' }}>
                              <strong>Aprobada:</strong> {new Date(solicitud.fec_respuesta_sol).toLocaleDateString('es-ES')} {new Date(solicitud.fec_respuesta_sol).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                            </Typography>
                          )}
                          
                          {/* Fecha deseada */}
                          {solicitud.fecha_limite_deseada_sol && (
                            <Typography variant="body2" sx={{ height: '20px', display: 'flex', alignItems: 'center' }}>
                              <strong>Fecha deseada:</strong> {new Date(solicitud.fecha_limite_deseada_sol).toLocaleDateString('es-ES')}
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      {/* Comentarios del administrador si existen */}
                      {solicitud.comentarios_admin_sol && (
                        <Box sx={{ height: '180px' }}>
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
                            height: '150px',
                            overflow: 'auto',
                            borderRadius: 2
                          }}>
                            <Typography variant="body2" sx={{ 
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-word',
                              lineHeight: 1.5
                            }}>
                              {solicitud.comentarios_admin_sol}
                            </Typography>
                          </Paper>
                        </Box>
                      )}

                      {/* Comentarios técnicos - Solo para MASTER */}
                      <Box sx={{ flex: 1, minHeight: '150px' }}>
                        <Typography variant="subtitle2" sx={{ 
                          color: '#6d1313', 
                          fontWeight: 600, 
                          mb: 2,
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}>
                          <Edit sx={{ fontSize: 16, color: '#b91c1c' }} />
                          Comentarios Técnicos (MASTER)
                        </Typography>
                        <TextField
                          multiline
                          rows={6}
                          fullWidth
                          value={comentariosTecnicos}
                          onChange={(e) => setComentariosTecnicos(e.target.value)}
                          placeholder="Agregar comentarios técnicos o instrucciones especiales..."
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              bgcolor: '#fef9e7',
                              borderRadius: 2
                            }
                          }}
                        />
                      </Box>
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
          onClick={onClose} 
          variant="outlined"
          sx={{ 
            color: '#6d1313', 
            borderColor: '#b91c1c',
            '&:hover': { borderColor: '#991b1b', color: '#991b1b' }
          }}
        >
          Cerrar
        </Button>
        <Button
          variant="contained"
          sx={{
            bgcolor: '#6d1313',
            color: 'white',
            '&:hover': { bgcolor: '#991b1b' }
          }}
        >
          Guardar Comentarios
        </Button>
      </DialogActions>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default DetalleSolicitudMaster; 