import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Badge,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import {
  Search,
  Event,
  School,
  People,
  AttachMoney,
  CalendarToday,
  LocationOn,
  Person,
  Visibility,
  FilterList,
  Refresh,
  Close,
  Assignment
} from '@mui/icons-material';

import AdminSidebar from './AdminSidebar';
import { useSidebarLayout } from '../../hooks/useSidebarLayout';
import DetalleEventoCurso from './DetalleEventoCurso';
import api from '../../services/api';
import ModalCartaMotivacion from './ModalCartaMotivacion';

const AdminGestionInscripciones = () => {
  const { getMainContentStyle } = useSidebarLayout();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Estado para el detalle
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  // Estadísticas
  const [stats, setStats] = useState({
    total: 0,
    eventos: 0,
    cursos: 0,
    inscripcionesPendientes: 0,
    inscripcionesAprobadas: 0
  });

  // Estado para la carta de motivación
  const [openCartaModal, setOpenCartaModal] = useState(false);
  const [cartaMotivacion, setCartaMotivacion] = useState('');

  // Estados para el modal de carta de motivación
  const [modalCartaOpen, setModalCartaOpen] = useState(false);
  const [cartaSeleccionada, setCartaSeleccionada] = useState('');
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  // Función para manejar la carta de motivación
  const handleVerCartaMotivacion = (carta, usuario) => {
    setCartaSeleccionada(carta || '');
    setUsuarioSeleccionado(usuario);
    setModalCartaOpen(true);
  };

  const handleCerrarModalCarta = () => {
    setModalCartaOpen(false);
    setCartaSeleccionada('');
    setUsuarioSeleccionado(null);
  };

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/administracion/cursos-eventos');
      
      if (response.data.success) {
        console.log('📊 Datos recibidos:', response.data.data.items); // Para debug
        const itemsData = response.data.data.items || [];
        setItems(itemsData);
        setFilteredItems(itemsData);
        setStats(response.data.data.estadisticas || stats);
      }
    } catch (error) {
      console.error('❌ Error al cargar datos:', error);
      setSnackbar({
        open: true,
        message: 'Error al cargar los datos',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    let filtered = items;

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(item =>
        (item.tipo === 'EVENTO' ? item.nom_eve : item.nom_cur)
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        item.organizador_nombre?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por tipo
    if (selectedTab === 1) {
      filtered = filtered.filter(item => item.tipo === 'EVENTO');
    } else if (selectedTab === 2) {
      filtered = filtered.filter(item => item.tipo === 'CURSO');
    }

    setFilteredItems(filtered);
  }, [items, searchTerm, selectedTab]);

  const handleItemClick = (item) => {
    console.log('🔍 Seleccionado item:', item);
    setSelectedItem(item);
    setShowDetail(true);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedItem(null);
    // Recargar datos para actualizar estadísticas
    cargarDatos();
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (showDetail && selectedItem) {
    return (
      <DetalleEventoCurso
        item={selectedItem}
        onClose={handleCloseDetail}
        onVerCartaMotivacion={handleVerCartaMotivacion}
      />
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <AdminSidebar />
      
      <Box sx={{ flexGrow: 1, p: 3, ...getMainContentStyle() }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
              Gestión de Inscripciones
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Administra las inscripciones de eventos y cursos
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={cargarDatos}
            disabled={loading}
          >
            Actualizar
          </Button>
        </Box>

        {/* Estadísticas */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Items
                </Typography>
                <Typography variant="h4">{stats.total}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Eventos
                </Typography>
                <Typography variant="h4">{stats.eventos}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Cursos
                </Typography>
                <Typography variant="h4">{stats.cursos}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Pendientes
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {stats.inscripcionesPendientes}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Aprobadas
                </Typography>
                <Typography variant="h4" color="success.main">
                  {stats.inscripcionesAprobadas}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filtros */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <TextField
              placeholder="Buscar por nombre, organizador..."
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
            <Tab label="Todos" />
            <Tab label="Eventos" />
            <Tab label="Cursos" />
          </Tabs>
        </Paper>

        {/* Lista de items */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredItems.map((item) => (
              <Grid item xs={12} md={6} lg={4} key={`${item.tipo}-${item.id_eve || item.id_cur}`}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 3
                    }
                  }}
                  onClick={() => handleItemClick(item)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Chip
                        icon={item.tipo === 'EVENTO' ? <Event /> : <School />}
                        label={item.tipo}
                        color={item.tipo === 'EVENTO' ? 'primary' : 'secondary'}
                        size="small"
                      />
                      <Chip
                        label={item.es_gratuito ? 'Gratuito' : `$${item.precio}`}
                        color={item.es_gratuito ? 'success' : 'warning'}
                        size="small"
                      />
                    </Box>

                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                      {item.tipo === 'EVENTO' ? item.nom_eve : item.nom_cur}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {(item.tipo === 'EVENTO' ? item.des_eve : item.des_cur)?.substring(0, 100)}...
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                      <CalendarToday sx={{ fontSize: 16 }} />
                      <Typography variant="caption">
                        {formatearFecha(item.tipo === 'EVENTO' ? item.fec_ini_eve : item.fec_ini_cur)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                      <LocationOn sx={{ fontSize: 16 }} />
                      <Typography variant="caption">
                        {item.tipo === 'EVENTO' ? item.ubi_eve : item.ubi_cur}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                      <Person sx={{ fontSize: 16 }} />
                      <Typography variant="caption">
                        {item.organizador_nombre}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Badge badgeContent={item.inscripciones_pendientes} color="warning">
                        <People sx={{ fontSize: 20 }} />
                      </Badge>
                      <Typography variant="caption" color="text.secondary">
                        {item.total_inscripciones} inscripciones
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {filteredItems.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No se encontraron elementos
            </Typography>
          </Box>
        )}
      </Box>

      {/* Modal para mostrar la carta de motivación */}
      <Dialog
        open={openCartaModal}
        onClose={() => setOpenCartaModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">📝 Carta de Motivación</Typography>
            <IconButton onClick={() => setOpenCartaModal(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Paper sx={{ p: 3, backgroundColor: '#f9f9f9', minHeight: '200px' }}>
            <Typography 
              variant="body1" 
              sx={{ 
                whiteSpace: 'pre-wrap', 
                lineHeight: 1.6,
                fontFamily: 'Arial, sans-serif'
              }}
            >
              {cartaMotivacion || 'No hay contenido disponible.'}
            </Typography>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenCartaModal(false)} 
            color="primary" 
            variant="contained"
            sx={{ bgcolor: '#6d1313', '&:hover': { bgcolor: '#5a0f0f' } }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Carta de Motivación */}
      <ModalCartaMotivacion
        open={modalCartaOpen}
        onClose={handleCerrarModalCarta}
        carta={cartaSeleccionada}
        usuario={usuarioSeleccionado}
      />
    </Box>
  );
};

export default AdminGestionInscripciones;