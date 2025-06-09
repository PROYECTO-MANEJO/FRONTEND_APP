import React from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Avatar, Button
} from '@mui/material';
import {
  People, Event, School, AttachMoney, Assessment
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { useSidebarLayout } from '../../hooks/useSidebarLayout';

const AdminReportes = () => {
  const { getMainContentStyle } = useSidebarLayout();
  const navigate = useNavigate();

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

  const handleVerReportes = (tipo) => {
    // Todos los tipos de reporte ahora navegan a su página de historial específica
    // sin generar un reporte automáticamente
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

        {/* Report Navigation */}
        <Box sx={{ mb: 4 }}>
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
      </Box>
    </Box>
  );
};

export default AdminReportes;