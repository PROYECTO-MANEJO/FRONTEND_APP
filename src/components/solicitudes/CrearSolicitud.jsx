import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Chip,
  Divider,
} from '@mui/material';
import {
  Send,
  Edit,
  Schedule,
  Assignment,
  Save,
  ArrowBack,
} from '@mui/icons-material';

import UserSidebar from '../user/UserSidebar';
import { useUserSidebarLayout } from '../../hooks/useUserSidebarLayout';
import solicitudesService from '../../services/solicitudesService';

const CrearSolicitud = () => {
  const { getMainContentStyle } = useUserSidebarLayout();
  const navigate = useNavigate();
  const { id } = useParams(); // Para editar solicitud existente
  

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  
  const [formData, setFormData] = useState({
    titulo_sol: '',
    descripcion_sol: '',
    justificacion_sol: '',
    tipo_cambio_sol: '',
    prioridad_sol: 'MEDIA',
    urgencia_sol: 'NORMAL'
  });

  const [solicitudActual, setSolicitudActual] = useState(null);

  const tiposCambio = solicitudesService.obtenerTiposCambio();

  useEffect(() => {
    if (id) {
      cargarSolicitud();
    }
  }, [id]);

  const cargarSolicitud = async () => {
    try {
      setLoading(true);
      const response = await solicitudesService.obtenerMiSolicitud(id);
      const solicitud = response.data;
      
      setSolicitudActual(solicitud);
      setModoEdicion(true);
      
      // Verificar si puede editarse
      if (!['BORRADOR', 'RECHAZADA'].includes(solicitud.estado_sol)) {
        setError('Esta solicitud no puede editarse en su estado actual');
        return;
      }
      
      // Cargar datos en el formulario
      setFormData({
        titulo_sol: solicitud.titulo_sol || '',
        descripcion_sol: solicitud.descripcion_sol || '',
        justificacion_sol: solicitud.justificacion_sol || '',
        tipo_cambio_sol: solicitud.tipo_cambio_sol || '',
        prioridad_sol: solicitud.prioridad_sol || 'MEDIA',
        urgencia_sol: solicitud.urgencia_sol || 'NORMAL'
      });
      
    } catch (error) {
      setError('Error al cargar la solicitud: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar errores cuando el usuario empiece a escribir
    if (error) setError(null);
  };

  const validarFormulario = () => {
    const errores = [];
    
    if (!formData.titulo_sol.trim()) errores.push('El título es obligatorio');
    if (!formData.descripcion_sol.trim()) errores.push('La descripción es obligatoria');
    if (!formData.justificacion_sol.trim()) errores.push('La justificación es obligatoria');
    if (!formData.tipo_cambio_sol) errores.push('El tipo de cambio es obligatorio');
    
    return errores;
  };

  const handleGuardarBorrador = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (modoEdicion) {
        // Actualizar solicitud existente
        await solicitudesService.editarSolicitud(id, formData);
        setSuccess('Solicitud actualizada como borrador');
      } else {
        // Crear nueva solicitud (se crea automáticamente como BORRADOR)
        const response = await solicitudesService.crearSolicitud(formData);
        setSuccess('Solicitud guardada como borrador');
        
        // Redirigir a edición de la nueva solicitud
        navigate(`/solicitudes/editar/${response.data.id_sol}`);
      }
      
    } catch (error) {
      setError('Error al guardar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEnviarSolicitud = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Validar formulario antes de enviar
      const errores = validarFormulario();
      if (errores.length > 0) {
        setError('Completa los campos obligatorios: ' + errores.join(', '));
        return;
      }
      
      let solicitudId = id;
      
      if (!modoEdicion) {
        // Crear nueva solicitud primero
        const response = await solicitudesService.crearSolicitud(formData);
        solicitudId = response.data.id_sol;
      } else {
        // Actualizar solicitud existente
        await solicitudesService.editarSolicitud(id, formData);
      }
      
      // Enviar solicitud (BORRADOR → PENDIENTE)
      await solicitudesService.enviarSolicitud(solicitudId);
      
      setSuccess('Solicitud enviada exitosamente. Está pendiente de revisión.');
      
      // Redirigir a mis solicitudes después de un momento
      setTimeout(() => {
        navigate('/solicitudes');
      }, 2000);
      
    } catch (error) {
      setError('Error al enviar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoInfo = (estado) => {
    const estados = {
      'BORRADOR': { color: '#9e9e9e', icon: <Edit />, label: 'Borrador' },
      'PENDIENTE': { color: '#ff9800', icon: <Schedule />, label: 'Pendiente' },
      'RECHAZADA': { color: '#f44336', icon: <Assignment />, label: 'Rechazada' }
    };
    return estados[estado] || estados['BORRADOR'];
  };

  const estadoInfo = solicitudActual ? getEstadoInfo(solicitudActual.estado_sol) : getEstadoInfo('BORRADOR');

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
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          {/* Header */}
          <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate('/solicitudes')}
              sx={{ 
                color: '#666',
                borderColor: '#ddd',
                '&:hover': {
                  bgcolor: '#f5f5f5',
                  borderColor: '#ccc'
                }
              }}
            >
              Volver
            </Button>
            
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#6d1313' }}>
                {modoEdicion ? 'Editar Solicitud' : 'Nueva Solicitud de Cambio'}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {modoEdicion ? 'Modifica los detalles de tu solicitud' : 'Crea una nueva solicitud de cambio'}
              </Typography>
            </Box>
            
            {solicitudActual && (
              <Chip 
                icon={estadoInfo.icon}
                label={estadoInfo.label}
                sx={{ 
                  bgcolor: estadoInfo.color,
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
            )}
          </Box>

          {/* Alertas */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}

          {/* Stepper de proceso */}
          <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Stepper activeStep={modoEdicion && solicitudActual?.estado_sol !== 'BORRADOR' ? 1 : 0}>
              <Step>
                <StepLabel>Crear/Editar Borrador</StepLabel>
              </Step>
              <Step>
                <StepLabel>Enviar para Revisión</StepLabel>
              </Step>
              <Step>
                <StepLabel>Revisión y Aprobación</StepLabel>
              </Step>
            </Stepper>
          </Paper>

          {/* Formulario */}
          <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider', bgcolor: '#fafafa' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
                Información de la Solicitud
              </Typography>
            </Box>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  fullWidth
                  name="titulo_sol"
                  label="Título de la Solicitud"
                  value={formData.titulo_sol}
                  onChange={handleInputChange}
                  required
                  placeholder="Ej: Implementar autenticación de dos factores"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#666',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#333',
                      }
                    }
                  }}
                />
                
                <FormControl fullWidth required>
                  <InputLabel>Tipo de Cambio</InputLabel>
                  <Select
                    name="tipo_cambio_sol"
                    value={formData.tipo_cambio_sol}
                    onChange={handleInputChange}
                    label="Tipo de Cambio"
                    sx={{
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#666',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#333',
                      }
                    }}
                  >
                    {tiposCambio.map((tipo) => (
                      <MenuItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  name="descripcion_sol"
                  label="Descripción Detallada"
                  value={formData.descripcion_sol}
                  onChange={handleInputChange}
                  required
                  placeholder="Describe detalladamente qué cambio necesitas y cómo debería funcionar..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#666',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#333',
                      }
                    }
                  }}
                />
                
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  name="justificacion_sol"
                  label="Justificación del Cambio"
                  value={formData.justificacion_sol}
                  onChange={handleInputChange}
                  required
                  placeholder="Explica por qué es necesario este cambio..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#666',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#333',
                      }
                    }
                  }}
                />
                
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <FormControl fullWidth>
                    <InputLabel>Prioridad</InputLabel>
                    <Select
                      name="prioridad_sol"
                      value={formData.prioridad_sol}
                      onChange={handleInputChange}
                      label="Prioridad"
                      sx={{
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#666',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#333',
                        }
                      }}
                    >
                      {solicitudesService.obtenerPrioridades().map((prioridad) => (
                        <MenuItem key={prioridad.value} value={prioridad.value}>
                          {prioridad.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <FormControl fullWidth>
                    <InputLabel>Urgencia</InputLabel>
                    <Select
                      name="urgencia_sol"
                      value={formData.urgencia_sol}
                      onChange={handleInputChange}
                      label="Urgencia"
                      sx={{
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#666',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#333',
                        }
                      }}
                    >
                      {solicitudesService.obtenerUrgencias().map((urgencia) => (
                        <MenuItem key={urgencia.value} value={urgencia.value}>
                          {urgencia.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            </CardContent>
          </Paper>

          {/* Botones de Acción */}
          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/solicitudes')}
              disabled={loading}
              sx={{ 
                color: '#666',
                borderColor: '#ddd',
                '&:hover': {
                  bgcolor: '#f5f5f5',
                  borderColor: '#ccc'
                }
              }}
            >
              Cancelar
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<Save />}
              onClick={handleGuardarBorrador}
              disabled={loading}
              sx={{ 
                color: '#666',
                borderColor: '#ddd',
                '&:hover': {
                  bgcolor: '#f5f5f5',
                  borderColor: '#ccc'
                }
              }}
            >
              Guardar Borrador
            </Button>
            
            <Button
              variant="contained"
              startIcon={<Send />}
              onClick={handleEnviarSolicitud}
              disabled={loading}
              sx={{ 
                bgcolor: '#333',
                '&:hover': {
                  bgcolor: '#555'
                }
              }}
            >
              Enviar Solicitud
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CrearSolicitud;