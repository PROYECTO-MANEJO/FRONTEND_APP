import React from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { 
  CheckCircle, 
  Schedule, 
  Cancel, 
  Description 
} from '@mui/icons-material';

const EstadoInscripcion = ({ 
  estado, 
  showDetails = false, 
  mostrarTexto = true, 
  dataCompleta = {} 
}) => {
  const getEstadoConfig = (estado) => {
    switch (estado) {
      case 'APROBADO':
        return {
          color: 'success',
          icon: <CheckCircle sx={{ fontSize: 16 }} />,
          texto: 'Aprobado',
          descripcion: 'Tu inscripción ha sido aprobada'
        };
      case 'PENDIENTE':
        return {
          color: 'warning',
          icon: <Schedule sx={{ fontSize: 16 }} />,
          texto: 'Pendiente',
          descripcion: 'Esperando aprobación del administrador'
        };
      case 'RECHAZADO':
        return {
          color: 'error',
          icon: <Cancel sx={{ fontSize: 16 }} />,
          texto: 'Rechazado',
          descripcion: 'Tu inscripción ha sido rechazada'
        };
      default:
        return {
          color: 'default',
          icon: <Schedule sx={{ fontSize: 16 }} />,
          texto: 'Desconocido',
          descripcion: 'Estado no definido'
        };
    }
  };

  const config = getEstadoConfig(estado);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip
          icon={config.icon}
          label={config.texto}
          color={config.color}
          size="small"
          variant="outlined"
        />
        {mostrarTexto && (
          <Typography variant="caption" color="text.secondary">
            {config.descripcion}
          </Typography>
        )}
      </Box>
      
      {showDetails && dataCompleta.fechaInscripcion && (
        <Typography variant="caption" sx={{ opacity: 0.8, display: 'block' }}>
          Inscrito: {new Date(dataCompleta.fechaInscripcion).toLocaleDateString()}
        </Typography>
      )}
      
      {showDetails && dataCompleta.fechaAprobacion && estado === 'APROBADO' && (
        <Typography variant="caption" sx={{ opacity: 0.8, display: 'block' }}>
          Aprobado: {new Date(dataCompleta.fechaAprobacion).toLocaleDateString()}
        </Typography>
      )}
      
      {(showDetails || mostrarTexto) && dataCompleta.metodoPago && (
        <Typography variant="caption" sx={{ opacity: 0.8, display: 'block' }}>
          Método de pago: {dataCompleta.metodoPago.replace(/TRANFERENCIA/g, 'TRANSFERENCIA').replace(/_/g, ' ')}
        </Typography>
      )}
      
      {showDetails && dataCompleta.valorPagado !== undefined && (
        <Typography variant="caption" sx={{ opacity: 0.8, display: 'block' }}>
          Valor: ${dataCompleta.valorPagado}
        </Typography>
      )}
      
      {showDetails && (dataCompleta.tieneComprobante || dataCompleta.enlacePago) && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Description sx={{ fontSize: 14, color: 'text.secondary' }} />
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            {dataCompleta.tieneComprobante ? 'Comprobante PDF enviado' : 'Comprobante de pago enviado'}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default EstadoInscripcion; 