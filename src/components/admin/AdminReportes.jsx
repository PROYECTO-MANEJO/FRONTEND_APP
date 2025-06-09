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

import { useNavigate } from 'react-router-dom';
import api from '../../services/api'; // Asegúrate de que la ruta a tu archivo api.js sea correcta

const AdminReportes = () => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    usuarios: [],
    eventos: [],
    cursos: [],
    ingresos: []
  });
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
    title: 'Reportes Financieros',
    description: 'Ver historial y generar reportes de ingresos',
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
    if (tipo === 'financiero') {
      // Solo navegar al historial sin generar reporte automáticamente
      navigate('/admin/reportes/historial?tipo=FINANZAS');
      return;
    }

    // Para el resto de reportes, mantener el comportamiento actual
    setLoading(true);
    try {
      const res = await api.post('/reportes/generar', { tipo });
      if (res.data && res.data.data && res.data.data.id) {
        navigate(`/admin/reportes/${res.data.data.id}`);
      }
    } catch {
      alert('Error al generar el reporte');
    } finally {
      setLoading(false);
    }
  };


  const handleVerHistorial = (tipo) => {
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

  const handleGenerar = async (tipo) => {
    setLoading(true);
    try {
      if (tipo === 'financiero') {
        await api.post('/reportes/finanzas/pdf');
        navigate('/admin/reportes/historial?tipo=FINANZAS');
      } else if (tipo === 'usuarios') {
        await api.post('/reportes/usuarios/pdf');
        navigate('/admin/reportes/historial-usuarios?tipo=USUARIOS');
      } else if (tipo === 'eventos') {
        await api.post('/reportes/eventos/pdf');
        navigate('/admin/reportes/historial-eventos?tipo=EVENTOS');
      } else if (tipo === 'cursos') {
        await api.post('/reportes/cursos/pdf');
        navigate('/admin/reportes/historial-cursos?tipo=CURSOS');
      }
    } catch (error) {
      alert('Error al generar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: 'Ingresos Totales',
      value: '$18,000',
      icon: <AttachMoney />,
      color: '#10b981',
      change: '+12%'
    },
    {
      title: 'Usuarios Activos',
      value: '250',
      icon: <People />,
      color: '#3b82f6',
      change: '+8%'
    },
    {
      title: 'Eventos Realizados',
      value: '15',
      icon: <Event />,
      color: '#f59e0b',
      change: '+25%'
    },
    {
      title: 'Cursos Completados',
      value: '115',
      icon: <School />,
      color: '#7c3aed',
      change: '+15%'
    }
  ];

  const reportTypes = [
    {
      key: 'usuarios',
      title: 'Reporte de Usuarios',
      description: 'Estadísticas detalladas de usuarios registrados',
      icon: <People />,
      color: '#3b82f6'
    },
    {
      key: 'eventos',
      title: 'Reporte de Eventos',
      description: 'Análisis de eventos y participación',
      icon: <Event />,
      color: '#10b981'
    },
    {
      key: 'cursos',
      title: 'Reporte de Cursos',
      description: 'Estadísticas de cursos y completación',
      icon: <School />,
      color: '#f59e0b'
    },
    {
      key: 'financiero',
      title: 'Reporte Financiero',
      description: 'Análisis de ingresos y gastos',
      icon: <AttachMoney />,
      color: '#ef4444'
    }
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <AdminSidebar />
      
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Reportes y Análisis
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Visualiza estadísticas y genera reportes del sistema
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
            <CircularProgress size={60} sx={{ color: '#7c3aed' }} />
          </Box>
        ) : (
          <>
            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {stats.map((stat, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {stat.title}
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                            {stat.value}
                          </Typography>
                          <Chip
                            label={stat.change}
                            size="small"
                            sx={{
                              bgcolor: stat.change.startsWith('+') ? '#dcfce7' : '#fef2f2',
                              color: stat.change.startsWith('+') ? '#16a34a' : '#dc2626',
                              fontWeight: 500
                            }}
                          />
                        </Box>
                        <Avatar sx={{ bgcolor: stat.color, width: 56, height: 56 }}>
                          {stat.icon}
                        </Avatar>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Report Generation */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                Generar Reportes
              </Typography>
              <Grid container spacing={3}>
                {reportTypes.map((report, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent sx={{ textAlign: 'center', p: 3 }}>
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
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                          {report.description}
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<Event />}
                          sx={{
                            bgcolor: report.color,
                            '&:hover': { bgcolor: report.color, opacity: 0.9 }
                          }}
                          fullWidth
                          onClick={() => handleVerHistorial(report.key)}
                        >
                          Ver Reportes
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Data Tables */}
            <Grid container spacing={3}>
              {/* Eventos más populares */}
              <Grid item xs={12} md={6}>
                <Paper elevation={2} sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Event sx={{ mr: 2, color: '#7c3aed' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Eventos Más Populares
                    </Typography>
                  </Box>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Evento</TableCell>
                          <TableCell align="right">Inscritos</TableCell>
                          <TableCell align="right">Ingresos</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {reportData.eventos.map((evento, index) => (
                          <TableRow key={index}>
                            <TableCell>{evento.nombre}</TableCell>
                            <TableCell align="right">{evento.inscritos}</TableCell>
                            <TableCell align="right">${evento.ingresos}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>

              {/* Cursos con mejor rendimiento */}
              <Grid item xs={12} md={6}>
                <Paper elevation={2} sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <School sx={{ mr: 2, color: '#7c3aed' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Rendimiento de Cursos
                    </Typography>
                  </Box>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Curso</TableCell>
                          <TableCell align="right">Estudiantes</TableCell>
                          <TableCell align="right">Completados</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {reportData.cursos.map((curso, index) => (
                          <TableRow key={index}>
                            <TableCell>{curso.nombre}</TableCell>
                            <TableCell align="right">{curso.estudiantes}</TableCell>
                            <TableCell align="right">
                              {curso.completados} ({Math.round((curso.completados / curso.estudiantes) * 100)}%)
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>

              {/* Distribución de ingresos */}
              <Grid item xs={12} md={6}>
                <Paper elevation={2} sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <AttachMoney sx={{ mr: 2, color: '#7c3aed' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Distribución de Ingresos
                    </Typography>
                  </Box>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Concepto</TableCell>
                          <TableCell align="right">Monto</TableCell>
                          <TableCell align="right">Porcentaje</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {reportData.ingresos.map((ingreso, index) => (
                          <TableRow key={index}>
                            <TableCell>{ingreso.concepto}</TableCell>
                            <TableCell align="right">${ingreso.monto}</TableCell>
                            <TableCell align="right">{ingreso.porcentaje}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>

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
                    disabled={loading && report.tipo !== 'financiero'}
                    onClick={() => handleGenerar(report.tipo)}
                    startIcon={<Assessment />}
                    sx={{ mt: 'auto' }}
                  >
                    {loading && report.tipo !== 'financiero' ? <CircularProgress size={24} /> : 
                     report.tipo === 'financiero' ? 'Ver Historial' : 'Generar'}
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