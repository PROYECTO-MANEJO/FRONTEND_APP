import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Box,
  Button,
  Alert,
} from '@mui/material';
import { Person, CheckCircle, RequestPage, AdminPanelSettings } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const AdminDashboard = ({ user }) => (
  <>
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
    <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
      ¡Bienvenido al Dashboard de Administrador!
    </Typography>
    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
      Has iniciado sesión exitosamente como administrador.
    </Typography>
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
              color="secondary"
              size="small"
              sx={{
                bgcolor: '#f3e8ff',
                color: '#7c3aed',
                fontWeight: 500,
              }}
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
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
    <Box sx={{ mt: 4 }}>
      <Typography variant="body2" color="text.secondary">
        Próximamente: Gestión de eventos, cursos, participantes y más funcionalidades.
      </Typography>
    </Box>
  </>
);

export default AdminDashboard;