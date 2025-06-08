import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  IconButton,
  CircularProgress,
  Fab,
  Snackbar,
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
  FormHelperText,
  Divider,
  OutlinedInput,
  Checkbox,
  ListItemText
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Event,
  LocationOn,
  CalendarToday,
  People,
  Visibility,
  Category,
  Schedule,
  Person,
  Save,
  Cancel,
  Info
} from '@mui/icons-material';

import AdminSidebar from './AdminSidebar';
import api from '../../services/api';

const AdminEventos = () => {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [stats, setStats] = useState({
    totalEventos: 0,
    eventosActivos: 0,
    totalInscripciones: 0,
    capacidadTotal: 0
  });

  // Estados para el modal de crear/editar evento
  const [openModal, setOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loadingModal, setLoadingModal] = useState(false);
  const [errors, setErrors] = useState({});

  // Estados para datos del formulario
  const [categorias, setCategorias] = useState([]);
  const [organizadores, setOrganizadores] = useState([]);
  const [carreras, setCarreras] = useState([]);

  // Estados del evento
  const [evento, setEvento] = useState({
    nom_eve: '',
    des_eve: '',
    id_cat_eve: '',
    fec_ini_eve: '',
    fec_fin_eve: '',
    hor_ini_eve: '',
    hor_fin_eve: '',
    dur_eve: 0,
    are_eve: '',
    ubi_eve: '',
    ced_org_eve: '',
    capacidad_max_eve: '',
    tipo_audiencia_eve: '',
    carreras_seleccionadas: []
  });

  // Constantes
  const AREAS_EVENTO = [
    'PRACTICA',
    'INVESTIGACION', 
    'ACADEMICA',
    'TECNICA',
    'INDUSTRIAL',
    'EMPRESARIAL',
    'IA',
    'REDES'
  ];

  const TIPOS_AUDIENCIA = [
    { value: 'CARRERA_ESPECIFICA', label: 'Carrera Específica', description: 'Solo para estudiantes de carreras seleccionadas' },
    { value: 'TODAS_CARRERAS', label: 'Todas las Carreras', description: 'Para estudiantes de todas las carreras de la universidad' },
    { value: 'PUBLICO_GENERAL', label: 'Público General', description: 'Para estudiantes y usuarios externos' }
  ];

  const fechaMinima = new Date().toISOString().split('T')[0];

  useEffect(() => {
    cargarDatos();
    cargarDatosFormulario();
  }, []);

  // Calcular duración automáticamente
  useEffect(() => {
    if (evento.fec_ini_eve && evento.fec_fin_eve && evento.hor_ini_eve && evento.hor_fin_eve) {
      const fechaInicio = new Date(evento.fec_ini_eve);
      const fechaFin = new Date(evento.fec_fin_eve);
      
      // Calcular días
      const diffTiempo = fechaFin.getTime() - fechaInicio.getTime();
      const diffDias = Math.ceil(diffTiempo / (1000 * 3600 * 24)) + 1;

      // Calcular horas por día
      const [horaIni, minIni] = evento.hor_ini_eve.split(':').map(Number);
      const [horaFin, minFin] = evento.hor_fin_eve.split(':').map(Number);
      
      const minutosInicio = horaIni * 60 + minIni;
      const minutosFin = horaFin * 60 + minFin;
      const horasPorDia = (minutosFin - minutosInicio) / 60;

      if (horasPorDia > 0 && diffDias > 0) {
        const duracionTotal = horasPorDia * diffDias;
        setEvento(prev => ({ ...prev, dur_eve: duracionTotal }));
      }
    }
  }, [evento.fec_ini_eve, evento.fec_fin_eve, evento.hor_ini_eve, evento.hor_fin_eve]);

  const cargarDatosFormulario = async () => {
    try {
      const [categoriasRes, organizadoresRes, carrerasRes] = await Promise.all([
        api.get('/categorias'),
        api.get('/organizadores'),
        api.get('/carreras')
      ]);

      setCategorias(categoriasRes.data.categorias || []);
      setOrganizadores(organizadoresRes.data.organizadores || []);
      setCarreras(carrerasRes.data.data || []);
    } catch (error) {
      console.error('Error cargando datos del formulario:', error);
    }
  };

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Cargar eventos
      const eventosResponse = await api.get('/eventos');
      const eventosData = eventosResponse.data.eventos || [];
      setEventos(eventosData);
      
      // Calcular estadísticas
      const totalEventos = eventosData.length;
      const eventosActivos = eventosData.filter(e => e.est_eve === 'ACTIVO' || !e.est_eve).length;
      const totalInscripciones = eventosData.reduce((sum, e) => sum + (e.total_inscripciones || 0), 0);
      const capacidadTotal = eventosData.reduce((sum, e) => sum + parseInt(e.capacidad_max_eve || 0), 0);
      
      setStats({
        totalEventos,
        eventosActivos,
        totalInscripciones,
        capacidadTotal
      });
      
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setSnackbar({
        open: true,
        message: 'Error al cargar los datos',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Funciones del modal
  const handleOpenModal = (eventoData = null) => {
    setIsEditing(Boolean(eventoData));
    setSelectedEvent(eventoData);
    
    if (eventoData) {
      // Modo edición - cargar datos del evento
      const formatearFecha = (fecha) => {
        if (!fecha) return '';
        return new Date(fecha).toISOString().split('T')[0];
      };

      const formatearHora = (hora) => {
        if (!hora) return '';
        if (typeof hora === 'string' && hora.includes(':')) {
          return hora.substring(0, 5);
        }
        return hora;
      };

      setEvento({
        nom_eve: eventoData.nom_eve || '',
        des_eve: eventoData.des_eve || '',
        id_cat_eve: eventoData.id_cat_eve || '',
        fec_ini_eve: formatearFecha(eventoData.fec_ini_eve),
        fec_fin_eve: formatearFecha(eventoData.fec_fin_eve),
        hor_ini_eve: formatearHora(eventoData.hora_inicio || eventoData.hor_ini_eve),
        hor_fin_eve: formatearHora(eventoData.hora_fin || eventoData.hor_fin_eve),
        dur_eve: eventoData.dur_eve || 0,
        are_eve: eventoData.are_eve || '',
        ubi_eve: eventoData.ubi_eve || '',
        ced_org_eve: eventoData.ced_org_eve || '',
        capacidad_max_eve: eventoData.capacidad_max_eve || '',
        tipo_audiencia_eve: eventoData.tipo_audiencia_eve || '',
        carreras_seleccionadas: eventoData.carreras ? eventoData.carreras.map(c => c.id) : []
      });
    } else {
      // Modo creación - limpiar formulario
      setEvento({
        nom_eve: '',
        des_eve: '',
        id_cat_eve: '',
        fec_ini_eve: '',
        fec_fin_eve: '',
        hor_ini_eve: '',
        hor_fin_eve: '',
        dur_eve: 0,
        are_eve: '',
        ubi_eve: '',
        ced_org_eve: '',
        capacidad_max_eve: '',
        tipo_audiencia_eve: '',
        carreras_seleccionadas: []
      });
    }
    
    setErrors({});
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setIsEditing(false);
    setSelectedEvent(null);
    setErrors({});
  };

  const handleSubmitModal = async () => {
    // Validaciones básicas
    const nuevosErrores = {};
    
    if (!evento.nom_eve.trim()) nuevosErrores.nom_eve = 'El nombre es obligatorio';
    if (!evento.des_eve.trim()) nuevosErrores.des_eve = 'La descripción es obligatoria';
    if (!evento.id_cat_eve) nuevosErrores.id_cat_eve = 'Seleccione una categoría';
    if (!evento.fec_ini_eve) nuevosErrores.fec_ini_eve = 'La fecha de inicio es obligatoria';
    if (!evento.fec_fin_eve) nuevosErrores.fec_fin_eve = 'La fecha de fin es obligatoria';
    if (!evento.hor_ini_eve) nuevosErrores.hor_ini_eve = 'La hora de inicio es obligatoria';
    if (!evento.hor_fin_eve) nuevosErrores.hor_fin_eve = 'La hora de fin es obligatoria';
    if (!evento.are_eve) nuevosErrores.are_eve = 'Seleccione un área';
    if (!evento.ubi_eve.trim()) nuevosErrores.ubi_eve = 'La ubicación es obligatoria';
    if (!evento.ced_org_eve) nuevosErrores.ced_org_eve = 'Seleccione un organizador';
    if (!evento.capacidad_max_eve || evento.capacidad_max_eve <= 0) {
      nuevosErrores.capacidad_max_eve = 'La capacidad debe ser mayor a 0';
    }
    if (!evento.tipo_audiencia_eve) nuevosErrores.tipo_audiencia_eve = 'Seleccione el tipo de audiencia';
    
    if (evento.tipo_audiencia_eve === 'CARRERA_ESPECIFICA' && evento.carreras_seleccionadas.length === 0) {
      nuevosErrores.carreras_seleccionadas = 'Debe seleccionar al menos una carrera';
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrors(nuevosErrores);
      return;
    }

    setLoadingModal(true);
    try {
      // Preparar datos
      const datosEvento = {
        nom_eve: evento.nom_eve.trim(),
        des_eve: evento.des_eve.trim(),
        id_cat_eve: evento.id_cat_eve,
        fec_ini_eve: evento.fec_ini_eve,
        fec_fin_eve: evento.fec_fin_eve,
        hor_ini_eve: `${evento.hor_ini_eve}:00`,
        hor_fin_eve: `${evento.hor_fin_eve}:00`,
        dur_eve: parseInt(evento.dur_eve) || 1,
        are_eve: evento.are_eve,
        ubi_eve: evento.ubi_eve.trim(),
        ced_org_eve: evento.ced_org_eve,
        capacidad_max_eve: parseInt(evento.capacidad_max_eve),
        tipo_audiencia_eve: evento.tipo_audiencia_eve
      };

      let eventoId;
      
      if (isEditing) {
        // Actualizar evento
        await api.put(`/eventos/${selectedEvent.id_eve}`, datosEvento);
        eventoId = selectedEvent.id_eve;
        
        setSnackbar({
          open: true,
          message: 'Evento actualizado exitosamente',
          severity: 'success'
        });
      } else {
        // Crear evento
        const response = await api.post('/eventos', datosEvento);
        eventoId = response.data?.data?.id_eve;
        
        setSnackbar({
          open: true,
          message: 'Evento creado exitosamente',
          severity: 'success'
        });
      }

      // Manejar carreras si es necesario
      if (evento.tipo_audiencia_eve === 'CARRERA_ESPECIFICA' && eventoId) {
        if (isEditing) {
          // Eliminar asociaciones existentes
          try {
            const asociacionesResponse = await api.get('/eventosPorCarrera/listar');
            const asociacionesActuales = asociacionesResponse.data.data.filter(
              asoc => asoc.id_eve_per === eventoId
            );

            for (const asociacion of asociacionesActuales) {
              await api.delete('/eventosPorCarrera/eliminar', {
                data: {
                  eventoId: eventoId,
                  carreraId: asociacion.id_car_per
                }
              });
            }
          } catch (error) {
            console.warn('Error eliminando asociaciones previas:', error);
          }
        }

        // Crear nuevas asociaciones
        for (const carreraId of evento.carreras_seleccionadas) {
          try {
            await api.post('/eventosPorCarrera/asociar', {
              eventoId: eventoId,
              carreraId: carreraId
            });
          } catch (error) {
            console.warn('Error asociando carrera:', carreraId, error);
          }
        }
      }

      // Recargar datos y cerrar modal
      await cargarDatos();
      handleCloseModal();

    } catch (error) {
      console.error('Error al procesar evento:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || `Error al ${isEditing ? 'actualizar' : 'crear'} el evento`,
        severity: 'error'
      });
    } finally {
      setLoadingModal(false);
    }
  };

  const handleDelete = async (eventoId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este evento?')) {
      try {
        await api.delete(`/eventos/${eventoId}`);
        setSnackbar({
          open: true,
          message: 'Evento eliminado correctamente',
          severity: 'success'
        });
        cargarDatos();
      } catch (error) {
        console.error('Error al eliminar evento:', error);
        setSnackbar({
          open: true,
          message: 'Error al eliminar el evento',
          severity: 'error'
        });
      }
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'ACTIVO':
        return '#10b981';
      case 'FINALIZADO':
        return '#6b7280';
      case 'CANCELADO':
        return '#ef4444';
      default:
        return '#f59e0b';
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin fecha';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatearHora = (hora) => {
    if (!hora) return 'Sin hora';
    if (typeof hora === 'string' && hora.includes(':')) {
      return hora.substring(0, 5); // HH:MM
    }
    return hora;
  };

  const statsCards = [
    {
      title: 'Total Eventos',
      value: stats.totalEventos,
      icon: <Event />,
      color: '#6d1313'
    },
    {
      title: 'Eventos Activos',
      value: stats.eventosActivos,
      icon: <CalendarToday />,
      color: '#10b981'
    },
    {
      title: 'Total Inscripciones',
      value: stats.totalInscripciones,
      icon: <People />,
      color: '#3b82f6'
    },
    {
      title: 'Capacidad Total',
      value: stats.capacidadTotal,
      icon: <Person />,
      color: '#8b5cf6'
    }
  ];

  if (loading && eventos.length === 0) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
        <AdminSidebar />
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress size={60} sx={{ color: '#6d1313' }} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f5f5f5' }}>
      <AdminSidebar />
      
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ color: '#6d1313', fontWeight: 'bold', mb: 1 }}>
            <Event sx={{ mr: 1, fontSize: '2rem' }} />
            Gestión de Eventos
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Administra y visualiza todos los eventos del sistema
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statsCards.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: stat.color, mr: 2 }}>
                    {stat.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Actions */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Lista de Eventos ({eventos.length})
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenModal()}
            sx={{ 
              bgcolor: '#6d1313', 
              '&:hover': { bgcolor: '#8b1a1a' }
            }}
          >
            Nuevo Evento
          </Button>
        </Box>

        {/* Events Grid */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
            <CircularProgress size={60} sx={{ color: '#6d1313' }} />
          </Box>
        ) : eventos.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Event sx={{ fontSize: '4rem', color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No hay eventos registrados
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Crea tu primer evento para comenzar
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenModal()}
              sx={{ 
                bgcolor: '#6d1313', 
                '&:hover': { bgcolor: '#8b1a1a' }
              }}
            >
              Crear Primer Evento
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {eventos.map((evento) => (
              <Grid item xs={12} sm={6} md={4} key={evento.id_eve}>
                <Card sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  '&:hover': { 
                    boxShadow: 6,
                    transform: 'translateY(-2px)',
                    transition: 'all 0.3s ease'
                  }
                }}>
                  <CardContent sx={{ flexGrow: 1, p: 3,width: '400px' }}>
                    {/* Header con título y estado */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 600, 
                        flexGrow: 1,
                        lineHeight: 1.3,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {evento.nom_eve}
                      </Typography>
                      <Chip
                        label={evento.est_eve || 'ACTIVO'}
                        size="small"
                        sx={{
                          bgcolor: getEstadoColor(evento.est_eve),
                          color: 'white',
                          fontWeight: 500,
                          ml: 1
                        }}
                      />
                    </Box>
                    
                    {/* Descripción */}
                    <Typography variant="body2" color="text.secondary" sx={{ 
                      mb: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {evento.des_eve}
                    </Typography>
                    
                    {/* Información del evento */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {formatearFecha(evento.fec_ini_eve)}
                          {evento.fec_fin_eve && evento.fec_fin_eve !== evento.fec_ini_eve && 
                            ` - ${formatearFecha(evento.fec_fin_eve)}`
                          }
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Schedule sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {formatearHora(evento.hora_inicio)}
                          {evento.hora_fin && ` - ${formatearHora(evento.hora_fin)}`}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationOn sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {evento.ubi_eve || 'Sin ubicación'}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Category sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {evento.categoria_nombre || 'Sin categoría'}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <People sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {evento.total_inscripciones || 0} / {evento.capacidad_max_eve || 'Sin límite'}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Person sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {evento.organizador_nombre || 'Sin organizador'}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Área y tipo de audiencia */}
                    <Box sx={{ mb: 2 }}>
                      <Chip 
                        label={evento.are_eve} 
                        size="small" 
                        sx={{ mr: 1, mb: 1, bgcolor: '#6d1313', color: 'white' }}
                      />
                      {evento.tipo_audiencia_eve && (
                        <Chip 
                          label={evento.tipo_audiencia_eve.replace('_', ' ')} 
                          size="small" 
                          variant="outlined"
                          sx={{ mb: 1 }}
                        />
                      )}
                    </Box>

                    {/* Carreras asociadas */}
                    {evento.carreras && evento.carreras.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                          Carreras:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {evento.carreras.slice(0, 2).map((carrera) => (
                            <Chip 
                              key={carrera.id}
                              label={carrera.nombre}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem' }}
                            />
                          ))}
                          {evento.carreras.length > 2 && (
                            <Chip 
                              label={`+${evento.carreras.length - 2} más`}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem' }}
                            />
                          )}
                        </Box>
                      </Box>
                    )}
                    
                    {/* Botones de acción */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 'auto' }}>
                      <IconButton
                        color="info" 
                        size="small"
                        title="Ver detalles"
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton
                        color="primary"
                        size="small"
                        title="Editar evento"
                        onClick={() => handleOpenModal(evento)}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        size="small" 
                        onClick={() => handleDelete(evento.id_eve)}
                        title="Eliminar evento"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            bgcolor: '#6d1313',
            '&:hover': { bgcolor: '#8b1a1a' }
          }}
          onClick={() => handleOpenModal()}
        >
          <Add />
        </Fab>

        {/* Modal de Crear/Editar Evento */}
        <Dialog 
          open={openModal} 
          onClose={handleCloseModal} 
          maxWidth="lg" 
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3 }
          }}
        >
          <DialogTitle sx={{ 
            bgcolor: '#6d1313', 
            color: 'white',
            display: 'flex',
            alignItems: 'center'
          }}>
            {isEditing ? <Edit sx={{ mr: 1 }} /> : <Event sx={{ mr: 1 }} />}
            {isEditing ? 'Editar Evento' : 'Crear Nuevo Evento'}
          </DialogTitle>
          
          <DialogContent sx={{ p: 3 }}>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {/* Información Básica */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <Info sx={{ mr: 1 }} />
                  Información Básica
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Nombre del Evento"
                      value={evento.nom_eve}
                      onChange={(e) => setEvento(prev => ({ ...prev, nom_eve: e.target.value }))}
                      error={!!errors.nom_eve}
                      helperText={errors.nom_eve}
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth error={!!errors.id_cat_eve}>
                      <InputLabel>Categoría *</InputLabel>
                      <Select
                        value={evento.id_cat_eve}
                        onChange={(e) => setEvento(prev => ({ ...prev, id_cat_eve: e.target.value }))}
                        label="Categoría *"
                      >
                        {categorias.map((categoria) => (
                          <MenuItem key={categoria.id_cat} value={categoria.id_cat}>
                            {categoria.nom_cat}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.id_cat_eve && <FormHelperText>{errors.id_cat_eve}</FormHelperText>}
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Descripción"
                      value={evento.des_eve}
                      onChange={(e) => setEvento(prev => ({ ...prev, des_eve: e.target.value }))}
                      error={!!errors.des_eve}
                      helperText={errors.des_eve}
                      multiline
                      rows={3}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth error={!!errors.are_eve}>
                      <InputLabel>Área *</InputLabel>
                      <Select
                        value={evento.are_eve}
                        onChange={(e) => setEvento(prev => ({ ...prev, are_eve: e.target.value }))}
                        label="Área *"
                      >
                        {AREAS_EVENTO.map((area) => (
                          <MenuItem key={area} value={area}>
                            {area}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.are_eve && <FormHelperText>{errors.are_eve}</FormHelperText>}
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Ubicación"
                      value={evento.ubi_eve}
                      onChange={(e) => setEvento(prev => ({ ...prev, ubi_eve: e.target.value }))}
                      error={!!errors.ubi_eve}
                      helperText={errors.ubi_eve}
                      required
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* Fechas y Horarios */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <Schedule sx={{ mr: 1 }} />
                  Fechas y Horarios
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Fecha de Inicio"
                      value={evento.fec_ini_eve}
                      onChange={(e) => setEvento(prev => ({ ...prev, fec_ini_eve: e.target.value }))}
                      error={!!errors.fec_ini_eve}
                      helperText={errors.fec_ini_eve}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ min: fechaMinima }}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Fecha de Fin"
                      value={evento.fec_fin_eve}
                      onChange={(e) => setEvento(prev => ({ ...prev, fec_fin_eve: e.target.value }))}
                      error={!!errors.fec_fin_eve}
                      helperText={errors.fec_fin_eve}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ min: evento.fec_ini_eve || fechaMinima }}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="time"
                      label="Hora de Inicio"
                      value={evento.hor_ini_eve}
                      onChange={(e) => setEvento(prev => ({ ...prev, hor_ini_eve: e.target.value }))}
                      error={!!errors.hor_ini_eve}
                      helperText={errors.hor_ini_eve || 'Entre 08:00 y 18:00'}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ min: '08:00', max: '18:00' }}
                      required
                    />
                  </Grid>

                                     <Grid item xs={12} md={6}>
                     <TextField
                       fullWidth
                       type="time"
                       label="Hora de Fin"
                       value={evento.hor_fin_eve}
                       onChange={(e) => setEvento(prev => ({ ...prev, hor_fin_eve: e.target.value }))}
                       error={!!errors.hor_fin_eve}
                       helperText={errors.hor_fin_eve || 'Entre 10:00 y 20:00'}
                       InputLabelProps={{ shrink: true }}
                       inputProps={{ min: '10:00', max: '20:00' }}
                       required
                     />
                   </Grid>

                   <Grid item xs={12} md={6}>
                     <TextField
                       fullWidth
                       label="Duración Total (horas)"
                       value={evento.dur_eve}
                       InputProps={{ readOnly: true }}
                       helperText="Se calcula automáticamente"
                     />
                   </Grid>
                 </Grid>
               </Grid>

              {/* Organización */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <People sx={{ mr: 1 }} />
                  Organización y Capacidad
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth error={!!errors.ced_org_eve}>
                      <InputLabel>Organizador *</InputLabel>
                      <Select
                        value={evento.ced_org_eve}
                        onChange={(e) => setEvento(prev => ({ ...prev, ced_org_eve: e.target.value }))}
                        label="Organizador *"
                      >
                        {organizadores.map((org) => (
                          <MenuItem key={org.ced_org} value={org.ced_org}>
                            {org.nom_org1} {org.nom_org2} {org.ape_org1} {org.ape_org2}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.ced_org_eve && <FormHelperText>{errors.ced_org_eve}</FormHelperText>}
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Capacidad Máxima"
                      value={evento.capacidad_max_eve}
                      onChange={(e) => setEvento(prev => ({ ...prev, capacidad_max_eve: e.target.value }))}
                      error={!!errors.capacidad_max_eve}
                      helperText={errors.capacidad_max_eve || 'Máximo 1000 personas'}
                      inputProps={{ min: 1, max: 1000 }}
                      required
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* Tipo de Audiencia */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <Category sx={{ mr: 1 }} />
                  Tipo de Audiencia
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth error={!!errors.tipo_audiencia_eve}>
                      <InputLabel>Tipo de Audiencia *</InputLabel>
                      <Select
                        value={evento.tipo_audiencia_eve}
                        onChange={(e) => setEvento(prev => ({ ...prev, tipo_audiencia_eve: e.target.value }))}
                        label="Tipo de Audiencia *"
                      >
                        {TIPOS_AUDIENCIA.map((tipo) => (
                          <MenuItem key={tipo.value} value={tipo.value}>
                            <Box>
                              <Typography variant="body1">{tipo.label}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {tipo.description}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.tipo_audiencia_eve && <FormHelperText>{errors.tipo_audiencia_eve}</FormHelperText>}
                    </FormControl>
                  </Grid>

                  {/* Selector de carreras solo para CARRERA_ESPECIFICA */}
                  {evento.tipo_audiencia_eve === 'CARRERA_ESPECIFICA' && (
                    <Grid item xs={12}>
                      <FormControl fullWidth error={!!errors.carreras_seleccionadas}>
                        <InputLabel>Carreras Específicas *</InputLabel>
                        <Select
                          multiple
                          value={evento.carreras_seleccionadas}
                          onChange={(e) => setEvento(prev => ({ ...prev, carreras_seleccionadas: e.target.value }))}
                          input={<OutlinedInput label="Carreras Específicas *" />}
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((value) => {
                                const carrera = carreras.find(c => c.id_car === value);
                                return (
                                  <Chip 
                                    key={value} 
                                    label={carrera?.nom_car || value}
                                    size="small"
                                    sx={{ bgcolor: '#6d1313', color: 'white' }}
                                  />
                                );
                              })}
                            </Box>
                          )}
                        >
                          {carreras.map((carrera) => (
                            <MenuItem key={carrera.id_car} value={carrera.id_car}>
                              <Checkbox 
                                checked={evento.carreras_seleccionadas.indexOf(carrera.id_car) > -1} 
                              />
                              <ListItemText 
                                primary={carrera.nom_car}
                                secondary={carrera.des_car}
                              />
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.carreras_seleccionadas && (
                          <FormHelperText>{errors.carreras_seleccionadas}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                  )}
                </Grid>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 3, bgcolor: '#f5f5f5' }}>
            <Button 
              onClick={handleCloseModal}
              startIcon={<Cancel />}
              disabled={loadingModal}
            >
              Cancelar
            </Button>
            <Button 
              variant="contained"
              onClick={handleSubmitModal}
              startIcon={loadingModal ? <CircularProgress size={20} /> : <Save />}
              disabled={loadingModal}
              sx={{
                bgcolor: '#6d1313',
                '&:hover': { bgcolor: '#8b1a1a' }
              }}
            >
              {loadingModal 
                ? (isEditing ? 'Actualizando...' : 'Creando...') 
                : (isEditing ? 'Actualizar Evento' : 'Crear Evento')
              }
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default AdminEventos; 