import React, { useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Avatar, Button, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import {
  People, Event, School, AttachMoney, Assessment, Download
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

const indicadores = [
  { label: 'Ingresos Totales', value: '$18,000', icon: <AttachMoney />, color: '#10b981', growth: '+12%' },
  { label: 'Usuarios Activos', value: '250', icon: <People />, color: '#3b82f6', growth: '+8%' },
  { label: 'Eventos Realizados', value: '15', icon: <Event />, color: '#f59e0b', growth: '+25%' },
  { label: 'Cursos Completados', value: '115', icon: <School />, color: '#a855f7', growth: '+15%' }
];

const eventosPopulares = [
  { evento: 'Conferencia Tech 2024', inscritos: 150, ingresos: '$7500' },
  { evento: 'Workshop Web Dev', inscritos: 35, ingresos: '$1050' },
  { evento: 'Seminario Marketing', inscritos: 80, ingresos: '$3200' }
];

const rendimientoCursos = [
  { curso: 'JavaScript Avanzado', estudiantes: 45, completados: '38 (84%)' },
  { curso: 'React Fundamentals', estudiantes: 60, completados: '52 (87%)' },
  { curso: 'Node.js Backend', estudiantes: 30, completados: '25 (83%)' }
];

const distribucionIngresos = [
  { concepto: 'Eventos', monto: '$11750', porcentaje: '65%' },
  { concepto: 'Cursos', monto: '$5250', porcentaje: '29%' },
  { concepto: 'Otros', monto: '$1000', porcentaje: '6%' }
];

const crecimientoUsuarios = [
  { mes: 'Enero', total: 120, nuevos: '+25' },
  { mes: 'Febrero', total: 145, nuevos: '+30' },
  { mes: 'Marzo', total: 175, nuevos: '+40' }
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
    } catch (error) {
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
        <Typography variant="subtitle1" sx={{ mb: 3 }}>
          Visualiza estadísticas y genera reportes del sistema
        </Typography>

        {/* Indicadores */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {indicadores.map((ind, idx) => (
            <Grid item xs={12} sm={6} md={3} key={ind.label}>
              <Card>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: ind.color }}>{ind.icon}</Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{ind.value}</Typography>
                    <Typography variant="body2" color="text.secondary">{ind.label}</Typography>
                    <Typography variant="caption" color="success.main">{ind.growth}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Generar Reportes */}
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Generar Reportes
        </Typography>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {reportTypes.map((report) => (
            <Grid item xs={12} sm={6} md={3} key={report.tipo}>
              <Card>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Avatar sx={{ bgcolor: report.color, width: 64, height: 64, mx: 'auto', mb: 2 }}>
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
                    color={report.btnColor}
                    fullWidth
                    disabled={loading}
                    onClick={() => handleGenerar(report.tipo)}
                    startIcon={<Assessment />}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Generar'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Tablas de análisis */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Eventos Más Populares</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Evento</TableCell>
                      <TableCell>Inscritos</TableCell>
                      <TableCell>Ingresos</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {eventosPopulares.map(ev => (
                      <TableRow key={ev.evento}>
                        <TableCell>{ev.evento}</TableCell>
                        <TableCell>{ev.inscritos}</TableCell>
                        <TableCell>{ev.ingresos}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Rendimiento de Cursos</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Curso</TableCell>
                      <TableCell>Estudiantes</TableCell>
                      <TableCell>Completado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rendimientoCursos.map(curso => (
                      <TableRow key={curso.curso}>
                        <TableCell>{curso.curso}</TableCell>
                        <TableCell>{curso.estudiantes}</TableCell>
                        <TableCell>{curso.completados}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Distribución de Ingresos</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Concepto</TableCell>
                      <TableCell>Monto</TableCell>
                      <TableCell>Porcentaje</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {distribucionIngresos.map(row => (
                      <TableRow key={row.concepto}>
                        <TableCell>{row.concepto}</TableCell>
                        <TableCell>{row.monto}</TableCell>
                        <TableCell>{row.porcentaje}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Crecimiento de Usuarios</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Mes</TableCell>
                      <TableCell>Total</TableCell>
                      <TableCell>Nuevos</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {crecimientoUsuarios.map(row => (
                      <TableRow key={row.mes}>
                        <TableCell>{row.mes}</TableCell>
                        <TableCell>{row.total}</TableCell>
                        <TableCell>{row.nuevos}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default AdminReportes;