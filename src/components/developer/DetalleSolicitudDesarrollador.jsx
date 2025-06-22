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
  Tooltip
} from '@mui/material';
import {
  ArrowBack,
  PlayArrow,
  Pause,
  Done,
  GitHub,
  Comment,
  Schedule,
  Person,
  Business,
  Flag,
  BugReport
} from '@mui/icons-material';
import solicitudesService from '../../services/solicitudesService';

const DetalleSolicitudDesarrollador = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [solicitud, setSolicitud] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comentarioDialog, setComentarioDialog] = useState(false);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    cargarSolicitud();
  }, [id]);

  const cargarSolicitud = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await solicitudesService.obtenerSolicitudDesarrollador(id);
      setSolicitud(response.data);
      
    } catch (error) {
      console.error('Error cargando solicitud:', error);
      setError('Error al cargar la solicitud');
    } finally {
      setLoading(false);
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

  const handleAgregarComentario = async () => {
    if (!nuevoComentario.trim()) return;

    try {
      setProcesando(true);
      await solicitudesService.agregarComentarioDesarrollo(id, nuevoComentario);
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

  const getEstadoColor = (estado) => {
    const colores = {
      'APROBADA': 'success',
      'EN_DESARROLLO': 'primary',
      'EN_TESTING': 'warning',
      'EN_PAUSA': 'default',
      'COMPLETADA': 'success'
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
      'APROBADA': 0,
      'EN_DESARROLLO': 50,
      'EN_TESTING': 80,
      'COMPLETADA': 100,
      'EN_PAUSA': 25
    };
    return progreso[estado] || 0;
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
                      onClick={() => navigate('/developer/solicitudes')}
          sx={{ mt: 2 }}
        >
          Volver al Dashboard
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <IconButton onClick={() => navigate('/developer/solicitudes')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          Detalle de Solicitud
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Información Principal */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {solicitud.titulo_sol}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    ID: {solicitud.id_sol}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip 
                    label={solicitud.estado_sol} 
                    color={getEstadoColor(solicitud.estado_sol)}
                    sx={{ fontWeight: 'bold' }}
                  />
                  <Chip 
                    label={solicitud.prioridad_sol} 
                    color={getPrioridadColor(solicitud.prioridad_sol)}
                    size="small"
                  />
                </Box>
              </Box>

              {/* Progreso */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Progreso de Desarrollo
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={getProgresoSegunEstado(solicitud.estado_sol)}
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {getProgresoSegunEstado(solicitud.estado_sol)}% completado
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Descripción */}
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Descripción
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, whiteSpace: 'pre-wrap' }}>
                {solicitud.descripcion_sol}
              </Typography>

              {/* Justificación */}
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Justificación
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, whiteSpace: 'pre-wrap' }}>
                {solicitud.justificacion_sol}
              </Typography>

              {/* Comentarios Técnicos */}
              {solicitud.comentarios_tecnicos_sol && (
                <>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Comentarios de Desarrollo
                  </Typography>
                  <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 2, mb: 3 }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                      {solicitud.comentarios_tecnicos_sol}
                    </Typography>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Panel de Control */}
        <Grid item xs={12} md={4}>
          {/* Acciones */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Acciones
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {solicitud.estado_sol === 'APROBADA' && (
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<PlayArrow />}
                    onClick={() => handleCambiarEstado('EN_DESARROLLO')}
                    disabled={procesando}
                    sx={{ bgcolor: '#1976d2' }}
                  >
                    Iniciar Desarrollo
                  </Button>
                )}

                {solicitud.estado_sol === 'EN_DESARROLLO' && (
                  <>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<Done />}
                      onClick={() => handleCambiarEstado('EN_TESTING')}
                      disabled={procesando}
                      sx={{ bgcolor: '#388e3c' }}
                    >
                      Completar Desarrollo
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Pause />}
                      onClick={() => handleCambiarEstado('EN_PAUSA')}
                      disabled={procesando}
                      color="warning"
                    >
                      Pausar Desarrollo
                    </Button>
                  </>
                )}

                {solicitud.estado_sol === 'EN_PAUSA' && (
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<PlayArrow />}
                    onClick={() => handleCambiarEstado('EN_DESARROLLO')}
                    disabled={procesando}
                    sx={{ bgcolor: '#1976d2' }}
                  >
                    Reanudar Desarrollo
                  </Button>
                )}

                {solicitud.estado_sol === 'EN_TESTING' && (
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<BugReport />}
                    onClick={() => handleCambiarEstado('EN_DESARROLLO')}
                    disabled={procesando}
                    color="warning"
                  >
                    Reportar Bug
                  </Button>
                )}

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Comment />}
                  onClick={() => setComentarioDialog(true)}
                  disabled={procesando}
                >
                  Agregar Comentario
                </Button>

                {solicitud.github_repo_url && (
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<GitHub />}
                    onClick={() => window.open(solicitud.github_repo_url, '_blank')}
                    sx={{ color: '#333' }}
                  >
                    Ver en GitHub
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Información del Proyecto */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Información del Proyecto
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Person sx={{ color: '#666' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Solicitante
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {solicitud.solicitante}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Business sx={{ color: '#666' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Tipo de Cambio
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {solicitud.tipo_cambio_sol}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Schedule sx={{ color: '#666' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Fecha Límite
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {solicitud.fecha_limite_deseada ? 
                        new Date(solicitud.fecha_limite_deseada).toLocaleDateString('es-ES') : 
                        'No definida'
                      }
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Flag sx={{ color: '#666' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Creada
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {new Date(solicitud.fec_creacion_sol).toLocaleDateString('es-ES')}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog para agregar comentario */}
      <Dialog 
        open={comentarioDialog} 
        onClose={() => setComentarioDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Agregar Comentario de Desarrollo</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={nuevoComentario}
            onChange={(e) => setNuevoComentario(e.target.value)}
            placeholder="Describe el progreso, problemas encontrados, o cualquier información relevante..."
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
            {procesando ? <CircularProgress size={20} /> : 'Agregar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DetalleSolicitudDesarrollador; 