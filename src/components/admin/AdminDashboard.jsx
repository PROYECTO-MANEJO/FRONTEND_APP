import React, { useContext } from 'react';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Alert,
  Chip
} from '@mui/material';
import { 
  People,
  Event,
  School,
  RequestPage,
  TrendingUp,
  VerifiedUser,
  ManageAccounts,
  ArrowForward
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { AuthContext } from '../../context/AuthContext';
import { useSidebarLayout } from '../../hooks/useSidebarLayout';
import useGitHubPolling from '../../hooks/useGitHubPolling';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { getMainContentStyle } = useSidebarLayout();
  
  // Iniciar polling automático de GitHub para MASTER/ADMIN
  useGitHubPolling(180000); // 3 minutos


  const quickActions = [
    {
      title: 'Gestionar Usuarios',
      description: 'Administrar cuentas de usuario',
      icon: <People />,
      path: '/admin/usuarios',
      color: '#6d1313',
      isRestricted: user?.rol !== 'MASTER'
    },
    {
      title: 'Gestionar Eventos',
      description: 'Crear y administrar eventos',
      icon: <Event />,
      path: '/admin/eventos',
      color: '#6d1313'
    },
    {
      title: 'Crear Cursos',
      description: 'Administrar cursos disponibles',
      icon: <School />,
      path: '/admin/cursos',
      color: '#6d1313'
    },
    {
      title: 'Solicitudes de Cambio',
      description: 'Revisar solicitudes de cambio',
      icon: <RequestPage />,
      path: '/admin/solicitudes',
      color: '#6d1313',
      isRestricted: user?.rol !== 'MASTER'
    },
    {
      title: 'Verificar Documentos',
      description: 'Revisar documentos pendientes',
      icon: <VerifiedUser />,
      path: '/admin/verificacion-documentos',
      color: '#6d1313',
      isRestricted: user?.rol !== 'MASTER'
    },
    {
      title: 'Gestión',
      description: 'Administrar inscripciones',
      icon: <ManageAccounts />,
      path: '/admin/gestion-inscripciones',
      color: '#6d1313'
    },
    {
      title: 'Reportes',
      description: 'Generar reportes del sistema',
      icon: <TrendingUp />,
      path: '/admin/reportes',
      color: '#6d1313'
    }
  ].filter(action => !action.isRestricted);



  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <AdminSidebar />
      
      <Box sx={{ flexGrow: 1, p: 3, ...getMainContentStyle() }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box 
            sx={{
              background: 'linear-gradient(135deg, #6d1313 0%, #8b1a1a 100%)',
              borderRadius: 3,
              p: 4,
              color: 'white',
              mb: 3,
              position: 'relative'
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              ¡Bienvenido, {user?.nom_usu1}!
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Panel de Administración - Sistema de Gestión
            </Typography>
          </Box>
        </Box>

        

        {/* Información de Rol */}
        {user?.rol !== 'MASTER' && (
          <Alert 
            severity="info" 
            sx={{ 
              mb: 3, 
              borderRadius: 2,
              border: '1px solid #6d1313',
              '& .MuiAlert-icon': { color: '#6d1313' }
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
              ℹ️ Acceso de Administrador Estándar
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Tu rol actual te permite gestionar eventos, cursos, inscripciones y reportes. 
              Las siguientes funcionalidades están restringidas a <strong>Administradores Master</strong>:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip 
                label="👥 Gestión de Usuarios" 
                size="small" 
                sx={{ bgcolor: '#ffebee', color: '#6d1313' }}
              />
              <Chip 
                label="📋 Solicitudes de Cambio" 
                size="small" 
                sx={{ bgcolor: '#ffebee', color: '#6d1313' }}
              />
              <Chip 
                label="✅ Verificación de Documentos" 
                size="small" 
                sx={{ bgcolor: '#ffebee', color: '#6d1313' }}
              />
            </Box>
          </Alert>
        )}

        {/* Quick Actions */}
        <Card sx={{ borderRadius: 3, boxShadow: 3, mb: 4 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', color: '#6d1313' }}>
              Acciones Rápidas
            </Typography>
            <Grid container spacing={2}>
              {quickActions.map((action, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card 
                    sx={{
                      borderRadius: 2,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': { 
                        transform: 'translateY(-4px)',
                        boxShadow: 6
                      }
                    }}
                    onClick={() => navigate(action.path)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ bgcolor: action.color, mr: 2 }}>
                            {action.icon}
                          </Avatar>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                              {action.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {action.description}
                            </Typography>
                          </Box>
                        </Box>
                        <ArrowForward sx={{ color: '#6d1313' }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>


      </Box>
    </Box>
);
};

export default AdminDashboard;