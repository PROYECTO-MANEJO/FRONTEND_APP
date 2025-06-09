import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, CircularProgress, Stack
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import api from '../../services/api';

const HistorialReportesFinancieros = () => {
  const [searchParams] = useSearchParams();
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const tipo = searchParams.get('tipo');
    if (tipo === 'FINANZAS') {
      api.get(`/reportes?tipo=${tipo}`)
        .then(res => setReportes(res.data.reportes || []))
        .catch(() => setReportes([]))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const handleDescargarPDF = async (id, nombreArchivo = 'reporte_financiero.pdf') => {
    try {
      const res = await fetch(`/api/reportes/download/${id}`, {
        headers: {
          'x-token': localStorage.getItem('token'), // Ajusta según dónde guardes tu token
        }
      });
      if (!res.ok) throw new Error('Error al descargar');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = nombreArchivo;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('No se pudo descargar el PDF');
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  }

  // Encuentra el último reporte (el más reciente)
  const ultimoReporte = reportes.length > 0
    ? reportes.reduce((a, b) => new Date(a.fecha_generado) > new Date(b.fecha_generado) ? a : b)
    : null;

  return (
    <Box sx={{ p: 4 }}>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/reportes')}
        >
          Volver a Reportes
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<DownloadIcon />}
          onClick={() => handleDescargarPDF(ultimoReporte.id_rep, ultimoReporte.nombre_archivo)}
          disabled={!ultimoReporte}
        >
          Descargar último PDF
        </Button>
      </Stack>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Historial de Reportes Financieros
      </Typography>
      <Paper sx={{ p: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center">No hay reportes financieros generados.</TableCell>
                </TableRow>
              )}
              {reportes.map((rep) => (
                <TableRow key={rep.id_rep}>
                  <TableCell>{new Date(rep.fecha_generado).toLocaleString()}</TableCell>
                  <TableCell>{rep.nombre_archivo}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDescargarPDF(rep.id_rep, rep.nombre_archivo)}
                    >
                      Descargar PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default HistorialReportesFinancieros;