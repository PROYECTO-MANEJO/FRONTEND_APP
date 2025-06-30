import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
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
  Badge
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Visibility,
  Schedule,
  Assignment,
  Person,
  Code,
  BugReport,
  PlayArrow,
  Pause,
  Done,
  FilterList,
  Refresh
} from '@mui/icons-material';
// import { useAuth } from '../../context/AuthContext';
import solicitudesService from '../../services/solicitudesService';

const DashboardAprobaciones = () => {
  
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  
  // Estados para diálogos
  const [dialogoAprobacion, setDialogoAprobacion] = useState({ open: false, solicitud: null });
  const [dialogoRechazo, setDialogoRechazo] = useState({ open: false, solicitud: null });
  const [comentarios, setComentarios] = useState('');
  const [desarrolladorSeleccionado, setDesarrolladorSeleccionado] = useState('');
  const [desarrolladores, setDesarrolladores] = useState([]);
  
  const [stats, setStats] = useState({
    pendientes: 0,
    enRevision: 0,
    pendientesAprobacion: 0,
    aprobadas: 0,
    rechazadas: 0,
    enDesarrollo: 0
  });

  // Tabs de filtrado
  const tabs = [
    { label: 'Pendientes', estado: 'PENDIENTE', icon: <Schedule />, color: '#ff9800' },
    { label: 'En Revisión', estado: 'EN_REVISION', icon: <Assignment />, color: '#2196f3' },
    { label: 'Pend. Aprobación', estado: 'PENDIENTE_APROBACION_TECNICA', icon: <CheckCircle />, color: '#f57c00' },
    { label: 'Aprobadas', estado: 'APROBADA', icon: <Done />, color: '#4caf50' },
    { label: 'En Desarrollo', estado: 'EN_DESARROLLO', icon: <Code />, color: '#3f51b5' }
  ];

  useEffect(() => {
    loadSolicitudes();
    loadDesarrolladores();
  }, [activeTab]);

  const loadSolicitudes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const estadoFiltro = tabs[activeTab]?.estado;
      const response = await solicitudesService.obtenerTodasLasSolicitudes({
        estado: estadoFiltro
      });
      
      setSolicitudes(response.data || []);
      
      // Calcular estadísticas
      const todasResponse = await solicitudesService.obtenerTodasLasSolicitudes();
      const todas = todasResponse.data || [];
      
      const stats = {
        pendientes: todas.filter(s => s.estado_sol === 'PENDIENTE').length,
        enRevision: todas.filter(s => s.estado_sol === 'EN_REVISION').length,
        pendientesAprobacion: todas.filter(s => 
          s.estado_sol === 'PENDIENTE_APROBACION_TECNICA' || 
          s.estado_sol === 'PENDIENTE_APROBACION_NEGOCIO'
        ).length,
        aprobadas: todas.filter(s => s.estado_sol === 'APROBADA').length,
        rechazadas: todas.filter(s => s.estado_sol === 'RECHAZADA').length,
        enDesarrollo: todas.filter(s => s.estado_sol === 'EN_DESARROLLO').length
      };
      setStats(stats);
      
    } catch (error) {
      console.error('Error cargando solicitudes:', error);
      setError('Error al cargar las solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const loadDesarrolladores = async () => {
    try {
      const response = await solicitudesService.obtenerDesarrolladoresDisponibles();
      setDesarrolladores(response.data || []);
    } catch (error) {
      console.error('Error cargando desarrolladores:', error);
    }
  };

  const handleAprobar = async () => {
    try {
      const { solicitud } = dialogoAprobacion;
      
      // Aprobar solicitud
      await solicitudesService.responderSolicitud(solicitud.id_sol, {
        aprobada: true,
        comentarios_admin_sol: comentarios
      });
      
      // Si se seleccionó desarrollador, asignar
      if (desarrolladorSeleccionado) {
        await solicitudesService.asignarDesarrollador(solicitud.id_sol, desarrolladorSeleccionado);
      }
      
      setDialogoAprobacion({ open: false, solicitud: null });
      setComentarios('');
      setDesarrolladorSeleccionado('');
      loadSolicitudes();
      
    } catch (error) {
      console.error('Error aprobando solicitud:', error);
      setError('Error al aprobar la solicitud');
    }
  };

  const handleRechazar = async () => {
    try {
      const { solicitud } = dialogoRechazo;
      
      await solicitudesService.responderSolicitud(solicitud.id_sol, {
        aprobada: false,
        comentarios_admin_sol: comentarios
      });
      
      setDialogoRechazo({ open: false, solicitud: null });
      setComentarios('');
      loadSolicitudes();
      
    } catch (error) {
      console.error('Error rechazando solicitud:', error);
      setError('Error al rechazar la solicitud');
    }
  };

  const handleCambiarEstado = async (solicitudId, nuevoEstado) => {
    try {
      await solicitudesService.actualizarEstado(solicitudId, nuevoEstado);
      loadSolicitudes();
    } catch (error) {
      console.error('Error cambiando estado:', error);
      setError('Error al cambiar el estado');
    }
  };

  const getEstadoColor = (estado) => {
    return solicitudesService.getColorPorEstado(estado);
  };

  const getPrioridadColor = (prioridad) => {
    return solicitudesService.getColorPorPrioridad(prioridad);
  };

  if (loading && solicitudes.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2', mb: 1 }}>
          Dashboard de Aprobaciones
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Gestiona las solicitudes de cambio que requieren tu aprobación
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Estadísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ bgcolor: '#fff3e0', textAlign: 'center' }}>
            <CardContent sx={{ py: 2 }}>
              <Schedule sx={{ fontSize: 40, color: '#ff9800', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                {stats.pendientes}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pendientes
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ bgcolor: '#e3f2fd', textAlign: 'center' }}>
            <CardContent sx={{ py: 2 }}>
              <Assignment sx={{ fontSize: 40, color: '#2196f3', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2196f3' }}>
                {stats.enRevision}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                En Revisión
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ bgcolor: '#fff8e1', textAlign: 'center' }}>
            <CardContent sx={{ py: 2 }}>
              <CheckCircle sx={{ fontSize: 40, color: '#f57c00', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f57c00' }}>
                {stats.pendientesAprobacion}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                P. Aprobación
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ bgcolor: '#e8f5e8', textAlign: 'center' }}>
            <CardContent sx={{ py: 2 }}>
              <Done sx={{ fontSize: 40, color: '#4caf50', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                {stats.aprobadas}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Aprobadas
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ bgcolor: '#f3e5f5', textAlign: 'center' }}>
            <CardContent sx={{ py: 2 }}>
              <Code sx={{ fontSize: 40, color: '#3f51b5', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>
                {stats.enDesarrollo}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                En Desarrollo
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ bgcolor: '#ffebee', textAlign: 'center' }}>
            <CardContent sx={{ py: 2 }}>
              <Cancel sx={{ fontSize: 40, color: '#f44336', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f44336' }}>
                {stats.rechazadas}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Rechazadas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs de Filtrado */}
      <Paper elevation={1} sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabs.map((tab, index) => (
            <Tab 
              key={index}
              icon={
                <Badge badgeContent={Object.values(stats)[index]} color="error">
                  {tab.icon}
                </Badge>
              }
              label={tab.label}
              sx={{ color: tab.color }}
            />
          ))}
        </Tabs>
      </Paper>

      {/* Tabla de Solicitudes */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {tabs[activeTab]?.label} ({solicitudes.length})
            </Typography>
            
            <Button 
              variant="outlined" 
              startIcon={<Refresh />}
              onClick={loadSolicitudes}
              disabled={loading}
            >
              Actualizar
            </Button>
          </Box>

          {solicitudes.length === 0 ? (
            <Alert severity="info">
              No hay solicitudes en estado "{tabs[activeTab]?.label}" en este momento.
            </Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell><strong>Solicitud</strong></TableCell>
                    <TableCell><strong>Solicitante</strong></TableCell>
                    <TableCell><strong>Tipo</strong></TableCell>
                    <TableCell><strong>Prioridad</strong></TableCell>
                    <TableCell><strong>Fecha Creación</strong></TableCell>
                    <TableCell><strong>Desarrollador</strong></TableCell>
                    <TableCell><strong>Acciones</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {solicitudes.map((solicitud) => (
                    <TableRow key={solicitud.id_sol} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {solicitud.titulo_sol}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {solicitud.id_sol.substring(0, 8)}...
                          </Typography>
                          <Chip 
                            label={solicitud.estado_sol} 
                            size="small" 
                            sx={{ 
                              mt: 0.5,
                              bgcolor: getEstadoColor(solicitud.estado_sol),
                              color: 'white',
                              display: 'block',
                              width: 'fit-content'
                            }}
                          />
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {solicitud.solicitante || 'N/A'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {solicitud.email_solicitante}
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Chip 
                          label={solicitud.tipo_cambio_sol} 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Chip 
                          label={solicitud.prioridad_sol} 
                          size="small" 
                          sx={{ 
                            bgcolor: getPrioridadColor(solicitud.prioridad_sol),
                            color: 'white'
                          }}
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2">
                          {solicitudesService.formatearFecha(solicitud.fec_creacion_sol)}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        {solicitud.desarrollador_asignado ? (
                          <Typography variant="body2">
                            {solicitud.desarrollador_asignado}
                          </Typography>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            Sin asignar
                          </Typography>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {/* Acciones según el estado */}
                          {solicitud.estado_sol === 'PENDIENTE' && (
                            <Tooltip title="Iniciar Revisión">
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => handleCambiarEstado(solicitud.id_sol, 'EN_REVISION')}
                              >
                                <PlayArrow />
                              </IconButton>
                            </Tooltip>
                          )}
                          
                          {(solicitud.estado_sol === 'EN_REVISION' || 
                            solicitud.estado_sol === 'PENDIENTE_APROBACION_TECNICA') && (
                            <>
                              <Tooltip title="Aprobar">
                                <IconButton 
                                  size="small" 
                                  color="success"
                                  onClick={() => setDialogoAprobacion({ open: true, solicitud })}
                                >
                                  <CheckCircle />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Rechazar">
                                <IconButton 
                                  size="small" 
                                  color="error"
                                  onClick={() => setDialogoRechazo({ open: true, solicitud })}
                                >
                                  <Cancel />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                          
                          {/* Ver detalles - siempre disponible */}
                          <Tooltip title="Ver Detalles">
                            <IconButton 
                              size="small" 
                              color="info"
                              onClick={() => window.open(`/admin/solicitud/${solicitud.id_sol}`, '_blank')}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de Aprobación */}
      <Dialog open={dialogoAprobacion.open} onClose={() => setDialogoAprobacion({ open: false, solicitud: null })} maxWidth="md" fullWidth>
        <DialogTitle>
          Aprobar Solicitud: {dialogoAprobacion.solicitud?.titulo_sol}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Comentarios de Aprobación"
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              sx={{ mb: 3 }}
            />
            
            <FormControl fullWidth>
              <InputLabel>Asignar Desarrollador (Opcional)</InputLabel>
              <Select
                value={desarrolladorSeleccionado}
                label="Asignar Desarrollador (Opcional)"
                onChange={(e) => setDesarrolladorSeleccionado(e.target.value)}
              >
                <MenuItem value="">Sin asignar</MenuItem>
                {desarrolladores.map((dev) => (
                  <MenuItem key={dev.id_usu} value={dev.id_usu}>
                    {dev.nombre_completo} - {dev.carga_trabajo || 0} solicitudes
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogoAprobacion({ open: false, solicitud: null })}>
            Cancelar
          </Button>
          <Button onClick={handleAprobar} variant="contained" color="success">
            Aprobar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de Rechazo */}
      <Dialog open={dialogoRechazo.open} onClose={() => setDialogoRechazo({ open: false, solicitud: null })} maxWidth="md" fullWidth>
        <DialogTitle>
          Rechazar Solicitud: {dialogoRechazo.solicitud?.titulo_sol}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Motivo del Rechazo (Obligatorio)"
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogoRechazo({ open: false, solicitud: null })}>
            Cancelar
          </Button>
          <Button 
            onClick={handleRechazar} 
            variant="contained" 
            color="error"
            disabled={!comentarios.trim()}
          >
            Rechazar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DashboardAprobaciones; 