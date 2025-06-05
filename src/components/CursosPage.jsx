import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Paper
} from '@mui/material';
import { cursoService } from '../services/cursoService';
import CursoCard from './CursoCard';
import UserSidebar from './UserSidebar';

const CursosPage = () => {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCursos = async () => {
      try {
        setLoading(true);
        const cursosData = await cursoService.getAll();
        setCursos(cursosData);
      } catch (err) {
        setError('Error al cargar los cursos');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadCursos();
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
            Cursos Disponibles
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Explora todos los cursos disponibles en la plataforma
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress sx={{ color: '#6d1313' }} />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {cursos.length === 0 ? (
              <Grid item xs={12}>
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No hay cursos disponibles
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Actualmente no hay cursos publicados en la plataforma
                  </Typography>
                </Paper>
              </Grid>
            ) : (
              cursos.map((curso) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={curso.id_cur}>
                  <CursoCard curso={curso} />
                </Grid>
              ))
            )}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default CursosPage;