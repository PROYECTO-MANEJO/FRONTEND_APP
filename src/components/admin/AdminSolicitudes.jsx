import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Pagination,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Avatar,
  Tooltip,
  Badge,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Visibility,
  FilterList,
  Refresh,
  Check,
  Close,
  Edit,
  BarChart,
  Assignment,
  Person,
  Category,
  PriorityHigh,
  AccessTime,
  RequestPage,
  Engineering,
} from '@mui/icons-material';
import solicitudesService from '../../services/solicitudesService';
import AdminSidebar from './AdminSidebar';
import { useSidebarLayout } from '../../hooks/useSidebarLayout';
import GestionTecnicaSolicitud from './GestionTecnicaSolicitud';

const AdminSolicitudes = () => {
  const { getMainContentStyle } = useSidebarLayout();
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [respuestaDialog, setRespuestaDialog] = useState(false);
  const [gestionTecnicaDialog, setGestionTecnicaDialog] = useState(false);
  const [estadisticas, setEstadisticas] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  
  // Filtros y paginación
  const [filtros, setFiltros] = useState({
    estado: '',
    tipo_cambio: '',
    prioridad: '',
    page: 1,
    limit: 8
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 8,
    total: 0,
    totalPages: 0
  });

  // Formulario de respuesta/edición
  const [respuestaForm, setRespuestaForm] = useState({
    estado_sol: '',
    prioridad_sol: '',
    comentarios_admin_sol: '', // Comentario público para el usuario
    comentarios_internos_sol: '' // Comentario interno para el equipo
  });

  // Estado para controlar si es edición o respuesta inicial
  const [esEdicion, setEsEdicion] = useState(false);

  const estados = solicitudesService.getOpcionesEstado();
  const tiposCambio = solicitudesService.getOpcionesTipoCambio();
  const prioridades = solicitudesService.getOpcionesPrioridad();

  useEffect(() => {
    cargarSolicitudes();
    cargarEstadisticas();
  }, [filtros]);

  const cargarSolicitudes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await solicitudesService.obtenerTodasLasSolicitudes(filtros);
      setSolicitudes(response.data.solicitudes);
      setPagination(response.data.pagination);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const response = await solicitudesService.obtenerEstadisticas();
      setEstadisticas(response.data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const handleFiltroChange = (campo) => (event) => {
    setFiltros({
      ...filtros,
      [campo]: event.target.value,
      page: 1
    });
  };

  const handlePageChange = (event, newPage) => {
    setFiltros({
      ...filtros,
      page: newPage
    });
  };

  const limpiarFiltros = () => {
    console.log('Limpiando filtros...');
    const nuevosFiltros = {
      estado: '',
      tipo_cambio: '',
      prioridad: '',
      page: 1,
      limit: 8
    };
    console.log('Nuevos filtros:', nuevosFiltros);
    setFiltros(nuevosFiltros);
  };

  const verDetalle = async (solicitud) => {
    try {
      setLoading(true);
      // Cargar los detalles completos de la solicitud desde el backend
      const response = await solicitudesService.obtenerSolicitudAdmin(solicitud.id_sol);
      setSelectedSolicitud(response.data);
      setDialogOpen(true);
    } catch (error) {
      setError('Error al cargar los detalles de la solicitud');
      console.error('Error cargando detalles:', error);
    } finally {
      setLoading(false);
    }
  };

  const abrirRespuesta = (solicitud) => {
    setSelectedSolicitud(solicitud);
    setRespuestaForm({
      estado_sol: '',
      prioridad_sol: solicitud.prioridad_sol,
      comentarios_admin_sol: '',
      comentarios_internos_sol: ''
    });
    setEsEdicion(false);
    setRespuestaDialog(true);
  };

  const abrirGestionTecnica = (solicitud) => {
    setSelectedSolicitud(solicitud);
    setGestionTecnicaDialog(true);
  };

  const handleGestionTecnicaCompleta = async () => {
    await cargarSolicitudes();
    await cargarEstadisticas();
  };

  const handleRespuestaSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Preparar datos para enviar
      let datosAEnviar = { ...respuestaForm };
      
      // Si es respuesta inicial y se está aprobando, asegurar que se envíe la prioridad
      if (!esEdicion && respuestaForm.estado_sol === 'APROBADA') {
        if (!datosAEnviar.prioridad_sol) {
          datosAEnviar.prioridad_sol = selectedSolicitud.prioridad_sol;
        }
      }
      
      console.log('=== FRONTEND DEBUG ===');
      console.log('Datos a enviar:', datosAEnviar);
      console.log('Es edición:', esEdicion);
      console.log('ID solicitud:', selectedSolicitud.id_sol);
      console.log('Tipo de ID:', typeof selectedSolicitud.id_sol);
      console.log('Solicitud completa:', selectedSolicitud);
      
      if (esEdicion) {
        console.log('Llamando gestionarSolicitudTecnica...');
        const response = await solicitudesService.gestionarSolicitudTecnica(selectedSolicitud.id_sol, datosAEnviar);
        console.log('Respuesta gestión técnica:', response);
      } else {
        console.log('Llamando responderSolicitud...');
        const response = await solicitudesService.responderSolicitud(selectedSolicitud.id_sol, datosAEnviar);
        console.log('Respuesta responder:', response);
      }
      
      setRespuestaDialog(false);
      await cargarSolicitudes();
      await cargarEstadisticas();
    } catch (error) {
      console.error('=== ERROR COMPLETO ===');
      console.error('Error completo:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      setError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (solicitud, nuevoEstado) => {
    try {
      setLoading(true);
      await solicitudesService.actualizarEstado(solicitud.id_sol, nuevoEstado);
      await cargarSolicitudes();
      await cargarEstadisticas();
      setError(null);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getIconoEstado = (estado) => {
    switch (estado) {
      case 'APROBADA':
        return <Check sx={{ fontSize: 20 }} />;
      case 'RECHAZADA':
        return <Close sx={{ fontSize: 20 }} />;
      case 'COMPLETADA':
        return <Check sx={{ fontSize: 20 }} />;
      default:
        return <AccessTime sx={{ fontSize: 20 }} />;
    }
  };

  const renderEstadisticas = () => {
    if (!estadisticas) return null;

    return (
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={1}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary" gutterBottom>
                {estadisticas.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Solicitudes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {estadisticas.porEstado.map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.estado}>
            <Card elevation={1}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: solicitudesService.getColorPorEstado(item.estado) }} gutterBottom>
                  {item.cantidad}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {estados.find(e => e.value === item.estado)?.label || item.estado}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderSolicitudCard = (solicitud) => (
    <Card key={solicitud.id_sol} elevation={1} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        {/* Header con estado y prioridad */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Chip
            icon={getIconoEstado(solicitud.estado_sol)}
            label={estados.find(e => e.value === solicitud.estado_sol)?.label || solicitud.estado_sol}
            size="small"
            sx={{
              bgcolor: solicitudesService.getColorPorEstado(solicitud.estado_sol),
              color: 'white',
              fontWeight: 500
            }}
          />
          <Chip
            label={solicitud.prioridad_sol}
            size="small"
            sx={{
              bgcolor: solicitudesService.getColorPorPrioridad(solicitud.prioridad_sol),
              color: 'white'
            }}
          />
        </Box>

        {/* Título */}
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, lineHeight: 1.3 }}>
          {solicitud.titulo_sol}
        </Typography>

        {/* Info del usuario */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Person sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {solicitud.usuario.nom_usu1} {solicitud.usuario.ape_usu1} ({solicitud.usuario.ced_usu})
          </Typography>
        </Box>

        {/* Tipo de cambio */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Category sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {tiposCambio.find(t => t.value === solicitud.tipo_cambio_sol)?.label}
          </Typography>
        </Box>

        {/* Descripción truncada */}
        <Typography variant="body2" color="text.secondary" sx={{ 
          mb: 2,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {solicitud.descripcion_sol}
        </Typography>

        {/* Fecha */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="caption" color="text.secondary">
            {solicitudesService.formatearFecha(solicitud.fec_creacion_sol)}
          </Typography>
        </Box>

        {/* Botones de acción */}
        <Box sx={{ mt: 'auto', pt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Visibility />}
              onClick={() => verDetalle(solicitud)}
              size="small"
            >
              Ver
            </Button>
            {['PENDIENTE', 'EN_REVISION'].includes(solicitud.estado_sol) && (
              <Button
                fullWidth
                variant="contained"
                startIcon={<Edit />}
                onClick={() => abrirRespuesta(solicitud)}
                size="small"
              >
                Respuesta Rápida
              </Button>
            )}
          </Box>
          
          {/* Botón de gestión completa - Siempre visible excepto para completadas */}
          {solicitud.estado_sol !== 'COMPLETADA' && (
            <Button
              fullWidth
              variant="contained"
              startIcon={<Engineering />}
              onClick={() => abrirGestionTecnica(solicitud)}
              size="small"
              sx={{
                bgcolor: '#6d1313',
                '&:hover': {
                  bgcolor: '#5a1010'
                }
              }}
            >
              Gestión Completa
            </Button>
          )}

          {/* Acciones rápidas para cambiar estado */}
          {solicitud.estado_sol === 'APROBADA' && (
            <Button
              fullWidth
              variant="outlined"
              size="small"
              onClick={() => cambiarEstado(solicitud, 'EN_DESARROLLO')}
              color="info"
            >
              Iniciar Desarrollo
            </Button>
          )}
          
          {solicitud.estado_sol === 'EN_DESARROLLO' && (
            <Button
              fullWidth
              variant="outlined"
              size="small"
              onClick={() => cambiarEstado(solicitud, 'COMPLETADA')}
              color="success"
            >
              Marcar Completada
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <AdminSidebar />
      
      <Box sx={{ flexGrow: 1, p: 3, ...getMainContentStyle() }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#6d1313', fontWeight: 'bold' }}>
            <RequestPage />
          Gestión de Solicitudes de Cambio
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Administra todas las solicitudes de cambio del sistema
        </Typography>
      </Box>

      {/* Tabs */}
      <Tabs 
        value={activeTab} 
        onChange={(e, v) => setActiveTab(v)} 
        sx={{ 
          mb: 3,
          '& .MuiTab-root.Mui-selected': {
            color: '#6d1313'
          },
          '& .MuiTabs-indicator': {
            backgroundColor: '#6d1313'
          }
        }}
      >
        <Tab icon={<Assignment />} iconPosition="start" label="Solicitudes" />
        <Tab icon={<BarChart />} iconPosition="start" label="Estadísticas" />
      </Tabs>

      {activeTab === 0 && (
        <>
          {/* Estadísticas resumidas */}
          {estadisticas && (
            <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>Resumen</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ color: '#6d1313' }}>{estadisticas.total}</Typography>
                    <Typography variant="caption">Total</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Badge badgeContent={estadisticas.porEstado.find(e => e.estado === 'PENDIENTE')?.cantidad || 0} color="warning">
                      <Typography variant="h4" sx={{ color: '#f59e0b' }}>
                        {estadisticas.porEstado.find(e => e.estado === 'PENDIENTE')?.cantidad || 0}
                      </Typography>
                    </Badge>
                    <Typography variant="caption" display="block">Pendientes</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ color: '#10b981' }}>
                      {estadisticas.porEstado.find(e => e.estado === 'APROBADA')?.cantidad || 0}
                    </Typography>
                    <Typography variant="caption">Aprobadas</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ color: '#8b5cf6' }}>
                      {estadisticas.porEstado.find(e => e.estado === 'EN_DESARROLLO')?.cantidad || 0}
                    </Typography>
                    <Typography variant="caption">En Desarrollo</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* Filtros */}
          <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <FilterList />
              <Typography variant="h6">Filtros</Typography>
            </Box>
            
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={filtros.estado}
                    label="Estado"
                    onChange={handleFiltroChange('estado')}
                  >
                    <MenuItem value="">Todos</MenuItem>
                    {estados.map((estado) => (
                      <MenuItem key={estado.value} value={estado.value}>
                        {estado.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    value={filtros.tipo_cambio}
                    label="Tipo"
                    onChange={handleFiltroChange('tipo_cambio')}
                  >
                    <MenuItem value="">Todos</MenuItem>
                    {tiposCambio.map((tipo) => (
                      <MenuItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Prioridad</InputLabel>
                  <Select
                    value={filtros.prioridad}
                    label="Prioridad"
                    onChange={handleFiltroChange('prioridad')}
                  >
                    <MenuItem value="">Todas</MenuItem>
                    {prioridades.map((prioridad) => (
                      <MenuItem key={prioridad.value} value={prioridad.value}>
                        {prioridad.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="outlined" onClick={limpiarFiltros} size="small">
                    Limpiar
                  </Button>
                  <Tooltip title="Actualizar">
                    <IconButton onClick={cargarSolicitudes} size="small">
                      <Refresh />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Error */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Loading */}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {/* Lista de solicitudes */}
          {!loading && solicitudes.length > 0 && (
            <>
              <Grid container spacing={3}>
                {solicitudes.map((solicitud) => (
                  <Grid item xs={12} md={6} lg={4} key={solicitud.id_sol}>
                    {renderSolicitudCard(solicitud)}
                  </Grid>
                ))}
              </Grid>

              {/* Paginación */}
              {pagination.totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={pagination.totalPages}
                    page={pagination.page}
                    onChange={handlePageChange}
                    sx={{
                      '& .MuiPaginationItem-root.Mui-selected': {
                        backgroundColor: '#6d1313',
                        color: 'white'
                      }
                    }}
                    size="large"
                  />
                </Box>
              )}
            </>
          )}

          {/* No hay solicitudes */}
          {!loading && solicitudes.length === 0 && (
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
              <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: 'grey.100', width: 60, height: 60 }}>
                <Assignment sx={{ fontSize: 30, color: 'grey.400' }} />
              </Avatar>
              <Typography variant="h6" gutterBottom color="text.secondary">
                No hay solicitudes
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {Object.values(filtros).some(v => v) 
                  ? 'No se encontraron solicitudes con los filtros aplicados'
                  : 'No hay solicitudes de cambio en el sistema'
                }
              </Typography>
            </Paper>
          )}
        </>
      )}

      {activeTab === 1 && renderEstadisticas()}

      {/* Dialog para ver detalles */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Assignment />
            Detalles de la Solicitud
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          {selectedSolicitud && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Debug temporal - eliminar después */}
              {console.log('=== DEBUG SOLICITUD COMPLETA ===', selectedSolicitud)}
              {/* Estados y fechas */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Chip
                  icon={getIconoEstado(selectedSolicitud.estado_sol)}
                  label={estados.find(e => e.value === selectedSolicitud.estado_sol)?.label}
                  sx={{
                    bgcolor: solicitudesService.getColorPorEstado(selectedSolicitud.estado_sol),
                    color: 'white',
                    fontWeight: 500
                  }}
                />
                <Chip
                  label={selectedSolicitud.prioridad_sol}
                  sx={{
                    bgcolor: solicitudesService.getColorPorPrioridad(selectedSolicitud.prioridad_sol),
                    color: 'white'
                  }}
                />
              </Box>

              <Box>
                <Typography variant="h6" gutterBottom>
                  {selectedSolicitud.titulo_sol}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {tiposCambio.find(t => t.value === selectedSolicitud.tipo_cambio_sol)?.label}
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" gutterBottom color="primary">
                  Solicitante
                </Typography>
                <Typography variant="body2">
                  <strong>Nombre:</strong> {selectedSolicitud.usuario?.nom_usu1} {selectedSolicitud.usuario?.nom_usu2} {selectedSolicitud.usuario?.ape_usu1} {selectedSolicitud.usuario?.ape_usu2}
                </Typography>
                <Typography variant="body2">
                  <strong>Cédula:</strong> {selectedSolicitud.usuario?.ced_usu}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom color="primary">
                  Descripción
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {selectedSolicitud.descripcion_sol}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom color="primary">
                  Justificación
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {selectedSolicitud.justificacion_sol}
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" gutterBottom color="primary">
                  Información Adicional
                </Typography>
                <Typography variant="body2">
                  <strong>Fecha de creación:</strong> {solicitudesService.formatearFecha(selectedSolicitud.fec_creacion_sol)}
                </Typography>
                {selectedSolicitud.fec_respuesta_sol && (
                  <Typography variant="body2">
                    <strong>Fecha de respuesta:</strong> {solicitudesService.formatearFecha(selectedSolicitud.fec_respuesta_sol)}
                  </Typography>
                )}
                {selectedSolicitud.adminResponsable && (
                  <Typography variant="body2">
                    <strong>Administrador responsable:</strong> {selectedSolicitud.adminResponsable.nom_usu1} {selectedSolicitud.adminResponsable.ape_usu1}
                  </Typography>
                )}
              </Box>

              {selectedSolicitud.comentarios_admin_sol && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="subtitle2" gutterBottom color="primary">
                      Comentarios del Administrador (Usuario)
                    </Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {selectedSolicitud.comentarios_admin_sol}
                    </Typography>
                  </Box>
                </>
              )}

              {selectedSolicitud.comentarios_internos_sol && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="subtitle2" gutterBottom color="error">
                      Comentarios Internos (Equipo de Desarrollo)
                    </Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                      {selectedSolicitud.comentarios_internos_sol}
                    </Typography>
                  </Box>
                </>
              )}



              {/* Información Técnica Adicional - Solo visible para administradores */}
              {selectedSolicitud && (selectedSolicitud.riesgo_cambio_sol || selectedSolicitud.categoria_cambio_sol || 
                selectedSolicitud.impacto_negocio_sol || selectedSolicitud.impacto_tecnico_sol ||
                selectedSolicitud.plan_implementacion_sol || selectedSolicitud.plan_rollout_sol ||
                selectedSolicitud.plan_backout_sol || selectedSolicitud.plan_rollback_sol ||
                selectedSolicitud.plan_testing_sol || selectedSolicitud.fecha_planificada_inicio_sol ||
                selectedSolicitud.fecha_real_inicio_sol || selectedSolicitud.tiempo_estimado_horas_sol ||
                selectedSolicitud.comentarios_tecnicos_sol || selectedSolicitud.observaciones_implementacion_sol) && (
                <>
                  <Divider />
                  <Typography variant="h6" sx={{ color: '#6d1313', fontWeight: 'bold', mt: 2 }}>
                    📋 Información Técnica Detallada
                  </Typography>

                  {/* Análisis de Riesgo y Categorización */}
                  {(selectedSolicitud.riesgo_cambio_sol || selectedSolicitud.categoria_cambio_sol) && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ color: '#6d1313', fontWeight: 'bold' }}>
                        📊 Análisis de Riesgo y Categorización
                      </Typography>
                      {selectedSolicitud.riesgo_cambio_sol && (
                        <Typography variant="body2">
                          <strong>Riesgo del Cambio:</strong> {selectedSolicitud.riesgo_cambio_sol}
                        </Typography>
                      )}
                      {selectedSolicitud.categoria_cambio_sol && (
                        <Typography variant="body2">
                          <strong>Categoría del Cambio:</strong> {selectedSolicitud.categoria_cambio_sol}
                        </Typography>
                      )}
                      {selectedSolicitud.comentarios_tecnicos_sol && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2"><strong>Comentarios Técnicos:</strong></Typography>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', bgcolor: '#f9f9f9', p: 1, borderRadius: 1, mt: 0.5 }}>
                            {selectedSolicitud.comentarios_tecnicos_sol}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}

                  {/* Análisis de Impacto */}
                  {(selectedSolicitud.impacto_negocio_sol || selectedSolicitud.impacto_tecnico_sol || selectedSolicitud.tiempo_inactividad_estimado_sol) && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ color: '#6d1313', fontWeight: 'bold' }}>
                        🎯 Análisis de Impacto
                      </Typography>
                      {selectedSolicitud.impacto_negocio_sol && (
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="body2"><strong>Impacto en el Negocio:</strong></Typography>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', bgcolor: '#f9f9f9', p: 1, borderRadius: 1, mt: 0.5 }}>
                            {selectedSolicitud.impacto_negocio_sol}
                          </Typography>
                        </Box>
                      )}
                      {selectedSolicitud.impacto_tecnico_sol && (
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="body2"><strong>Impacto Técnico:</strong></Typography>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', bgcolor: '#f9f9f9', p: 1, borderRadius: 1, mt: 0.5 }}>
                            {selectedSolicitud.impacto_tecnico_sol}
                          </Typography>
                        </Box>
                      )}
                      {selectedSolicitud.tiempo_inactividad_estimado_sol && (
                        <Typography variant="body2">
                          <strong>Tiempo de Inactividad Estimado:</strong> {selectedSolicitud.tiempo_inactividad_estimado_sol}
                        </Typography>
                      )}
                    </Box>
                  )}

                  {/* Planes de Implementación */}
                  {(selectedSolicitud.plan_implementacion_sol || selectedSolicitud.plan_rollout_sol || 
                    selectedSolicitud.plan_backout_sol || selectedSolicitud.plan_rollback_sol || 
                    selectedSolicitud.plan_testing_sol) && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ color: '#6d1313', fontWeight: 'bold' }}>
                        ⚙️ Planes de Implementación
                      </Typography>
                      {selectedSolicitud.plan_implementacion_sol && (
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="body2"><strong>Plan de Implementación:</strong></Typography>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', bgcolor: '#f9f9f9', p: 1, borderRadius: 1, mt: 0.5 }}>
                            {selectedSolicitud.plan_implementacion_sol}
                          </Typography>
                        </Box>
                      )}
                      {selectedSolicitud.plan_rollout_sol && (
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="body2"><strong>Plan de Rollout:</strong></Typography>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', bgcolor: '#f9f9f9', p: 1, borderRadius: 1, mt: 0.5 }}>
                            {selectedSolicitud.plan_rollout_sol}
                          </Typography>
                        </Box>
                      )}
                      {selectedSolicitud.plan_backout_sol && (
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="body2"><strong>Plan de Backout:</strong></Typography>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', bgcolor: '#f9f9f9', p: 1, borderRadius: 1, mt: 0.5 }}>
                            {selectedSolicitud.plan_backout_sol}
                          </Typography>
                        </Box>
                      )}
                      {selectedSolicitud.plan_rollback_sol && (
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="body2"><strong>Plan de Rollback:</strong></Typography>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', bgcolor: '#f9f9f9', p: 1, borderRadius: 1, mt: 0.5 }}>
                            {selectedSolicitud.plan_rollback_sol}
                          </Typography>
                        </Box>
                      )}
                      {selectedSolicitud.plan_testing_sol && (
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="body2"><strong>Plan de Testing:</strong></Typography>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', bgcolor: '#f9f9f9', p: 1, borderRadius: 1, mt: 0.5 }}>
                            {selectedSolicitud.plan_testing_sol}
                          </Typography>
                        </Box>
                      )}
                      {selectedSolicitud.observaciones_implementacion_sol && (
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="body2"><strong>Observaciones de Implementación:</strong></Typography>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', bgcolor: '#f9f9f9', p: 1, borderRadius: 1, mt: 0.5 }}>
                            {selectedSolicitud.observaciones_implementacion_sol}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}

                  {/* Planificación y Fechas */}
                  {(selectedSolicitud.fecha_planificada_inicio_sol || selectedSolicitud.fecha_real_inicio_sol || 
                    selectedSolicitud.tiempo_estimado_horas_sol || selectedSolicitud.ventana_mantenimiento_sol) && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ color: '#6d1313', fontWeight: 'bold' }}>
                        📅 Planificación y Recursos
                      </Typography>
                      
                      {/* Fechas Planificadas */}
                      {(selectedSolicitud.fecha_planificada_inicio_sol || selectedSolicitud.fecha_planificada_fin_sol) && (
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>Fechas Planificadas:</Typography>
                          {selectedSolicitud.fecha_planificada_inicio_sol && (
                            <Typography variant="body2" sx={{ ml: 1 }}>
                              <strong>Inicio:</strong> {solicitudesService.formatearFecha(selectedSolicitud.fecha_planificada_inicio_sol)}
                              {selectedSolicitud.hora_planificada_inicio_sol && ` a las ${selectedSolicitud.hora_planificada_inicio_sol}`}
                            </Typography>
                          )}
                          {selectedSolicitud.fecha_planificada_fin_sol && (
                            <Typography variant="body2" sx={{ ml: 1 }}>
                              <strong>Fin:</strong> {solicitudesService.formatearFecha(selectedSolicitud.fecha_planificada_fin_sol)}
                              {selectedSolicitud.hora_planificada_fin_sol && ` a las ${selectedSolicitud.hora_planificada_fin_sol}`}
                            </Typography>
                          )}
                        </Box>
                      )}

                      {/* Fechas Reales */}
                      {(selectedSolicitud.fecha_real_inicio_sol || selectedSolicitud.fecha_real_fin_sol) && (
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>Fechas Reales de Ejecución:</Typography>
                          {selectedSolicitud.fecha_real_inicio_sol && (
                            <Typography variant="body2" sx={{ ml: 1 }}>
                              <strong>Inicio Real:</strong> {solicitudesService.formatearFecha(selectedSolicitud.fecha_real_inicio_sol)}
                              {selectedSolicitud.hora_real_inicio_sol && ` a las ${selectedSolicitud.hora_real_inicio_sol}`}
                            </Typography>
                          )}
                          {selectedSolicitud.fecha_real_fin_sol && (
                            <Typography variant="body2" sx={{ ml: 1 }}>
                              <strong>Fin Real:</strong> {solicitudesService.formatearFecha(selectedSolicitud.fecha_real_fin_sol)}
                              {selectedSolicitud.hora_real_fin_sol && ` a las ${selectedSolicitud.hora_real_fin_sol}`}
                            </Typography>
                          )}
                        </Box>
                      )}

                      {/* Otros recursos */}
                      {selectedSolicitud.tiempo_estimado_horas_sol && (
                        <Typography variant="body2">
                          <strong>Tiempo Estimado:</strong> {selectedSolicitud.tiempo_estimado_horas_sol} horas
                        </Typography>
                      )}
                      {selectedSolicitud.ventana_mantenimiento_sol && (
                        <Typography variant="body2">
                          <strong>Ventana de Mantenimiento:</strong> {selectedSolicitud.ventana_mantenimiento_sol}
                        </Typography>
                      )}
                      {selectedSolicitud.recursos_tecnicos_necesarios_sol && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2"><strong>Recursos Técnicos Necesarios:</strong></Typography>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', bgcolor: '#f9f9f9', p: 1, borderRadius: 1, mt: 0.5 }}>
                            {selectedSolicitud.recursos_tecnicos_necesarios_sol}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}
                </>
              )}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para responder solicitud */}
      <Dialog
        open={respuestaDialog}
        onClose={() => setRespuestaDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle>
          <Typography variant="h6">
            {esEdicion ? 'Editar Solicitud' : 'Responder Solicitud'}
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                value={respuestaForm.estado_sol}
                label="Estado"
                onChange={(e) => setRespuestaForm({...respuestaForm, estado_sol: e.target.value})}
              >
                {esEdicion ? (
                  // Si es edición, mostrar todos los estados excepto completada si ya no lo está
                  estados.filter(estado => 
                    selectedSolicitud?.estado_sol === 'COMPLETADA' ? 
                    estado.value === 'COMPLETADA' : 
                    estado.value !== 'COMPLETADA'
                  ).map((estado) => (
                    <MenuItem key={estado.value} value={estado.value}>
                      {estado.label}
                    </MenuItem>
                  ))
                ) : (
                  // Si es respuesta inicial, mostrar las opciones de decisión
                  [
                    <MenuItem key="APROBADA" value="APROBADA">Aprobar</MenuItem>,
                    <MenuItem key="RECHAZADA" value="RECHAZADA">Rechazar</MenuItem>,
                    <MenuItem key="PENDIENTE" value="PENDIENTE">Poner en Pendiente</MenuItem>
                  ]
                )}
              </Select>
            </FormControl>

            {/* Campos condicionales - Solo mostrar si es APROBADA o es edición */}
            {(respuestaForm.estado_sol === 'APROBADA' || esEdicion) && (
              <FormControl fullWidth>
                <InputLabel>Prioridad</InputLabel>
                <Select
                  value={respuestaForm.prioridad_sol}
                  label="Prioridad"
                  onChange={(e) => setRespuestaForm({...respuestaForm, prioridad_sol: e.target.value})}
                >
                  {prioridades.map((prioridad) => (
                    <MenuItem key={prioridad.value} value={prioridad.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PriorityHigh sx={{ fontSize: 20, color: prioridad.color }} />
                        {prioridad.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Comentarios para el Usuario"
              value={respuestaForm.comentarios_admin_sol}
              onChange={(e) => setRespuestaForm({...respuestaForm, comentarios_admin_sol: e.target.value})}
              placeholder="Comentarios que verá el usuario sobre la decisión..."
              helperText="Este comentario será visible para el usuario que hizo la solicitud"
            />

            {/* Comentarios internos - Solo mostrar si es APROBADA o es edición */}
            {(respuestaForm.estado_sol === 'APROBADA' || esEdicion) && (
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Comentarios Internos (Equipo de Desarrollo)"
                value={respuestaForm.comentarios_internos_sol}
                onChange={(e) => setRespuestaForm({...respuestaForm, comentarios_internos_sol: e.target.value})}
                placeholder="Instrucciones técnicas, notas para desarrolladores..."
                helperText="Solo visible para administradores y desarrolladores"
              />
            )}
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setRespuestaDialog(false)}>
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            onClick={handleRespuestaSubmit}
            disabled={!respuestaForm.estado_sol || loading}
          >
            {loading ? 'Guardando...' : esEdicion ? 'Guardar Cambios' : 'Enviar Respuesta'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Gestión Completa */}
      <GestionTecnicaSolicitud
        open={gestionTecnicaDialog}
        onClose={() => setGestionTecnicaDialog(false)}
        solicitud={selectedSolicitud}
        onGestionCompleta={handleGestionTecnicaCompleta}
      />
      </Box>
    </Box>
  );
};

export default AdminSolicitudes; 