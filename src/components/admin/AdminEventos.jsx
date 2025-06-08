import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Fab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert
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
  Category
} from '@mui/icons-material';
import AdminSidebar from './AdminSidebar';
import api from '../../services/api';

const AdminEventos = () => {
  const [eventos, setEventos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [organizadores, setOrganizadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    fecha: '',
    hora: '',
    ubicacion: '',
    capacidad: '',
    precio: '',
    imagen: '',
    id_cat_eve: '',
    ced_org_eve: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [stats, setStats] = useState({
    totalEventos: 0,
    eventosActivos: 0,
    totalInscripciones: 0,
    capacidadTotal: 0
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Cargar eventos
      const eventosResponse = await api.get('/eventos');
      const eventosData = eventosResponse.data.eventos || [];
      setEventos(eventosData);
      
      // Cargar categorías
      const categoriasResponse = await api.get('/categorias');
      setCategorias(categoriasResponse.data.categorias || []);
      
      // Cargar organizadores
      const organizadoresResponse = await api.get('/organizadores');
      setOrganizadores(organizadoresResponse.data.organizadores || []);
      
      // Calcular estadísticas
      const totalEventos = eventosData.length;
      const eventosActivos = eventosData.filter(e => e.est_eve === 'ACTIVO').length;
      const totalInscripciones = eventosData.reduce((sum, e) => sum + (e.inscripciones?.length || 0), 0);
      const capacidadTotal = eventosData.reduce((sum, e) => sum + parseInt(e.cap_max_eve || 0), 0);
      
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

  const handleOpenDialog = (event = null) => {
    setSelectedEvent(event);
    if (event) {
      setFormData({
        titulo: event.nom_eve,
        descripcion: event.des_eve,
        fecha: event.fec_ini_eve?.substring(0, 10) || '',
        hora: event.hor_ini_eve || '',
        ubicacion: event.lug_eve || '',
        capacidad: event.cap_max_eve || '',
        precio: event.precio || '',
        imagen: event.imagen || '',
        id_cat_eve: event.id_cat_eve || '',
        ced_org_eve: event.ced_org_eve || ''
      });
    } else {
      setFormData({
        titulo: '',
        descripcion: '',
        fecha: '',
        hora: '',
        ubicacion: '',
        capacidad: '',
        precio: '',
        imagen: '',
        id_cat_eve: '',
        ced_org_eve: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEvent(null);
  };

  const handleSaveEvent = async () => {
    try {
      setLoading(true);
      
      if (selectedEvent) {
        await api.put(`/eventos/${selectedEvent.id_eve}`, formData);
        setSnackbar({
          open: true,
          message: 'Evento actualizado correctamente',
          severity: 'success'
        });
      } else {
        await api.post('/eventos', formData);
        setSnackbar({
          open: true,
          message: 'Evento creado correctamente',
          severity: 'success'
        });
      }
      
      handleCloseDialog();
      cargarDatos();
      
    } catch (error) {
      console.error('Error al guardar evento:', error);
      setSnackbar({
        open: true,
        message: 'Error al guardar el evento',
        severity: 'error'
      });
    } finally {
      setLoading(false);
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

  const getCategoriaName = (idCategoria) => {
    const categoria = categorias.find(cat => cat.id_cat === idCategoria);
    return categoria ? categoria.nom_cat : 'Sin categoría';
  };

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
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Gestión de Eventos
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Crea y administra eventos del sistema
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {stats.map((stat, index) => (
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
            Lista de Eventos
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{ bgcolor: '#7c3aed', '&:hover': { bgcolor: '#6d28d9' } }}
          >
            Nuevo Evento
          </Button>
        </Box>

        {/* Events Grid */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
            <CircularProgress size={60} sx={{ color: '#7c3aed' }} />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {eventos.map((evento) => (
              <Grid item xs={12} sm={6} md={4} key={evento.id_eve}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={evento.imagen}
                    alt={evento.nom_eve}
                    sx={{ bgcolor: '#e5e7eb' }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, flexGrow: 1 }}>
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
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {evento.des_eve}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {evento.fec_ini_eve ? new Date(evento.fec_ini_eve).toLocaleDateString() : 'Sin fecha'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationOn sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {evento.lug_eve || 'Sin ubicación'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Category sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {getCategoriaName(evento.id_cat_eve)}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <People sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {evento.cap_max_eve || 'Sin límite'}
                      </Typography>
                    </Box>
                    
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#7c3aed', mb: 2 }}>
                      ${evento.precio}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <IconButton
                        onClick={() => handleOpenDialog(evento)}
                        color="primary"
                        size="small"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton color="info" size="small">
                        <Visibility />
                      </IconButton>
                      <IconButton color="error" size="small" onClick={() => handleDelete(evento.id_eve)}>
                        <Delete />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Dialog for Create/Edit Event */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {selectedEvent ? 'Editar Evento' : 'Nuevo Evento'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Título del Evento"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descripción"
                  multiline
                  rows={3}
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Fecha"
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Hora"
                  type="time"
                  value={formData.hora}
                  onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Ubicación"
                  value={formData.ubicacion}
                  onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Capacidad"
                  type="number"
                  value={formData.capacidad}
                  onChange={(e) => setFormData({ ...formData, capacidad: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Precio"
                  type="number"
                  value={formData.precio}
                  onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="URL de Imagen"
                  value={formData.imagen}
                  onChange={(e) => setFormData({ ...formData, imagen: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Categoría</InputLabel>
                  <Select
                    value={formData.id_cat_eve}
                    label="Categoría"
                    onChange={(e) => setFormData({ ...formData, id_cat_eve: e.target.value })}
                  >
                    {categorias.map((categoria) => (
                      <MenuItem key={categoria.id_cat} value={categoria.id_cat}>
                        {categoria.nom_cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Organizador</InputLabel>
                  <Select
                    value={formData.ced_org_eve}
                    label="Organizador"
                    onChange={(e) => setFormData({ ...formData, ced_org_eve: e.target.value })}
                  >
                    {organizadores.map((organizador) => (
                      <MenuItem key={organizador.ced_org} value={organizador.ced_org}>
                        {organizador.nom_org1} {organizador.ape_org1}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button 
              onClick={handleSaveEvent} 
              variant="contained"
              sx={{ bgcolor: '#7c3aed', '&:hover': { bgcolor: '#6d28d9' } }}
            >
              {selectedEvent ? 'Actualizar' : 'Crear'}
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