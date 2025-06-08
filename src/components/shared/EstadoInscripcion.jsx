import React from 'react';
import { Chip, Box, Typography } from '@mui/material';
import { 
  CheckCircle, 
  Schedule, 
  Cancel, 
  Warning,
  Payment
} from '@mui/icons-material';

const EstadoInscripcion = ({ 
  estado, 
  tamaño = 'small', 
  size = 'small', 
  mostrarTexto = false, 
  showDetails = false,
  estadoData = null 
}) => {
  // Compatibilidad: usar 'size' como prioridad, luego 'tamaño'
  const finalSize = size || tamaño;
  
  // Compatibilidad: si estado es un string, convertirlo al formato esperado
  let estadoInfo;
  if (typeof estado === 'string') {
    estadoInfo = { inscrito: true, estado: estado };
  } else if (estado && typeof estado === 'object') {
    estadoInfo = estado;
  } else {
    return null;
  }

  // Si no está inscrito, no mostrar nada
  if (!estadoInfo || !estadoInfo.inscrito) return null;

  // Usar estadoData si está disponible, sino usar estadoInfo
  const dataCompleta = estadoData || estadoInfo;

  const getEstadoConfig = () => {
    switch (estadoInfo.estado) {
      case 'APROBADO':
        return {
          label: 'Aprobado',
          color: 'success',
          icon: <CheckCircle sx={{ fontSize: '0.8rem' }} />,
          descripcion: 'Tu inscripción ha sido aprobada',
          bgColor: '#e8f5e8',
          textColor: '#2e7d32'
        };
      case 'PENDIENTE':
        return {
          label: 'Pendiente',
          color: 'warning',
          icon: <Schedule sx={{ fontSize: '0.8rem' }} />,
          descripcion: 'Tu inscripción está pendiente de revisión',
          bgColor: '#fff3e0',
          textColor: '#f57c00'
        };
      case 'RECHAZADO':
        return {
          label: 'Rechazado',
          color: 'error',
          icon: <Cancel sx={{ fontSize: '0.8rem' }} />,
          descripcion: 'Tu inscripción fue rechazada. Puedes volver a inscribirte.',
          bgColor: '#ffebee',
          textColor: '#d32f2f'
        };
      default:
        return {
          label: 'En Proceso',
          color: 'info',
          icon: <Payment sx={{ fontSize: '0.8rem' }} />,
          descripcion: 'Procesando tu inscripción',
          bgColor: '#e3f2fd',
          textColor: '#1976d2'
        };
    }
  };

  const config = getEstadoConfig();

  if (finalSize === 'small') {
    return (
      <Chip
        size="small"
        label={config.label}
        color={config.color}
        icon={config.icon}
        sx={{
          fontWeight: 600,
          fontSize: '0.7rem',
          height: '20px'
        }}
      />
    );
  }

  if (finalSize === 'medium') {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          backgroundColor: config.bgColor,
          color: config.textColor,
          px: 1.5,
          py: 0.5,
          borderRadius: 2,
          border: `1px solid ${config.textColor}20`
        }}
      >
        {config.icon}
        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
          {config.label}
        </Typography>
      </Box>
    );
  }

  // Tamaño large con descripción
  return (
    <Box
      sx={{
        backgroundColor: config.bgColor,
        color: config.textColor,
        p: 2,
        borderRadius: 2,
        border: `1px solid ${config.textColor}20`
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        {config.icon}
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Estado: {config.label}
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ mb: 1 }}>
        {config.descripcion}
      </Typography>
      
      {/* Información de fechas */}
      {dataCompleta.fechaInscripcion && (
        <Typography variant="caption" sx={{ opacity: 0.8, display: 'block' }}>
          Inscrito el: {new Date(dataCompleta.fechaInscripcion).toLocaleDateString()}
        </Typography>
      )}
      {dataCompleta.fechaAprobacion && estadoInfo.estado === 'APROBADO' && (
        <Typography variant="caption" sx={{ opacity: 0.8, display: 'block' }}>
          Aprobado el: {new Date(dataCompleta.fechaAprobacion).toLocaleDateString()}
        </Typography>
      )}
      
      {/* Información adicional si showDetails está activado o mostrarTexto */}
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
      
      {showDetails && dataCompleta.enlacePago && (
        <Typography variant="caption" sx={{ opacity: 0.8, display: 'block' }}>
          Comprobante de pago enviado
        </Typography>
      )}
    </Box>
  );
};

export default EstadoInscripcion; 