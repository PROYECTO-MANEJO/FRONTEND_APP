import React, { useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Avatar, Button, Divider, CircularProgress, Alert
} from '@mui/material';
import {
  People, Event, School, AttachMoney, Assessment, BugReport, TrendingUp, PictureAsPdf
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { useSidebarLayout } from '../../hooks/useSidebarLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const AdminReportes = () => {
  const { getMainContentStyle } = useSidebarLayout();
  const { isMaster } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

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
      title: 'Reportes Financieros',
      description: 'Ver historial y generar reportes de ingresos',
      icon: <AttachMoney />,
      color: '#ef4444',
      btnColor: 'error'
    }
  ];

  // Reportes PDF de solicitudes (solo para MASTER)
  const solicitudesPDFTypes = [
    {
      tipo: 'estado',
      title: 'Reporte por Estados',
      description: 'Distribución de solicitudes por estados del sistema',
      icon: <Assessment />,
      color: '#9c27b0',
      btnColor: 'secondary'
    },
    {
      tipo: 'desarrollador',
      title: 'Carga por Desarrollador',
      description: 'Solicitudes asignadas y carga de trabajo por desarrollador',
      icon: <BugReport />,
      color: '#2196f3',
      btnColor: 'primary'
    },
    {
      tipo: 'resumen',
      title: 'Reporte Ejecutivo',
      description: 'Resumen general y métricas principales del sistema',
      icon: <TrendingUp />,
      color: '#673ab7',
      btnColor: 'secondary'
    }
  ];

  const handleVerReportes = (tipo) => {
    // Reportes existentes
    if (tipo === 'financiero') {
      navigate('/admin/reportes/historial?tipo=FINANZAS');
    } else if (tipo === 'usuarios') {
      navigate('/admin/reportes/historial-usuarios?tipo=USUARIOS');
    } else if (tipo === 'eventos') {
      navigate('/admin/reportes/historial-eventos?tipo=EVENTOS');
    } else if (tipo === 'cursos') {
      navigate('/admin/reportes/historial-cursos?tipo=CURSOS');
    }
  };

  const handleGenerarPDFSolicitudes = async (tipoReporte) => {
    try {
      setLoading(true);
      setMessage(null);

      const endpoint = `/reportes/solicitudes/${tipoReporte}/pdf`;
      const response = await api.post(endpoint);

      if (response.data.success) {
        setMessage({
          type: 'success',
          text: `✅ ${response.data.message}`
        });
        // Redirigir al tipo correcto de reporte
        setTimeout(() => {
          const tipoReporteMap = {
            'estado': 'SOLICITUDES_ESTADO',
            'desarrollador': 'SOLICITUDES_DESARROLLADOR',
            'resumen': 'SOLICITUDES_RESUMEN'
          };
          navigate(`/admin/reportes/historial-solicitudes?tipo=${tipoReporteMap[tipoReporte]}`);
        }, 2000);
      }
    } catch (error) {
      console.error('Error generando reporte PDF:', error);
      if (error.response?.status === 401) {
        // Si es error de autenticación, redirigir al homepage
        navigate('/');
        return;
      }
      setMessage({
        type: 'error',
        text: `❌ Error al generar el reporte: ${error.response?.data?.message || error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AdminSidebar />
      
      <Box sx={{ flexGrow: 1, p: 4, background: '#fafbfc', minHeight: '100vh', ...getMainContentStyle() }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Reportes y Análisis
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Visualiza estadísticas y genera reportes del sistema
          </Typography>
        </Box>

        {/* Reportes Generales */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#1976d2' }}>
            📊 Reportes Generales del Sistema
          </Typography>
          <Grid container spacing={3} sx={{ maxWidth: 800, mx: 'auto' }}>
            {reportTypes.map((report) => (
              <Grid item xs={12} sm={6} md={6} key={report.tipo}>
                <Card sx={{ 
                  height: 280, 
                  minWidth: 350,
                  maxWidth: 350,
                  mx: 'auto',
                  display: 'flex', 
                  flexDirection: 'column' 
                }}>
                  <CardContent sx={{ textAlign: 'center', p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Avatar
                      sx={{
                        bgcolor: report.color,
                        width: 64,
                        height: 64,
                        mx: 'auto',
                        mb: 2
                      }}
                    >
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
                      color={report.tipo === 'usuarios' ? 'primary' : report.btnColor}
                      fullWidth
                      onClick={() => handleVerReportes(report.tipo)}
                      startIcon={<Assessment />}
                      sx={{ 
                        mt: 'auto',
                        ...(report.tipo === 'usuarios' && {
                          backgroundColor: '#1976d2',
                          '&:hover': {
                            backgroundColor: '#1565c0'
                          }
                        })
                      }}
                    >
                      Ver Reportes
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Reportes de Solicitudes (Solo para MASTER) */}
        {isMaster() && (
          <>
            <Divider sx={{ my: 4 }} />
            <Box sx={{ mb: 4 }}>
              <Box sx={{ mb: 3, textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#9c27b0' }}>
                  🔒 Reportes de Solicitudes de Cambio (MASTER)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Análisis exclusivo y auditoría del sistema de solicitudes
                </Typography>
              </Box>
              {/* Mensaje de estado */}
              {message && (
                <Alert 
                  severity={message.type} 
                  sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}
                  onClose={() => setMessage(null)}
                >
                  {message.text}
                </Alert>
              )}

              <Grid container spacing={3} sx={{ maxWidth: 1000, mx: 'auto' }}>
                {solicitudesPDFTypes.map((report) => (
                  <Grid item xs={12} sm={6} md={4} key={report.tipo}>
                    <Card sx={{ 
                      height: 300, 
                      display: 'flex', 
                      flexDirection: 'column',
                      border: '2px solid transparent',
                      '&:hover': {
                        border: '2px solid #9c27b0',
                        transform: 'translateY(-4px)',
                        transition: 'all 0.3s ease'
                      }
                    }}>
                      <CardContent sx={{ textAlign: 'center', p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                        <Avatar
                          sx={{
                            bgcolor: report.color,
                            width: 64,
                            height: 64,
                            mx: 'auto',
                            mb: 2
                          }}
                        >
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
                          onClick={() => handleGenerarPDFSolicitudes(report.tipo)}
                          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PictureAsPdf />}
                          disabled={loading}
                          sx={{ mt: 'auto' }}
                        >
                          {loading ? 'Generando...' : 'Generar PDF'}
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default AdminReportes;