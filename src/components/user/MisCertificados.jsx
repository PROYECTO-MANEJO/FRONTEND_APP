import React, { useState, useEffect } from 'react';
import {
  Alert,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Box,
  Chip,
  CircularProgress,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Download as DownloadIcon,
  Info as InfoIcon,
  Event as EventIcon,
  School as SchoolIcon,
  HourglassEmpty as HourglassEmptyIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material';
import { 
  obtenerParticipacionesTerminadas, 
  descargarCertificado,
  obtenerTodasLasInscripciones
} from '../../services/certificadoService';

const MisCertificados = () => {
  const [participaciones, setParticipaciones] = useState({ eventos: [], cursos: [] });
  const [todasLasInscripciones, setTodasLasInscripciones] = useState({ eventos: [], cursos: [] });
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
      
      // Cargar participaciones terminadas (para pestañas aprobados/reprobados)
      const responseTerminadas = await obtenerParticipacionesTerminadas();
      setParticipaciones(responseTerminadas.data);
      
      // Cargar TODAS las inscripciones (incluyendo las que no tienen participación)
      const responseTodas = await obtenerTodasLasInscripciones();
      setTodasLasInscripciones(responseTodas.data);
      
      setError(null);
    } catch (err) {
      setError(err.message || 'Error al cargar participaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleDescargarCertificado = async (tipo, idParticipacion) => {
    try {
      setDownloading(idParticipacion);
      await descargarCertificado(tipo, idParticipacion);
    } catch (err) {
      setError(err.message || 'Error al descargar certificado');
    } finally {
      setDownloading(null);
    }
  };

  // Para pestaña "Todos" - usar todas las inscripciones
  const inscripcionesTotales = [
    ...(todasLasInscripciones.eventos || []),
    ...(todasLasInscripciones.cursos || [])
  ];

  // Para pestañas "Aprobados" y "Reprobados" - usar solo las terminadas
  const participacionesTerminadas = [
    ...(participaciones.eventos || []),
    ...(participaciones.cursos || [])
  ];
  
  const participacionesAprobadas = participacionesTerminadas.filter(p => p.aprobado);
  const participacionesReprobadas = participacionesTerminadas.filter(p => p.aprobado === false);

  // Contador para inscripciones en curso (ni aprobadas ni reprobadas)
  const inscripcionesEnCurso = inscripcionesTotales.length - participacionesAprobadas.length - participacionesReprobadas.length;

  const tabs = [
    { label: `Todos (${inscripcionesTotales.length})`, data: inscripcionesTotales },
    { label: `Aprobados (${participacionesAprobadas.length})`, data: participacionesAprobadas },
    { label: `Reprobados (${participacionesReprobadas.length})`, data: participacionesReprobadas },
  ];

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Componente para mostrar una inscripción (con o sin participación)
  const CardInscripcion = ({ item }) => {
    const tipo = item.tipo || (item.evento ? 'evento' : 'curso');
    
    // Determinar si es una inscripción o una participación
    const esParticipacion = item.aprobado !== undefined;
    
    // Información específica según el tipo
    const titulo = item.evento || item.curso;
    const esAprobado = esParticipacion ? item.aprobado : null;
    const tieneCertificado = esParticipacion ? item.tiene_certificado_pdf : false;
    
    // Determinar el estado
    const esTerminada = esParticipacion && (item.aprobado !== null);
    const esActiva = !esTerminada;
    
    // Obtener el estado del evento/curso
    const obtenerEstadoActividad = () => {
      if (esParticipacion) {
        return tipo === 'evento' ? 'ACTIVO' : 'ACTIVO';
      } else {
        return tipo === 'evento' ? (item.estado_evento || 'ACTIVO') : (item.estado_curso || 'ACTIVO');
      }
    };
    
    const estadoActividad = obtenerEstadoActividad();
    
    // Obtener el estado de pago (solo para inscripciones)
    const estadoPago = !esParticipacion ? (tipo === 'evento' ? item.estado_pago : item.estado_pago) : null;

    return (
      <Card
        sx={{
          mb: 2,
          borderRadius: 2,
          maxWidth: 320,
          mx: 'auto',
          transition: 'all 0.3s ease',
          '&:hover': { boxShadow: 6 }
        }}
      >
        <CardContent>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Chip
              label={tipo.toUpperCase()}
              size="small"
              color={tipo === 'evento' ? 'primary' : 'secondary'}
              icon={tipo === 'evento' ? <EventIcon /> : <SchoolIcon />}
            />
            {esTerminada ? (
              <Chip
                icon={esAprobado ? <CheckCircleIcon /> : <CancelIcon />}
                label={esAprobado ? 'Aprobado' : 'Reprobado'}
                size="small"
                color={esAprobado ? 'success' : 'error'}
              />
            ) : (
              <Chip
                icon={estadoActividad === 'ACTIVO' || estadoActividad === 'ABIERTO' ? 
                  <PlayArrowIcon /> : <HourglassEmptyIcon />}
                label={estadoActividad === 'ACTIVO' || estadoActividad === 'ABIERTO' ? 
                  'En Curso' : estadoActividad}
                size="small"
                color={estadoActividad === 'ACTIVO' || estadoActividad === 'ABIERTO' ? 
                  'info' : 'warning'}
              />
            )}
          </Box>

          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            {titulo}
          </Typography>

          {esTerminada ? (
            <Typography variant="body2">
              {tipo === 'curso' && (
                <>
                  Nota Final:{' '}
                  <strong>{item.nota_final ?? 'N/A'}/100</strong>
                  <br />
                </>
              )}
              Asistencia:{' '}
              <strong>
                {tipo === 'evento'
                  ? item.asi_par ?? 'N/A'
                  : item.asistencia_porcentaje ?? 'N/A'}%
              </strong>
              <br />
              Participante: {item.usuario}
            </Typography>
          ) : (
            <Typography variant="body2">
              <strong>Estado:</strong> {estadoPago === 'APROBADO' ? 'Inscrito' : 'Pendiente de aprobación'}
              <br />
              <strong>Fecha de inscripción:</strong> {formatearFecha(item.fecha_inscripcion)}
              <br />
              {item.metodo_pago && (
                <>
                  <strong>Método de pago:</strong> {item.metodo_pago}
                  <br />
                </>
              )}
              {!item.es_gratuito && (
                <>
                  <strong>Estado de pago:</strong>{' '}
                  <Chip 
                    label={estadoPago || 'PENDIENTE'} 
                    size="small" 
                    color={estadoPago === 'APROBADO' ? 'success' : 'warning'}
                    sx={{ fontSize: '0.7rem', height: 20 }}
                  />
                  <br />
                </>
              )}
              Participante: {item.usuario}
            </Typography>
          )}

          {esTerminada && esAprobado && tieneCertificado && (
            <>
              <Typography variant="body2" color="success.main" mt={1}>
                Certificado PDF disponible
              </Typography>
              <Button
                variant="contained"
                color="success"
                fullWidth
                sx={{ mt: 2 }}
                startIcon={
                  downloading === item.id_par || downloading === item.id_par_cur
                    ? <CircularProgress size={16} color="inherit" />
                    : <DownloadIcon />
                }
                onClick={() =>
                  handleDescargarCertificado(
                    tipo,
                    tipo === 'evento' ? item.id_par : item.id_par_cur
                  )
                }
                disabled={
                  downloading === item.id_par ||
                  downloading === item.id_par_cur
                }
              >
                {downloading === item.id_par ||
                downloading === item.id_par_cur
                  ? 'Descargando...'
                  : 'Descargar certificado'}
              </Button>
            </>
          )}

          {esTerminada && !esAprobado && (
            <Alert
              icon={<InfoIcon />}
              severity="info"
              sx={{ mt: 1 }}
            >
              {tipo === 'evento'
                ? 'Se requiere mínimo 70% de asistencia'
                : 'Se requiere nota final y asistencia mayor al 70%'}
            </Alert>
          )}

          {esActiva && (
            <Alert
              icon={<InfoIcon />}
              severity="info"
              sx={{ mt: 1 }}
            >
              {estadoActividad === 'ACTIVO' || estadoActividad === 'ABIERTO' ? 
                `${tipo === 'evento' ? 'Evento' : 'Curso'} en progreso. Los resultados aparecerán al finalizar.` :
                `${tipo === 'evento' ? 'Evento' : 'Curso'} próximo a iniciar.`}
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 'bold',
          textAlign: 'center',
          mb: 4,
          color: 'primary.main'
        }}
      >
        Mis Inscripciones y Certificados
      </Typography>

      {/* estadísticas arriba */}
      <Grid container spacing={2} justifyContent="center" mb={3}>
        <Grid item>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold">{inscripcionesTotales.length}</Typography>
            <Typography variant="body2" color="text.secondary">Total Inscripciones</Typography>
          </Paper>
        </Grid>
        <Grid item>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" color="success.main">{participacionesAprobadas.length}</Typography>
            <Typography variant="body2" color="text.secondary">Aprobadas</Typography>
          </Paper>
        </Grid>
        <Grid item>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" color="error.main">{participacionesReprobadas.length}</Typography>
            <Typography variant="body2" color="text.secondary">Reprobadas</Typography>
          </Paper>
        </Grid>
        <Grid item>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" color="info.main">{inscripcionesEnCurso}</Typography>
            <Typography variant="body2" color="text.secondary">En Curso</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* tabs */}
      <Tabs
        value={tabValue}
        onChange={(e, val) => setTabValue(val)}
        variant="fullWidth"
        centered
        sx={{ mb: 3 }}
      >
        {tabs.map((tab, idx) => (
          <Tab key={idx} label={tab.label} />
        ))}
      </Tabs>

      {/* tarjetas */}
      <Grid container spacing={3} justifyContent="center">
        {tabs[tabValue].data.length > 0 ? (
          tabs[tabValue].data.map((item) => (
            <Grid item key={item.id_par || item.id_par_cur || item.id_ins || item.id_ins_cur}>
              <CardInscripcion item={item} />
            </Grid>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary" mt={4}>
            No hay participaciones registradas en esta categoría
          </Typography>
        )}
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default MisCertificados;
