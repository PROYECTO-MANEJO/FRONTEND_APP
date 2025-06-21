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
  Divider,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Visibility,
  FilterList,
  Refresh,
  Description,
  AccessTime,
  Person,
  Category,
  PriorityHigh,
  Check,
  Close,
} from '@mui/icons-material';
import solicitudesService from '../../services/solicitudesService';

const MisSolicitudes = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Filtros y paginación
  const [filtros, setFiltros] = useState({
    estado: '',
    tipo_cambio: '',
    page: 1,
    limit: 6
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    total: 0,
    totalPages: 0
  });

  const estados = solicitudesService.getOpcionesEstado();
  const tiposCambio = solicitudesService.getOpcionesTipoCambio();

  useEffect(() => {
    cargarSolicitudes();
  }, [filtros]);

  const cargarSolicitudes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await solicitudesService.obtenerMisSolicitudes(filtros);
      setSolicitudes(response.data.solicitudes);
      setPagination(response.data.pagination);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
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
    setFiltros({
      estado: '',
      tipo_cambio: '',
      page: 1,
      limit: 6
    });
  };

  const verDetalle = async (solicitud) => {
    try {
      const response = await solicitudesService.obtenerMiSolicitud(solicitud.id_sol);
      setSelectedSolicitud(response.data);
      setDialogOpen(true);
    } catch {
      setError('Error al cargar los detalles de la solicitud');
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
            Creada: {solicitudesService.formatearFecha(solicitud.fec_creacion_sol)}
          </Typography>
        </Box>

        {/* Admin responsable */}
        {solicitud.adminResponsable && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Person sx={{ fontSize: 16, color: 'primary.main' }} />
            <Typography variant="caption" color="primary.main">
              Responsable: {solicitud.adminResponsable.nom_usu1} {solicitud.adminResponsable.ape_usu1}
            </Typography>
          </Box>
        )}

        {/* Botón ver detalle */}
        <Box sx={{ mt: 'auto', pt: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Visibility />}
            onClick={() => verDetalle(solicitud)}
            size="small"
            sx={{
              borderColor: '#6d1313', // ✅ AGREGAR COLOR
              color: '#6d1313', // ✅ AGREGAR COLOR
              '&:hover': {
                borderColor: '#5a1010', // ✅ AGREGAR COLOR
                backgroundColor: 'rgba(109, 19, 19, 0.04)', // ✅ AGREGAR COLOR
              },
            }}
          >
            Ver Detalles
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading && solicitudes.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Filtros */}
      <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <FilterList sx={{ color: '#6d1313' }} />
          <Typography variant="h6" sx={{ color: '#6d1313' }}>Filtros</Typography>
        </Box>
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ '&.Mui-focused': { color: '#6d1313' } }}>Estado</InputLabel>
              <Select
                value={filtros.estado}
                label="Estado"
                onChange={handleFiltroChange('estado')}
                sx={{
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#6d1313',
                  },
                }}
              >
                <MenuItem value="">Todos los estados</MenuItem>
                {estados.map((estado) => (
                  <MenuItem key={estado.value} value={estado.value}>
                    {estado.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ '&.Mui-focused': { color: '#6d1313' } }}>Tipo de Cambio</InputLabel>
              <Select
                value={filtros.tipo_cambio}
                label="Tipo de Cambio"
                onChange={handleFiltroChange('tipo_cambio')}
                sx={{
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#6d1313',
                  },
                }}
              >
                <MenuItem value="">Todos los tipos</MenuItem>
                {tiposCambio.map((tipo) => (
                  <MenuItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                variant="outlined" 
                onClick={limpiarFiltros} 
                size="small"
                sx={{
                  borderColor: '#6d1313',
                  color: '#6d1313',
                  '&:hover': {
                    borderColor: '#5a1010',
                    backgroundColor: 'rgba(109, 19, 19, 0.04)',
                  },
                }}
              >
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
                    '&:hover': {
                      backgroundColor: '#5a1010',
                    },
                  },
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
            <Description sx={{ fontSize: 30, color: 'grey.400' }} />
          </Avatar>
          <Typography variant="h6" gutterBottom color="text.secondary">
            No tienes solicitudes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {filtros.estado || filtros.tipo_cambio 
              ? 'No se encontraron solicitudes con los filtros aplicados'
              : 'Aún no has creado ninguna solicitud de cambio'
            }
          </Typography>
        </Paper>
      )}

      {/* Dialog para ver detalles */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle>
          <Typography variant="h6" sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            color: '#6d1313'
          }}>
            <Description sx={{ color: '#6d1313' }} />
            Detalles de la Solicitud
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          {selectedSolicitud && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
                <Typography variant="subtitle2" gutterBottom sx={{ color: '#6d1313' }}>
                  Descripción
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {selectedSolicitud.descripcion_sol}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom sx={{ color: '#6d1313' }}>
                  Justificación
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {selectedSolicitud.justificacion_sol}
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" gutterBottom sx={{ color: '#6d1313' }}>
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
                    <Typography variant="subtitle2" gutterBottom sx={{ color: '#6d1313' }}>
                      Comentarios del Administrador
                    </Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {selectedSolicitud.comentarios_admin_sol}
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button 
            onClick={() => setDialogOpen(false)}
            sx={{
              color: '#6d1313',
              '&:hover': {
                backgroundColor: 'rgba(109, 19, 19, 0.04)',
              },
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MisSolicitudes;