import { useState } from 'react';
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
  Grid,
} from '@mui/material';
import {
  Send,
  Description,
  Category,
  PriorityHigh,
  CheckCircle,
  Business,
  Timeline,
  Group,
  CalendarMonth,
} from '@mui/icons-material';
// import { useAuth } from '../../context/AuthContext'; // Removido porque no se usa
import solicitudesService from '../../services/solicitudesService';

const CrearSolicitud = ({ onSolicitudCreada }) => {
  // const { user } = useAuth(); // Removido porque no se usa en esta versión mejorada
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    titulo_sol: '',
    descripcion_sol: '',
    justificacion_sol: '',
    tipo_cambio_sol: '',
    prioridad_sol: 'MEDIA',
    urgencia_sol: 'NORMAL',
    impacto_negocio_sol: '',
    usuarios_afectados_sol: '',
    recursos_necesarios_sol: '',
    beneficios_esperados_sol: '',
    fecha_limite_deseada: '',
  });

  const steps = ['Información Básica', 'Detalles del Cambio', 'Impacto y Planificación', 'Revisión'];
  const tiposCambio = solicitudesService.getOpcionesTipoCambio();
  const prioridades = solicitudesService.getOpcionesPrioridad();
  const urgencias = solicitudesService.getOpcionesUrgencia();

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
    setError(null);
  };

  const handleNext = () => {
    // Validaciones por paso
    if (activeStep === 0) {
      if (!formData.titulo_sol.trim() || formData.titulo_sol.length < 5) {
        setError('El título debe tener al menos 5 caracteres');
        return;
      }
      if (!formData.tipo_cambio_sol) {
        setError('Debe seleccionar un tipo de cambio');
        return;
      }
    }
    
    if (activeStep === 1) {
      if (!formData.descripcion_sol.trim() || formData.descripcion_sol.length < 10) {
        setError('La descripción debe tener al menos 10 caracteres');
        return;
      }
      if (!formData.justificacion_sol.trim() || formData.justificacion_sol.length < 10) {
        setError('La justificación debe tener al menos 10 caracteres');
        return;
      }
    }

    setError(null);
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Preparar datos para envío (solo incluir campos no vacíos)
      const datosEnvio = {
        titulo_sol: formData.titulo_sol,
        descripcion_sol: formData.descripcion_sol,
        justificacion_sol: formData.justificacion_sol,
        tipo_cambio_sol: formData.tipo_cambio_sol,
        prioridad_sol: formData.prioridad_sol,
        urgencia_sol: formData.urgencia_sol
      };

      // Agregar campos opcionales solo si tienen valor
      if (formData.impacto_negocio_sol.trim()) {
        datosEnvio.impacto_negocio_sol = formData.impacto_negocio_sol;
      }
      if (formData.beneficios_esperados_sol.trim()) {
        datosEnvio.beneficios_esperados_sol = formData.beneficios_esperados_sol;
      }
      if (formData.recursos_necesarios_sol.trim()) {
        datosEnvio.recursos_necesarios_sol = formData.recursos_necesarios_sol;
      }
      if (formData.usuarios_afectados_sol.trim()) {
        datosEnvio.usuarios_afectados_sol = formData.usuarios_afectados_sol;
      }
      if (formData.fecha_limite_deseada) {
        datosEnvio.fecha_limite_deseada = formData.fecha_limite_deseada;
      }

      const response = await solicitudesService.crearSolicitud(datosEnvio);
      setSuccess(true);
      
      // Resetear formulario después de 2 segundos
      setTimeout(() => {
        setFormData({
          titulo_sol: '',
          descripcion_sol: '',
          justificacion_sol: '',
          tipo_cambio_sol: '',
          prioridad_sol: 'MEDIA',
          urgencia_sol: 'NORMAL',
          impacto_negocio_sol: '',
          usuarios_afectados_sol: '',
          recursos_necesarios_sol: '',
          beneficios_esperados_sol: '',
          fecha_limite_deseada: '',
        });
        setActiveStep(0);
        setSuccess(false);
        if (onSolicitudCreada) {
          onSolicitudCreada(response.data);
        }
      }, 2000);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Paper elevation={2} sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
        <CheckCircle sx={{ fontSize: 60, color: '#6d1313', mb: 2 }} />
        <Typography variant="h5" gutterBottom sx={{ color: '#6d1313' }}>
          ¡Solicitud Creada Exitosamente!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Tu solicitud ha sido enviada y está siendo revisada por los administradores.
        </Typography>
      </Paper>
    );
  }

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="Título de la Solicitud"
              value={formData.titulo_sol}
              onChange={handleChange('titulo_sol')}
              placeholder="Ej: Implementar filtro avanzado de búsqueda"
              helperText="Describe brevemente el cambio que solicitas (5-200 caracteres)"
              required
              inputProps={{ maxLength: 200 }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#6d1313',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#6d1313',
                },
              }}
            />

            <FormControl fullWidth required>
              <InputLabel sx={{ '&.Mui-focused': { color: '#6d1313' } }}>Tipo de Cambio</InputLabel>
              <Select
                value={formData.tipo_cambio_sol}
                label="Tipo de Cambio"
                onChange={handleChange('tipo_cambio_sol')}
                sx={{
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#6d1313',
                  },
                }}
              >
                {tiposCambio.map((tipo) => (
                  <MenuItem key={tipo.value} value={tipo.value}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Category sx={{ fontSize: 20, color: '#6d1313' }} />
                        <Typography variant="body1">{tipo.label}</Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {tipo.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ '&.Mui-focused': { color: '#6d1313' } }}>Prioridad</InputLabel>
                  <Select
                    value={formData.prioridad_sol}
                    label="Prioridad"
                    onChange={handleChange('prioridad_sol')}
                    sx={{
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#6d1313',
                      },
                    }}
                  >
                    {prioridades.map((prioridad) => (
                      <MenuItem key={prioridad.value} value={prioridad.value}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PriorityHigh sx={{ fontSize: 20, color: prioridad.color }} />
                            <Typography variant="body1">{prioridad.label}</Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {prioridad.description}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ '&.Mui-focused': { color: '#6d1313' } }}>Urgencia</InputLabel>
                  <Select
                    value={formData.urgencia_sol}
                    label="Urgencia"
                    onChange={handleChange('urgencia_sol')}
                    sx={{
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#6d1313',
                      },
                    }}
                  >
                    {urgencias.map((urgencia) => (
                      <MenuItem key={urgencia.value} value={urgencia.value}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Timeline sx={{ fontSize: 20, color: '#6d1313' }} />
                            <Typography variant="body1">{urgencia.label}</Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {urgencia.description}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Descripción Detallada"
              value={formData.descripcion_sol}
              onChange={handleChange('descripcion_sol')}
              placeholder="Describe detalladamente el cambio que necesitas, incluyendo funcionalidades específicas..."
              helperText="Explica en detalle qué cambio necesitas (mínimo 10 caracteres)"
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#6d1313',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#6d1313',
                },
              }}
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Justificación"
              value={formData.justificacion_sol}
              onChange={handleChange('justificacion_sol')}
              placeholder="Explica por qué es necesario este cambio, qué problema resuelve..."
              helperText="Justifica la necesidad del cambio (mínimo 10 caracteres)"
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#6d1313',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#6d1313',
                },
              }}
            />
          </Box>
        );

      case 2:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Impacto en el Negocio"
              value={formData.impacto_negocio_sol}
              onChange={handleChange('impacto_negocio_sol')}
              placeholder="Describe cómo este cambio impactará al negocio, procesos o usuarios..."
              helperText="Campo opcional - Ayuda al equipo técnico a entender el impacto"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#6d1313',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#6d1313',
                },
              }}
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Beneficios Esperados"
              value={formData.beneficios_esperados_sol}
              onChange={handleChange('beneficios_esperados_sol')}
              placeholder="¿Qué beneficios esperas obtener con este cambio?"
              helperText="Campo opcional - Describe los beneficios esperados"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#6d1313',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#6d1313',
                },
              }}
            />

            <TextField
              fullWidth
              multiline
              rows={2}
              label="Usuarios Afectados"
              value={formData.usuarios_afectados_sol}
              onChange={handleChange('usuarios_afectados_sol')}
              placeholder="¿Qué usuarios o grupos se verán afectados por este cambio?"
              helperText="Campo opcional - Especifica quiénes se verán impactados"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#6d1313',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#6d1313',
                },
              }}
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Recursos Necesarios"
                  value={formData.recursos_necesarios_sol}
                  onChange={handleChange('recursos_necesarios_sol')}
                  placeholder="Estimación de recursos, tiempo, personal..."
                  helperText="Campo opcional - Tu estimación de recursos"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderColor: '#6d1313',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#6d1313',
                    },
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Fecha Límite Deseada"
                  value={formData.fecha_limite_deseada}
                  onChange={handleChange('fecha_limite_deseada')}
                  helperText="Campo opcional - Fecha límite deseada"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    min: new Date().toISOString().split('T')[0], // No permitir fechas pasadas
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderColor: '#6d1313',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#6d1313',
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 3:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#6d1313' }}>
              Resumen de tu Solicitud
            </Typography>
            
            <Card elevation={1}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      {formData.titulo_sol}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Category sx={{ fontSize: 16, color: '#6d1313' }} />
                      <Typography variant="body2">
                        <strong>Tipo:</strong> {tiposCambio.find(t => t.value === formData.tipo_cambio_sol)?.label}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <PriorityHigh sx={{ fontSize: 16, color: '#6d1313' }} />
                      <Typography variant="body2">
                        <strong>Prioridad:</strong> {prioridades.find(p => p.value === formData.prioridad_sol)?.label}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Timeline sx={{ fontSize: 16, color: '#6d1313' }} />
                      <Typography variant="body2">
                        <strong>Urgencia:</strong> {urgencias.find(u => u.value === formData.urgencia_sol)?.label}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  {formData.fecha_limite_deseada && (
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <CalendarMonth sx={{ fontSize: 16, color: '#6d1313' }} />
                        <Typography variant="body2">
                          <strong>Fecha límite:</strong> {new Date(formData.fecha_limite_deseada).toLocaleDateString('es-ES')}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2" paragraph>
                      <strong>Descripción:</strong> {formData.descripcion_sol}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Justificación:</strong> {formData.justificacion_sol}
                    </Typography>
                    
                    {formData.impacto_negocio_sol && (
                      <Typography variant="body2" paragraph>
                        <strong>Impacto en el Negocio:</strong> {formData.impacto_negocio_sol}
                      </Typography>
                    )}
                    
                    {formData.beneficios_esperados_sol && (
                      <Typography variant="body2" paragraph>
                        <strong>Beneficios Esperados:</strong> {formData.beneficios_esperados_sol}
                      </Typography>
                    )}
                    
                    {formData.usuarios_afectados_sol && (
                      <Typography variant="body2" paragraph>
                        <strong>Usuarios Afectados:</strong> {formData.usuarios_afectados_sol}
                      </Typography>
                    )}
                    
                    {formData.recursos_necesarios_sol && (
                      <Typography variant="body2">
                        <strong>Recursos Necesarios:</strong> {formData.recursos_necesarios_sol}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#6d1313' }}>
          <Description sx={{ color: '#6d1313' }} />
          Nueva Solicitud de Cambio
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Completa el formulario para enviar tu solicitud de cambio al equipo de desarrollo
        </Typography>
      </Box>

      <Stepper activeStep={activeStep} sx={{ 
        mb: 4,
        '& .MuiStepIcon-root.Mui-active': {
          color: '#6d1313',
        },
        '& .MuiStepIcon-root.Mui-completed': {
          color: '#6d1313',
        }
      }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 4 }}>
        {renderStepContent(activeStep)}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          variant="outlined"
          sx={{
            borderColor: '#6d1313',
            color: '#6d1313',
            '&:hover': {
              borderColor: '#5a1010',
              backgroundColor: 'rgba(109, 19, 19, 0.04)',
            },
          }}
        >
          Atrás
        </Button>

        <Box sx={{ display: 'flex', gap: 2 }}>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <Send />}
              sx={{ 
                minWidth: 140,
                backgroundColor: '#6d1313',
                '&:hover': {
                  backgroundColor: '#5a1010',
                },
              }}
            >
              {loading ? 'Enviando...' : 'Enviar Solicitud'}
            </Button>
          ) : (
            <Button 
              variant="contained" 
              onClick={handleNext}
              sx={{
                backgroundColor: '#6d1313',
                '&:hover': {
                  backgroundColor: '#5a1010',
                },
              }}
            >
              Siguiente
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default CrearSolicitud;