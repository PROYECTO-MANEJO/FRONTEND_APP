import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, CircularProgress, Stack, Chip
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RefreshIcon from '@mui/icons-material/Refresh';
import api from '../../services/api';

const tiposReporte = {
  FINANZAS: {
    titulo: 'Reportes Financieros',
    color: 'error',
    endpoint: '/reportes/finanzas/pdf'
  },
  EVENTOS: {
    titulo: 'Reportes de Eventos',
    color: 'success',
    endpoint: '/reportes/eventos/pdf'
  },
  CURSOS: {
    titulo: 'Reportes de Cursos',
    color: 'warning',
    endpoint: '/reportes/cursos/pdf'
  }
};

const HistorialReportesGenerico = () => {
  const [searchParams] = useSearchParams();
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generando, setGenerando] = useState(false);
  const navigate = useNavigate();
  
  const tipo = searchParams.get('tipo') || 'FINANZAS';
  const configTipo = tiposReporte[tipo] || tiposReporte.FINANZAS;

  useEffect(() => {
    cargarReportes();
  }, [tipo]);

  const cargarReportes = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/reportes?tipo=${tipo}`);
      setReportes(response.data.reportes || []);
    } catch (error) {
      console.error('Error al cargar reportes:', error);
      setReportes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDescargarPDF = async (id, nombreArchivo = 'reporte.pdf') => {
    try {
      // Usar la instancia de api configurada con responseType blob para archivos binarios
      const response = await api.get(`/reportes/download/${id}`, {
        responseType: 'blob'
      });
      
      // Crear blob y URL para descarga
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Crear elemento temporal para descarga
      const a = document.createElement('a');
      a.href = url;
      a.download = nombreArchivo;
      document.body.appendChild(a);
      a.click();
      
      // Limpiar
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error al descargar PDF:', err);
      alert('No se pudo descargar el PDF. Por favor, intente nuevamente.');
    }
  };

  const handleGenerarNuevo = async () => {
    setGenerando(true);
    try {
      await api.post(configTipo.endpoint);
      alert('Nuevo reporte generado exitosamente');
      cargarReportes(); // Recargar lista
    } catch (error) {
      console.error('Error al generar reporte:', error);
      alert('Error al generar el reporte. Por favor, intente nuevamente.');
    } finally {
      setGenerando(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Encuentra el último reporte (el más reciente)
  const ultimoReporte = reportes.length > 0
    ? reportes.reduce((a, b) => new Date(a.fecha_generado) > new Date(b.fecha_generado) ? a : b)
    : null;

  return (
    <Box sx={{ p: 4 }}>
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/reportes')}
        >
          Volver a Reportes
        </Button>
        
        <Button
          variant="contained"
          color={configTipo.color}
          startIcon={<DownloadIcon />}
          onClick={() => handleDescargarPDF(ultimoReporte.id_rep, ultimoReporte.nombre_archivo)}
          disabled={!ultimoReporte}
        >
          Descargar último PDF
        </Button>

        <Button
          variant="contained"
          color="primary"
          startIcon={generando ? <CircularProgress size={20} /> : <RefreshIcon />}
          onClick={handleGenerarNuevo}
          disabled={generando}
        >
          {generando ? 'Generando...' : 'Generar nuevo'}
        </Button>
      </Stack>

      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {configTipo.titulo}
        </Typography>
        <Chip 
          label={`${reportes.length} reporte${reportes.length !== 1 ? 's' : ''}`} 
          color={configTipo.color}
          variant="outlined"
        />
      </Stack>

      <Paper sx={{ p: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Fecha de Generación</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Nombre del Archivo</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No hay reportes de {tipo.toLowerCase()} generados.
                    </Typography>
                    <Button
                      variant="outlined"
                      color={configTipo.color}
                      startIcon={<RefreshIcon />}
                      onClick={handleGenerarNuevo}
                      disabled={generando}
                      sx={{ mt: 2 }}
                    >
                      Generar primer reporte
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                reportes.map((reporte) => (
                  <TableRow key={reporte.id_rep} hover>
                    <TableCell>
                      {new Date(reporte.fecha_generado).toLocaleString('es-EC', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {reporte.nombre_archivo}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color={configTipo.color}
                        startIcon={<DownloadIcon />}
                        onClick={() => handleDescargarPDF(reporte.id_rep, reporte.nombre_archivo)}
                        size="small"
                      >
                        Descargar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default HistorialReportesGenerico; 