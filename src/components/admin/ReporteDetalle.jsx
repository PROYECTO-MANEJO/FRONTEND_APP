import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Typography, Paper, Button, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import api from '../../services/api';

const ReporteDetalle = () => {
  const { id } = useParams();
  const [reporte, setReporte] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReporte = async () => {
      try {
        const res = await api.get(`/reportes/${id}`);
        setReporte(res.data.data);
      } catch (error) {
        setReporte(null);
      } finally {
        setLoading(false);
      }
    };
    fetchReporte();
  }, [id]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  }

  if (!reporte) {
    return <Typography variant="h6" color="error" sx={{ mt: 4 }}>Reporte no encontrado</Typography>;
  }

  // Ejemplo de tabla profesional con los datos del reporte
  return (
    <Box sx={{ p: 4 }}>
      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
          {reporte.titulo}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
          Generado: {new Date(reporte.fecha).toLocaleString()}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          {reporte.descripcion}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<DownloadIcon />}
          href={reporte.url_pdf}
          target="_blank"
        >
          Descargar PDF
        </Button>
      </Paper>

      {/* Tabla de datos del reporte */}
      {reporte.datos && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Resumen del Reporte</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Campo</TableCell>
                  <TableCell>Valor</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(reporte.datos).map(([campo, valor]) => (
                  <TableRow key={campo}>
                    <TableCell>{campo}</TableCell>
                    <TableCell>{typeof valor === 'object' ? JSON.stringify(valor) : valor}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
};

export default ReporteDetalle;