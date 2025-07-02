import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import { 
  Event,
  School,
  CalendarToday,
  LocationOn,
  AccessTime,
  Payment,
  Description,
  CheckCircle,
  Cancel,
  PlayArrow
} from '@mui/icons-material';
import UserSidebar from './UserSidebar';
import { useUserSidebarLayout } from '../../hooks/useUserSidebarLayout';
import EstadoInscripcion from '../shared/EstadoInscripcion';
import { useInscripciones } from '../../hooks/useInscripciones';

const MisInscripciones = () => {
  const { getMainContentStyle } = useUserSidebarLayout();
  const { 
    inscripcionesEventos, 
    inscripcionesCursos, 
    loading, 
    error 
  } = useInscripciones();

  // Debug: Mostrar los datos recibidos del backend
  useEffect(() => {
    if (!loading && !error) {
      console.log('DEBUG - Inscripciones Eventos:', inscripcionesEventos);
      console.log('DEBUG - Inscripciones Cursos:', inscripcionesCursos);
      
      // Verificar específicamente el estado de cada evento
      inscripcionesEventos.forEach(inscripcion => {
        console.log(`Evento: ${inscripcion.evento?.nom_eve || 'N/A'} - Estado: ${inscripcion.evento?.estado || 'No definido'}`);
      });
      
      // Verificar específicamente el estado de cada curso
      inscripcionesCursos.forEach(inscripcion => {
        console.log(`Curso: ${inscripcion.curso?.nom_cur || 'N/A'} - Estado: ${inscripcion.curso?.estado || 'No definido'}`);
      });
    }
  }, [inscripcionesEventos, inscripcionesCursos, loading, error]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
        <UserSidebar />
        <Box sx={{ 
          flexGrow: 1,
          p: 3, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          ...getMainContentStyle()
        }}>
          <CircularProgress size={60} sx={{ color: '#b91c1c' }} />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
        <UserSidebar />
        <Box sx={{ 
          flexGrow: 1,
          p: 3, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          ...getMainContentStyle()
        }}>
          <Alert severity="error" sx={{ maxWidth: 500 }}>
            Error al cargar tus inscripciones: {error}
          </Alert>
        </Box>
      </Box>
    );
  }

  const totalInscripciones = inscripcionesEventos.length + inscripcionesCursos.length;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <UserSidebar />
      
      {/* Main Content */}
      <Box sx={{ 
        flexGrow: 1,
        p: 3,
        ...getMainContentStyle()
      }}>
        <Container maxWidth="xl" sx={{ py: 4, px: 3 }}>
          {/* Header */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 700, 
                mb: 1,
                color: 'text.primary',
                fontSize: { xs: '2rem', md: '3rem' }
              }}
            >
              Mis Inscripciones
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary"
              sx={{ maxWidth: 600, mx: 'auto' }}
            >
              Revisa el estado de todas tus inscripciones en eventos y cursos
            </Typography>
          </Box>

          {/* Estadísticas */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                <Typography variant="h4" sx={{ color: '#b91c1c', fontWeight: 700 }}>
                  {totalInscripciones}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Inscripciones
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 700 }}>
                  {inscripcionesEventos.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Eventos
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                <Typography variant="h4" sx={{ color: '#2e7d32', fontWeight: 700 }}>
                  {inscripcionesCursos.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Cursos
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                <Typography variant="h4" sx={{ color: '#f57c00', fontWeight: 700 }}>
                  {[...inscripcionesEventos, ...inscripcionesCursos].filter(i => i.estado_pago === 'APROBADO').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Aprobadas
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {totalInscripciones === 0 ? (
            <Paper 
              elevation={2}
              sx={{ 
                p: 6, 
                textAlign: 'center',
                borderRadius: 3,
                maxWidth: 500,
                mx: 'auto'
              }}
            >
              <Typography variant="h5" color="text.secondary" gutterBottom>
                No tienes inscripciones
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Aún no te has inscrito en ningún evento o curso. Explora nuestras opciones disponibles.
              </Typography>
            </Paper>
          ) : (
            <>
              {/* Eventos */}
              {inscripcionesEventos.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h4" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Event color="primary" />
                    Inscripciones en Eventos ({inscripcionesEventos.length})
                  </Typography>
                  <Grid container spacing={3}>
                    {inscripcionesEventos.map((inscripcion) => (
                      <Grid item xs={12} md={6} lg={4} key={inscripcion.id_ins}>
                        <InscripcionCard inscripcion={inscripcion} tipo="evento" />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* Cursos */}
              {inscripcionesCursos.length > 0 && (
                <Box>
                  <Typography variant="h4" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <School color="success" />
                    Inscripciones en Cursos ({inscripcionesCursos.length})
                  </Typography>
                  <Grid container spacing={3}>
                    {inscripcionesCursos.map((inscripcion) => (
                      <Grid item xs={12} md={6} lg={4} key={inscripcion.id_ins}>
                        <InscripcionCard inscripcion={inscripcion} tipo="curso" />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </>
          )}
        </Container>
      </Box>
    </Box>
  );
};

// Componente para cada tarjeta de inscripción
const InscripcionCard = ({ inscripcion, tipo }) => {
  const esEvento = tipo === 'evento';
  const item = esEvento ? inscripcion.evento : inscripcion.curso;
  
  if (!item) return null;

  const nombre = esEvento ? item.nom_eve : item.nom_cur;
  const descripcion = esEvento ? item.des_eve : item.des_cur;
  const fechaInicio = esEvento ? item.fec_ini_eve : item.fec_ini_cur;
  const ubicacion = esEvento ? item.ubi_eve : null;
  const estadoItem = esEvento ? item.estado : item.estado;
  const estaCerrado = estadoItem === 'CERRADO';

  // Debug: Mostrar información detallada de cada card
  console.log(`DEBUG - Card ${esEvento ? 'Evento' : 'Curso'}: ${nombre}`);
  console.log(`  - Estado del item: ${estadoItem || 'No definido'}`);
  console.log(`  - ¿Está cerrado?: ${estaCerrado}`);
  console.log(`  - Datos completos:`, item);

  const estadoInscripcion = {
    inscrito: true,
    estado: esEvento ? inscripcion.estado_pago : inscripcion.estado_pago_cur,
    fechaInscripcion: esEvento ? inscripcion.fec_ins : inscripcion.fec_ins_cur,
    metodoPago: esEvento ? inscripcion.met_pag_ins : inscripcion.met_pag_ins_cur,
    valorPagado: esEvento ? inscripcion.val_ins : inscripcion.val_ins_cur,
    enlacePago: esEvento ? inscripcion.enl_ord_pag_ins : inscripcion.enl_ord_pag_ins_cur,
    tieneComprobante: !!inscripcion.comprobante_pago_pdf,
    nombreComprobante: inscripcion.comprobante_filename,
    fechaSubidaComprobante: inscripcion.fec_subida_comprobante,
    fechaAprobacion: esEvento ? inscripcion.fec_aprobacion : inscripcion.fec_aprobacion_cur
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2 , width: '450px'}}>
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        {/* Header con tipo, estado y estado de cierre */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip 
              label={esEvento ? 'EVENTO' : 'CURSO'}
              size="small"
              icon={esEvento ? <Event sx={{ fontSize: '0.7rem' }} /> : <School sx={{ fontSize: '0.7rem' }} />}
              sx={{ 
                bgcolor: esEvento ? '#1976d2' : '#2e7d32',
                color: 'white',
                fontWeight: 600
              }}
            />
            {estaCerrado ? (
              <Chip 
                label="FINALIZADO"
                size="small"
                icon={<CheckCircle sx={{ fontSize: '0.7rem' }} />}
                sx={{ 
                  bgcolor: '#d32f2f',
                  color: 'white',
                  fontWeight: 600
                }}
              />
            ) : (
              <Chip 
                label="EN CURSO"
                size="small"
                icon={<PlayArrow sx={{ fontSize: '0.7rem' }} />}
                sx={{ 
                  bgcolor: '#1976d2',
                  color: 'white',
                  fontWeight: 600
                }}
              />
            )}
          </Box>
          <EstadoInscripcion 
            estado={estadoInscripcion.estado} 
            showDetails={false}
            mostrarTexto={false}
            dataCompleta={estadoInscripcion}
          />
        </Box>

        {/* Título */}
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, lineHeight: 1.2 }}>
          {nombre}
        </Typography>

        {/* Descripción */}
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {descripcion}
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* Información del evento/curso */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarToday sx={{ fontSize: '1rem', color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {new Date(fechaInicio).toLocaleDateString()}
            </Typography>
          </Box>
          
          {ubicacion && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOn sx={{ fontSize: '1rem', color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {ubicacion}
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccessTime sx={{ fontSize: '1rem', color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              Inscrito el: {new Date(estadoInscripcion.fechaInscripcion).toLocaleDateString()}
            </Typography>
          </Box>

          {/* Información de pago y comprobante */}
          {estadoInscripcion.valorPagado && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Payment sx={{ fontSize: '1rem', color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Valor: ${estadoInscripcion.valorPagado}
              </Typography>
            </Box>
          )}

          {estadoInscripcion.tieneComprobante && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Description sx={{ fontSize: '1rem', color: 'success.main' }} />
              <Typography variant="body2" color="success.main">
                Comprobante PDF enviado
              </Typography>
            </Box>
          )}
        </Box>

        {/* Estado detallado */}
        <Box sx={{ mt: 2 }}>
          <EstadoInscripcion 
            estado={estadoInscripcion.estado} 
            showDetails={true}
            mostrarTexto={true}
            dataCompleta={estadoInscripcion}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default MisInscripciones; 