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
  EventAvailable,
  CalendarToday,
  Schedule,
  LocationOn,
  People,
  AttachMoney
} from '@mui/icons-material';
import ModalInscripcion from './ModalInscripcion';
import EstadoInscripcion from './EstadoInscripcion';
import DocumentosAlert from './DocumentosAlert';
import { useInscripciones } from '../../hooks/useInscripciones';
import { useAuth } from '../../context/AuthContext';
import { useEstadoDisplay } from '../../hooks/useEstadoDisplay';
import api from '../../services/api';

const EventoCard = ({ evento }) => {
  const [open, setOpen] = useState(false);
  const [inscripcionOpen, setInscripcionOpen] = useState(false);
  const [documentosAlertOpen, setDocumentosAlertOpen] = useState(false);
  
  // Hook para manejar inscripciones (solo si no es "mis eventos")
  const { obtenerEstadoEvento, cargarInscripciones } = useInscripciones();
  
  // Hook para obtener información del usuario y documentos
  const { user } = useAuth();

  // Hook para manejar el estado de visualización
  const { estado: estadoDisplay, color: estadoColor } = useEstadoDisplay(evento, 'evento');
  
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

  // ✅ VERIFICAR DOCUMENTOS - OBLIGATORIO PARA TODAS LAS INSCRIPCIONES
  const isEstudiante = user?.rol === 'ESTUDIANTE';
  const documentosCompletos = user?.documentos ? (
    isEstudiante 
      ? (user.documentos.cedula_subida && user.documentos.matricula_subida)
      : user.documentos.cedula_subida
  ) : false;
  
  const documentosVerificados = user?.documentos?.documentos_verificados || false;
  const puedeInscribirse = documentosCompletos && documentosVerificados;

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  
  const handleInscripcionOpen = () => {
    // Solo abrir modal si el usuario puede inscribirse
    if (puedeInscribirse) {
      setInscripcionOpen(true);
    } else {
      // Mostrar alerta explicativa elegante
      setDocumentosAlertOpen(true);
    }
  };
  const handleInscripcionClose = () => setInscripcionOpen(false);
  
  const handleInscripcionExitosa = () => {
    // Recargar inscripciones después de una inscripción exitosa
    if (!esMiEvento) {
      cargarInscripciones();
    }
    console.log('Inscripción exitosa en evento:', evento.nom_eve);
  };

  // Función para formatear fechas
  const formatearFecha = (fecha) => {
    if (!fecha) return 'No especificada';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calcular el estado del evento basado en fechas y estado real
  const calcularEstadoEvento = (fechaInicio, fechaFin, estadoReal) => {
    // Si está cerrado, siempre mostrar FINALIZADO
    if (estadoReal === 'CERRADO') {
      return 'FINALIZADO';
    }

    const hoy = new Date();
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    if (hoy < inicio) {
      return 'PRÓXIMAMENTE';
    } else if (hoy >= inicio && hoy <= fin) {
      return 'EN CURSO';
    } else {
      // Si pasó la fecha fin y no está cerrado, verificar estado
      api.verificarYCerrarAutomaticamente('evento', evento.id_eve)
        .catch(error => console.error('Error verificando estado:', error));
      return 'FINALIZADO';
    }
  };

  // Función para determinar el color del estado del evento
  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'PRÓXIMAMENTE':
        return 'info';
      case 'EN CURSO':
        return 'success';
      case 'FINALIZADO':
        return 'error';
      default:
        return 'default';
    }
  };

  const estadoEvento = calcularEstadoEvento(evento.fec_ini_eve, evento.fec_fin_eve, evento.estado);

  return (
    <>
      <Card 
        className="fixed-card-size"
        width="400px" important
        height="380px" 
        minWidth="400px" 
        maxHeight="380px"
        flexShrink="0"
        style={{
          width: '400px',
          height: '380px',
          minWidth: '400px',
          maxWidth: '400px',
          minHeight: '380px',
          maxHeight: '380px',
          flexShrink: 0,
          flexGrow: 0,
          boxSizing: 'border-box'
        }}
        sx={{ 
          width: '400px !important',
          height: '380px !important',
          minWidth: '400px !important',
          maxWidth: '400px !important',
          minHeight: '380px !important',
          maxHeight: '380px !important',
          flexShrink: '0 !important',
          flexGrow: '0 !important',
          flexBasis: '400px !important',
          boxSizing: 'border-box',
          overflow: 'hidden !important',
          '&.MuiCard-root': {
            width: '400px !important',
            height: '380px !important',
            minWidth: '400px !important',
            maxWidth: '400px !important',
            minHeight: '380px !important',
            maxHeight: '380px !important',
          },
          '&.MuiPaper-root': {
            width: '400px !important',
            height: '380px !important',
            minWidth: '400px !important',
            maxWidth: '400px !important',
            minHeight: '380px !important',
            maxHeight: '380px !important',
          },
          '&.fixed-card-size': {
            width: '400px !important',
            height: '380px !important',
            minWidth: '400px !important',
            maxWidth: '400px !important',
            minHeight: '380px !important',
            maxHeight: '380px !important',
          },
          '& .MuiCardContent-root': {
            height: '100%',
            padding: '16px !important',
            boxSizing: 'border-box',
            display: 'flex !important',
            flexDirection: 'column !important',
            overflow: 'hidden !important',
          },
          '&:hover': {
            boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
            transform: 'translateY(-2px)',
            transition: 'all 0.3s ease'
          }
        }}
      >
        <CardContent sx={{
          height: '100% !important',
          padding: '16px !important',
          display: 'flex !important',
          flexDirection: 'column !important',
          overflow: 'hidden !important',
          boxSizing: 'border-box !important',
          '&.MuiCardContent-root': {
            height: '100% !important',
            padding: '16px !important',
            display: 'flex !important',
            flexDirection: 'column !important',
            overflow: 'hidden !important',
          }
        }}>
          {/* Chips de EVENTO y ESTADO */}
          <Box sx={{ 
            display: 'flex', 
            gap: 0.5, 
            mb: 1, 
            flexWrap: 'wrap',
            height: '24px !important',
            minHeight: '24px !important',
            maxHeight: '24px !important',
            flexShrink: '0 !important',
            overflow: 'hidden'
          }}>
            <Chip 
              label="EVENTO" 
              size="small" 
              icon={<Event sx={{ fontSize: '0.7rem' }} />}
              sx={{ 
                bgcolor: '#d32f2f', 
                color: 'white',
                fontWeight: 600,
                fontSize: '0.7rem',
                height: '20px'
              }}
            />
            <Chip
              label={estadoDisplay}
              size="small"
              color={estadoColor}
              sx={{
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

          {/* Título con altura fija */}
          <Typography 
            variant="h6" 
            component="h2" 
            sx={{ 
              fontSize: '1rem',
              fontWeight: 600,
              mb: 1,
              height: '40px !important',
              minHeight: '40px !important',
              maxHeight: '40px !important',
              lineHeight: '20px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden !important',
              flexShrink: '0 !important'
            }}
          >
            {evento.nom_eve}
          </Typography>

          {/* Descripción con altura fija */}
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 2,
              height: '60px !important',
              minHeight: '60px !important',
              maxHeight: '60px !important',
              lineHeight: '20px',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden !important',
              flexShrink: '0 !important'
            }}
          >
            {evento.des_eve}
          </Typography>

          {/* Detalles con altura fija */}
          <Box sx={{ 
            mb: 2,
            height: '140px !important',
            minHeight: '140px !important',
            maxHeight: '140px !important',
            overflow: 'hidden !important',
            flexShrink: '0 !important'
          }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.3, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CalendarToday sx={{ fontSize: '0.875rem' }} />
              <strong>Fecha:</strong> {formatearFecha(evento.fec_ini_eve)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.3, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Schedule sx={{ fontSize: '0.875rem' }} />
              <strong>Duración:</strong> {evento.dur_eve || 'No especificada'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.3, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <LocationOn sx={{ fontSize: '0.875rem' }} />
              <strong>Lugar:</strong> {evento.lug_eve || 'Por definir'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.3, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <People sx={{ fontSize: '0.875rem' }} />
              <strong>Cupos:</strong> {evento.cupos_ocupados_eve || 0}/{evento.cupos_eve || 'Ilimitados'}
            </Typography>
            {evento.costo_eve > 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.3, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AttachMoney sx={{ fontSize: '0.875rem' }} />
                <strong>Costo:</strong> ${evento.costo_eve}
              </Typography>
            )}
          </Box>

          {/* Botones con altura fija */}
          <Box sx={{ 
            mt: 'auto',
            pt: 1,
            height: '36px !important',
            minHeight: '36px !important',
            maxHeight: '36px !important',
            display: 'flex',
            gap: 1,
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: '0 !important'
          }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<InfoOutlined />}
              onClick={handleOpen}
              sx={{ 
                borderColor: '#d32f2f',
                color: '#d32f2f',
                '&:hover': {
                  borderColor: '#9a0007',
                  backgroundColor: 'rgba(211, 47, 47, 0.04)'
                }
              }}
            >
              Ver Detalles
            </Button>
            {!esMiEvento && (
              <Button
                variant="contained"
                size="small"
                onClick={handleInscripcionOpen}
                disabled={!puedeInscribirse || estadoInscripcion?.inscrito}
                sx={{ 
                  bgcolor: '#d32f2f',
                  '&:hover': {
                    bgcolor: '#9a0007'
                  },
                  '&.Mui-disabled': {
                    bgcolor: 'rgba(211, 47, 47, 0.12)'
                  }
                }}
              >
                {estadoInscripcion?.inscrito ? 'Inscrito' : 'Inscribirse'}
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Modal de Detalles */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Typography variant="h6" component="div" sx={{ pr: 2 }}>
              {evento.nom_eve}
            </Typography>
            <IconButton
              aria-label="close"
              onClick={handleClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 2 }}>
            <Chip
              label={estadoDisplay}
              color={estadoColor}
              sx={{ fontWeight: 600 }}
            />
            {estadoInscripcion && (
              <EstadoInscripcion 
                estado={estadoInscripcion.estado}
                sx={{ ml: 1 }}
              />
            )}
          </Box>

          <Typography variant="body1" paragraph>
            {evento.desc_eve || 'No hay descripción disponible.'}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarToday color="action" />
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Fecha de Inicio
                </Typography>
                <Typography variant="body2">
                  {formatearFecha(evento.fec_ini_eve)}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarToday color="action" />
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Fecha de Fin
                </Typography>
                <Typography variant="body2">
                  {formatearFecha(evento.fec_fin_eve)}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Schedule color="action" />
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Horario
                </Typography>
                <Typography variant="body2">
                  {evento.hora_ini_eve || 'No especificado'}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOn color="action" />
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Lugar
                </Typography>
                <Typography variant="body2">
                  {evento.lugar_eve || 'Por definir'}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <People color="action" />
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Cupos Disponibles
                </Typography>
                <Typography variant="body2">
                  {evento.cupos_ocupados_eve || 0}/{evento.cupos_eve || 'Ilimitados'}
                </Typography>
              </Box>
            </Box>

            {evento.costo_eve > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AttachMoney color="action" />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Costo
                  </Typography>
                  <Typography variant="body2">
                    ${evento.costo_eve}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cerrar</Button>
          {!esMiEvento && (
            <Button
              variant="contained"
              onClick={handleInscripcionOpen}
              disabled={!puedeInscribirse || estadoInscripcion?.inscrito}
              sx={{ 
                bgcolor: '#d32f2f',
                '&:hover': {
                  bgcolor: '#9a0007'
                }
              }}
            >
              {estadoInscripcion?.inscrito ? 'Inscrito' : 'Inscribirse'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Modal de Inscripción */}
      <ModalInscripcion
        open={inscripcionOpen}
        onClose={handleInscripcionClose}
        onSuccess={handleInscripcionExitosa}
        item={evento}
        tipo="evento"
      />

      {/* Alerta de Documentos */}
      <DocumentosAlert
        open={documentosAlertOpen}
        onClose={() => setDocumentosAlertOpen(false)}
        isEstudiante={isEstudiante}
      />
    </>
  );
};

export default EventoCard;