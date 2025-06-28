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
import { Security, ArrowBack, Dashboard } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const MasterRoute = ({ children }) => {
  const { isAuthenticated, isLoading, isMaster } = useAuth();

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
          Verificando permisos de administrador master...
        </Typography>
      </Box>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado pero no es master, mostrar página de acceso denegado
  if (!isMaster()) {
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
                bgcolor: '#fff3cd',
                color: '#856404',
                mx: 'auto',
                mb: 3,
              }}
            >
              <Security sx={{ fontSize: 40 }} />
            </Avatar>
            
            <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
              Acceso Restringido
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Esta funcionalidad está disponible únicamente para administradores master.
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
                onClick={() => window.location.href = '/admin'}
                fullWidth
              >
                Ir al Panel Admin
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Si es master, mostrar el componente hijo
  return children;
};

export default MasterRoute; 