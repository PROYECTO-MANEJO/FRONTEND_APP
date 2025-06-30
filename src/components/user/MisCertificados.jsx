import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Grid, 
  Box, 
  Chip, 
  Alert, 
  CircularProgress,
  Tabs,
  Tab,
  Paper,
  Divider
} from '@mui/material';
import {
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Event as EventIcon,
  School as SchoolIcon,
  DateRange as DateRangeIcon,
  Grade as GradeIcon,
  Groups as GroupsIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { obtenerParticipacionesTerminadas, descargarCertificado } from '../../services/certificadoService';
import UserSidebar from './UserSidebar';
import { useUserSidebarLayout } from '../../hooks/useUserSidebarLayout';

const MisCertificados = () => {
  const { getMainContentStyle } = useUserSidebarLayout();
  const [participaciones, setParticipaciones] = useState({ eventos: [], cursos: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    cargarParticipaciones();
  }, []);

  const cargarParticipaciones = async () => {
    try {
      setLoading(true);
      const response = await obtenerParticipacionesTerminadas();
      setParticipaciones(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar las participaciones: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDescargarCertificado = async (tipo, idParticipacion) => {
    try {
      setDownloading(idParticipacion);
      await descargarCertificado(tipo, idParticipacion);
      // Mostrar mensaje de éxito (podrías usar un snackbar aquí)
    } catch (err) {
      setError('Error al descargar certificado: ' + (err.response?.data?.message || err.message));
    } finally {
      setDownloading(null);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

    const CardParticipacion = ({ participacion, tipo }) => {
    const esAprobado = participacion.aprobado;
    const tieneCertificado = participacion.tiene_certificado_pdf;

    return (
      <Card 
        sx={{ 
          mb: 2, 
          borderRadius: 2,
          boxShadow: 2,
          '&:hover': {
            boxShadow: 4,
            transform: 'translateY(-2px)',
            transition: 'all 0.3s ease'
          }
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Header con tipo y estado */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Chip
              label={tipo.toUpperCase()}
              color={tipo === 'evento' ? 'primary' : 'secondary'}
              size="small"
              sx={{ fontWeight: 'bold' }}
            />
            <Chip
              icon={esAprobado ? <CheckCircleIcon /> : <CancelIcon />}
              label={esAprobado ? 'Aprobado' : 'Reprobado'}
              color={esAprobado ? 'success' : 'error'}
              variant="filled"
              size="small"
            />
          </Box>

          {/* Título del evento/curso */}
          <Typography 
            variant="h6" 
            component="h3" 
            sx={{ 
              fontWeight: 'bold', 
              mb: 2,
              color: 'text.primary'
            }}
          >
            {tipo === 'evento' ? participacion.evento : participacion.curso}
          </Typography>

          {/* Información de métricas */}
          <Box sx={{ mb: 2 }}>
            {tipo === 'evento' ? (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <GradeIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Asistencia: 
                  <Typography 
                    component="span" 
                    variant="body2" 
                    sx={{ 
                      ml: 0.5, 
                      fontWeight: 'bold',
                      color: participacion.asi_par >= 70 ? 'success.main' : 'error.main'
                    }}
                  >
                    {participacion.asi_par}%
                  </Typography>
                </Typography>
              </Box>
            ) : (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <GradeIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    Nota Final: 
                    <Typography 
                      component="span" 
                      variant="body2" 
                      sx={{ 
                        ml: 0.5, 
                        fontWeight: 'bold',
                        color: participacion.nota_final >= 70 ? 'success.main' : 'error.main'
                      }}
                    >
                      {participacion.nota_final}/100
                    </Typography>
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <GroupsIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    Asistencia: 
                    <Typography 
                      component="span" 
                      variant="body2" 
                      sx={{ 
                        ml: 0.5, 
                        fontWeight: 'bold',
                        color: participacion.asistencia_porcentaje >= 70 ? 'success.main' : 'error.main'
                      }}
                    >
                      {participacion.asistencia_porcentaje}%
                    </Typography>
                  </Typography>
                </Box>
              </>
            )}
            
            {/* Información del participante */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <GroupsIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Participante: {participacion.usuario}
              </Typography>
            </Box>

            {/* Fecha de certificado */}
            {esAprobado && tieneCertificado && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <DateRangeIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Certificado: {formatearFecha(tipo === 'evento' ? participacion.fec_cer_par : participacion.fec_cer_par_cur)}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Estado de comprobante */}
          <Box sx={{ mb: 2 }}>
            {esAprobado && tieneCertificado ? (
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', color: 'success.main' }}>
                <CheckCircleIcon sx={{ mr: 1, fontSize: 16 }} />
                Certificado PDF disponible
              </Typography>
            ) : esAprobado ? (
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', color: 'warning.main' }}>
                <CircularProgress size={16} sx={{ mr: 1 }} />
                Generando certificado...
              </Typography>
            ) : (
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', color: 'error.main' }}>
                <CancelIcon sx={{ mr: 1, fontSize: 16 }} />
                No cumple requisitos para certificado
              </Typography>
            )}
          </Box>

          {/* Botón de descarga */}
          {esAprobado && tieneCertificado && (
            <Button
              variant="contained"
              color="success"
              fullWidth
              startIcon={downloading === (tipo === 'evento' ? participacion.id_par : participacion.id_par_cur) ? 
                <CircularProgress size={16} color="inherit" /> : <DownloadIcon />}
              onClick={() => handleDescargarCertificado(
                tipo,
                tipo === 'evento' ? participacion.id_par : participacion.id_par_cur
              )}
              disabled={downloading === (tipo === 'evento' ? participacion.id_par : participacion.id_par_cur)}
              sx={{ 
                mt: 1,
                py: 1,
                fontWeight: 'bold',
                boxShadow: 2,
                '&:hover': {
                  boxShadow: 4
                }
              }}
            >
              {downloading === (tipo === 'evento' ? participacion.id_par : participacion.id_par_cur) ? 
                'Descargando...' : 'Descargar Certificado'}
            </Button>
          )}

          {/* Mensaje informativo para reprobados */}
          {!esAprobado && (
            <Alert severity="info" variant="outlined" sx={{ mt: 2 }}>
              <Typography variant="body2">
                {tipo === 'evento' ? 
                  'Se requiere mínimo 70% de asistencia para obtener certificado' :
                  'Se requiere mínimo 70% de nota final y 70% de asistencia para obtener certificado'
                }
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  };

  const EventosSection = ({ eventos }) => {
    return (
      <Box>
        {eventos.length > 0 ? (
          <Grid container spacing={3}>
            {eventos.map((evento) => (
              <Grid item xs={12} md={6} lg={4} key={evento.id_par}>
                <CardParticipacion participacion={evento} tipo="evento" />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <EventIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No tienes eventos terminados
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Los eventos aparecerán aquí una vez que finalicen
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  const CursosSection = ({ cursos }) => {
    return (
      <Box>
        {cursos.length > 0 ? (
          <Grid container spacing={3}>
            {cursos.map((curso) => (
              <Grid item xs={12} md={6} lg={4} key={curso.id_par_cur}>
                <CardParticipacion participacion={curso} tipo="curso" />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No tienes cursos terminados
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Los cursos aparecerán aquí una vez que finalicen
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress size={50} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Cargando participaciones...
        </Typography>
      </Box>
    );
  }

  // Calcular estadísticas
  const totalEventos = participaciones.eventos?.length || 0;
  const totalCursos = participaciones.cursos?.length || 0;
  const eventosAprobados = participaciones.eventos?.filter(e => e.aprobado).length || 0;
  const cursosAprobados = participaciones.cursos?.filter(c => c.aprobado).length || 0;
  const totalAprobados = eventosAprobados + cursosAprobados;
  const totalParticipaciones = totalEventos + totalCursos;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center' }}>
        Mis Certificados y Participaciones
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Estadísticas */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={3}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 2, 
              textAlign: 'center',
              borderRadius: 2,
              bgcolor: '#f8f9fa'
            }}
          >
            <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
              {totalParticipaciones}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Participaciones
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 2, 
              textAlign: 'center',
              borderRadius: 2,
              bgcolor: '#f0f8f0'
            }}
          >
            <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
              {totalAprobados}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Aprobadas
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 2, 
              textAlign: 'center',
              borderRadius: 2,
              bgcolor: '#f0f7ff'
            }}
          >
            <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
              {totalEventos}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Eventos
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 2, 
              textAlign: 'center',
              borderRadius: 2,
              bgcolor: '#f8f0ff'
            }}
          >
            <Typography variant="h4" color="secondary" sx={{ fontWeight: 'bold' }}>
              {totalCursos}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cursos
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Tabs para separar eventos y cursos */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              fontWeight: 'bold',
              fontSize: '1rem'
            }
          }}
        >
          <Tab 
            icon={<EventIcon />} 
            label={`Eventos (${totalEventos})`} 
            iconPosition="start"
          />
          <Tab 
            icon={<SchoolIcon />} 
            label={`Cursos (${totalCursos})`} 
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Contenido de tabs */}
      {tabValue === 0 && <EventosSection eventos={participaciones.eventos || []} />}
      {tabValue === 1 && <CursosSection cursos={participaciones.cursos || []} />}
    </Box>
  );
};

export default MisCertificados; 