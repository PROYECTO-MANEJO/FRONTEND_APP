import { useState } from 'react';
import {
  Box,
  Container,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Tabs,
  Tab,
  Paper,
  Avatar,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  Logout,
  School,
  Add,
  List,
  Home,
  RequestPage,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { Link as RouterLink } from 'react-router-dom';
import CrearSolicitud from './CrearSolicitud';
import MisSolicitudes from './MisSolicitudes';

const SolicitudesUsuario = () => {
  const { user, logout, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState(0);

  const handleLogout = () => {
    logout();
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSolicitudCreada = () => {
    setActiveTab(1);
  };

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
                <School />
              </Avatar>
              <Typography variant="h6" component="h1" sx={{ fontWeight: 600 }}>
                MyStudy - Solicitudes
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {isAdmin() && (
                <Button
                  component={RouterLink}
                  to="/admin"
                  variant="contained"
                  size="small"
                  sx={{
                    bgcolor: '#7c3aed',
                    '&:hover': {
                      bgcolor: '#6d28d9',
                    },
                  }}
                >
                  Panel Admin
                </Button>
              )}
              <Typography variant="body2" color="inherit">
                {user?.nombre} {user?.apellido}
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

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link
            component={RouterLink}
            to="/dashboard"
            underline="hover"
            color="inherit"
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
          >
            <Home sx={{ fontSize: 16 }} />
            Dashboard
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <RequestPage sx={{ fontSize: 16 }} />
            Solicitudes de Cambio
          </Typography>
        </Breadcrumbs>

        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
            Solicitudes de Cambio
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestiona tus solicitudes de cambio para mejorar la aplicación
          </Typography>
        </Box>

        {/* Tabs */}
        <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={handleTabChange} sx={{ px: 2 }}>
              <Tab
                icon={<Add />}
                iconPosition="start"
                label="Nueva Solicitud"
                sx={{ textTransform: 'none', fontWeight: 500 }}
              />
              <Tab
                icon={<List />}
                iconPosition="start"
                label="Mis Solicitudes"
                sx={{ textTransform: 'none', fontWeight: 500 }}
              />
            </Tabs>
          </Box>

          {/* Tab Content */}
          <Box sx={{ p: 4 }}>
            {activeTab === 0 && (
              <CrearSolicitud onSolicitudCreada={handleSolicitudCreada} />
            )}
            {activeTab === 1 && (
              <MisSolicitudes />
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default SolicitudesUsuario;