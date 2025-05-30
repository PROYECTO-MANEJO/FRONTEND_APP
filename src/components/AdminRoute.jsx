import { Navigate } from 'react-router-dom';
import {
  Box,
  CircularProgress,
  Typography,
  Card,
  CardContent,
  Button,
  Avatar,
} from '@mui/material';
import { Warning, ArrowBack, Dashboard } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress
          size={60}
          thickness={4}
          sx={{ mb: 2, color: 'primary.main' }}
        />
        <Typography variant="body1" color="text.secondary">
          Verificando permisos...
        </Typography>
      </Box>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado pero no es admin, mostrar página de acceso denegado
  if (!isAdmin()) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          p: 2,
        }}
      >
        <Card
          elevation={3}
          sx={{
            maxWidth: 400,
            width: '100%',
            borderRadius: 3,
          }}
        >
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: '#fef2f2',
                color: '#dc2626',
                mx: 'auto',
                mb: 3,
              }}
            >
              <Warning sx={{ fontSize: 40 }} />
            </Avatar>
            
            <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
              Acceso Denegado
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              No tienes permisos de administrador para acceder a esta página.
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<ArrowBack />}
                onClick={() => window.history.back()}
                fullWidth
              >
                Volver Atrás
              </Button>
              <Button
                variant="outlined"
                startIcon={<Dashboard />}
                onClick={() => window.location.href = '/dashboard'}
                fullWidth
              >
                Ir al Dashboard
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Si es admin, mostrar el componente hijo
  return children;
};

export default AdminRoute; 