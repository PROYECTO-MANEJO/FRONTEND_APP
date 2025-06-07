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
  Fab
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Event,
  LocationOn,
  CalendarToday,
  People,
  Visibility
} from '@mui/icons-material';
import AdminSidebar from './AdminSidebar';

const AdminEventos = () => {
  const [eventos, setEventos] = useState([]);
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
    imagen: ''
  });

  useEffect(() => {
    loadEventos();
  }, []);

  const loadEventos = async () => {
    try {
      setLoading(true);
      // Aquí iría la llamada real a la API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Datos simulados
      setEventos([
        {
          id: 1,
          titulo: 'Conferencia de Tecnología 2024',
          descripcion: 'Una conferencia sobre las últimas tendencias en tecnología',
          fecha: '2024-03-15',
          hora: '09:00',
          ubicacion: 'Centro de Convenciones',
          capacidad: 200,
          inscritos: 150,
          precio: 50,
          estado: 'ACTIVO',
          imagen: '/api/placeholder/300/200'
        },
        {
          id: 2,
          titulo: 'Workshop de Desarrollo Web',
          descripcion: 'Taller práctico de desarrollo web moderno',
          fecha: '2024-03-20',
          hora: '14:00',
          ubicacion: 'Aula Magna',
          capacidad: 50,
          inscritos: 35,
          precio: 30,
          estado: 'ACTIVO',
          imagen: '/api/placeholder/300/200'
        },
        {
          id: 3,
          titulo: 'Seminario de Marketing Digital',
          descripcion: 'Estrategias efectivas de marketing digital',
          fecha: '2024-03-25',
          hora: '10:00',
          ubicacion: 'Sala de Conferencias',
          capacidad: 100,
          inscritos: 80,
          precio: 40,
          estado: 'ACTIVO',
          imagen: '/api/placeholder/300/200'
        }
      ]);
    } catch (error) {
      console.error('Error al cargar eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (event = null) => {
    setSelectedEvent(event);
    if (event) {
      setFormData({
        titulo: event.titulo,
        descripcion: event.descripcion,
        fecha: event.fecha,
        hora: event.hora,
        ubicacion: event.ubicacion,
        capacidad: event.capacidad.toString(),
        precio: event.precio.toString(),
        imagen: event.imagen
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
        imagen: ''
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
      // Aquí iría la lógica para guardar/actualizar evento
      console.log('Guardando evento:', formData);
      handleCloseDialog();
      loadEventos();
    } catch (error) {
      console.error('Error al guardar evento:', error);
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

  const stats = [
    {
      title: 'Total Eventos',
      value: eventos.length,
      icon: <Event />,
      color: '#3b82f6'
    },
    {
      title: 'Eventos Activos',
      value: eventos.filter(e => e.estado === 'ACTIVO').length,
      icon: <CalendarToday />,
      color: '#10b981'
    },
    {
      title: 'Total Inscritos',
      value: eventos.reduce((sum, e) => sum + e.inscritos, 0),
      icon: <People />,
      color: '#f59e0b'
    },
    {
      title: 'Capacidad Total',
      value: eventos.reduce((sum, e) => sum + e.capacidad, 0),
      icon: <LocationOn />,
      color: '#7c3aed'
    }
  ];

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
              <Grid item xs={12} sm={6} md={4} key={evento.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={evento.imagen}
                    alt={evento.titulo}
                    sx={{ bgcolor: '#e5e7eb' }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, flexGrow: 1 }}>
                        {evento.titulo}
                      </Typography>
                      <Chip
                        label={evento.estado}
                        size="small"
                        sx={{
                          bgcolor: getEstadoColor(evento.estado),
                          color: 'white',
                          fontWeight: 500,
                          ml: 1
                        }}
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {evento.descripcion}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {evento.fecha} - {evento.hora}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationOn sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {evento.ubicacion}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <People sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {evento.inscritos}/{evento.capacidad} inscritos
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
                      <IconButton color="error" size="small">
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
      </Box>
    </Box>
  );
};

export default AdminEventos; 