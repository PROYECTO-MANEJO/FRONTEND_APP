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
  Tabs,
  Tab,
  Badge,
  Tooltip,
  Avatar,
  Divider
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
  Assignment,
  CheckCircle
} from '@mui/icons-material';

import AdminSidebar from './AdminSidebar';
import { useSidebarLayout } from '../../hooks/useSidebarLayout';
import DetalleEventoCurso from './DetalleEventoCurso';
import api from '../../services/api';

const AdminGestionInscripciones = () => {
  const { getMainContentStyle } = useSidebarLayout();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState(0); // 0: Todos, 1: Eventos, 2: Cursos
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

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    filtrarItems();
  }, [items, searchTerm, selectedTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/administracion/cursos-eventos');
      
      if (response.data.success) {
        const itemsData = response.data.data.items || [];
        setItems(itemsData);
        
        // Calcular estadísticas
        const totalPendientes = itemsData.reduce((sum, item) => sum + (item.estadisticas?.pendientes || 0), 0);
        const totalAprobadas = itemsData.reduce((sum, item) => sum + (item.estadisticas?.aprobadas || 0), 0);
        
        setStats({
          total: response.data.data.total || 0,
          eventos: response.data.data.eventos || 0,
          cursos: response.data.data.cursos || 0,
          inscripcionesPendientes: totalPendientes,
          inscripcionesAprobadas: totalAprobadas
        });
      } else {
        throw new Error(response.data.message || 'Error en la respuesta del servidor');
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      
      // Mostrar mensaje de error más específico
      let errorMessage = 'Error al cargar los datos';
      if (error.response) {
        // Error de respuesta del servidor
        errorMessage = error.response.data?.message || `Error ${error.response.status}: ${error.response.statusText}`;
      } else if (error.request) {
        // Error de red/conexión
        errorMessage = 'Error de conexión con el servidor. Verifica que el backend esté ejecutándose.';
      } else {
        // Otro tipo de error
        errorMessage = error.message || 'Error desconocido';
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
      
      // Inicializar con datos vacíos en caso de error
      setItems([]);
      setStats({
        total: 0,
        eventos: 0,
        cursos: 0,
        inscripcionesPendientes: 0,
        inscripcionesAprobadas: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const filtrarItems = () => {
    let filtered = items;

    // Filtrar por tipo
    if (selectedTab === 1) {
      filtered = filtered.filter(item => item.tipo === 'EVENTO');
    } else if (selectedTab === 2) {
      filtered = filtered.filter(item => item.tipo === 'CURSO');
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => {
        const nombre = item.tipo === 'EVENTO' ? item.nom_eve : item.nom_cur;
        const organizador = item.organizador_nombre;
        const categoria = item.categoria_nombre;
        
        return nombre.toLowerCase().includes(term) ||
               organizador.toLowerCase().includes(term) ||
               categoria.toLowerCase().includes(term);
      });
    }

    setFilteredItems(filtered);
  };

  const handleVerDetalle = (item) => {
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
    if (!fecha) return 'No especificada';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getEstadoColor = (item) => {
    const fechaActual = new Date();
    const fechaInicio = new Date(item.tipo === 'EVENTO' ? item.fec_ini_eve : item.fec_ini_cur);
    
    if (fechaInicio <= fechaActual) {
      return 'success'; // En curso
    } else {
      return 'primary'; // Próximamente
    }
  };

  const getEstadoTexto = (item) => {
    const fechaActual = new Date();
    const fechaInicio = new Date(item.tipo === 'EVENTO' ? item.fec_ini_eve : item.fec_ini_cur);
    
    if (fechaInicio <= fechaActual) {
      return 'En Curso';
    } else {
      return 'Próximamente';
    }
  };

  if (showDetail && selectedItem) {
    return (
      <DetalleEventoCurso
        item={selectedItem}
        onClose={handleCloseDetail}
      />
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <AdminSidebar />
      
      <Box sx={{ flexGrow: 1, p: 3, ...getMainContentStyle() }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333', mb: 1 }}>
            Gestión de Inscripciones
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Administra las inscripciones de cursos y eventos activos (que aún no han terminado)
          </Typography>
        </Box>

        {/* Estadísticas */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ bgcolor: '#1976d2', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stats.total}
                    </Typography>
                    <Typography variant="body2">
                      Total Items
                    </Typography>
                  </Box>
                  <People sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ bgcolor: '#388e3c', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stats.eventos}
                    </Typography>
                    <Typography variant="body2">
                      Eventos
                    </Typography>
                  </Box>
                  <Event sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ bgcolor: '#f57c00', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stats.cursos}
                    </Typography>
                    <Typography variant="body2">
                      Cursos
                    </Typography>
                  </Box>
                  <School sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ bgcolor: '#d32f2f', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stats.inscripcionesPendientes}
                    </Typography>
                    <Typography variant="body2">
                      Pendientes
                    </Typography>
                  </Box>
                  <Badge badgeContent={stats.inscripcionesPendientes} color="error">
                    <People sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Badge>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ bgcolor: '#7b1fa2', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stats.inscripcionesAprobadas}
                    </Typography>
                    <Typography variant="body2">
                      Aprobadas
                    </Typography>
                  </Box>
                  <People sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Controles */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <TextField
              placeholder="Buscar por nombre, organizador o categoría..."
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
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={cargarDatos}
              disabled={loading}
            >
              Actualizar
            </Button>
          </Box>

          <Tabs
            value={selectedTab}
            onChange={(e, newValue) => setSelectedTab(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Todos" />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Event />
                  Eventos
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <School />
                  Cursos
                </Box>
              } 
            />
          </Tabs>
        </Paper>

        {/* Lista de Items */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredItems.map((item) => {
              const nombre = item.tipo === 'EVENTO' ? item.nom_eve : item.nom_cur;
              const descripcion = item.tipo === 'EVENTO' ? item.des_eve : item.des_cur;
              const fechaInicio = item.tipo === 'EVENTO' ? item.fec_ini_eve : item.fec_ini_cur;
              const fechaFin = item.tipo === 'EVENTO' ? item.fec_fin_eve : item.fec_fin_cur;
              const ubicacion = item.tipo === 'EVENTO' ? item.ubi_eve : item.ubi_cur;

              return (
                <Grid item xs={12} md={6} lg={4} key={`${item.tipo}-${item.tipo === 'EVENTO' ? item.id_eve : item.id_cur}`}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      {/* Header */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Chip
                          icon={item.tipo === 'EVENTO' ? <Event /> : <School />}
                          label={item.tipo}
                          color={item.tipo === 'EVENTO' ? 'primary' : 'secondary'}
                          size="small"
                        />
                        <Chip
                          label={getEstadoTexto(item)}
                          color={getEstadoColor(item)}
                          size="small"
                        />
                      </Box>

                      {/* Título */}
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, lineHeight: 1.2 }}>
                        {nombre}
                      </Typography>

                      {/* Descripción */}
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          mb: 2,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {descripcion}
                      </Typography>

                      {/* Información básica */}
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {formatearFecha(fechaInicio)}
                            {fechaFin && ` - ${formatearFecha(fechaFin)}`}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <LocationOn sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" noWrap>
                            {ubicacion}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Person sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" noWrap>
                            {item.organizador_nombre}
                          </Typography>
                        </Box>

                        {/* Precio */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <AttachMoney sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {item.es_gratuito ? 'Gratuito' : `$${item.precio}`}
                          </Typography>
                        </Box>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      {/* Estadísticas de inscripciones */}
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                          Inscripciones:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip
                            label={`Total: ${item.estadisticas?.total || 0}`}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            label={`Aprobadas: ${item.estadisticas?.aprobadas || 0}`}
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                          {(item.estadisticas?.pendientes || 0) > 0 && (
                            <Chip
                              label={`Pendientes: ${item.estadisticas.pendientes}`}
                              size="small"
                              color="warning"
                              variant="outlined"
                            />
                          )}
                          <Chip
                            label={`Disponibles: ${item.estadisticas?.disponibles || 0}`}
                            size="small"
                            color="info"
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                    </CardContent>

                    {/* Acciones */}
                    <Box sx={{ p: 2, pt: 0 }}>
                      {/* Botón de gestión de calificaciones/asistencia si hay inscripciones aprobadas */}
                      {(item.estadisticas?.aprobadas || 0) > 0 && (
                        <Button
                          fullWidth
                          variant="contained"
                          color="primary"
                          startIcon={item.tipo === 'EVENTO' ? <CheckCircle /> : <Assignment />}
                          onClick={() => {
                            if (item.tipo === 'EVENTO') {
                              navigate(`/admin/gestion-asistencia-evento/${item.id_eve}`);
                            } else {
                              navigate(`/admin/gestion-notas-curso/${item.id_cur}`);
                            }
                          }}
                          sx={{ mb: 1 }}
                        >
                          {item.tipo === 'EVENTO' ? 'Gestionar Asistencia' : 'Gestionar Notas'}
                        </Button>
                      )}
                      
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<Visibility />}
                        onClick={() => handleVerDetalle(item)}
                        sx={{
                          bgcolor: '#6d1313',
                          '&:hover': { bgcolor: '#5a0f0f' }
                        }}
                      >
                        Ver Detalles
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* Mensaje cuando no hay resultados */}
        {!loading && filteredItems.length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No se encontraron resultados
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm ? 'Intenta con otros términos de búsqueda' : 'No hay cursos o eventos activos (que aún no hayan terminado)'}
            </Typography>
          </Paper>
        )}
      </Box>

      {/* Snackbar */}
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
    </Box>
  );
};

export default AdminGestionInscripciones; 