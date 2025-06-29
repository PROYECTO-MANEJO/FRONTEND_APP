import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  Card,
  IconButton
} from '@mui/material';
import { 
  Close,
  EventAvailable,
  School,
  Payment,
  CheckCircle,
  UploadFile,
  Description,
  Delete
} from '@mui/icons-material';
import { inscripcionService } from '../../services/inscripcionService';
import { useAuth } from '../../context/AuthContext';

// Función para mejorar los mensajes de error
const mejorarMensajeError = (errorMessage) => {
  const mensajesEspecificos = {
    'Solo puedes inscribirte en eventos públicos': {
      titulo: '🚫 Acceso Restringido',
      mensaje: 'Como usuario externo, solo puedes inscribirte en eventos abiertos al público general. Este evento es exclusivo para estudiantes de carreras específicas.',
      tipo: 'warning'
    },
    'No tienes una carrera asignada. Contacta al administrador.': {
      titulo: '⚠️ Carrera No Asignada',
      mensaje: 'Para inscribirte en este evento necesitas tener una carrera asignada en tu perfil. Por favor, contacta al administrador para que complete tu información académica.',
      tipo: 'warning'
    },
    'Este evento no está habilitado para tu carrera': {
      titulo: '📚 Carrera No Habilitada',
      mensaje: 'Este evento está dirigido específicamente a estudiantes de ciertas carreras y la tuya no está incluida. Puedes buscar otros eventos disponibles para tu carrera.',
      tipo: 'warning'
    },
    'Ya estás inscrito en este evento': {
      titulo: '✅ Ya Inscrito',
      mensaje: 'Ya te encuentras inscrito en este evento. Puedes revisar el estado de tu inscripción en tu perfil o contactar al organizador si tienes dudas.',
      tipo: 'info'
    },
    'Faltan campos obligatorios': {
      titulo: '📝 Información Incompleta',
      mensaje: 'Por favor, completa todos los campos obligatorios del formulario de inscripción, especialmente el método de pago.',
      tipo: 'error'
    },
    'Método de pago no válido': {
      titulo: '💳 Método de Pago Inválido',
      mensaje: 'El método de pago seleccionado no es válido. Por favor, selecciona una opción válida: Tarjeta de Crédito, Transferencia Bancaria o Depósito.',
      tipo: 'error'
    },
    'Evento no encontrado': {
      titulo: '❌ Evento No Encontrado',
      mensaje: 'El evento al que intentas inscribirte no existe o ha sido eliminado. Por favor, actualiza la página e intenta nuevamente.',
      tipo: 'error'
    },
    'Cuenta no encontrada': {
      titulo: '👤 Usuario No Encontrado',
      mensaje: 'No se pudo encontrar tu información de usuario. Por favor, cierra sesión e inicia sesión nuevamente.',
      tipo: 'error'
    },
    'Solo puedes inscribirte en cursos públicos': {
      titulo: '🚫 Acceso Restringido',
      mensaje: 'Como usuario externo, solo puedes inscribirte en cursos abiertos al público general. Este curso es exclusivo para estudiantes de carreras específicas.',
      tipo: 'warning'
    },
    'Debes tener tus documentos verificados por un administrador antes de poder inscribirte': {
      titulo: '📄 Documentos No Verificados',
      mensaje: 'Para inscribirte en cualquier evento o curso, necesitas tener tus documentos (cédula y matrícula si eres estudiante) verificados por un administrador. Ve a tu perfil para subirlos.',
      tipo: 'warning'
    },
    'Debes subir todos los documentos requeridos': {
      titulo: '📤 Documentos Incompletos',
      mensaje: 'Antes de inscribirte, debes subir todos los documentos requeridos (cédula y matrícula si eres estudiante) en tu perfil.',
      tipo: 'warning'
    },
    'Este curso no está habilitado para tu carrera': {
      titulo: '📚 Carrera No Habilitada',
      mensaje: 'Este curso está dirigido específicamente a estudiantes de ciertas carreras y la tuya no está incluida. Puedes buscar otros cursos disponibles para tu carrera.',
      tipo: 'warning'
    },
    'Ya estás inscrito en este curso': {
      titulo: '✅ Ya Inscrito',
      mensaje: 'Ya te encuentras inscrito en este curso. Puedes revisar el estado de tu inscripción en tu perfil o contactar al organizador si tienes dudas.',
      tipo: 'info'
    },
    'Curso no encontrado': {
      titulo: '❌ Curso No Encontrado',
      mensaje: 'El curso al que intentas inscribirte no existe o ha sido eliminado. Por favor, actualiza la página e intenta nuevamente.',
      tipo: 'error'
    }
  };

  // Buscar mensaje específico
  for (const [clave, info] of Object.entries(mensajesEspecificos)) {
    if (errorMessage.includes(clave)) {
      return info;
    }
  }

  // Mensaje genérico mejorado
  return {
    titulo: '⚠️ Error en la Inscripción',
    mensaje: `Ha ocurrido un problema: ${errorMessage}. Si el problema persiste, por favor contacta al soporte técnico.`,
    tipo: 'error'
  };
};

const ModalInscripcion = ({ 
  open, 
  onClose, 
  item, 
  tipo, // 'evento' o 'curso'
  onInscripcionExitosa 
}) => {
  const [metodoPago, setMetodoPago] = useState('');
  const [comprobantePago, setComprobantePago] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [cartaMotivacion, setCartaMotivacion] = useState('');
  
  const { user } = useAuth();

  const metodosPago = [
    { value: 'TARJETA_CREDITO', label: 'Tarjeta de Crédito' },
    { value: 'TRANFERENCIA', label: 'Transferencia Bancaria' },
    { value: 'DEPOSITO', label: 'Depósito Bancario' }
  ];

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setComprobantePago(file);
      setError(null);
    } else {
      setError({
        tipo: 'error',
        titulo: 'Archivo no válido',
        mensaje: 'Solo se permiten archivos PDF para el comprobante de pago'
      });
    }
  };

  const removeFile = () => {
    setComprobantePago(null);
    // Limpiar input
    const input = document.getElementById('comprobante_input');
    if (input) input.value = '';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async () => {
    // Verificar si es contenido pagado y faltan campos de pago
    const esGratuito = item.es_gratuito;
    if (!esGratuito && (!metodoPago || !comprobantePago)) {
      setError(mejorarMensajeError('Faltan campos obligatorios'));
      return;
    }

    // Verificar que tengamos el ID del usuario
    const userId = user?.id_usu;
    if (!userId) {
      setError(mejorarMensajeError('Cuenta no encontrada'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Crear FormData para enviar archivo
      const formData = new FormData();
      formData.append('idUsuario', userId);

      if (tipo === 'evento') {
        formData.append('idEvento', item.id_eve);
      } else {
        formData.append('idCurso', item.id_cur);
      }

      // Solo agregar información de pago si no es gratuito
      if (!esGratuito) {
        formData.append('metodoPago', metodoPago);
        formData.append('comprobante_pago', comprobantePago);
      }

      // Al enviar la inscripción
      formData.append('carta_motivacion', cartaMotivacion); // si tu backend espera snake_case

      if (tipo === 'evento') {
        await inscripcionService.inscribirseEventoConArchivo(formData);
      } else {
        await inscripcionService.inscribirseCursoConArchivo(formData);
      }

      setSuccess(true);
      
      // Notificar éxito al componente padre
      if (onInscripcionExitosa) {
        onInscripcionExitosa();
      }

      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        onClose();
        resetForm();
      }, 2000);

    } catch (error) {
      const errorMessage = error.message || 'Error al procesar la inscripción';
      setError(mejorarMensajeError(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setMetodoPago('');
    setComprobantePago(null);
    setError(null);
    setSuccess(false);
    setCartaMotivacion('');
    // Limpiar input de archivo
    const input = document.getElementById('comprobante_input');
    if (input) input.value = '';
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      resetForm();
    }
  };

  if (!item) return null;

  const esEvento = tipo === 'evento';
  const titulo = esEvento ? item.nom_eve : item.nom_cur;
  const descripcion = esEvento ? item.des_eve : item.des_cur;
  const fechaInicio = esEvento ? item.fec_ini_eve : item.fec_ini_cur;
  const duracion = esEvento ? item.dur_eve : item.dur_cur;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {esEvento ? <EventAvailable color="primary" /> : <School color="primary" />}
          <Typography variant="h6" component="span">
            Inscribirse en {esEvento ? 'Evento' : 'Curso'}
          </Typography>
        </Box>
        <Button
          onClick={handleClose}
          color="inherit"
          size="small"
          sx={{ minWidth: 'auto', p: 1 }}
          disabled={loading}
        >
          <Close />
        </Button>
      </DialogTitle>
      
      <DialogContent>
        {success ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" color="success.main" gutterBottom>
              ¡Inscripción Exitosa!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Tu inscripción ha sido procesada correctamente. 
              Recibirás una confirmación por email.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Información del evento/curso */}
            <Box>
              <Typography variant="h6" color="primary" gutterBottom>
                {titulo}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {descripcion}
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 1 }}>
                <Typography variant="body2">
                  <strong>Fecha de inicio:</strong> {new Date(fechaInicio).toLocaleDateString()}
                </Typography>
                <Typography variant="body2">
                  <strong>Duración:</strong> {duracion} horas
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2">
                  <strong>Costo:</strong> {item.es_gratuito ? 'Gratuito' : `$${item.precio} USD`}
                </Typography>
                <Chip 
                  label={item.es_gratuito ? 'GRATIS' : 'PAGADO'} 
                  size="small"
                  color={item.es_gratuito ? 'success' : 'warning'}
                  variant="outlined"
                />
              </Box>
            </Box>

            <Divider />

            {error && (
              <Alert severity={error.tipo || 'error'} sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {error.titulo}
                </Typography>
                <Typography variant="body2">
                  {error.mensaje}
                </Typography>
              </Alert>
            )}

            {/* Formulario de inscripción */}
            {item.es_gratuito ? (
              /* Contenido gratuito */
              <Box>
                <Alert severity="success" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    🎉 ¡{esEvento ? 'Evento' : 'Curso'} Gratuito!
                  </Typography>
                  <Typography variant="body2">
                    Este {esEvento ? 'evento' : 'curso'} es completamente gratuito. 
                    Tu inscripción será procesada automáticamente y recibirás una confirmación inmediata.
                  </Typography>
                </Alert>
              </Box>
            ) : (
              /* Contenido pagado */
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Payment color="primary" />
                  Información de Pago
                </Typography>

                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>💰 Costo:</strong> ${item.precio} USD<br/>
                    Tu inscripción quedará pendiente hasta que el administrador verifique tu comprobante de pago.
                  </Typography>
                </Alert>

                {/* Método de Pago */}
                <FormControl fullWidth required>
                  <InputLabel>Método de Pago</InputLabel>
                  <Select
                    value={metodoPago}
                    label="Método de Pago"
                    onChange={(e) => setMetodoPago(e.target.value)}
                  >
                    {metodosPago.map((metodo) => (
                      <MenuItem key={metodo.value} value={metodo.value}>
                        {metodo.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Subir Comprobante de Pago */}
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    📄 Comprobante de Pago <span style={{ color: 'red' }}>*</span>
                  </Typography>
                  
                  {comprobantePago ? (
                    <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Description color="primary" />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {comprobantePago.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatFileSize(comprobantePago.size)}
                            </Typography>
                          </Box>
                        </Box>
                        <IconButton 
                          onClick={removeFile}
                          color="error"
                          size="small"
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </Card>
                  ) : (
                    <Box>
                      <input
                        id="comprobante_input"
                        type="file"
                        accept=".pdf"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="comprobante_input">
                        <Button
                          variant="outlined"
                          component="span"
                          startIcon={<UploadFile />}
                          fullWidth
                          sx={{ p: 3, borderStyle: 'dashed' }}
                        >
                          Seleccionar archivo PDF
                        </Button>
                      </label>
                      <Typography variant="caption" display="block" sx={{ mt: 1, textAlign: 'center' }} color="text.secondary">
                        Solo archivos PDF, máximo 10MB
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            )}

            {/* Requerimiento de carta de motivación */}
            {item.requiere_carta_motivacion === true && (
              <TextField
                fullWidth
                label="Carta de motivación *"
                value={cartaMotivacion}
                onChange={e => setCartaMotivacion(e.target.value)}
                multiline
                minRows={6}
                maxRows={12}
                required
                sx={{ mt: 2 }}
              />
            )}

            {/* Botones de acción */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
              <Button
                onClick={handleClose}
                disabled={loading}
                color="inherit"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                variant="contained"
                disabled={loading || (!item.es_gratuito && (!metodoPago || !comprobantePago))}
                sx={{ 
                  bgcolor: '#6d1313', 
                  '&:hover': { bgcolor: '#5a1010' },
                  minWidth: 120
                }}
              >
                {loading ? 'Procesando...' : 'Inscribirse'}
              </Button>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ModalInscripcion;