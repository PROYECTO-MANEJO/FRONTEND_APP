import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, CircularProgress, Stack, Alert, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AdminSidebar from './AdminSidebar';
import { useSidebarLayout } from '../../hooks/useSidebarLayout';
import api from '../../services/api';

const HistorialReportesFinancieros = () => {
  const { getMainContentStyle } = useSidebarLayout();
  const [searchParams] = useSearchParams();
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generandoReporte, setGenerandoReporte] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [viewerDialog, setViewerDialog] = useState({
    open: false,
    pdfUrl: '',
    reporte: null
  });

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

  const handleVerPDF = async (id, nombreArchivo) => {
    try {
      const res = await api.get(`/reportes/download/${id}`, {
        responseType: 'blob',
        headers: {
          'x-token': localStorage.getItem('token'),
        }
      });
      const blob = res.data;
      const url = window.URL.createObjectURL(blob);

      setViewerDialog({
        open: true,
        pdfUrl: url,
        reporte: nombreArchivo
      });
    } catch {
      alert('No se pudo cargar la vista previa del PDF');
    }
  };

  const handleGenerarReporte = async () => {
    setGenerandoReporte(true);
    setMensaje({ tipo: '', texto: '' });
    
    try {
      await api.post('/reportes/finanzas/pdf');
      setMensaje({ 
        tipo: 'success', 
        texto: 'Reporte financiero generado exitosamente. Actualizando lista...' 
      });
      
      setTimeout(() => {
        const tipo = searchParams.get('tipo');
        if (tipo === 'FINANZAS') {
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
        texto: 'Error al generar el reporte financiero' 
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
            disabled={generandoReporte}
          >
            {generandoReporte ? 'Generando...' : 'Generar Nuevo Reporte'}
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

        {mensaje.texto && (
          <Alert severity={mensaje.tipo} sx={{ mb: 3 }}>
            {mensaje.texto}
          </Alert>
        )}

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
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleVerPDF(rep.id_rep, rep.nombre_archivo)}
                        >
                          Ver PDF
                        </Button>
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<DownloadIcon />}
                          onClick={() => handleDescargarPDF(rep.id_rep, rep.nombre_archivo)}
                        >
                          Descargar
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      {/* Modal visor PDF */}
      <Dialog
        open={viewerDialog.open}
        onClose={() => setViewerDialog({ open: false, pdfUrl: '', reporte: null })}
        maxWidth="xl"
        fullWidth
      >
        <DialogTitle>
          Vista previa de {viewerDialog.reporte}
        </DialogTitle>
        <DialogContent sx={{ height: '80vh' }}>
          {viewerDialog.pdfUrl ? (
            <iframe
              src={viewerDialog.pdfUrl}
              title="Vista previa PDF"
              width="100%"
              height="100%"
              style={{ border: 'none' }}
            ></iframe>
          ) : (
            <CircularProgress />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewerDialog({ open: false, pdfUrl: '', reporte: null })}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HistorialReportesFinancieros;
