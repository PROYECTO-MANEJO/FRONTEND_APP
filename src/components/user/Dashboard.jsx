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
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import UserDashboard from './UserDashboard';
import AdminDashboard from '../admin/AdminDashboard';

const Dashboard = () => {
  const { user, logout, isAdmin } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Solo mostrar header para admin o cuando sea necesario */}
      {isAdmin() && (
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
      )}

      {/* Main Content sin wrapper para usuarios */}
      {isAdmin() ? (
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Paper
            elevation={2}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <AdminDashboard user={user} />
            </CardContent>
          </Paper>
        </Container>
      ) : (
        <UserDashboard user={user} />
      )}
    </Box>
  );
};

export default Dashboard;