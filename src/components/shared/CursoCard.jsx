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
import { useInscripciones } from '../../hooks/useInscripciones';

const CursoCard = ({ curso }) => {
  const [open, setOpen] = useState(false);
  const [inscripcionOpen, setInscripcionOpen] = useState(false);
  
  // Hook para manejar inscripciones (solo si no es "mis cursos")
  const { obtenerEstadoCurso, cargarInscripciones } = useInscripciones();
  
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

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  
  const handleInscripcionOpen = () => setInscripcionOpen(true);
  const handleInscripcionClose = () => setInscripcionOpen(false);
  
  const handleInscripcionExitosa = () => {
    // Recargar inscripciones después de una inscripción exitosa
    if (!esMiCurso) {
      cargarInscripciones();
    }
    console.log('Inscripción exitosa en curso:', curso.nom_cur);
  };

  // Función para determinar el color del estado del curso
  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'PRÓXIMAMENTE':
        return 'info';
      case 'EN CURSO':
        return 'success';
      case 'FINALIZADO':
        return 'default';
      default:
        return 'primary';
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

  // Calcular el estado del curso basado en fechas
  const calcularEstadoCurso = (fechaInicio, fechaFin) => {
    const hoy = new Date();
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    if (hoy < inicio) {
      return 'PRÓXIMAMENTE';
    } else if (hoy >= inicio && hoy <= fin) {
      return 'EN CURSO';
    } else {
      return 'FINALIZADO';
    }
  };

  const estadoCurso = curso.estado || calcularEstadoCurso(curso.fec_ini_cur, curso.fec_fin_cur);

  return (
    <>
      <Card sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
        }
      }}>
        <CardContent sx={{ flexGrow: 1, p: 2 }}>
          {/* Header con estado e inscripción */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Chip 
              label={estadoCurso} 
              color={getEstadoColor(estadoCurso)}
              size="small"
              sx={{ fontWeight: 600 }}
            />
            {estadoInscripcion && (
              <EstadoInscripcion estado={estadoInscripcion.estado} size="small" />
            )}
          </Box>

          {/* Título del curso */}
          <Typography variant="h6" sx={{ 
            fontWeight: 'bold', 
            mb: 1, 
            lineHeight: 1.2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
            {curso.nom_cur}
          </Typography>

          {/* Descripción */}
          <Typography variant="body2" color="text.secondary" sx={{ 
            mb: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
            {curso.des_cur}
          </Typography>

          {/* Información básica */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {formatearFecha(curso.fec_ini_cur)}
                {curso.fec_fin_cur && curso.fec_fin_cur !== curso.fec_ini_cur && 
                  ` - ${formatearFecha(curso.fec_fin_cur)}`
                }
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Schedule sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {curso.dur_cur} horas totales
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Category sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {curso.categoria_nombre || 'Sin categoría'}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AttachMoney sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {curso.es_gratuito ? 'Gratuito' : `$${curso.precio}`}
              </Typography>
            </Box>
          </Box>

          {/* Carreras habilitadas (chips) */}
          {curso.carreras && curso.carreras.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {curso.carreras.slice(0, 2).map((carrera, index) => (
                  <Chip 
                    key={index} 
                    label={carrera.nombre} 
                    size="small" 
                    color="primary" 
                    variant="outlined" 
                  />
                ))}
                {curso.carreras.length > 2 && (
                  <Chip 
                    label={`+${curso.carreras.length - 2} más`} 
                    size="small" 
                    variant="outlined" 
                  />
                )}
              </Box>
            </Box>
          )}
        </CardContent>

        {/* Footer con botón */}
        <Box sx={{ p: 2, pt: 0 }}>
          <Button
            variant="outlined"
            fullWidth
            size="small"
            startIcon={<InfoOutlined />}
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
              height: '32px'
            }}
          >
            Ver Detalles
          </Button>
        </Box>
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
                  label={estadoCurso} 
                  color={getEstadoColor(estadoCurso)}
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

              {curso.requiere_verificacion_docs && (
                <Box>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Requisitos
                  </Typography>
                  <Chip 
                    label="Requiere verificación de documentos" 
                    color="warning" 
                    variant="outlined"
                    size="small"
                  />
                </Box>
              )}
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
              startIcon={<School />}
              sx={{ borderRadius: 2, flex: 1 }}
            >
              Inscribirse
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
    </>
  );
};

export default CursoCard;
