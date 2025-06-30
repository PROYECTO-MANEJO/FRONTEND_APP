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
import { useAuth } from '../../context/AuthContext';

const CursoCard = ({ curso }) => {
  const [open, setOpen] = useState(false);
  const [inscripcionOpen, setInscripcionOpen] = useState(false);
  
  // Hook para manejar inscripciones (solo si no es "mis cursos")
  const { obtenerEstadoCurso, cargarInscripciones } = useInscripciones();
  
  // Hook para obtener información del usuario y documentos
  const { user } = useAuth();
  
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
        height: '300px',
        minHeight: '300px',
        maxHeight: '300px',
        width: '100%',
        minWidth: '400px',
        maxWidth: '400px',
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
        }
      }}>
        <CardContent sx={{ 
          p: 2.5, 
          display: 'flex', 
          flexDirection: 'column',
          height: '100%',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Chips de CURSO y ESTADO */}
          <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
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
            {curso.nom_cur}
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
            {curso.des_cur}
          </Typography>

          {/* Información compacta */}
          <Box sx={{ mb: 'auto' }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.3 }}>
              <strong>Fecha:</strong> {new Date(curso.fec_ini_cur).toLocaleDateString()}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.3 }}>
              <strong>Duración:</strong> {curso.dur_cur} horas
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.3 }}>
              <strong>Precio:</strong> {curso.es_gratuito ? 'Gratuito' : `$${curso.precio}`}
            </Typography>
            {curso.organizador_nombre && (
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.3 }}>
                <strong>Organizador:</strong> {curso.organizador_nombre}
              </Typography>
            )}
            {curso.carreras && curso.carreras.length > 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                <strong>Carreras:</strong> {curso.carreras.length > 1 ? `${curso.carreras.length} carreras` : curso.carreras[0].nombre}
              </Typography>
            )}
            {curso.tipo_audiencia_cur === 'PUBLICO_GENERAL' && (
              <Typography variant="body2" color="primary" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                ✨ Abierto al público general
              </Typography>
            )}
            {curso.tipo_audiencia_cur === 'TODAS_CARRERAS' && (
              <Typography variant="body2" color="primary" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                🎓 Todas las carreras
              </Typography>
            )}
          </Box>
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
              borderColor: '#2e7d32',
              color: '#2e7d32',
              '&:hover': {
                borderColor: '#1b5e20',
                backgroundColor: '#f1f8e9',
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
    </>
  );
};

export default CursoCard;
