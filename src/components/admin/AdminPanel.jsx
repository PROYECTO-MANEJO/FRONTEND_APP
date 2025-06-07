import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Card,
  CardContent,
  Avatar,
  Chip,
  Alert,
  Grid,
  Paper,
  Tabs,
  Tab,
  TextField,
  CircularProgress,
} from '@mui/material';
import {
  Logout,
  AdminPanelSettings,
  Assessment,
  People,
  Event,
  BarChart,
  PersonAdd,
  Business,
  TrendingUp,
  AttachMoney,
  EventNote,
  RequestPage,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import authService from '../../services/authService';
import AdminSolicitudes from './AdminSolicitudes';
import CrearCursos from './CrearCursos';
import CrearEventos from './CrearEventos';

const AdminPanel = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [adminFormData, setAdminFormData] = useState({
    cedula: '',
    nombre: '',
    nombre2: '',
    apellido: '',
    apellido2: '',
    fechaNacimiento: '',
    telefono: '',
    email: '',
    password: ''
  });
  const [createAdminError, setCreateAdminError] = useState('');
  const [createAdminSuccess, setCreateAdminSuccess] = useState('');

  const handleLogout = () => {
    logout();
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleAdminFormChange = (e) => {
    const { name, value } = e.target;
    setAdminFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (createAdminError) setCreateAdminError('');
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setIsCreatingAdmin(true);
    setCreateAdminError('');
    setCreateAdminSuccess('');

    try {
      await authService.createAdmin(adminFormData);
      setCreateAdminSuccess('Administrador creado exitosamente');
      setAdminFormData({
        cedula: '',
        nombre: '',
        nombre2: '',
        apellido: '',
        apellido2: '',
        fechaNacimiento: '',
        telefono: '',
        email: '',
        password: ''
      });
    } catch (error) {
      setCreateAdminError(error.message);
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  const tabs = [
    { label: 'Resumen', icon: <Assessment /> },
    { label: 'Usuarios', icon: <People /> },
    { label: 'Crear Eventos', icon: <Event /> },
    { label: 'Crear Curso', icon: <EventNote /> },
    { label: 'Solicitudes', icon: <RequestPage /> },
    { label: 'Reportes', icon: <BarChart /> },
  ];

  const statsCards = [
    {
      title: 'Total Usuarios',
      value: '1,234',
      icon: <People />,
      color: '#3b82f6',
    },
    {
      title: 'Eventos Activos',
      value: '42',
      icon: <EventNote />,
      color: '#10b981',
    },
    {
      title: 'Inscripciones',
      value: '856',
      icon: <TrendingUp />,
      color: '#f59e0b',
    },
    {
      title: 'Ingresos',
      value: '$12,450',
      icon: <AttachMoney />,
      color: '#8b5cf6',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <AppBar position="static" elevation={1}>
        <Container maxWidth="lg">
          <Toolbar sx={{ px: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  mr: 2,
                  width: 40,
                  height: 40,
                }}
              >
                <AdminPanelSettings />
              </Avatar>
              <Typography variant="h6" component="h1" sx={{ fontWeight: 600 }}>
                Panel de Administración
              </Typography>
              <Chip
                label="Administrador"
                sx={{
                  ml: 2,
                  bgcolor: '#f3e8ff',
                  color: '#7c3aed',
                  fontWeight: 500,
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                component={Link}
                to="/admin/solicitudes"
                variant="outlined"
                color="inherit"
                startIcon={<RequestPage />}
                size="small"
              >
                Solicitudes
              </Button>
              <Typography variant="body2" color="text.secondary">
                <strong>{user?.nombre} {user?.apellido}</strong>
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Logout />}
                onClick={handleLogout}
                size="small"
              >
                Cerrar Sesión
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Tabs */}
        <Paper elevation={1} sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            {tabs.map((tab, index) => (
              <Tab
                key={index}
                icon={tab.icon}
                label={tab.label}
                iconPosition="start"
                sx={{ minHeight: 64 }}
              />
            ))}
          </Tabs>
        </Paper>

        {/* Content */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            {statsCards.map((card, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card elevation={2}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        sx={{
                          bgcolor: card.color,
                          mr: 2,
                          width: 48,
                          height: 48,
                        }}
                      >
                        {card.icon}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {card.title}
                        </Typography>
                        <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                          {card.value}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {activeTab === 1 && (
          <Card elevation={2}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonAdd />
                  Crear Nuevo Administrador
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Solo los administradores pueden crear otros administradores
                </Typography>
              </Box>

              {createAdminSuccess && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  {createAdminSuccess}
                </Alert>
              )}
              
              {createAdminError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {createAdminError}
                </Alert>
              )}

              <Box component="form" onSubmit={handleCreateAdmin}>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Cédula"
                      name="cedula"
                      required
                      value={adminFormData.cedula}
                      onChange={handleAdminFormChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Teléfono"
                      name="telefono"
                      required
                      value={adminFormData.telefono}
                      onChange={handleAdminFormChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Primer Nombre"
                      name="nombre"
                      required
                      value={adminFormData.nombre}
                      onChange={handleAdminFormChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Segundo Nombre"
                      name="nombre2"
                      value={adminFormData.nombre2}
                      onChange={handleAdminFormChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Primer Apellido"
                      name="apellido"
                      required
                      value={adminFormData.apellido}
                      onChange={handleAdminFormChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Segundo Apellido"
                      name="apellido2"
                      value={adminFormData.apellido2}
                      onChange={handleAdminFormChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Fecha de Nacimiento"
                      name="fechaNacimiento"
                      type="date"
                      required
                      value={adminFormData.fechaNacimiento}
                      onChange={handleAdminFormChange}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      required
                      value={adminFormData.email}
                      onChange={handleAdminFormChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Contraseña"
                      name="password"
                      type="password"
                      required
                      value={adminFormData.password}
                      onChange={handleAdminFormChange}
                    />
                  </Grid>
                </Grid>
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={isCreatingAdmin}
                    startIcon={isCreatingAdmin ? <CircularProgress size={20} color="inherit" /> : <PersonAdd />}
                    sx={{ px: 4 }}
                  >
                    {isCreatingAdmin ? 'Creando...' : 'Crear Administrador'}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        {activeTab === 2 && (
          <CrearEventos />
        )}

        {activeTab === 3 && (
          <CrearCursos />
        )}  

        {activeTab === 4 && (
          <AdminSolicitudes />
        )}

        {activeTab === 5 && (
          <Card elevation={2}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <BarChart sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Reportes del Sistema
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Próximamente: Generación de reportes
              </Typography>
            </CardContent>
          </Card>
        )}
      </Container>
    </Box>
  );
};

export default AdminPanel; 