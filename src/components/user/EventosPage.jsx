import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Paper,
  Container,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import { Event, EventAvailable } from '@mui/icons-material';
import { eventoService } from '../../services/eventoService';
import EventoCard from '../shared/EventoCard';
import UserSidebar from './UserSidebar';
import { useUserSidebarLayout } from '../../hooks/useUserSidebarLayout';

const EventosPage = () => {
  const { getMainContentStyle } = useUserSidebarLayout();
  const [misEventos, setMisEventos] = useState([]);
  const [eventosDisponibles, setEventosDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const loadEventos = async () => {
      try {
        setLoading(true);
        const [misEventosData, eventosDisponiblesData] = await Promise.all([
          eventoService.getMisEventos(),
          eventoService.getEventosDisponibles()
        ]);
        setMisEventos(misEventosData);
        setEventosDisponibles(eventosDisponiblesData);
      } catch (err) {
        setError('Error al cargar los eventos');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadEventos();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (error) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
        <UserSidebar />
        <Box sx={{ 
          flexGrow: 1,
          p: 3, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          ...getMainContentStyle()
        }}>
          <Typography color="error" variant="h6">{error}</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <UserSidebar />
      
      {/* Main Content */}
      <Box sx={{ 
        flexGrow: 1,
        ...getMainContentStyle()
      }}>
        <Container maxWidth="xl" sx={{ py: 4, px: 3 }}>
          {/* Header optimizado */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 700, 
                mb: 1,
                color: 'text.primary',
                fontSize: { xs: '2rem', md: '3rem' }
              }}
            >
              Eventos
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary"
              sx={{ maxWidth: 600, mx: 'auto' }}
            >
              Gestiona tus eventos inscritos y descubre eventos disponibles
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
              <CircularProgress size={60} sx={{ color: '#b91c1c' }} />
            </Box>
          ) : (
            <>
              {/* Tabs para alternar entre mis eventos y eventos disponibles */}
              <Paper elevation={1} sx={{ mb: 3, borderRadius: 2 }}>
                <Tabs 
                  value={tabValue} 
                  onChange={handleTabChange}
                  variant="fullWidth"
                  sx={{
                    '& .MuiTab-root': {
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '1rem',
                      py: 2
                    }
                  }}
                >
                  <Tab 
                    icon={<Event />} 
                    label={`Mis Eventos (${misEventos.length})`}
                    iconPosition="start"
                  />
                  <Tab 
                    icon={<EventAvailable />} 
                    label={`Disponibles (${eventosDisponibles.length})`}
                    iconPosition="start"
                  />
                </Tabs>
              </Paper>

              {/* Contenido basado en el tab seleccionado */}
              {tabValue === 0 ? (
                // Mis Eventos
                <>
                  {misEventos.length === 0 ? (
                    <Paper 
                      elevation={2}
                      sx={{ 
                        p: 6, 
                        textAlign: 'center',
                        borderRadius: 3,
                        maxWidth: 500,
                        mx: 'auto'
                      }}
                    >
                      <Typography variant="h5" color="text.secondary" gutterBottom>
                        No tienes eventos inscritos
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        Aún no te has inscrito en ningún evento. Explora los eventos disponibles en la pestaña de "Disponibles".
                      </Typography>
                    </Paper>
                  ) : (
                    <>
                      {/* Grid de mis eventos */}
                      <Grid 
                        container 
                        spacing={{ xs: 2, sm: 3, md: 4 }}
                        justifyContent="flex-start"
                      >
                        {misEventos.map(evento => (
                          <Grid 
                            item 
                            xs={12} 
                            sm={6} 
                            md={4} 
                            lg={3}
                            key={evento.id_eve}
                            sx={{ 
                              display: 'flex',
                              justifyContent: 'center'
                            }}
                          >
                            <EventoCard evento={evento} />
                          </Grid>
                        ))}
                      </Grid>
                    </>
                  )}
                </>
              ) : (
                // Eventos Disponibles
                <>
                  {eventosDisponibles.length === 0 ? (
                    <Paper 
                      elevation={2}
                      sx={{ 
                        p: 6, 
                        textAlign: 'center',
                        borderRadius: 3,
                        maxWidth: 500,
                        mx: 'auto'
                      }}
                    >
                      <Typography variant="h5" color="text.secondary" gutterBottom>
                        No hay eventos disponibles
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        No hay eventos disponibles para tu carrera o perfil en este momento.
                      </Typography>
                    </Paper>
                  ) : (
                    <>
                      {/* Grid de eventos disponibles */}
                      <Grid 
                        container 
                        spacing={{ xs: 2, sm: 3, md: 4 }}
                        justifyContent="flex-start"
                      >
                        {eventosDisponibles.map(evento => (
                          <Grid 
                            item 
                            xs={12} 
                            sm={6} 
                            md={4} 
                            lg={3}
                            key={evento.id_eve}
                            sx={{ 
                              display: 'flex',
                              justifyContent: 'center'
                            }}
                          >
                            <EventoCard evento={evento} />
                          </Grid>
                        ))}
                      </Grid>
                    </>
                  )}
                </>
              )}
            </>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default EventosPage;