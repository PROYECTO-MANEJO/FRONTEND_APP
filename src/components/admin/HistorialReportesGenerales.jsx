import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, CircularProgress, Stack
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import api from '../../services/api';

const TITULOS = {
  USUARIOS: 'Historial de Reportes de Usuarios',
  EVENTOS: 'Historial de Reportes de Eventos',
  CURSOS: 'Historial de Reportes de Cursos'
};

const ENDPOINTS = {
  USUARIOS: '/reportes/usuarios/pdf',
  EVENTOS: '/reportes/eventos/pdf',
  CURSOS: '/reportes/cursos/pdf'
};

const HistorialReportesGenerales = () => {
  const [searchParams] = useSearchParams();
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const tipo = searchParams.get('tipo');

  useEffect(() => {
    if (tipo) {
      api.get(`/reportes?tipo=${tipo}`)
        .then(res => setReportes(res.data.reportes || []))
        .catch(() => setReportes([]))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [tipo]);

  const handleDescargarPDF = async (id, nombreArchivo = 'reporte.pdf') => {
    try {
      const res = await api.get(`/reportes/download/${id}`, {
        responseType: 'blob',
        headers: {
          'x-token': localStorage.getItem('token'),
        }
      });
      const blob = res.data;
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

  const generarNuevoReporte = async () => {
    try {
      await api.post(ENDPOINTS[tipo]);
      const res = await api.get(`/reportes?tipo=${tipo}`);
      setReportes(res.data.reportes || []);
    } catch {
      alert('Error al generar el nuevo reporte');
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  }

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
          color="secondary"
          onClick={generarNuevoReporte}
          disabled={!ENDPOINTS[tipo]}
        >
          Generar nuevo reporte
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<DownloadIcon />}
          onClick={() => handleDescargarPDF(ultimoReporte?.id_rep, ultimoReporte?.nombre_archivo)}
          disabled={!ultimoReporte}
        >
          Descargar último PDF
        </Button>
      </Stack>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        {TITULOS[tipo] || 'Historial de Reportes'}
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
                  <TableCell colSpan={3} align="center">
                    No hay reportes generados.
                  </TableCell>
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

export default HistorialReportesGenerales;