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


import solicitudesService from '../../services/solicitudesService';

const DeveloperCrearSolicitud = () => {
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
        navigate(`/developer/mis-solicitudes/editar/${response.data.id_sol}`);
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
        navigate('/developer/mis-solicitudes');
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/developer/mis-solicitudes')}
              variant="outlined"
              size="small"
            >
              Volver
            </Button>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#2c5530' }}>
              {modoEdicion ? 'Editar Solicitud' : 'Nueva Solicitud de Cambio'}
            </Typography>
          </Box>
          
          {modoEdicion && solicitudActual && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Solicitud #{solicitudActual.id_sol}
                  </Typography>
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
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Creada: {new Date(solicitudActual.fecha_creacion_sol).toLocaleDateString('es-ES')}
                </Typography>
              </CardContent>
            </Card>
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

        {/* Formulario Principal */}
        <Paper sx={{ p: 4, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            Información de la Solicitud
          </Typography>

          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Título */}
            <TextField
              fullWidth
              label="Título de la Solicitud"
              name="titulo_sol"
              value={formData.titulo_sol}
              onChange={handleInputChange}
              required
              placeholder="Describe brevemente el cambio solicitado"
              variant="outlined"
            />

            {/* Tipo de Cambio */}
            <FormControl fullWidth required>
              <InputLabel>Tipo de Cambio</InputLabel>
              <Select
                name="tipo_cambio_sol"
                value={formData.tipo_cambio_sol}
                onChange={handleInputChange}
                label="Tipo de Cambio"
              >
                {tiposCambio.map((tipo) => (
                  <MenuItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Prioridad y Urgencia */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Prioridad</InputLabel>
                <Select
                  name="prioridad_sol"
                  value={formData.prioridad_sol}
                  onChange={handleInputChange}
                  label="Prioridad"
                >
                  <MenuItem value="BAJA">Baja</MenuItem>
                  <MenuItem value="MEDIA">Media</MenuItem>
                  <MenuItem value="ALTA">Alta</MenuItem>
                  <MenuItem value="CRITICA">Crítica</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Urgencia</InputLabel>
                <Select
                  name="urgencia_sol"
                  value={formData.urgencia_sol}
                  onChange={handleInputChange}
                  label="Urgencia"
                >
                  <MenuItem value="NORMAL">Normal</MenuItem>
                  <MenuItem value="URGENTE">Urgente</MenuItem>
                  <MenuItem value="CRITICA">Crítica</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Descripción */}
            <TextField
              fullWidth
              label="Descripción Detallada"
              name="descripcion_sol"
              value={formData.descripcion_sol}
              onChange={handleInputChange}
              required
              multiline
              rows={4}
              placeholder="Explica detalladamente el cambio que necesitas..."
              variant="outlined"
            />

            {/* Justificación */}
            <TextField
              fullWidth
              label="Justificación del Cambio"
              name="justificacion_sol"
              value={formData.justificacion_sol}
              onChange={handleInputChange}
              required
              multiline
              rows={4}
              placeholder="Explica por qué es necesario este cambio..."
              variant="outlined"
            />
          </Box>
        </Paper>

        {/* Botones de Acción */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/developer/mis-solicitudes')}
            disabled={loading}
          >
            Cancelar
          </Button>

          <Button
            variant="outlined"
            startIcon={<Save />}
            onClick={handleGuardarBorrador}
            disabled={loading}
            sx={{
              borderColor: '#2c5530',
              color: '#2c5530',
              '&:hover': {
                borderColor: '#1e3a23',
                bgcolor: 'rgba(44, 85, 48, 0.04)'
              }
            }}
          >
            {loading ? 'Guardando...' : 'Guardar Borrador'}
          </Button>

          <Button
            variant="contained"
            startIcon={<Send />}
            onClick={handleEnviarSolicitud}
            disabled={loading}
            sx={{
              bgcolor: '#2c5530',
              '&:hover': { bgcolor: '#1e3a23' }
            }}
          >
            {loading ? 'Enviando...' : 'Enviar Solicitud'}
          </Button>
        </Box>

        {/* Información de ayuda */}
        <Card sx={{ mt: 3, bgcolor: '#f8f9fa' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              💡 Consejos para una buena solicitud
            </Typography>
            <Box component="ul" sx={{ pl: 2, mb: 0 }}>
              <li><Typography variant="body2">Sé específico en el título y descripción</Typography></li>
              <li><Typography variant="body2">Explica claramente el problema o necesidad</Typography></li>
              <li><Typography variant="body2">Justifica por qué es importante este cambio</Typography></li>
              <li><Typography variant="body2">Puedes guardar como borrador y enviar después</Typography></li>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  };

export default DeveloperCrearSolicitud; 