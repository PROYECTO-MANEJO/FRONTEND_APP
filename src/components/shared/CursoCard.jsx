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
  School,
  CalendarToday,
  Schedule,
  Category,
  Person,
  People,
  LocationOn,
  AttachMoney
} from '@mui/icons-material';
import ModalInscripcion from './ModalInscripcion';
import EstadoInscripcion from './EstadoInscripcion';
import DocumentosAlert from './DocumentosAlert';
import { useInscripciones } from '../../hooks/useInscripciones';
import { useAuth } from '../../context/AuthContext';
import { useEstadoDisplay } from '../../hooks/useEstadoDisplay';
import api from '../../services/api';

const CursoCard = ({ curso }) => {
  const [open, setOpen] = useState(false);
  const [inscripcionOpen, setInscripcionOpen] = useState(false);
  const [documentosAlertOpen, setDocumentosAlertOpen] = useState(false);
  
  // Hook para manejar inscripciones (solo si no es "mis cursos")
  const { obtenerEstadoCurso, cargarInscripciones } = useInscripciones();
  
  // Hook para obtener información del usuario y documentos
  const { user } = useAuth();

  // Hook para manejar el estado de visualización
  const { estado: estadoDisplay, color: estadoColor } = useEstadoDisplay(curso, 'curso');
  
  // Verificar si este es un curso de "mis cursos" (tiene estado_inscripcion)
  const esMiCurso = Boolean(curso.estado_inscripcion);
  
  // Si es "mi curso", usar la información del curso, si no, usar el hook
  const estadoInscripcion = esMiCurso 
    ? {
        inscrito: true,
        estado: curso.estado_inscripcion,
        fechaInscripcion: curso.fecha_inscripcion,
        metodoPago: curso.metodo_pago,
        valorPagado: curso.valor_pagado,
        enlacePago: curso.enlace_pago,
        fechaAprobacion: curso.fecha_aprobacion
      }
    : obtenerEstadoCurso(curso.id_cur);

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
    if (!esMiCurso) {
      cargarInscripciones();
    }
    console.log('Inscripción exitosa en curso:', curso.nom_cur);
  };

  // Calcular el estado del curso basado en fechas y estado real
  const calcularEstadoCurso = (fechaInicio, fechaFin, estadoReal) => {
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
      api.verificarYCerrarAutomaticamente('curso', curso.id_cur)
        .catch(error => console.error('Error verificando estado:', error));
      return 'FINALIZADO';
    }
  };

  // Función para determinar el color del estado del curso
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

  // Función para formatear fechas
  const formatearFecha = (fecha) => {
    if (!fecha) return 'No especificada';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const estadoCurso = calcularEstadoCurso(curso.fec_ini_cur, curso.fec_fin_cur, curso.estado);

  return (
    <>
      <Card 
        className="fixed-card-size"
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
          {/* Chips de CURSO y ESTADO */}
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
              label="CURSO" 
              size="small" 
              icon={<School sx={{ fontSize: '0.7rem' }} />}
              sx={{ 
                bgcolor: '#2e7d32', 
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
            {curso.nom_cur}
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
            {curso.des_cur}
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
              <strong>Fecha:</strong> {formatearFecha(curso.fec_ini_cur)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.3, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Schedule sx={{ fontSize: '0.875rem' }} />
              <strong>Duración:</strong> {curso.dur_cur || 'No especificada'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.3, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <LocationOn sx={{ fontSize: '0.875rem' }} />
              <strong>Lugar:</strong> {curso.lug_cur || 'Por definir'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.3, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <People sx={{ fontSize: '0.875rem' }} />
              <strong>Cupos:</strong> {curso.cupos_ocupados_cur || 0}/{curso.cupos_cur || 'Ilimitados'}
            </Typography>
            {curso.costo_cur > 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.3, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AttachMoney sx={{ fontSize: '0.875rem' }} />
                <strong>Costo:</strong> ${curso.costo_cur}
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
                borderColor: '#2e7d32',
                color: '#2e7d32',
                '&:hover': {
                  borderColor: '#1b5e20',
                  backgroundColor: 'rgba(46, 125, 50, 0.04)'
                }
              }}
            >
              Ver Detalles
            </Button>
            {!esMiCurso && (
              <Button
                variant="contained"
                size="small"
                onClick={handleInscripcionOpen}
                disabled={!puedeInscribirse || estadoInscripcion?.inscrito}
                sx={{ 
                  bgcolor: '#2e7d32',
                  '&:hover': {
                    bgcolor: '#1b5e20'
                  },
                  '&.Mui-disabled': {
                    bgcolor: 'rgba(46, 125, 50, 0.12)'
                  }
                }}
              >
                {estadoInscripcion?.inscrito ? 'Inscrito' : 'Inscribirse'}
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Modal de detalles */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <School color="primary" />
            <Typography variant="h6">
              Detalles del Curso
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Título y estado */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h5" color="primary" sx={{ fontWeight: 600, flex: 1 }}>
                  {curso.nom_cur}
                </Typography>
                <Chip 
                  label={estadoDisplay} 
                  color={estadoColor}
                  sx={{ fontWeight: 600 }}
                />
              </Box>
              
              <Typography variant="body1" color="text.secondary" paragraph>
                {curso.des_cur}
              </Typography>
            </Box>

            <Divider />

            {/* Información principal */}
            <Box>
              <Typography variant="h6" color="primary" gutterBottom>
                Información del Curso
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Fecha de Inicio
                  </Typography>
                  <Typography variant="body2">
                    {formatearFecha(curso.fec_ini_cur)}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Fecha de Fin
                  </Typography>
                  <Typography variant="body2">
                    {formatearFecha(curso.fec_fin_cur)}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Duración Total
                  </Typography>
                  <Typography variant="body2">
                    {curso.dur_cur} horas
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Capacidad Máxima
                  </Typography>
                  <Typography variant="body2">
                    {curso.capacidad_max_cur} estudiantes
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Categoría
                  </Typography>
                  <Typography variant="body2">
                    {curso.categoria_nombre || 'Sin categoría'}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Organizador
                  </Typography>
                  <Typography variant="body2">
                    {curso.organizador_nombre || 'Sin organizador'}
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Costo
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2">
                    {curso.es_gratuito ? 'Gratuito' : `$${curso.precio} USD`}
                  </Typography>
                  <Chip 
                    label={curso.es_gratuito ? 'GRATIS' : 'PAGADO'} 
                    size="small"
                    color={curso.es_gratuito ? 'success' : 'warning'}
                    variant="outlined"
                  />
                </Box>
              </Box>
            </Box>

            {/* Carreras habilitadas */}
            {curso.carreras && curso.carreras.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Carreras Habilitadas
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {curso.carreras.map((carrera, index) => (
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

            {/* Estado de inscripción para "mis cursos" */}
            {esMiCurso && estadoInscripcion && (
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

            <Divider />

            {/* Información adicional */}
            <Box>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                Tipo de Audiencia
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {curso.tipo_audiencia_cur === 'PUBLICO_GENERAL' && 'Público General'}
                {curso.tipo_audiencia_cur === 'TODAS_CARRERAS' && 'Todas las Carreras'}
                {curso.tipo_audiencia_cur === 'CARRERA_ESPECIFICA' && 'Carreras Específicas'}
              </Typography>

              {/* ✅ REQUISITOS DE DOCUMENTOS - OBLIGATORIOS PARA TODOS */}
              <Box>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Requisitos de Inscripción
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Chip 
                    label="📄 Verificación de documentos obligatoria" 
                    color="error"
                    variant="outlined"
                    size="small"
                  />
                  {!puedeInscribirse && !esMiCurso && (
                    <Box sx={{ p: 1.5, bgcolor: 'warning.light', borderRadius: 1 }}>
                      <Typography variant="body2" color="warning.dark" sx={{ fontWeight: 600 }}>
                        ⚠️ Para inscribirte necesitas:
                      </Typography>
                      <Typography variant="body2" color="warning.dark">
                        • {!documentosCompletos ? `Subir tu cédula${isEstudiante ? ' y matrícula' : ''}` : '✓ Documentos subidos'}
                      </Typography>
                      <Typography variant="body2" color="warning.dark">
                        • {!documentosVerificados ? 'Verificación por administrador' : '✓ Documentos verificados'}
                      </Typography>
                      <Typography variant="caption" color="warning.dark" sx={{ mt: 0.5, display: 'block' }}>
                        Ve a tu perfil para gestionar tus documentos.
                      </Typography>
                    </Box>
                  )}
                  {puedeInscribirse && !esMiCurso && (
                    <Box sx={{ p: 1, bgcolor: 'success.light', borderRadius: 1 }}>
                      <Typography variant="body2" color="success.dark" sx={{ fontWeight: 600 }}>
                        ✅ Cumples con todos los requisitos
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
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
              disabled={!puedeInscribirse}
              startIcon={<School />}
              sx={{ 
                borderRadius: 2, 
                flex: 1,
                ...(puedeInscribirse ? {} : {
                  bgcolor: 'grey.400',
                  color: 'grey.600',
                  '&:hover': {
                    bgcolor: 'grey.400'
                  }
                })
              }}
            >
              {puedeInscribirse ? 'Inscribirse' : 'Documentos Requeridos'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Modal de Inscripción - solo para cursos disponibles */}
      {!esMiCurso && (
        <ModalInscripcion
          open={inscripcionOpen}
          onClose={handleInscripcionClose}
          tipo="curso"
          item={curso}
          onInscripcionExitosa={handleInscripcionExitosa}
        />
      )}

      {/* Alerta de documentos */}
      <DocumentosAlert
        open={documentosAlertOpen}
        onClose={() => setDocumentosAlertOpen(false)}
        user={user}
      />
    </>
  );
};

export default CursoCard;
