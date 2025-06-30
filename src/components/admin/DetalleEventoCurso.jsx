import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  Tooltip,
  Menu,
  MenuItem
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
  MoreVert,
  Visibility,
  Schedule,
  Category,
  Business,
  Grade,
  Assignment,
  Save,
  Edit,
  Lock
} from '@mui/icons-material';

import AdminSidebar from './AdminSidebar';
import { useSidebarLayout } from '../../hooks/useSidebarLayout';
import api from '../../services/api';

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
  
  // Estados para calificaciones y asistencia
  const [calificaciones, setCalificaciones] = useState({});
  const [asistencias, setAsistencias] = useState({});
  const [editingCalificacion, setEditingCalificacion] = useState(null);
  const [loadingCalificaciones, setLoadingCalificaciones] = useState(false);
  const [participacionesExistentes, setParticipacionesExistentes] = useState({});
  
  // Estados para acciones
  const [loadingAction, setLoadingAction] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null, inscripcion: null });
  const [motivoRechazo, setMotivoRechazo] = useState('');
  
  // Menu para acciones
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedInscripcion, setSelectedInscripcion] = useState(null);
  
  // Estado para cerrar curso/evento
  const [cerrarDialogOpen, setCerrarDialogOpen] = useState(false);
  const [loadingCerrar, setLoadingCerrar] = useState(false);

  useEffect(() => {
    cargarDetalles();
    cargarParticipacionesExistentes();
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

  const cargarParticipacionesExistentes = async () => {
    try {
      const endpoint = item.tipo === 'EVENTO'
        ? `/administracion/evento/${item.id_eve}/participaciones`
        : `/administracion/curso/${item.id_cur}/participaciones`;

      const response = await api.get(endpoint);

      if (response.data.success) {
        const participacionesMap = {};
        response.data.data.forEach(participacion => {
          const inscripcionId = item.tipo === 'EVENTO' 
            ? participacion.id_ins_per 
            : participacion.id_ins_cur_per;
          
          participacionesMap[inscripcionId] = {
            asistencia: item.tipo === 'EVENTO' 
              ? participacion.asi_par 
              : parseFloat(participacion.asistencia_porcentaje),
            nota: item.tipo === 'CURSO' ? parseFloat(participacion.nota_final) : null,
            aprobado: participacion.aprobado,
            fecha_evaluacion: participacion.fec_evaluacion || participacion.fecha_evaluacion
          };
        });
        
        setParticipacionesExistentes(participacionesMap);
        
        // Pre-cargar los valores en los estados de asistencia y calificaciones
        Object.keys(participacionesMap).forEach(inscripcionId => {
          const participacion = participacionesMap[inscripcionId];
          setAsistencias(prev => ({
            ...prev,
            [inscripcionId]: participacion.asistencia
          }));
          
          if (item.tipo === 'CURSO' && participacion.nota !== null) {
            setCalificaciones(prev => ({
              ...prev,
              [inscripcionId]: participacion.nota
            }));
          }
        });
      }
    } catch (error) {
      console.error('Error al cargar participaciones existentes:', error);
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

  const handleAprobar = async (inscripcionId) => {
    try {
      setLoadingAction(true);
      const endpoint = item.tipo === 'EVENTO'
        ? `/administracion/evento/inscripcion/${inscripcionId}/aprobar`
        : `/administracion/curso/inscripcion/${inscripcionId}/aprobar`;
      
      const response = await api.put(endpoint);
      
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: response.data.message,
          severity: 'success'
        });
        cargarDetalles(); // Recargar datos
      }
    } catch (error) {
      console.error('Error al aprobar inscripción:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error al aprobar la inscripción',
        severity: 'error'
      });
    } finally {
      setLoadingAction(false);
      setConfirmDialog({ open: false, action: null, inscripcion: null });
    }
  };

  const handleRechazar = async (inscripcionId, motivo) => {
    try {
      setLoadingAction(true);
      const endpoint = item.tipo === 'EVENTO'
        ? `/administracion/evento/inscripcion/${inscripcionId}/rechazar`
        : `/administracion/curso/inscripcion/${inscripcionId}/rechazar`;
      
      const response = await api.put(endpoint, { motivo });
      
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: response.data.message,
          severity: 'success'
        });
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
      setMotivoRechazo('');
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

  const handleDescargarComprobante = async (inscripcionId) => {
    try {
      const endpoint = `/administracion/comprobante/${item.tipo.toLowerCase()}/${inscripcionId}`;
      const response = await api.get(endpoint, { responseType: 'blob' });
      
      // Crear enlace de descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `comprobante_${inscripcionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setSnackbar({
        open: true,
        message: 'Comprobante descargado exitosamente',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error al descargar comprobante:', error);
      setSnackbar({
        open: true,
        message: 'Error al descargar el comprobante',
        severity: 'error'
      });
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

  const getEstadoChip = (estado) => {
    const configs = {
      PENDIENTE: { color: 'warning', label: 'Pendiente' },
      APROBADO: { color: 'success', label: 'Aprobado' },
      RECHAZADO: { color: 'error', label: 'Rechazado' }
    };
    
    const config = configs[estado] || { color: 'default', label: estado };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const handleMenuOpen = (event, inscripcion) => {
    setAnchorEl(event.currentTarget);
    setSelectedInscripcion(inscripcion);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedInscripcion(null);
  };

  // Funciones para calificaciones y asistencia
  const getUsuariosParaCalificar = () => {
    if (item.es_gratuito) {
      // Si es gratuito, mostrar todos los usuarios inscritos
      return inscripciones;
    } else {
      // Si es pagado, mostrar solo los aprobados
      return inscripciones.filter(ins => ins.estado_pago === 'APROBADO');
    }
  };

  const handleAsistenciaChange = (inscripcionId, porcentaje) => {
    setAsistencias(prev => ({
      ...prev,
      [inscripcionId]: porcentaje
    }));
  };

  const handleCalificacionChange = (inscripcionId, nota) => {
    setCalificaciones(prev => ({
      ...prev,
      [inscripcionId]: nota
    }));
  };

  const guardarCalificacion = async (inscripcionId) => {
    try {
      setLoadingCalificaciones(true);
      setEditingCalificacion(inscripcionId);
      
      const asistenciaPorcentaje = asistencias[inscripcionId] || 0;
      const nota = item.tipo === 'CURSO' ? (calificaciones[inscripcionId] || 0) : null;

      // Validar datos antes de enviar
      if (item.tipo === 'EVENTO') {
        if (asistenciaPorcentaje === '' || asistenciaPorcentaje < 0 || asistenciaPorcentaje > 100) {
          setSnackbar({
            open: true,
            message: 'El porcentaje de asistencia debe estar entre 0 y 100',
            severity: 'error'
          });
          return;
        }
      } else {
        if (asistenciaPorcentaje === '' || asistenciaPorcentaje < 0 || asistenciaPorcentaje > 100) {
          setSnackbar({
            open: true,
            message: 'El porcentaje de asistencia debe estar entre 0 y 100',
            severity: 'error'
          });
          return;
        }
        if (nota === '' || nota < 0 || nota > 100) {
          setSnackbar({
            open: true,
            message: 'La nota final debe estar entre 0 y 100',
            severity: 'error'
          });
          return;
        }
      }

      const endpoint = item.tipo === 'EVENTO'
        ? `/administracion/evento/${item.id_eve}/participacion`
        : `/administracion/curso/${item.id_cur}/participacion`;

      const data = {
        inscripcion_id: inscripcionId,
        asistencia_porcentaje: parseFloat(asistenciaPorcentaje),
        ...(item.tipo === 'CURSO' && { nota_final: parseFloat(nota) })
      };

      const response = await api.post(endpoint, data);

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: `Participación guardada exitosamente. Estado: ${response.data.data.estado}`,
          severity: 'success'
        });
        setEditingCalificacion(null);
        // Recargar participaciones para mostrar el estado actualizado
        cargarParticipacionesExistentes();
      }
    } catch (error) {
      console.error('Error al guardar participación:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error al guardar la participación',
        severity: 'error'
      });
    } finally {
      setLoadingCalificaciones(false);
      setEditingCalificacion(null);
    }
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
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {item.tipo === 'CURSO' ? <Grade /> : <Assignment />}
                  {item.tipo === 'CURSO' ? 'Calificaciones' : 'Asistencia'}
                </Box>
              } 
            />
          </Tabs>
        </Paper>

        {/* Tabla de inscripciones o calificaciones */}
        <Paper>
          {selectedTab === 4 ? (
            // Sección de Calificaciones/Asistencia
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                {item.tipo === 'CURSO' ? <Grade /> : <Assignment />}
                {item.tipo === 'CURSO' ? 'Gestión de Calificaciones y Asistencia' : 'Gestión de Asistencia'}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {item.es_gratuito 
                  ? 'Mostrando todos los usuarios inscritos (evento/curso gratuito)'
                  : 'Mostrando solo usuarios con pago aprobado'
                }
              </Typography>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Usuario</TableCell>
                      <TableCell>Carrera</TableCell>
                      <TableCell>Asistencia (%)</TableCell>
                      {item.tipo === 'CURSO' && <TableCell>Nota Final (0-100)</TableCell>}
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getUsuariosParaCalificar().map((inscripcion) => (
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
                          <Typography variant="body2">
                            {inscripcion.usuario.carrera}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {participacionesExistentes[inscripcion.id_inscripcion] ? (
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#6d1313' }}>
                                {participacionesExistentes[inscripcion.id_inscripcion].asistencia}%
                              </Typography>
                              <Chip 
                                label={participacionesExistentes[inscripcion.id_inscripcion].aprobado ? 'Aprobado' : 'Reprobado'}
                                size="small"
                                color={participacionesExistentes[inscripcion.id_inscripcion].aprobado ? 'success' : 'error'}
                                sx={{ mt: 0.5 }}
                              />
                            </Box>
                          ) : (
                            <TextField
                              type="number"
                              size="small"
                              placeholder="0-100%"
                              value={asistencias[inscripcion.id_inscripcion] || ''}
                              onChange={(e) => handleAsistenciaChange(inscripcion.id_inscripcion, e.target.value)}
                              inputProps={{ min: 0, max: 100 }}
                              sx={{ width: 100 }}
                              InputProps={{
                                endAdornment: <Typography variant="caption">%</Typography>
                              }}
                            />
                          )}
                        </TableCell>
                        {item.tipo === 'CURSO' && (
                          <TableCell>
                            {participacionesExistentes[inscripcion.id_inscripcion] ? (
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#6d1313' }}>
                                  {participacionesExistentes[inscripcion.id_inscripcion].nota}/100
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Registrado el {new Date(participacionesExistentes[inscripcion.id_inscripcion].fecha_evaluacion).toLocaleDateString('es-ES')}
                                </Typography>
                              </Box>
                            ) : (
                              <TextField
                                type="number"
                                size="small"
                                placeholder="0-100"
                                value={calificaciones[inscripcion.id_inscripcion] || ''}
                                onChange={(e) => handleCalificacionChange(inscripcion.id_inscripcion, e.target.value)}
                                inputProps={{ min: 0, max: 100 }}
                                sx={{ width: 100 }}
                              />
                            )}
                          </TableCell>
                        )}
                        <TableCell>
                          {participacionesExistentes[inscripcion.id_inscripcion] ? (
                            <Box>
                              <Chip 
                                label="Registrado" 
                                size="small" 
                                color="success" 
                                variant="outlined"
                              />
                              <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                                {new Date(participacionesExistentes[inscripcion.id_inscripcion].fecha_evaluacion).toLocaleDateString('es-ES')}
                              </Typography>
                            </Box>
                          ) : (
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={editingCalificacion === inscripcion.id_inscripcion ? <CircularProgress size={16} /> : <Save />}
                              onClick={() => guardarCalificacion(inscripcion.id_inscripcion)}
                              disabled={loadingCalificaciones && editingCalificacion === inscripcion.id_inscripcion}
                              sx={{ bgcolor: '#6d1313', '&:hover': { bgcolor: '#5a0f0f' } }}
                            >
                              Guardar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {getUsuariosParaCalificar().length === 0 && (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h6" color="text.secondary">
                    No hay usuarios para calificar
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.es_gratuito 
                      ? 'No hay usuarios inscritos en este evento/curso'
                      : 'No hay usuarios con pago aprobado'
                    }
                  </Typography>
                </Box>
              )}
            </Box>
          ) : (
            // Tabla normal de inscripciones
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
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, inscripcion)}
                        size="small"
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
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

    {/* Menú contextual */}
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
    >
      {selectedInscripcion?.estado_pago === 'PENDIENTE' && !itemData.es_gratuito && (
        <>
          <MenuItem onClick={() => handleMenuAction('aprobar')}>
            <CheckCircle sx={{ mr: 1, color: 'green' }} />
            Aprobar
          </MenuItem>
          <MenuItem onClick={() => handleMenuAction('rechazar')}>
            <Cancel sx={{ mr: 1, color: 'red' }} />
            Rechazar
          </MenuItem>
        </>
      )}
      {selectedInscripcion?.tiene_comprobante && (
        <MenuItem onClick={() => handleMenuAction('descargar')}>
          <Download sx={{ mr: 1 }} />
          Descargar Comprobante
        </MenuItem>
      )}
      <MenuItem onClick={() => handleMenuAction('ver')}>
        <Visibility sx={{ mr: 1 }} />
        Ver Detalles
      </MenuItem>
    </Menu>

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
        {confirmDialog.action === 'rechazar' && (
          <TextField
            autoFocus
            margin="dense"
            label="Motivo del rechazo"
            fullWidth
            variant="outlined"
            value={motivoRechazo}
            onChange={(e) => setMotivoRechazo(e.target.value)}
            sx={{ mt: 2 }}
          />
        )}
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
              handleRechazar(confirmDialog.inscripcion.id_inscripcion, motivoRechazo);
            }
          }}
          variant="contained"
          color={confirmDialog.action === 'aprobar' ? 'success' : 'error'}
          disabled={loadingAction || (confirmDialog.action === 'rechazar' && !motivoRechazo.trim())}
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
  </Box>
  </Box>
);
};

export default DetalleEventoCurso;
