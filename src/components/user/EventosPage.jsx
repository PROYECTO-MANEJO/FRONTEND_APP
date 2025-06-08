import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Paper,
  Container
} from '@mui/material';
import { eventoService } from '../../services/eventoService';
import EventoCard from '../shared/EventoCard';
import UserSidebar from './UserSidebar';

const EventosPage = () => {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadEventos = async () => {
      try {
        setLoading(true);
        const eventosData = await eventoService.getMisEventos();
        setEventos(eventosData);
      } catch (err) {
        setError('Error al cargar los eventos');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadEventos();
  }, []);

  if (error) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f5f5f5' }}>
        <UserSidebar />
        <Box sx={{ flexGrow: 1, p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography color="error" variant="h6">{error}</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f5f5f5' }}>
      <UserSidebar />
      
      {/* Main Content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
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
              Mis Eventos
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary"
              sx={{ maxWidth: 600, mx: 'auto' }}
            >
              Todos los eventos en los que estás inscrito o participando
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
              <CircularProgress size={60} sx={{ color: '#b91c1c' }} />
            </Box>
          ) : (
            <>
              {eventos.length === 0 ? (
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
                    Aún no te has inscrito en ningún evento. Explora los eventos disponibles en el dashboard.
                  </Typography>
                </Paper>
              ) : (
                <>
                  {/* Contador de eventos */}
                  <Box sx={{ mb: 3, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                      Tienes <strong>{eventos.length}</strong> evento{eventos.length !== 1 ? 's' : ''} inscrito{eventos.length !== 1 ? 's' : ''}
                    </Typography>
                  </Box>

                  {/* Grid perfecto de eventos */}
                  <Grid 
                    container 
                    spacing={{ xs: 2, sm: 3, md: 4 }}
                    sx={{
                      '& .MuiGrid-item': {
                        display: 'flex',
                        height: '300px' // ALTURA FIJA OBLIGATORIA
                      }
                    }}
                  >
                    {eventos.map(evento => (
                      <Grid 
                        item 
                        xs={12} 
                        sm={6} 
                        md={4} 
                        lg={3}
                        key={evento.id_eve}
                        sx={{ 
                          display: 'flex',
                          height: '300px !important' // FUERZA LA ALTURA
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
        </Container>
      </Box>
    </Box>
  );
};

export default EventosPage;