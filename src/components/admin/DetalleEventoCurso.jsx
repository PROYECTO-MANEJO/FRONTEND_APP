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
  ErrorOutline,
  Edit,
  Lock,
  PictureAsPdf,
  Close,
  Description
} from '@mui/icons-material';

import AdminSidebar from './AdminSidebar';
import { useSidebarLayout } from '../../hooks/useSidebarLayout';
import api from '../../services/api';
import { inscripcionService } from '../../services/inscripcionService';
import DocumentViewer from '../DocumentViewer';

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

  // Estado para modal de carta de motivación
  const [cartaModal, setCartaModal] = useState({ 
    open: false, 
    inscripcion: null
  });

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
      
      // Enviar un motivo de rechazo (requerido por el backend)
      const response = await api.put(endpoint, {
        motivo: "Comprobante de pago rechazado por administrador"
      });
      
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
        message: error.response?.data?.message || 'Error al rechazar la inscripción',
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
      
      console.log('🔍 Solicitando comprobante para:', inscripcion.id_inscripcion);
      
      let pdfUrl;
      if (item.tipo === 'EVENTO') {
        pdfUrl = await inscripcionService.visualizarComprobantePagoEvento(inscripcion.id_inscripcion);
      } else {
        pdfUrl = await inscripcionService.visualizarComprobantePagoCurso(inscripcion.id_inscripcion);
      }
      
      console.log('✅ URL obtenida:', pdfUrl);
      
      setComprobanteModal(prev => ({ 
        ...prev, 
        pdfUrl, 
        loading: false 
      }));
      
    } catch (error) {
      console.error('❌ Error al cargar comprobante:', error);
      setSnackbar({
        open: true,
        message: 'Error al cargar el comprobante. El archivo no está disponible o no es válido.',
        severity: 'error'
      });
      setComprobanteModal({ open: false, inscripcion: null, pdfUrl: null, loading: false });
    }
  };

  const handleCerrarComprobanteModal = () => {
    setComprobanteModal({ open: false, inscripcion: null, pdfUrl: null, loading: false });
  };

  // Función para aprobar desde el visor de documentos
  const handleAprobarDesdeVisor = () => {
    if (comprobanteModal.inscripcion) {
      handleAprobar(comprobanteModal.inscripcion.id_inscripcion, true);
    }
  };
  
  // Función para rechazar desde el visor de documentos
  const handleRechazarDesdeVisor = () => {
    if (comprobanteModal.inscripcion) {
      handleRechazar(comprobanteModal.inscripcion.id_inscripcion, true);
    }
  };

  // Función para ver la carta de motivación
  const handleVerCarta = (inscripcion) => {
    // Asegurarse de que siempre haya algo que mostrar
    const inscripcionConCarta = {
      ...inscripcion,
      carta_motivacion: inscripcion.carta_motivacion || "El usuario no ha proporcionado una carta de motivación o hubo un problema al cargarla."
    };
    
    setCartaModal({
      open: true,
      inscripcion: inscripcionConCarta
    });
  };

  // Función para cerrar modal de carta
  const handleCerrarCartaModal = () => {
    setCartaModal({
      open: false,
      inscripcion: null
    });
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
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell>Usuario</TableCell>
                <TableCell>Fecha Inscripción</TableCell>
                <TableCell align="center">Estado</TableCell>
                {!detalles?.es_gratuito && (
                  <TableCell align="center">Comprobante</TableCell>
                )}
                {detalles?.requiere_carta_motivacion && (
                  <TableCell align="center">Carta</TableCell>
                )}
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInscripciones.length > 0 ? (
                filteredInscripciones.map((inscripcion) => (
                  <TableRow key={inscripcion.id_inscripcion || inscripcion.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ bgcolor: '#6d1313', mr: 2 }}>
                          {inscripcion.usuario.nombre_completo.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            {inscripcion.usuario.nombre_completo}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {inscripcion.usuario.cedula}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                            <Email fontSize="small" sx={{ mr: 0.5, fontSize: '0.875rem' }} />
                            {inscripcion.usuario.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {formatearFecha(inscripcion.fecha_inscripcion)}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={inscripcion.estado_pago}
                        color={
                          inscripcion.estado_pago === 'APROBADO' ? 'success' :
                          inscripcion.estado_pago === 'RECHAZADO' ? 'error' : 'warning'
                        }
                        size="small"
                      />
                    </TableCell>
                    {!detalles?.es_gratuito && (
                      <TableCell align="center">
                        {inscripcion.tiene_comprobante && (
                          <Tooltip title="Ver comprobante de pago">
                            <IconButton
                              color="primary"
                              size="small"
                              onClick={() => handleVerComprobante(inscripcion)}
                            >
                              <PictureAsPdf />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    )}
                    {detalles?.requiere_carta_motivacion && (
                      <TableCell align="center">
                        {/* FORZAR MOSTRAR SIEMPRE EL BOTÓN PARA CURSOS QUE REQUIEREN CARTA */}
                        <Tooltip title="Ver carta de motivación">
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() => handleVerCarta(inscripcion)}
                          >
                            <Description />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    )}
                    <TableCell align="center">
                      {inscripcion.estado_pago === 'PENDIENTE' && (
                        <>
                          <Tooltip title="Aprobar inscripción">
                            <IconButton
                              color="success"
                              size="small"
                              onClick={() => setConfirmDialog({
                                open: true,
                                action: 'aprobar',
                                inscripcion
                              })}
                            >
                              <CheckCircle />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Rechazar inscripción">
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => setConfirmDialog({
                                open: true,
                                action: 'rechazar',
                                inscripcion
                              })}
                            >
                              <Cancel />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell 
                    colSpan={
                      detalles?.es_gratuito 
                        ? (detalles?.requiere_carta_motivacion ? 5 : 4) 
                        : (detalles?.requiere_carta_motivacion ? 6 : 5)
                    } 
                    align="center"
                  >
                    <Typography variant="body1" color="text.secondary" sx={{ py: 3 }}>
                      No se encontraron inscripciones
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

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
     <DocumentViewer
       open={comprobanteModal.open}
       onClose={handleCerrarComprobanteModal}
       pdfUrl={comprobanteModal.pdfUrl}
       onApprove={comprobanteModal.inscripcion?.estado_pago === 'PENDIENTE' ? handleAprobarDesdeVisor : null}
       onReject={comprobanteModal.inscripcion?.estado_pago === 'PENDIENTE' ? handleRechazarDesdeVisor : null}
     />

    {/* Modal para ver carta de motivación */}
    <Dialog
      open={cartaModal.open}
      onClose={handleCerrarCartaModal}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">
            Carta de Motivación
          </Typography>
          <IconButton onClick={handleCerrarCartaModal}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {cartaModal.inscripcion && (
          <Box sx={{ p: 2 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Usuario: {cartaModal.inscripcion.usuario.nombre_completo}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {cartaModal.inscripcion.usuario.email} | {cartaModal.inscripcion.usuario.cedula}
              </Typography>
            </Box>
            
            <Paper elevation={0} variant="outlined" sx={{ p: 3, bgcolor: '#f9f9f9', borderRadius: 2 }}>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', fontStyle: 'italic' }}>
                {cartaModal.inscripcion.carta_motivacion}
              </Typography>
            </Paper>
            
            {cartaModal.inscripcion.estado_pago === 'PENDIENTE' && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => {
                    setConfirmDialog({
                      open: true,
                      action: 'aprobar',
                      inscripcion: cartaModal.inscripcion
                    });
                    handleCerrarCartaModal();
                  }}
                  startIcon={<CheckCircle />}
                >
                  Aprobar Inscripción
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => {
                    setConfirmDialog({
                      open: true,
                      action: 'rechazar',
                      inscripcion: cartaModal.inscripcion
                    });
                    handleCerrarCartaModal();
                  }}
                  startIcon={<Cancel />}
                >
                  Rechazar Inscripción
                </Button>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  </Box>
);
};

export default DetalleEventoCurso;
