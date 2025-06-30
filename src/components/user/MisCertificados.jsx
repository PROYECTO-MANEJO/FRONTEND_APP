import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Grid,
  Paper,
  Tabs,
  Tab,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Download as DownloadIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { obtenerParticipacionesTerminadas, descargarCertificado } from '../../services/certificadoService';

const MisCertificados = () => {
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

  const participacionesTotales = [
    ...(participaciones.eventos || []),
    ...(participaciones.cursos || [])
  ];

  const participacionesAprobadas = participacionesTotales.filter(p => p.aprobado);
  const participacionesReprobadas = participacionesTotales.filter(p => p.aprobado === false);

  const tabs = [
    { label: `Todos (${participacionesTotales.length})`, data: participacionesTotales },
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

  const CardParticipacion = ({ participacion }) => {
    const tipo = participacion.evento ? 'evento' : 'curso';
    const esAprobado = participacion.aprobado;
    const tieneCertificado = participacion.tiene_certificado_pdf;

    return (
      <Card
        sx={{
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
            />
            <Chip
              icon={esAprobado ? <CheckCircleIcon /> : <CancelIcon />}
              label={esAprobado ? 'Aprobado' : 'Reprobado'}
              size="small"
              color={esAprobado ? 'success' : 'error'}
            />
          </Box>

          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            {participacion.evento || participacion.curso}
          </Typography>

          <Typography variant="body2">
            {tipo === 'curso' && (
              <>
                Nota Final:{' '}
                <strong>{participacion.nota_final ?? 'N/A'}/100</strong>
                <br />
              </>
            )}
            Asistencia:{' '}
            <strong>
              {tipo === 'evento'
                ? participacion.asi_par ?? 'N/A'
                : participacion.asistencia_porcentaje ?? 'N/A'}%
            </strong>
            <br />
            Participante: {participacion.usuario}
          </Typography>

          {esAprobado && tieneCertificado && (
            <Typography variant="body2" color="success.main" mt={1}>
              Certificado PDF disponible
            </Typography>
          )}

          {!esAprobado && (
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

          {esAprobado && tieneCertificado && (
            <Button
              variant="contained"
              color="success"
              fullWidth
              sx={{ mt: 2 }}
              startIcon={
                downloading === participacion.id_par || downloading === participacion.id_par_cur
                  ? <CircularProgress size={16} color="inherit" />
                  : <DownloadIcon />
              }
              onClick={() =>
                handleDescargarCertificado(
                  tipo,
                  tipo === 'evento' ? participacion.id_par : participacion.id_par_cur
                )
              }
              disabled={
                downloading === participacion.id_par ||
                downloading === participacion.id_par_cur
              }
            >
              {downloading === participacion.id_par ||
              downloading === participacion.id_par_cur
                ? 'Descargando...'
                : 'Descargar certificado'}
            </Button>
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
        Mis Certificados y Participaciones
      </Typography>

      {/* estadísticas arriba */}
      <Grid container spacing={2} justifyContent="center" mb={3}>
        <Grid item>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold">{participacionesTotales.length}</Typography>
            <Typography variant="body2" color="text.secondary">Total Participaciones</Typography>
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
          tabs[tabValue].data.map((p) => (
            <Grid item key={p.id_par || p.id_par_cur}>
              <CardParticipacion participacion={p} />
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
