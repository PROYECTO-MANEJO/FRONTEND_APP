import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Paper,
  Container
} from '@mui/material';
import { cursoService } from '../../services/cursoService';
import CursoCard from '../shared/CursoCard';
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
              Cursos Disponibles
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary"
              sx={{ maxWidth: 600, mx: 'auto' }}
            >
              Explora nuestra amplia selección de cursos especializados y mejora tus habilidades
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
              <CircularProgress size={60} sx={{ color: '#b91c1c' }} />
            </Box>
          ) : (
            <>
              {cursos.length === 0 ? (
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
                    No hay cursos disponibles
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Actualmente no hay cursos programados en la plataforma. Vuelve pronto para ver nuevas opciones.
                  </Typography>
                </Paper>
              ) : (
                <>
                  {/* Contador de cursos */}
                  <Box sx={{ mb: 3, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                      Mostrando <strong>{cursos.length}</strong> curso{cursos.length !== 1 ? 's' : ''} disponible{cursos.length !== 1 ? 's' : ''}
                    </Typography>
                  </Box>

                  {/* Grid perfecto de cursos */}
                  <Grid 
                    container 
                    spacing={{ xs: 2, sm: 3, md: 4 }}
                    sx={{
                      '& .MuiGrid-item': {
                        display: 'flex'
                      }
                    }}
                  >
                    {cursos.map(curso => (
                      <Grid 
                        item 
                        xs={12} 
                        sm={6} 
                        md={4} 
                        lg={3}
                        key={curso.id_cur || curso.id}
                        sx={{ display: 'flex' }}
                      >
                        <CursoCard curso={curso} />
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

export default CursosPage;