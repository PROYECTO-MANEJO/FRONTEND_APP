import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Tooltip
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Download,
  Visibility,
  Event,
  School,
  Payment,
  Description,
  FilterList,
  Refresh
} from '@mui/icons-material';

import AdminSidebar from './AdminSidebar';
import { useSidebarLayout } from '../../hooks/useSidebarLayout';
import { inscripcionService } from '../../services/inscripcionService';
import api from '../../services/api';

const AdminInscripciones = () => {
  const { getMainContentStyle } = useSidebarLayout();
  const [tabValue, setTabValue] = useState(0);
  const [inscripcionesEventos, setInscripcionesEventos] = useState([]);
  const [inscripcionesCursos, setInscripcionesCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  
  // Estados para modal de aprobación
  const [modalOpen, setModalOpen] = useState(false);
  const [inscripcionSeleccionada, setInscripcionSeleccionada] = useState(null);
  const [accionSeleccionada, setAccionSeleccionada] = useState('');
  const [comentario, setComentario] = useState('');
  const [procesando, setProcesando] = useState(false);

  // Estados para modal de carta de motivación
  const [modalCartaOpen, setModalCartaOpen] = useState(false);
  const [cartaMotivacionSeleccionada, setCartaMotivacionSeleccionada] = useState('');

  // Estadísticas
  const [stats, setStats] = useState({
    totalInscripciones: 0,
    pendientes: 0,
    aprobadas: 0,
    rechazadas: 0
  });

  useEffect(() => {
    cargarInscripciones();
  }, []);

  const cargarInscripciones = async () => {
    try {
      setLoading(true);
      setError(null);

      const [eventosResponse, cursosResponse] = await Promise.all([
        api.get('/admin/inscripciones/eventos'),
        api.get('/admin/inscripciones/cursos')
      ]);

      const eventosData = eventosResponse.data.data || [];
      const cursosData = cursosResponse.data.data || [];

      setInscripcionesEventos(eventosData);
      setInscripcionesCursos(cursosData);

      // Calcular estadísticas
      const todasInscripciones = [...eventosData, ...cursosData];
      setStats({
        totalInscripciones: todasInscripciones.length,
        pendientes: todasInscripciones.filter(i => (i.estado_pago || i.estado_pago_cur) === 'PENDIENTE').length,
        aprobadas: todasInscripciones.filter(i => (i.estado_pago || i.estado_pago_cur) === 'APROBADO').length,
        rechazadas: todasInscripciones.filter(i => (i.estado_pago || i.estado_pago_cur) === 'RECHAZADO').length
      });

    } catch (error) {
      console.error('Error cargando inscripciones:', error);
      setError('Error al cargar las inscripciones');
    } finally {
      setLoading(false);
    }
  };

  const handleDescargarComprobante = async (inscripcionId, tipo) => {
    try {
      let blob;
      if (tipo === 'evento') {
        blob = await inscripcionService.descargarComprobantePagoEvento(inscripcionId);
      } else {
        blob = await inscripcionService.descargarComprobantePagoCurso(inscripcionId);
      }

      // Crear URL del blob y descargar
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `comprobante_${tipo}_${inscripcionId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error descargando comprobante:', error);
      setError('Error al descargar el comprobante');
    }
  };

  const handleAprobarRechazar = (inscripcion, accion, tipo) => {
    setInscripcionSeleccionada({ ...inscripcion, tipo });
    setAccionSeleccionada(accion);
    setModalOpen(true);
  };

  const handleVerCartaMotivacion = (inscripcion) => {
    setCartaMotivacionSeleccionada(inscripcion.carta_motivacion || 'No hay carta de motivación disponible');
    setModalCartaOpen(true);
  };

  const confirmarAccion = async () => {
    if (!inscripcionSeleccionada || !accionSeleccionada) return;

    try {
      setProcesando(true);
      
      const endpoint = inscripcionSeleccionada.tipo === 'evento' 
        ? `/inscripciones/evento/aprobar-inscripcion/${inscripcionSeleccionada.id_ins}`
        : `/inscripcionesCursos/curso/aprobar/${inscripcionSeleccionada.id_ins_cur}`;

      await api.put(endpoint, {
        estado: accionSeleccionada,
        comentario: comentario
      });

      // Recargar inscripciones
      await cargarInscripciones();
      
      setModalOpen(false);
      setInscripcionSeleccionada(null);
      setAccionSeleccionada('');
      setComentario('');

    } catch (error) {
      console.error('Error procesando inscripción:', error);
      setError('Error al procesar la inscripción');
    } finally {
      setProcesando(false);
    }
  };

  const filtrarInscripciones = (inscripciones, esEvento = true) => {
    if (filtroEstado === 'TODOS') return inscripciones;
    
    return inscripciones.filter(inscripcion => {
      const estado = esEvento ? inscripcion.estado_pago : inscripcion.estado_pago_cur;
      return estado === filtroEstado;
    });
  };

  const TablaInscripciones = ({ inscripciones, tipo }) => {
    const inscripcionesFiltradas = filtrarInscripciones(inscripciones, tipo === 'evento');

    return (
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell><strong>Usuario</strong></TableCell>
              <TableCell><strong>{tipo === 'evento' ? 'Evento' : 'Curso'}</strong></TableCell>
              <TableCell><strong>Fecha Inscripción</strong></TableCell>
              <TableCell><strong>Estado</strong></TableCell>
              <TableCell><strong>Método Pago</strong></TableCell>
              <TableCell><strong>Valor</strong></TableCell>
              <TableCell><strong>Comprobante</strong></TableCell>
              <TableCell><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inscripcionesFiltradas.map((inscripcion) => {
              const esEvento = tipo === 'evento';
              const item = esEvento ? inscripcion.evento : inscripcion.curso;
              const estado = esEvento ? inscripcion.estado_pago : inscripcion.estado_pago_cur;
              const fechaInscripcion = esEvento ? inscripcion.fec_ins : inscripcion.fec_ins_cur;
              const metodoPago = esEvento ? inscripcion.met_pag_ins : inscripcion.met_pag_ins_cur;
              const valor = esEvento ? inscripcion.val_ins : inscripcion.val_ins_cur;
              const tieneComprobante = !!inscripcion.comprobante_pago_pdf;
              const inscripcionId = esEvento ? inscripcion.id_ins : inscripcion.id_ins_cur;

              return (
                <TableRow key={inscripcionId} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {inscripcion.usuario?.nom_usu} {inscripcion.usuario?.ape_usu}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {inscripcion.usuario?.cor_usu}
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {esEvento ? item?.nom_eve : item?.nom_cur}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(fechaInscripcion).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      label={estado}
                      color={
                        estado === 'APROBADO' ? 'success' :
                        estado === 'PENDIENTE' ? 'warning' : 'error'
                      }
                      size="small"
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {metodoPago ? metodoPago.replace(/_/g, ' ') : 'Gratuito'}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {valor ? `$${valor}` : 'Gratuito'}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    {tieneComprobante ? (
                      <Tooltip title="Descargar comprobante PDF">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleDescargarComprobante(inscripcionId, tipo)}
                        >
                          <Download />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        Sin comprobante
                      </Typography>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {/* Ícono para ver carta de motivación - solo para cursos que la requieren */}
                      {!esEvento && item?.requiere_carta_motivacion && inscripcion.carta_motivacion && (
                        <Tooltip title="Ver carta de motivación">
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => handleVerCartaMotivacion(inscripcion)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {estado === 'PENDIENTE' && (
                        <>
                          <Tooltip title="Aprobar">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleAprobarRechazar(inscripcion, 'APROBADO', tipo)}
                            >
                              <CheckCircle />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Rechazar">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleAprobarRechazar(inscripcion, 'RECHAZADO', tipo)}
                            >
                              <Cancel />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f5f5f5' }}>
        <AdminSidebar />
        <Box sx={{ flexGrow: 1, p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', ...getMainContentStyle() }}>
          <CircularProgress size={60} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f5f5f5' }}>
      <AdminSidebar />
      <Box sx={{ flexGrow: 1, p: 3, overflow: 'auto', ...getMainContentStyle() }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700, color: '#1a1a1a' }}>
          📋 Gestión de Inscripciones
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Estadísticas */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 700 }}>
                  {stats.totalInscripciones}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Inscripciones
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: '#f57c00', fontWeight: 700 }}>
                  {stats.pendientes}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pendientes
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: '#2e7d32', fontWeight: 700 }}>
                  {stats.aprobadas}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Aprobadas
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: '#d32f2f', fontWeight: 700 }}>
                  {stats.rechazadas}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Rechazadas
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Controles */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Filtrar por Estado</InputLabel>
            <Select
              value={filtroEstado}
              label="Filtrar por Estado"
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <MenuItem value="TODOS">Todos</MenuItem>
              <MenuItem value="PENDIENTE">Pendientes</MenuItem>
              <MenuItem value="APROBADO">Aprobados</MenuItem>
              <MenuItem value="RECHAZADO">Rechazados</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={cargarInscripciones}
          >
            Actualizar
          </Button>
        </Box>

        {/* Tabs para Eventos y Cursos */}
        <Paper elevation={2}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab
              icon={<Event />}
              label={`Eventos (${filtrarInscripciones(inscripcionesEventos, true).length})`}
              iconPosition="start"
            />
            <Tab
              icon={<School />}
              label={`Cursos (${filtrarInscripciones(inscripcionesCursos, false).length})`}
              iconPosition="start"
            />
          </Tabs>

          <Box sx={{ p: 3 }}>
            {tabValue === 0 && (
              <TablaInscripciones inscripciones={inscripcionesEventos} tipo="evento" />
            )}
            {tabValue === 1 && (
              <TablaInscripciones inscripciones={inscripcionesCursos} tipo="curso" />
            )}
          </Box>
        </Paper>

        {/* Modal de Carta de Motivación */}
        <Dialog open={modalCartaOpen} onClose={() => setModalCartaOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Description color="primary" />
            Carta de Motivación
          </DialogTitle>
          <DialogContent>
            <Box sx={{ 
              p: 3, 
              bgcolor: '#f9f9f9', 
              borderRadius: 2, 
              border: '1px solid #e0e0e0',
              minHeight: 200,
              maxHeight: 400,
              overflow: 'auto'
            }}>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                {cartaMotivacionSeleccionada}
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setModalCartaOpen(false)} variant="contained">
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal de Confirmación */}
        <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {accionSeleccionada === 'APROBADO' ? 'Aprobar Inscripción' : 'Rechazar Inscripción'}
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              ¿Estás seguro de que deseas {accionSeleccionada === 'APROBADO' ? 'aprobar' : 'rechazar'} esta inscripción?
            </Typography>
            
            {inscripcionSeleccionada && (
              <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="subtitle2">
                  Usuario: {inscripcionSeleccionada.usuario?.nom_usu} {inscripcionSeleccionada.usuario?.ape_usu}
                </Typography>
                <Typography variant="body2">
                  {inscripcionSeleccionada.tipo === 'evento' ? 'Evento' : 'Curso'}: {
                    inscripcionSeleccionada.tipo === 'evento' 
                      ? inscripcionSeleccionada.evento?.nom_eve 
                      : inscripcionSeleccionada.curso?.nom_cur
                  }
                </Typography>
              </Box>
            )}

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Comentario (opcional)"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Agrega un comentario sobre esta decisión..."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setModalOpen(false)} disabled={procesando}>
              Cancelar
            </Button>
            <Button
              onClick={confirmarAccion}
              variant="contained"
              color={accionSeleccionada === 'APROBADO' ? 'success' : 'error'}
              disabled={procesando}
            >
              {procesando ? <CircularProgress size={20} /> : 'Confirmar'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default AdminInscripciones; 