import React, { useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Avatar, Button, CircularProgress
} from '@mui/material';
import {
  People, Event, School, AttachMoney, Assessment
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import AdminSidebar from './AdminSidebar';
import { useSidebarLayout } from '../../hooks/useSidebarLayout';

const reportTypes = [
  {
    tipo: 'usuarios',
    title: 'Reporte de Usuarios',
    description: 'Estadísticas detalladas de usuarios registrados',
    icon: <People />,
    color: '#3b82f6',
    btnColor: 'primary'
  },
  {
    tipo: 'eventos',
    title: 'Reporte de Eventos',
    description: 'Análisis de eventos y participación',
    icon: <Event />,
    color: '#10b981',
    btnColor: 'success'
  },
  {
    tipo: 'cursos',
    title: 'Reporte de Cursos',
    description: 'Estadísticas de cursos y completación',
    icon: <School />,
    color: '#f59e0b',
    btnColor: 'warning'
  },
  {
    tipo: 'financiero',
    title: 'Reporte Financiero',
    description: 'Análisis de ingresos y gastos',
    icon: <AttachMoney />,
    color: '#ef4444',
    btnColor: 'error'
  }
];

const AdminReportes = () => {
  const [loading, setLoading] = useState(false);
  const { getMainContentStyle } = useSidebarLayout();
  const navigate = useNavigate();

  const handleGenerar = async (tipo) => {
    setLoading(true);
    try {
      if (tipo === 'financiero') {
        // Genera el PDF financiero y luego navega al historial de reportes financieros
        await api.post('/reportes/finanzas/pdf');
        navigate('/admin/reportes/historial?tipo=FINANZAS');
      } else {
        // Deja el resto igual para otros reportes
        const res = await api.post('/reportes/generar', { tipo });
        if (res.data && res.data.data && res.data.data.id) {
          navigate(`/admin/reportes/${res.data.data.id}`);
        }
      }
    } catch {
      alert('Error al generar el reporte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AdminSidebar />
      <Box sx={{ flexGrow: 1, p: 4, background: '#fafbfc', minHeight: '100vh', ...getMainContentStyle() }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Reportes y Análisis
        </Typography>
        <Typography variant="subtitle1" sx={{ mb: 4 }}>
          Genera reportes detallados del sistema
        </Typography>

        {/* Generar Reportes */}
        <Grid container spacing={3} sx={{ maxWidth: 1200, mx: 'auto' }}>
          {reportTypes.map((report) => (
            <Grid item xs={12} sm={6} md={3} key={report.tipo}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ textAlign: 'center', p: 3, flexGrow: 1 }}>
                  <Avatar sx={{ bgcolor: report.color, width: 64, height: 64, mx: 'auto', mb: 2 }}>
                    {report.icon}
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {report.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3, flexGrow: 1 }}>
                    {report.description}
                  </Typography>
                  <Button
                    variant="contained"
                    color={report.btnColor}
                    fullWidth
                    disabled={loading}
                    onClick={() => handleGenerar(report.tipo)}
                    startIcon={<Assessment />}
                    sx={{ mt: 'auto' }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Generar'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default AdminReportes;