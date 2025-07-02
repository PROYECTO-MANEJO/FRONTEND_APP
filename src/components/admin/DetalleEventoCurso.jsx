import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Badge,
  Tooltip
} from '@mui/material';
import {
  ArrowBack,
  Search,
  Event,
  School,
  People,
  AttachMoney,
  CalendarToday,
  LocationOn,
  Person,
  Email,
  Phone,
  CheckCircle,
  Cancel,
  Download,
  Visibility,
  Schedule,
  Category,
  Business,

  Edit,
  Lock,
  PictureAsPdf,
  Close
} from '@mui/icons-material';

import AdminSidebar from './AdminSidebar';
import { useSidebarLayout } from '../../hooks/useSidebarLayout';
import api from '../../services/api';
import { inscripcionService } from '../../services/inscripcionService';

const DetalleEventoCurso = ({ item, onClose }) => {
  const navigate = useNavigate();
  const { getMainContentStyle } = useSidebarLayout();
  const [loading, setLoading] = useState(true);
  const [detalles, setDetalles] = useState(null);
  const [inscripciones, setInscripciones] = useState([]);
  const [filteredInscripciones, setFilteredInscripciones] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState(0); // 0: Todas, 1: Pendientes, 2: Aprobadas, 3: Rechazadas, 4: Calificaciones
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  

  
  // Estados para acciones
  const [loadingAction, setLoadingAction] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null, inscripcion: null });
  
  // Estados para modal de comprobante
  const [comprobanteModal, setComprobanteModal] = useState({ 
    open: false, 
    inscripcion: null, 
    pdfUrl: null,
    loading: false
  });

  
  // Estado para cerrar curso/evento
  const [cerrarDialogOpen, setCerrarDialogOpen] = useState(false);
  const [loadingCerrar, setLoadingCerrar] = useState(false);

  useEffect(() => {
    cargarDetalles();
  }, [item]);

  useEffect(() => {
    filtrarInscripciones();
  }, [inscripciones, searchTerm, selectedTab]);

  const cargarDetalles = async () => {
    try {
      setLoading(true);
      const endpoint = item.tipo === 'EVENTO' 
        ? `/administracion/evento/${item.id_eve}`
        : `/administracion/curso/${item.id_cur}`;
      
      const response = await api.get(endpoint);
      
      if (response.data.success) {
        setDetalles(response.data.data);
        setInscripciones(response.data.data.inscripciones);
      }
    } catch (error) {
      console.error('Error al cargar detalles:', error);
      setSnackbar({
        open: true,
        message: 'Error al cargar los detalles',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };



  const filtrarInscripciones = () => {
    let filtered = inscripciones;

    // Filtrar por estado
    if (selectedTab === 1) {
      filtered = filtered.filter(ins => ins.estado_pago === 'PENDIENTE');
    } else if (selectedTab === 2) {
      filtered = filtered.filter(ins => ins.estado_pago === 'APROBADO');
    } else if (selectedTab === 3) {
      filtered = filtered.filter(ins => ins.estado_pago === 'RECHAZADO');
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(ins => 
        ins.usuario.nombre_completo.toLowerCase().includes(term) ||
        ins.usuario.cedula.includes(term) ||
        ins.usuario.email.toLowerCase().includes(term) ||
        ins.usuario.carrera.toLowerCase().includes(term)
      );
    }

    setFilteredInscripciones(filtered);
  };

  const handleAprobar = async (inscripcionId, cerrarModal = false) => {
    try {
      setLoadingAction(true);
      const endpoint = item.tipo === 'EVENTO' 
        ? `/administracion/evento/inscripcion/${inscripcionId}/aprobar`
        : `/administracion/curso/inscripcion/${inscripcionId}/aprobar`;
      
      const response = await api.put(endpoint);
      
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Inscripción aprobada correctamente',
          severity: 'success'
        });
        
        // Cerrar modal si se especifica
        if (cerrarModal) {
          setComprobanteModal({ open: false, inscripcion: null, pdfUrl: null, loading: false });
        }
        
        cargarDetalles(); // Recargar datos
      }
    } catch (error) {
      console.error('Error al aprobar inscripción:', error);
      setSnackbar({
        open: true,
        message: 'Error al aprobar la inscripción',
        severity: 'error'
      });
    } finally {
      setLoadingAction(false);
      setConfirmDialog({ open: false, action: null, inscripcion: null });
    }
  };

  const handleRechazar = async (inscripcionId, cerrarModal = false) => {
    try {
      setLoadingAction(true);
      const endpoint = item.tipo === 'EVENTO' 
        ? `/administracion/evento/inscripcion/${inscripcionId}/rechazar`
        : `/administracion/curso/inscripcion/${inscripcionId}/rechazar`;
      
      const response = await api.put(endpoint);
      
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Inscripción rechazada correctamente',
          severity: 'success'
        });
        
        // Cerrar modal si se especifica
        if (cerrarModal) {
          setComprobanteModal({ open: false, inscripcion: null, pdfUrl: null, loading: false });
        }
        
        cargarDetalles(); // Recargar datos
      }
    } catch (error) {
      console.error('Error al rechazar inscripción:', error);
      setSnackbar({
        open: true,
        message: 'Error al rechazar la inscripción',
        severity: 'error'
      });
    } finally {
      setLoadingAction(false);
      setConfirmDialog({ open: false, action: null, inscripcion: null });
    }
  };

  // Función para cerrar curso/evento
  const handleCerrar = async () => {
    try {
      setLoadingCerrar(true);
      const endpoint = item.tipo === 'EVENTO'
        ? `/eventos/${item.id_eve}/cerrar`
        : `/cursos/${item.id_cur}/cerrar`;
      
      const response = await api.put(endpoint);
      
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: `${item.tipo} cerrado correctamente. Los certificados pueden ser generados.`,
          severity: 'success'
        });
        cargarDetalles(); // Recargar para actualizar el estado
      }
    } catch (error) {
      console.error(`Error al cerrar ${item.tipo}:`, error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || `Error al cerrar el ${item.tipo}`,
        severity: 'error'
      });
    } finally {
      setLoadingCerrar(false);
      setCerrarDialogOpen(false);
    }
  };



  const formatearFecha = (fecha) => {
    if (!fecha) return 'No especificada';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatearHora = (hora) => {
    if (!hora) return 'No especificada';
    return new Date(`1970-01-01T${hora}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };





  const handleVerComprobante = async (inscripcion) => {
    try {
      setComprobanteModal(prev => ({ ...prev, loading: true, open: true, inscripcion }));
      
      let blob;
      if (item.tipo === 'EVENTO') {
        blob = await inscripcionService.descargarComprobantePagoEvento(inscripcion.id_inscripcion);
      } else {
        blob = await inscripcionService.descargarComprobantePagoCurso(inscripcion.id_inscripcion);
      }
      
      const pdfUrl = URL.createObjectURL(blob);
      setComprobanteModal(prev => ({ 
        ...prev, 
        pdfUrl, 
        loading: false 
      }));
      
    } catch (error) {
      console.error('Error al cargar comprobante:', error);
      setSnackbar({
        open: true,
        message: 'Error al cargar el comprobante',
        severity: 'error'
      });
      setComprobanteModal({ open: false, inscripcion: null, pdfUrl: null, loading: false });
    }
  };

  const handleCerrarComprobanteModal = () => {
    if (comprobanteModal.pdfUrl) {
      URL.revokeObjectURL(comprobanteModal.pdfUrl);
    }
    setComprobanteModal({ open: false, inscripcion: null, pdfUrl: null, loading: false });
  };



  if (loading) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
        <AdminSidebar />
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', ...getMainContentStyle() }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (!detalles) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
        <AdminSidebar />
        <Box sx={{ flexGrow: 1, p: 3, ...getMainContentStyle() }}>
          <Typography variant="h6" color="error">
            Error al cargar los detalles
          </Typography>
        </Box>
      </Box>
    );
  }

  const itemData = item.tipo === 'EVENTO' ? detalles.evento : detalles.curso;
  const estadisticas = detalles.estadisticas;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <AdminSidebar />
      
      <Box sx={{ flexGrow: 1, p: 3, ...getMainContentStyle() }}>
        {/* Header con botón de regreso */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={onClose} sx={{ mr: 2 }}>
              <ArrowBack />
            </IconButton>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
                {item.tipo === 'EVENTO' ? itemData.nom_eve : itemData.nom_cur}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Gestión de inscripciones - {item.tipo}
              </Typography>
            </Box>
          </Box>
          
          {/* Botones de gestión y cerrar solo si está activo */}
          {itemData.estado === 'ACTIVO' && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              {/* Botón para gestionar notas/asistencia */}
              <Button
                variant="contained"
                color="primary"
                startIcon={<School />}
                onClick={() => {
                  if (item.tipo === 'EVENTO') {
                    navigate(`/admin/gestion-asistencia-evento/${item.id_eve}`);
                  } else {
                    navigate(`/admin/gestion-notas-curso/${item.id_cur}`);
                  }
                }}
                sx={{ minWidth: 200 }}
              >
                {item.tipo === 'EVENTO' ? 'Gestionar Asistencia' : 'Gestionar Notas'}
              </Button>
              
              {/* Botón de cerrar */}
              <Button
                variant="contained"
                color="error"
                startIcon={loadingCerrar ? <CircularProgress size={20} color="inherit" /> : <Lock />}
                onClick={() => setCerrarDialogOpen(true)}
                disabled={loadingCerrar}
                sx={{ minWidth: 150 }}
              >
                {loadingCerrar ? 'Cerrando...' : `Cerrar ${item.tipo}`}
              </Button>
            </Box>
          )}
          
          {/* Indicador de estado cerrado */}
          {itemData.estado === 'CERRADO' && (
            <Chip
              icon={<Lock />}
              label={`${item.tipo} CERRADO`}
              color="error"
              variant="outlined"
              size="large"
            />
          )}
        </Box>

        {/* Información del evento/curso */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Chip
                  icon={item.tipo === 'EVENTO' ? <Event /> : <School />}
                  label={item.tipo}
                  color={item.tipo === 'EVENTO' ? 'primary' : 'secondary'}
                  sx={{ mr: 2 }}
                />
                <Chip
                  icon={<AttachMoney />}
                  label={itemData.es_gratuito ? 'Gratuito' : `$${itemData.precio}`}
                  color={itemData.es_gratuito ? 'success' : 'warning'}
                />
              </Box>

              <Typography variant="body1" sx={{ mb: 2 }}>
                {item.tipo === 'EVENTO' ? itemData.des_eve : itemData.des_cur}
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarToday sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      <strong>Inicio:</strong> {formatearFecha(item.tipo === 'EVENTO' ? itemData.fec_ini_eve : itemData.fec_ini_cur)}
                    </Typography>
                  </Box>
                  {(item.tipo === 'EVENTO' ? itemData.fec_fin_eve : itemData.fec_fin_cur) && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CalendarToday sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        <strong>Fin:</strong> {formatearFecha(item.tipo === 'EVENTO' ? itemData.fec_fin_eve : itemData.fec_fin_cur)}
                      </Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Schedule sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      <strong>Horario:</strong> {formatearHora(item.tipo === 'EVENTO' ? itemData.hor_ini_eve : itemData.hor_ini_cur)}
                      {(item.tipo === 'EVENTO' ? itemData.hor_fin_eve : itemData.hor_fin_cur) && 
                        ` - ${formatearHora(item.tipo === 'EVENTO' ? itemData.hor_fin_eve : itemData.hor_fin_cur)}`}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOn sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      <strong>Ubicación:</strong> {item.tipo === 'EVENTO' ? itemData.ubi_eve : itemData.ubi_cur}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Person sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      <strong>Organizador:</strong> {itemData.organizador_nombre}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Category sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      <strong>Categoría:</strong> {itemData.categoria_nombre}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {itemData.carreras_dirigidas && itemData.carreras_dirigidas.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Carreras dirigidas:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {itemData.carreras_dirigidas.map((carrera, index) => (
                      <Chip key={index} label={carrera} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Box>
              )}
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Estadísticas de Inscripciones
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Card sx={{ bgcolor: '#1976d2', color: 'white', textAlign: 'center' }}>
                    <CardContent sx={{ py: 2 }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {estadisticas.total}
                      </Typography>
                      <Typography variant="body2">Total</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card sx={{ bgcolor: '#388e3c', color: 'white', textAlign: 'center' }}>
                    <CardContent sx={{ py: 2 }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {estadisticas.aprobadas}
                      </Typography>
                      <Typography variant="body2">Aprobadas</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card sx={{ bgcolor: '#f57c00', color: 'white', textAlign: 'center' }}>
                    <CardContent sx={{ py: 2 }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {estadisticas.pendientes}
                      </Typography>
                      <Typography variant="body2">Pendientes</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card sx={{ bgcolor: '#d32f2f', color: 'white', textAlign: 'center' }}>
                    <CardContent sx={{ py: 2 }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {estadisticas.rechazadas}
                      </Typography>
                      <Typography variant="body2">Rechazadas</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Capacidad máxima:</strong> {item.tipo === 'EVENTO' ? itemData.capacidad_max_eve : itemData.capacidad_max_cur}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Cupos disponibles:</strong> {estadisticas.disponibles}
                </Typography>
                {!itemData.es_gratuito && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Con comprobante:</strong> {estadisticas.con_comprobante}
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Controles de filtrado */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <TextField
              placeholder="Buscar por nombre, cédula, email o carrera..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ flexGrow: 1 }}
            />
          </Box>

          <Tabs
            value={selectedTab}
            onChange={(e, newValue) => setSelectedTab(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Todas" />
            <Tab 
              label={
                <Badge badgeContent={estadisticas.pendientes} color="warning">
                  Pendientes
                </Badge>
              } 
            />
            <Tab label="Aprobadas" />
            <Tab label="Rechazadas" />
          </Tabs>
        </Paper>

        {/* Tabla de inscripciones */}
        <Paper>
          {/* Tabla normal de inscripciones */}
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Usuario</TableCell>
                      <TableCell>Contacto</TableCell>
                      <TableCell>Carrera</TableCell>
                      <TableCell>Fecha Inscripción</TableCell>
                      <TableCell>Estado</TableCell>
                      {!itemData.es_gratuito && <TableCell>Pago</TableCell>}
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredInscripciones.map((inscripcion) => (
                  <TableRow key={inscripcion.id_inscripcion}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: '#6d1313' }}>
                          {inscripcion.usuario.nombre_completo.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {inscripcion.usuario.nombre_completo}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {inscripcion.usuario.cedula}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                          <Email sx={{ fontSize: 14, mr: 0.5 }} />
                          <Typography variant="caption">
                            {inscripcion.usuario.email}
                          </Typography>
                        </Box>
                        {inscripcion.usuario.telefono && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Phone sx={{ fontSize: 14, mr: 0.5 }} />
                            <Typography variant="caption">
                              {inscripcion.usuario.telefono}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {inscripcion.usuario.carrera}
                      </Typography>
                      <Chip 
                        label={inscripcion.usuario.rol}
                        size="small"
                        variant="outlined"
                        color={inscripcion.usuario.rol === 'ESTUDIANTE' ? 'primary' : 'secondary'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatearFecha(inscripcion.fecha_inscripcion)}
                      </Typography>
                      {inscripcion.fecha_aprobacion && (
                        <Typography variant="caption" color="text.secondary">
                          Aprobado: {formatearFecha(inscripcion.fecha_aprobacion)}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {itemData.es_gratuito ? (
                        <Chip label="Gratuito" color="success" size="small" />
                      ) : (
                        <Chip 
                          label={
                            inscripcion.estado_pago === 'APROBADO' ? 'Aprobado' :
                            inscripcion.estado_pago === 'PENDIENTE' ? 'Pendiente' :
                            'Rechazado'
                          }
                          color={
                            inscripcion.estado_pago === 'APROBADO' ? 'success' :
                            inscripcion.estado_pago === 'PENDIENTE' ? 'warning' :
                            'error'
                          }
                          size="small"
                        />
                      )}
                    </TableCell>
                    {!itemData.es_gratuito && (
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            ${inscripcion.valor}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {inscripcion.metodo_pago}
                          </Typography>
                          {inscripcion.tiene_comprobante && (
                            <Chip 
                              label="Con comprobante" 
                              size="small" 
                              color="info" 
                              variant="outlined"
                              sx={{ mt: 0.5, display: 'block' }}
                            />
                          )}
                        </Box>
                      </TableCell>
                    )}
                    <TableCell>
                      {/* Ícono para ver comprobante (siempre visible si tiene comprobante) */}
                      {inscripcion.tiene_comprobante && (
                        <Tooltip title="Ver comprobante">
                          <IconButton
                            onClick={() => handleVerComprobante(inscripcion)}
                            size="small"
                            color="primary"
                          >
                            <PictureAsPdf />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
    </Paper>

    {/* Snackbar para notificaciones */}
    <Snackbar
      open={snackbar.open}
      autoHideDuration={6000}
      onClose={() => setSnackbar({ ...snackbar, open: false })}
    >
      <Alert
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        severity={snackbar.severity}
        sx={{ width: '100%' }}
      >
        {snackbar.message}
      </Alert>
    </Snackbar>



    {/* Diálogo de confirmación para acciones */}
    <Dialog
      open={confirmDialog.open}
      onClose={() => setConfirmDialog({ open: false, action: null, inscripcion: null })}
    >
      <DialogTitle>
        {confirmDialog.action === 'aprobar' ? 'Confirmar Aprobación' : 'Confirmar Rechazo'}
      </DialogTitle>
      <DialogContent>
        <Typography>
          {confirmDialog.action === 'aprobar' 
            ? `¿Está seguro de que desea aprobar la inscripción de ${confirmDialog.inscripcion?.usuario?.nombre_completo}?`
            : `¿Está seguro de que desea rechazar la inscripción de ${confirmDialog.inscripcion?.usuario?.nombre_completo}?`
          }
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setConfirmDialog({ open: false, action: null, inscripcion: null })}>
          Cancelar
        </Button>
        <Button
          onClick={() => {
            if (confirmDialog.action === 'aprobar') {
              handleAprobar(confirmDialog.inscripcion.id_inscripcion);
            } else {
              handleRechazar(confirmDialog.inscripcion.id_inscripcion);
            }
          }}
          variant="contained"
          color={confirmDialog.action === 'aprobar' ? 'success' : 'error'}
          disabled={loadingAction}
        >
          {loadingAction ? <CircularProgress size={20} /> : 'Confirmar'}
        </Button>
      </DialogActions>
    </Dialog>

    {/* Diálogo de confirmación para cerrar curso/evento */}
    <Dialog
      open={cerrarDialogOpen}
      onClose={() => setCerrarDialogOpen(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Lock sx={{ mr: 1, color: 'error.main' }} />
          Cerrar {item.tipo}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Una vez cerrado el {item.tipo.toLowerCase()}, no podrá modificar las calificaciones ni la asistencia de los participantes.
        </Alert>
        <Typography variant="body1">
          ¿Está seguro de que desea cerrar <strong>{itemData.nom_eve || itemData.nom_cur}</strong>?
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Esta acción permitirá generar los certificados para los participantes aprobados.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setCerrarDialogOpen(false)}>
          Cancelar
        </Button>
        <Button
          onClick={handleCerrar}
          variant="contained"
          color="error"
          disabled={loadingCerrar}
          startIcon={loadingCerrar ? <CircularProgress size={20} color="inherit" /> : <Lock />}
        >
          {loadingCerrar ? 'Cerrando...' : `Cerrar ${item.tipo}`}
        </Button>
      </DialogActions>
    </Dialog>

         {/* Modal de comprobante */}
     <Dialog
       open={comprobanteModal.open}
       onClose={handleCerrarComprobanteModal}
       maxWidth="lg"
       fullWidth
       PaperProps={{
         sx: { height: '90vh' }
       }}
     >
       <DialogTitle>
         <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
           <Box sx={{ display: 'flex', alignItems: 'center' }}>
             <PictureAsPdf sx={{ mr: 1 }} />
             Comprobante de Pago
             {comprobanteModal.inscripcion && (
               <Typography variant="subtitle2" sx={{ ml: 2, color: 'text.secondary' }}>
                 - {comprobanteModal.inscripcion.usuario.nombre_completo}
               </Typography>
             )}
           </Box>
           <IconButton onClick={handleCerrarComprobanteModal} size="small">
             <Close />
           </IconButton>
         </Box>
       </DialogTitle>
       <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
         {comprobanteModal.loading ? (
           <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
             <CircularProgress />
           </Box>
         ) : comprobanteModal.pdfUrl ? (
           <iframe
             src={comprobanteModal.pdfUrl}
             style={{ 
               width: '100%', 
               height: '100%', 
               border: 'none',
               minHeight: '500px'
             }}
             title="Comprobante de Pago"
           />
         ) : (
           <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
             <Typography color="error">Error al cargar el comprobante</Typography>
           </Box>
         )}
       </DialogContent>
       <DialogActions sx={{ borderTop: 1, borderColor: 'divider', p: 2 }}>
         <Button 
           onClick={handleCerrarComprobanteModal}
           variant="outlined"
           startIcon={<Close />}
         >
           Cerrar
         </Button>
         
         {/* Botones de acción solo si la inscripción está pendiente */}
         {comprobanteModal.inscripcion?.estado_pago === 'PENDIENTE' && !itemData.es_gratuito && (
           <>
             <Button
               onClick={() => handleRechazar(comprobanteModal.inscripcion.id_inscripcion, true)}
               variant="outlined"
               color="error"
               startIcon={loadingAction ? <CircularProgress size={16} /> : <Cancel />}
               disabled={loadingAction}
               sx={{ mx: 1 }}
             >
               {loadingAction ? 'Rechazando...' : 'Rechazar'}
             </Button>
             <Button
               onClick={() => handleAprobar(comprobanteModal.inscripcion.id_inscripcion, true)}
               variant="contained"
               color="success"
               startIcon={loadingAction ? <CircularProgress size={16} /> : <CheckCircle />}
               disabled={loadingAction}
             >
               {loadingAction ? 'Aprobando...' : 'Aprobar'}
             </Button>
           </>
         )}
       </DialogActions>
     </Dialog>
  </Box>
  </Box>
);
};

export default DetalleEventoCurso;
