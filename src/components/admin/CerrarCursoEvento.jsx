import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  Box,
  CircularProgress
} from '@mui/material';
import { Warning, Close as CloseIcon } from '@mui/icons-material';
import api from '../../services/api';

const CerrarCursoEvento = ({ 
  open, 
  onClose, 
  tipo, // 'curso' o 'evento'
  item, // objeto con datos del curso/evento
  onSuccess 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCerrar = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const endpoint = tipo === 'curso' ? `/cursos/${item.id_cur}/cerrar` : `/eventos/${item.id_eve}/cerrar`;
      
      await api.put(endpoint, {
        estado: 'CERRADO'
      });

      // Generar certificados automáticamente
      const certificadosEndpoint = tipo === 'curso' 
        ? `/certificados/generar-curso/${item.id_cur}` 
        : `/certificados/generar-evento/${item.id_eve}`;
      
      await api.post(certificadosEndpoint);

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || `Error al cerrar el ${tipo}`);
    } finally {
      setLoading(false);
    }
  };

  const getTitulo = () => {
    const nombre = tipo === 'curso' ? item?.nom_cur : item?.nom_eve;
    return `Cerrar ${tipo === 'curso' ? 'Curso' : 'Evento'}: ${nombre}`;
  };

  const getDescripcion = () => {
    return `Una vez cerrado el ${tipo}, no se podrán modificar las notas${tipo === 'curso' ? ' ni' : ' o'} la asistencia de los participantes. Se generarán automáticamente los certificados para todos los participantes que cumplan con los criterios de aprobación.`;
  };

  const getCriterios = () => {
    const porcentaje = item?.porcentaje_asistencia_aprobacion || 80;
    const nota = item?.nota_minima_aprobacion;
    
    if (tipo === 'curso') {
      return `Criterios de aprobación: ${porcentaje}% de asistencia y nota mínima de ${nota}`;
    } else {
      return `Criterio de aprobación: ${porcentaje}% de asistencia`;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', color: '#d32f2f' }}>
        <Warning sx={{ mr: 1 }} />
        {getTitulo()}
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {getDescripcion()}
          </Typography>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            {getCriterios()}
          </Alert>
          
          <Alert severity="warning">
            <strong>¡Esta acción no se puede deshacer!</strong> Una vez cerrado el {tipo}, 
            el estado cambiará permanentemente y se generarán los certificados.
          </Alert>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button 
          onClick={onClose} 
          disabled={loading}
          color="inherit"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleCerrar}
          disabled={loading}
          variant="contained"
          color="error"
          startIcon={loading ? <CircularProgress size={20} /> : <CloseIcon />}
        >
          {loading ? 'Cerrando...' : `Cerrar ${tipo === 'curso' ? 'Curso' : 'Evento'}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CerrarCursoEvento;
