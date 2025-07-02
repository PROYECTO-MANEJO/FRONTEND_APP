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
  Alert,
  CircularProgress,
  Divider,
  Chip,
  Card,
  CardContent,
  IconButton,
  LinearProgress
} from '@mui/material';
import { 
  Close,
  EventAvailable,
  School,
  Payment,
  CheckCircle,
  UploadFile,
  Description,
  Delete,
  CloudUpload
} from '@mui/icons-material';
import { inscripcionService } from '../../services/inscripcionService';
import { useAuth } from '../../context/AuthContext';

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
  
  const { user } = useAuth();

  const metodosPago = [
    { value: 'TARJETA_CREDITO', label: 'Tarjeta de Crédito' },
    { value: 'TRANFERENCIA', label: 'Transferencia Bancaria' },
    { value: 'DEPOSITO', label: 'Depósito Bancario' }
  ];

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    
    // Si no hay archivo seleccionado, salir
    if (!file) {
      setError({
        tipo: 'warning',
        titulo: 'No se seleccionó archivo',
        mensaje: 'Por favor seleccione un archivo PDF para continuar'
      });
      return;
    }
    
    console.log('🔍 Archivo seleccionado:', {
      nombre: file.name,
      tipo: file.type,
      tamaño: file.size,
      fecha: file.lastModified
    });
    
    // Validar que sea un PDF
    if (file.type !== 'application/pdf') {
      setError({
        tipo: 'error',
        titulo: 'Formato incorrecto',
        mensaje: 'Solo se permiten archivos en formato PDF'
      });
      setComprobantePago(null);
      // Limpiar input
      event.target.value = '';
      return;
    }
    
    // Validar tamaño máximo (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError({
        tipo: 'error',
        titulo: 'Archivo demasiado grande',
        mensaje: 'El archivo no puede superar los 10MB'
      });
      setComprobantePago(null);
      // Limpiar input
      event.target.value = '';
      return;
    }
    
    // Validar que el archivo no esté corrupto
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        // Verificar la firma del PDF (%PDF-)
        const arr = new Uint8Array(e.target.result).subarray(0, 5);
        const header = String.fromCharCode.apply(null, arr);
        
        if (header.indexOf('%PDF') !== 0) {
          setError({
            tipo: 'error',
            titulo: 'Archivo PDF inválido',
            mensaje: 'El archivo parece estar corrupto o no es un PDF válido'
          });
          setComprobantePago(null);
          // Limpiar input
          event.target.value = '';
          return;
        }
        
        // Si pasa todas las validaciones, guardar el archivo
        setComprobantePago(file);
        setError(null);
        console.log('✅ Archivo PDF válido:', file.name);
      } catch (err) {
        console.error('❌ Error al validar PDF:', err);
        setError({
          tipo: 'error',
          titulo: 'Error al procesar el archivo',
          mensaje: 'No se pudo validar el archivo PDF. Intente con otro archivo.'
        });
        setComprobantePago(null);
        // Limpiar input
        event.target.value = '';
      }
    };
    
    reader.onerror = () => {
      console.error('❌ Error al leer el archivo');
      setError({
        tipo: 'error',
        titulo: 'Error al leer el archivo',
        mensaje: 'No se pudo leer el archivo seleccionado. Intente con otro archivo.'
      });
      setComprobantePago(null);
      // Limpiar input
      event.target.value = '';
    };
    
    // Leer solo los primeros bytes para verificar la firma del PDF
    reader.readAsArrayBuffer(file.slice(0, 5));
  };

  const removeFile = () => {
    setComprobantePago(null);
    setError(null);
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
    try {
      const esGratuito = item.es_gratuito;
      const userId = user?.id_usu;

      console.log('🚀 Iniciando inscripción:', {
        esGratuito,
        metodoPago,
        tieneArchivo: !!comprobantePago,
        userId,
        tipo
      });

      // Validaciones básicas
      if (!userId) {
        throw new Error('No se pudo obtener la información del usuario');
      }

      if (!esGratuito) {
        if (!metodoPago) {
          throw new Error('Debe seleccionar un método de pago');
        }
        if (!comprobantePago) {
          throw new Error('Debe adjuntar el comprobante de pago en PDF');
        }
        
        // Validar que el archivo sea un PDF
        if (comprobantePago.type !== 'application/pdf') {
          throw new Error('El archivo debe ser un PDF válido');
        }
        
        // Validar tamaño máximo (10MB)
        const maxSize = 10 * 1024 * 1024;
        if (comprobantePago.size > maxSize) {
          throw new Error('El archivo no puede superar los 10MB');
        }
      }

      setLoading(true);
      setError(null);

      // Crear FormData correctamente
      const formData = new FormData();
      
      // Agregar datos básicos
      formData.append('idUsuario', userId);
      
      if (tipo === 'evento') {
        formData.append('idEvento', item.id_eve);
      } else {
        formData.append('idCurso', item.id_cur);
      }

      // Solo agregar datos de pago si no es gratuito
      if (!esGratuito) {
        formData.append('metodoPago', metodoPago);
        formData.append('comprobante_pago', comprobantePago, comprobantePago.name);
        
        console.log('📎 Archivo agregado al FormData:', {
          nombre: comprobantePago.name,
          tipo: comprobantePago.type,
          tamaño: comprobantePago.size
        });
      }

      // Debug: Mostrar contenido del FormData
      console.log('📦 FormData preparado:');
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: [FILE] ${value.name} (${value.type}, ${formatFileSize(value.size)})`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }

      // Enviar la solicitud
      let response;
      if (tipo === 'evento') {
        response = await inscripcionService.inscribirseEventoConArchivo(formData);
      } else {
        response = await inscripcionService.inscribirseCursoConArchivo(formData);
      }

      console.log('✅ Inscripción exitosa:', response);
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
      console.error('❌ Error en inscripción:', error);
      
      let mensajeError = 'Error al procesar la inscripción';
      
      if (error.response?.data?.message) {
        mensajeError = error.response.data.message;
      } else if (error.message) {
        mensajeError = error.message;
      }
      
      setError({
        tipo: 'error',
        titulo: 'Error en la inscripción',
        mensaje: mensajeError
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setMetodoPago('');
    setComprobantePago(null);
    setError(null);
    setSuccess(false);
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
              {item.es_gratuito ? 'Estás inscrito inmediatamente.' : 'Quedará pendiente hasta que se verifique el pago.'}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Información del evento/curso */}
            <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom>
                  {titulo}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {descripcion}
                </Typography>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 1 }}>
                  <Typography variant="body2">
                    <strong>Fecha:</strong> {new Date(fechaInicio).toLocaleDateString('es-ES')}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Duración:</strong> {duracion}
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
              </CardContent>
            </Card>

            {error && (
              <Alert severity={error.tipo || 'error'}>
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
              <Alert severity="success">
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  🎉 ¡{esEvento ? 'Evento' : 'Curso'} Gratuito!
                </Typography>
                <Typography variant="body2">
                  Este {esEvento ? 'evento' : 'curso'} es completamente gratuito. 
                  Tu inscripción será procesada automáticamente.
                </Typography>
              </Alert>
            ) : (
              /* Contenido pagado */
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Payment color="primary" />
                  Información de Pago
                </Typography>

                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>💰 Costo:</strong> ${item.precio} USD<br/>
                    Tu inscripción quedará <strong>pendiente</strong> hasta que el administrador verifique tu comprobante de pago.
                  </Typography>
                </Alert>

                {/* Método de Pago */}
                <FormControl fullWidth required>
                  <InputLabel>Método de Pago</InputLabel>
                  <Select
                    value={metodoPago}
                    label="Método de Pago"
                    onChange={(e) => setMetodoPago(e.target.value)}
                    disabled={loading}
                  >
                    {metodosPago.map((metodo) => (
                      <MenuItem key={metodo.value} value={metodo.value}>
                        {metodo.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Upload de Comprobante */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <UploadFile color="primary" />
                    Comprobante de Pago (PDF) *
                  </Typography>
                  
                  <input
                    id="comprobante_input"
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                    disabled={loading}
                  />
                  
                  {!comprobantePago ? (
                    <Button
                      variant="outlined"
                      component="label"
                      htmlFor="comprobante_input"
                      startIcon={<CloudUpload />}
                      fullWidth
                      sx={{ 
                        py: 2,
                        borderStyle: 'dashed',
                        borderWidth: 2,
                        '&:hover': {
                          borderStyle: 'dashed',
                          borderWidth: 2
                        }
                      }}
                      disabled={loading}
                    >
                      Seleccionar archivo PDF
                    </Button>
                  ) : (
                    <Card variant="outlined" sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Description color="error" />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {comprobantePago.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatFileSize(comprobantePago.size)}
                            </Typography>
                          </Box>
                        </Box>
                        <IconButton 
                          onClick={removeFile} 
                          size="small" 
                          color="error"
                          disabled={loading}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </Card>
                  )}
                </Box>
              </Box>
            )}

            {loading && (
              <Box>
                <LinearProgress sx={{ mb: 1 }} />
                <Typography variant="body2" color="text.secondary" align="center">
                  Procesando inscripción...
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={handleClose} 
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || success || (!item.es_gratuito && (!metodoPago || !comprobantePago))}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Inscribiendo...' : 'Inscribirse'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalInscripcion; 