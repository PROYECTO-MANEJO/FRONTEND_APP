import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, CircularProgress, Stack, Alert
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import AdminSidebar from './AdminSidebar';
import { useSidebarLayout } from '../../hooks/useSidebarLayout';
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
  const { getMainContentStyle } = useSidebarLayout();
  const [searchParams] = useSearchParams();
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generandoReporte, setGenerandoReporte] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
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
    } catch {
      alert('No se pudo descargar el PDF');
    }
  };

  const handleGenerarReporte = async () => {
    setGenerandoReporte(true);
    setMensaje({ tipo: '', texto: '' });
    
    try {
      await api.post(ENDPOINTS[tipo]);
      setMensaje({ 
        tipo: 'success', 
        texto: 'Reporte generado exitosamente. Actualizando lista...' 
      });
      
      // Recargar la lista de reportes después de generar uno nuevo
      setTimeout(() => {
        if (tipo) {
          api.get(`/reportes?tipo=${tipo}`)
            .then(res => {
              setReportes(res.data.reportes || []);
              setMensaje({ tipo: '', texto: '' });
            })
            .catch(() => {
              setMensaje({ 
                tipo: 'error', 
                texto: 'Error al actualizar la lista de reportes' 
              });
            });
        }
      }, 1000);
      
    } catch {
      setMensaje({ 
        tipo: 'error', 
        texto: 'Error al generar el reporte' 
      });
    } finally {
      setGenerandoReporte(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
        <AdminSidebar />
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', ...getMainContentStyle() }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  // Encuentra el último reporte (el más reciente)
  const ultimoReporte = reportes.length > 0
    ? reportes.reduce((a, b) => new Date(a.fecha_generado) > new Date(b.fecha_generado) ? a : b)
    : null;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <AdminSidebar />
      <Box sx={{ flexGrow: 1, p: 4, ...getMainContentStyle() }}>
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
            color="success"
            startIcon={generandoReporte ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
            onClick={handleGenerarReporte}
            disabled={generandoReporte || !ENDPOINTS[tipo]}
          >
            {generandoReporte ? 'Generando...' : 'Generar Nuevo Reporte'}
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

        {mensaje.texto && (
          <Alert severity={mensaje.tipo} sx={{ mb: 3 }}>
            {mensaje.texto}
          </Alert>
        )}

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
                      No hay reportes de {tipo?.toLowerCase()} generados.
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
    </Box>
  );
};

export default HistorialReportesGenerales;