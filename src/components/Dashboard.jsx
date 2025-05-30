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
} from '@mui/material';
import {
  Logout,
  AdminPanelSettings,
  School,
  CheckCircle,
  Person,
  RequestPage,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout, isAdmin } = useAuth();

  const handleLogout = () => {
    logout();
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
                Sistema de Gestión de Eventos
              </Typography>
              {isAdmin() && (
                <Button
                  component={Link}
                  to="/admin"
                  variant="contained"
                  size="small"
                  startIcon={<AdminPanelSettings />}
                  sx={{
                    ml: 2,
                    bgcolor: '#7c3aed',
                    '&:hover': {
                      bgcolor: '#6d28d9',
                    },
                  }}
                >
                  Panel Admin
                </Button>
              )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Bienvenido, <strong>{user?.nombre} {user?.apellido}</strong>
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
        <Paper
          elevation={2}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            {/* Welcome Icon */}
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'primary.main',
                mx: 'auto',
                mb: 3,
              }}
            >
              <CheckCircle sx={{ fontSize: 40 }} />
            </Avatar>

            {/* Welcome Message */}
            <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
              ¡Bienvenido al Dashboard!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Has iniciado sesión exitosamente en el sistema.
            </Typography>

            {/* User Information Card */}
            <Card
              elevation={1}
              sx={{
                maxWidth: 400,
                mx: 'auto',
                mb: 4,
                border: '1px solid',
                borderColor: 'grey.200',
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <Person />
                  Información de tu cuenta
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Nombre:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {user?.nombre} {user?.apellido}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      ID:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {user?.id}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Rol:
                    </Typography>
                    <Chip
                      label={user?.rol}
                      color={isAdmin() ? 'secondary' : 'primary'}
                      size="small"
                      sx={{
                        bgcolor: isAdmin() ? '#f3e8ff' : '#dbeafe',
                        color: isAdmin() ? '#7c3aed' : '#1d4ed8',
                        fontWeight: 500,
                      }}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Admin Message */}
            {isAdmin() && (
              <Alert
                severity="info"
                icon={<AdminPanelSettings />}
                sx={{
                  maxWidth: 400,
                  mx: 'auto',
                  mb: 4,
                  bgcolor: '#f3e8ff',
                  color: '#7c3aed',
                  border: '1px solid #e9d5ff',
                  '& .MuiAlert-icon': {
                    color: '#7c3aed',
                  },
                }}
              >
                Tienes permisos de administrador
              </Alert>
            )}

            {/* Actions */}
            <Box sx={{ mb: 4 }}>
              <Button
                component={Link}
                to="/solicitudes"
                variant="contained"
                size="large"
                startIcon={<RequestPage />}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                }}
              >
                Solicitudes de Cambio
              </Button>
            </Box>

            {/* Coming Soon */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="body2" color="text.secondary">
                Próximamente: Gestión de eventos, cursos, participantes y más funcionalidades.
              </Typography>
            </Box>
          </CardContent>
        </Paper>
      </Container>
    </Box>
  );
};

export default Dashboard; 