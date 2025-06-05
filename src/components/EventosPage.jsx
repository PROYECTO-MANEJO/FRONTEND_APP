import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Paper
} from '@mui/material';
import { eventoService } from '../services/eventoService';
import EventoCard from './EventoCard';
import UserSidebar from './UserSidebar';

const EventosPage = () => {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadEventos = async () => {
      try {
        setLoading(true);
        const eventosData = await eventoService.getAll();
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
          <Typography color="error">{error}</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f5f5f5' }}>
      <UserSidebar />
      
      {/* Main Content */}
      <Box sx={{ flexGrow: 1, p: 3, overflow: 'auto' }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            Eventos Disponibles
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Descubre todos los eventos disponibles en la plataforma
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress sx={{ color: '#6d1313' }} />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {eventos.length === 0 ? (
              <Grid item xs={12}>
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No hay eventos disponibles
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Actualmente no hay eventos programados en la plataforma
                  </Typography>
                </Paper>
              </Grid>
            ) : (
              eventos.map((evento) => (
                <Grid item xs={12} sm={6} md={4} key={evento.id_eve}>
                  <EventoCard evento={evento} />
                </Grid>
              ))
            )}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default EventosPage;