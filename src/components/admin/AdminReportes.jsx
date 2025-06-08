import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import {
  BarChart,
  TrendingUp,
  People,
  Event,
  School,
  AttachMoney,
  Download,
  Assessment,
  Timeline
} from '@mui/icons-material';
import AdminSidebar from './AdminSidebar';

const AdminReportes = () => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    usuarios: [],
    eventos: [],
    cursos: [],
    ingresos: []
  });

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    try {
      setLoading(true);
      // Aquí irían las llamadas reales a la API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Datos simulados
      setReportData({
        usuarios: [
          { mes: 'Enero', total: 120, nuevos: 25 },
          { mes: 'Febrero', total: 145, nuevos: 30 },
          { mes: 'Marzo', total: 180, nuevos: 35 },
          { mes: 'Abril', total: 210, nuevos: 40 },
          { mes: 'Mayo', total: 250, nuevos: 45 }
        ],
        eventos: [
          { nombre: 'Conferencia Tech 2024', inscritos: 150, ingresos: 7500 },
          { nombre: 'Workshop Web Dev', inscritos: 35, ingresos: 1050 },
          { nombre: 'Seminario Marketing', inscritos: 80, ingresos: 3200 }
        ],
        cursos: [
          { nombre: 'JavaScript Avanzado', estudiantes: 45, completados: 38 },
          { nombre: 'React Fundamentals', estudiantes: 60, completados: 52 },
          { nombre: 'Node.js Backend', estudiantes: 30, completados: 25 }
        ],
        ingresos: [
          { concepto: 'Eventos', monto: 11750, porcentaje: 65 },
          { concepto: 'Cursos', monto: 5250, porcentaje: 29 },
          { concepto: 'Otros', monto: 1000, porcentaje: 6 }
        ]
      });
    } catch (error) {
      console.error('Error al cargar datos de reportes:', error);
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
      title: 'Reporte de Usuarios',
      description: 'Estadísticas detalladas de usuarios registrados',
      icon: <People />,
      color: '#3b82f6'
    },
    {
      title: 'Reporte de Eventos',
      description: 'Análisis de eventos y participación',
      icon: <Event />,
      color: '#10b981'
    },
    {
      title: 'Reporte de Cursos',
      description: 'Estadísticas de cursos y completación',
      icon: <School />,
      color: '#f59e0b'
    },
    {
      title: 'Reporte Financiero',
      description: 'Análisis de ingresos y gastos',
      icon: <AttachMoney />,
      color: '#ef4444'
    }
  ];

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f5f5f5' }}>
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
                          startIcon={<Download />}
                          sx={{
                            bgcolor: report.color,
                            '&:hover': { bgcolor: report.color, opacity: 0.9 }
                          }}
                          fullWidth
                        >
                          Descargar
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

              {/* Crecimiento de usuarios */}
              <Grid item xs={12} md={6}>
                <Paper elevation={2} sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <TrendingUp sx={{ mr: 2, color: '#7c3aed' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Crecimiento de Usuarios
                    </Typography>
                  </Box>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Mes</TableCell>
                          <TableCell align="right">Total</TableCell>
                          <TableCell align="right">Nuevos</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {reportData.usuarios.map((usuario, index) => (
                          <TableRow key={index}>
                            <TableCell>{usuario.mes}</TableCell>
                            <TableCell align="right">{usuario.total}</TableCell>
                            <TableCell align="right">+{usuario.nuevos}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    </Box>
  );
};

export default AdminReportes; 