import React, { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  Grid,
  CircularProgress,
  Paper
} from '@mui/material';
import { eventoService } from '../../services/eventoService';
import { cursoService } from '../../services/cursoService';
import CursoCard from '../shared/CursoCard';
import EventoCard from '../shared/EventoCard';
import UserSidebar from './UserSidebar';

const UserDashboard = ({ user }) => {
  const [eventos, setEventos] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [eventosData, cursosData] = await Promise.all([
          eventoService.getAll(),
          cursoService.getAll()
        ]);
        setEventos(eventosData);
        setCursos(cursosData);
      } catch (err) {
        setError('Error al cargar los datos');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
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
        {/* Welcome Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Buenos días
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            ¡Bienvenido, {user?.nombre}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress sx={{ color: '#6d1313' }} />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {/* Left Column - Events & Courses */}
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Últimos Eventos
                </Typography>
                <Grid container spacing={2}>
                  {eventos.length === 0 ? (
                    <Grid item xs={12}>
                      <Paper sx={{ p: 3, textAlign: 'center' }}>
                        <Typography color="text.secondary">
                          No hay eventos disponibles
                        </Typography>
                      </Paper>
                    </Grid>
                  ) : (
                    eventos.slice(0, 4).map((evento) => (
                      <Grid item xs={12} key={evento.id_eve}>
                        <EventoCard evento={evento} />
                      </Grid>
                    ))
                  )}
                </Grid>
              </Box>

              {/* Your Courses Section */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Cursos Disponibles
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  {cursos.length === 0 ? (
                    <Grid item xs={12}>
                      <Paper sx={{ p: 3, textAlign: 'center' }}>
                        <Typography color="text.secondary">
                          No hay cursos disponibles
                        </Typography>
                      </Paper>
                    </Grid>
                  ) : (
                    cursos.map((curso) => (
                      <Grid item xs={12} sm={6} md={4} key={curso.id_cur}>
                        <CursoCard curso={curso} />
                      </Grid>
                    ))
                  )}
                </Grid>
              </Box>
            </Grid>

            {/* Right Column - Quick Actions */}
            <Grid item xs={12} md={6}>
              {/* Quick Actions */}
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Acciones Rápidas
                </Typography>
                {/* ... resto del contenido */}
              </Paper>
            </Grid>
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default UserDashboard;