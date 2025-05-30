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
} from '@mui/material';
import {
  Send,
  Description,
  Category,
  PriorityHigh,
  CheckCircle,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import solicitudesService from '../services/solicitudesService';

const CrearSolicitud = ({ onSolicitudCreada }) => {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    titulo_sol: '',
    descripcion_sol: '',
    justificacion_sol: '',
    tipo_cambio_sol: '',
    prioridad_sol: 'MEDIA'
  });

  const steps = ['Información Básica', 'Detalles del Cambio', 'Revisión'];
  const tiposCambio = solicitudesService.getOpcionesTipoCambio();
  const prioridades = solicitudesService.getOpcionesPrioridad();

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
      const response = await solicitudesService.crearSolicitud(formData);
      setSuccess(true);
      
      // Resetear formulario después de 2 segundos
      setTimeout(() => {
        setFormData({
          titulo_sol: '',
          descripcion_sol: '',
          justificacion_sol: '',
          tipo_cambio_sol: '',
          prioridad_sol: 'MEDIA'
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
        <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
        <Typography variant="h5" gutterBottom color="success.main">
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
            />

            <FormControl fullWidth required>
              <InputLabel>Tipo de Cambio</InputLabel>
              <Select
                value={formData.tipo_cambio_sol}
                label="Tipo de Cambio"
                onChange={handleChange('tipo_cambio_sol')}
              >
                {tiposCambio.map((tipo) => (
                  <MenuItem key={tipo.value} value={tipo.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Category sx={{ fontSize: 20, color: 'primary.main' }} />
                      {tipo.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Prioridad</InputLabel>
              <Select
                value={formData.prioridad_sol}
                label="Prioridad"
                onChange={handleChange('prioridad_sol')}
              >
                {prioridades.map((prioridad) => (
                  <MenuItem key={prioridad.value} value={prioridad.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PriorityHigh sx={{ fontSize: 20, color: prioridad.color }} />
                      <span>{prioridad.label}</span>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
            />

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Justificación"
              value={formData.justificacion_sol}
              onChange={handleChange('justificacion_sol')}
              placeholder="Explica por qué es necesario este cambio, qué problemas resuelve..."
              helperText="Justifica la necesidad del cambio (mínimo 10 caracteres)"
              required
            />
          </Box>
        );

      case 2:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6" gutterBottom>
              Revisión de la Solicitud
            </Typography>
            
            <Card elevation={1}>
              <CardContent>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Información del Solicitante
                </Typography>
                <Typography variant="body2">
                  <strong>Nombre:</strong> {user?.nom_usu1 || user?.nombre || 'No disponible'} {user?.nom_usu2 || ''} {user?.ape_usu1 || user?.apellido || ''} {user?.ape_usu2 || ''}
                </Typography>
                <Typography variant="body2">
                  <strong>Cédula:</strong> {user?.ced_usu || user?.cedula || 'No disponible'}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Detalles de la Solicitud
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Título:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {formData.titulo_sol}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Tipo de Cambio:</Typography>
                  <Chip 
                    label={tiposCambio.find(t => t.value === formData.tipo_cambio_sol)?.label}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Prioridad:</Typography>
                  <Chip 
                    label={prioridades.find(p => p.value === formData.prioridad_sol)?.label}
                    size="small"
                    sx={{ 
                      mt: 0.5,
                      bgcolor: prioridades.find(p => p.value === formData.prioridad_sol)?.color,
                      color: 'white'
                    }}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Descripción:</Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {formData.descripcion_sol}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">Justificación:</Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {formData.justificacion_sol}
                  </Typography>
                </Box>
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
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Description />
          Nueva Solicitud de Cambio
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Completa el formulario para enviar tu solicitud de cambio al equipo de desarrollo
        </Typography>
      </Box>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
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
              sx={{ minWidth: 140 }}
            >
              {loading ? 'Enviando...' : 'Enviar Solicitud'}
            </Button>
          ) : (
            <Button variant="contained" onClick={handleNext}>
              Siguiente
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default CrearSolicitud; 