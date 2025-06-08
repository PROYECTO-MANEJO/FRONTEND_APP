import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Chip,
  IconButton
} from '@mui/material';
import { 
  InfoOutlined, 
  Close,
  Event,
  EventAvailable
} from '@mui/icons-material';
import ModalInscripcion from './ModalInscripcion';
import EstadoInscripcion from './EstadoInscripcion';
import { useInscripciones } from '../../hooks/useInscripciones';

const EventoCard = ({ evento }) => {
  const [open, setOpen] = useState(false);
  const [inscripcionOpen, setInscripcionOpen] = useState(false);
  
  // Hook para manejar inscripciones (solo si no es "mis eventos")
  const { obtenerEstadoEvento, cargarInscripciones } = useInscripciones();
  
  // Verificar si este es un evento de "mis eventos" (tiene estado_inscripcion)
  const esMiEvento = Boolean(evento.estado_inscripcion);
  
  // Si es "mi evento", usar la información del evento, si no, usar el hook
  const estadoInscripcion = esMiEvento 
    ? {
        inscrito: true,
        estado: evento.estado_inscripcion,
        fechaInscripcion: evento.fecha_inscripcion,
        metodoPago: evento.metodo_pago,
        valorPagado: evento.valor_pagado,
        enlacePago: evento.enlace_pago,
        fechaAprobacion: evento.fecha_aprobacion
      }
    : obtenerEstadoEvento(evento.id_eve);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  
  const handleInscripcionOpen = () => setInscripcionOpen(true);
  const handleInscripcionClose = () => setInscripcionOpen(false);
  
  const handleInscripcionExitosa = () => {
    // Recargar inscripciones después de una inscripción exitosa
    if (!esMiEvento) {
      cargarInscripciones();
    }
    console.log('Inscripción exitosa en evento:', evento.nom_eve);
  };

  return (
    <>
      <Card 
        elevation={2}
        sx={{ 
          borderRadius: 3,
          transition: 'all 0.2s ease-in-out',
          height: '300px', // ALTURA ABSOLUTA FIJA
          minHeight: '300px', // ALTURA MÍNIMA
          maxHeight: '300px', // ALTURA MÁXIMA
          display: 'flex', 
          width: '450px',
          flexDirection: 'column',
          position: 'relative',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4,
          },
        }}
      >
        <CardContent sx={{ 
          p: 2.5, 
          display: 'flex', 
          flexDirection: 'column',
          height: '100%',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Chips de EVENTO y ESTADO */}
          <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
            <Chip 
              label="EVENTO" 
              size="small" 
              icon={<Event sx={{ fontSize: '0.7rem' }} />}
              sx={{ 
                bgcolor: '#b91c1c', 
                color: 'white',
                fontWeight: 600,
                fontSize: '0.7rem',
                height: '20px'
              }}
            />
            {estadoInscripcion && (
              <EstadoInscripcion 
                estado={estadoInscripcion.estado} 
                size="small" 
              />
            )}
          </Box>

          {/* Título - altura controlada */}
          <Typography 
            variant="h6" 
            component="h3"
            sx={{ 
              fontWeight: 600, 
              color: 'text.primary',
              fontSize: '1rem',
              lineHeight: 1.2,
              mb: 1,
              height: '2.4rem', // ALTURA FIJA
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {evento.nom_eve}
          </Typography>

          {/* Descripción - altura controlada */}
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              fontSize: '0.825rem',
              lineHeight: 1.3,
              mb: 1.5,
              height: '3.9rem', // ALTURA FIJA
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {evento.des_eve}
          </Typography>

          {/* Información compacta */}
          <Box sx={{ mb: 'auto' }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.3 }}>
              <strong>Fecha:</strong> {new Date(evento.fec_ini_eve).toLocaleDateString()}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.3 }}>
              <strong>Área:</strong> {evento.are_eve}
            </Typography>
            {evento.organizador_nombre && (
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.3 }}>
                <strong>Organizador:</strong> {evento.organizador_nombre}
              </Typography>
            )}
            {evento.carreras && evento.carreras.length > 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                <strong>Carreras:</strong> {evento.carreras.length > 1 ? `${evento.carreras.length} carreras` : evento.carreras[0].nombre}
              </Typography>
            )}
            {evento.tipo_audiencia_eve === 'PUBLICO_GENERAL' && (
              <Typography variant="body2" color="primary" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                ✨ Abierto al público general
              </Typography>
            )}
            {evento.tipo_audiencia_eve === 'TODAS_CARRERAS' && (
              <Typography variant="body2" color="primary" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                🎓 Todas las carreras
              </Typography>
            )}
          </Box>

          {/* Botón en el fondo */}
          <Button
            variant="outlined"
            fullWidth
            size="small"
            startIcon={<InfoOutlined sx={{ fontSize: '0.9rem' }} />}
            onClick={handleOpen}
            sx={{ 
              borderColor: '#b91c1c',
              color: '#b91c1c',
              '&:hover': {
                borderColor: '#991b1b',
                backgroundColor: '#fef2f2',
              },
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.8rem',
              height: '32px',
              mt: 'auto'
            }}
          >
            Ver Detalles
          </Button>
        </CardContent>
      </Card>

      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="span">
            {evento.nom_eve}
          </Typography>
          <Button
            onClick={handleClose}
            color="inherit"
            size="small"
            sx={{ minWidth: 'auto', p: 1 }}
          >
            <Close />
          </Button>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                Descripción
              </Typography>
              <Typography variant="body2">
                {evento.des_eve}
              </Typography>
            </Box>
            
            <Divider />
            
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <Chip label={`Área: ${evento.are_eve}`} color="primary" variant="outlined" />
              <Chip label={`Audiencia: ${evento.tipo_audiencia_eve.replace(/_/g, ' ')}`} color="secondary" variant="outlined" />
              {evento.organizador_nombre && (
                <Chip label={`Organizador: ${evento.organizador_nombre}`} color="info" variant="outlined" />
              )}
            </Box>

            {/* Información de carreras */}
            {evento.carreras && evento.carreras.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Carreras Habilitadas
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {evento.carreras.map((carrera, index) => (
                    <Chip 
                      key={index} 
                      label={carrera.nombre} 
                      size="small" 
                      color="success" 
                      variant="outlined" 
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Estado de inscripción para "mis eventos" */}
            {esMiEvento && estadoInscripcion && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Estado de tu Inscripción
                </Typography>
                <EstadoInscripcion 
                  estado={estadoInscripcion.estado} 
                  size="large" 
                  showDetails={true}
                  estadoData={estadoInscripcion}
                />
              </Box>
            )}
            
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Fecha de Inicio
                </Typography>
                <Typography variant="body2">
                  {new Date(evento.fec_ini_eve).toLocaleDateString()}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Fecha de Fin
                </Typography>
                <Typography variant="body2">
                  {evento.fec_fin_eve ? new Date(evento.fec_fin_eve).toLocaleDateString() : 'No especificada'}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Hora de Inicio
                </Typography>
                <Typography variant="body2">
                  {evento.hor_ini_eve}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Hora de Fin
                </Typography>
                <Typography variant="body2">
                  {evento.hor_fin_eve || 'No especificada'}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Duración
                </Typography>
                <Typography variant="body2">
                  {evento.dur_eve} horas
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Capacidad Máxima
                </Typography>
                <Typography variant="body2">
                  {evento.capacidad_max_eve} personas
                </Typography>
              </Box>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                Ubicación
              </Typography>
              <Typography variant="body2">
                {evento.ubi_eve}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={handleClose} 
            variant="outlined"
            sx={{ borderRadius: 2, flex: 1 }}
          >
            Cerrar
          </Button>
          
          {/* Botón de inscripción solo si no está inscrito */}
          {!estadoInscripcion && (
            <Button
              onClick={handleInscripcionOpen}
              variant="contained"
              startIcon={<EventAvailable />}
              sx={{ borderRadius: 2, flex: 1 }}
            >
              Inscribirse
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Modal de Inscripción - solo para eventos disponibles */}
      {!esMiEvento && (
        <ModalInscripcion
          open={inscripcionOpen}
          onClose={handleInscripcionClose}
          tipo="evento"
          item={evento}
          onInscripcionExitosa={handleInscripcionExitosa}
        />
      )}
    </>
  );
};

export default EventoCard;