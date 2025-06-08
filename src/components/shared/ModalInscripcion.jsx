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
  Divider
} from '@mui/material';
import { 
  Close,
  EventAvailable,
  School,
  Payment,
  CheckCircle 
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
  const [enlacePago, setEnlacePago] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { user } = useAuth();

  const metodosPago = [
    { value: 'TARJETA DE CREDITO', label: 'Tarjeta de Crédito' },
    { value: 'TRANFERENCIA', label: 'Transferencia Bancaria' },
    { value: 'DEPOSITO', label: 'Depósito Bancario' }
  ];

  const handleSubmit = async () => {
    if (!metodoPago) {
      setError('Debes seleccionar un método de pago');
      return;
    }

    // Verificar que tengamos el ID del usuario
    const userId = user?.id;
    if (!userId) {
      setError('Error: No se pudo obtener el ID del usuario. Por favor, cierra sesión e inicia sesión nuevamente.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const inscripcionData = {
        idUsuario: userId,
        metodoPago,
        enlacePago: enlacePago || '',
      };

      if (tipo === 'evento') {
        inscripcionData.idEvento = item.id_eve;
        await inscripcionService.inscribirseEvento(inscripcionData);
      } else {
        // Para cursos (cuando se implemente)
        inscripcionData.idCurso = item.id_cur;
        await inscripcionService.inscribirseCurso(inscripcionData);
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
      setError(error.message || 'Error al procesar la inscripción');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setMetodoPago('');
    setEnlacePago('');
    setError('');
    setSuccess(false);
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
              
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                <Typography variant="body2">
                  <strong>Fecha de inicio:</strong> {new Date(fechaInicio).toLocaleDateString()}
                </Typography>
                <Typography variant="body2">
                  <strong>Duración:</strong> {duracion} horas
                </Typography>
              </Box>
            </Box>

            <Divider />

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* Formulario de inscripción */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Payment color="primary" />
                Información de Pago
              </Typography>

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

              <TextField
                fullWidth
                label="Enlace de Comprobante de Pago (Opcional)"
                placeholder="https://ejemplo.com/comprobante"
                value={enlacePago}
                onChange={(e) => setEnlacePago(e.target.value)}
                disabled={loading}
                helperText="Si ya realizaste el pago, puedes agregar el enlace del comprobante"
              />

              <Alert severity="info" sx={{ mt: 1 }}>
                <Typography variant="body2">
                  <strong>Importante:</strong> Una vez enviada la inscripción, 
                  deberás esperar la aprobación del administrador. 
                  Recibirás una notificación por email con el estado de tu inscripción.
                </Typography>
              </Alert>
            </Box>
          </Box>
        )}
      </DialogContent>
      
      {!success && (
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={handleClose} 
            variant="outlined"
            disabled={loading}
            sx={{ minWidth: 100 }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || !metodoPago}
            sx={{ minWidth: 100 }}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {loading ? 'Procesando...' : 'Inscribirse'}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default ModalInscripcion; 