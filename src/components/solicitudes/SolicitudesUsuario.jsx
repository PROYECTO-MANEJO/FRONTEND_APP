import { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import {
  Add,
  List,
} from '@mui/icons-material';
import CrearSolicitud from './CrearSolicitud';
import MisSolicitudes from './MisSolicitudes';
import UserSidebar from '../user/UserSidebar';

const SolicitudesUsuario = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSolicitudCreada = () => {
    setActiveTab(1);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <UserSidebar />
      
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,
          pl: { xs: 0, sm: 2 },
          minHeight: '100vh'
        }}
      >
        {/* Main Content */}
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          {/* Page Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#6d1313' }}>
              Solicitudes de Cambio
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Gestiona tus solicitudes de cambio para mejorar la aplicación
            </Typography>
          </Box>

          {/* Tabs */}
          <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange} 
                sx={{ 
                  px: 2,
                  '& .MuiTab-root.Mui-selected': {
                    color: '#6d1313',
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#6d1313',
                  },
                }}
              >
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
        </Box>
      </Box>
    </Box>
  );
};

export default SolicitudesUsuario;