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
import { School, Assignment } from '@mui/icons-material';
import { cursoService } from '../../services/cursoService';
import CursoCard from '../shared/CursoCard';
import UserSidebar from './UserSidebar';
import { useUserSidebarLayout } from '../../hooks/useUserSidebarLayout';

const CursosPage = () => {
  const { getMainContentStyle } = useUserSidebarLayout();
  const [misCursos, setMisCursos] = useState([]);
  const [cursosDisponibles, setCursosDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const loadCursos = async () => {
      try {
        setLoading(true);
        const [misCursosData, cursosDisponiblesData] = await Promise.all([
          cursoService.getMisCursos(),
          cursoService.getCursosDisponibles()
        ]);
        setMisCursos(misCursosData);
        setCursosDisponibles(cursosDisponiblesData);
      } catch (err) {
        setError('Error al cargar los cursos');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadCursos();
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
              Cursos
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary"
              sx={{ maxWidth: 600, mx: 'auto' }}
            >
              Gestiona tus cursos inscritos y descubre cursos disponibles
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
              <CircularProgress size={60} sx={{ color: '#b91c1c' }} />
            </Box>
          ) : (
            <>
              {/* Tabs para alternar entre mis cursos y cursos disponibles */}
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
                    icon={<Assignment />} 
                    label={`Mis Cursos (${misCursos.length})`}
                    iconPosition="start"
                  />
                  <Tab 
                    icon={<School />} 
                    label={`Disponibles (${cursosDisponibles.length})`}
                    iconPosition="start"
                  />
                </Tabs>
              </Paper>

              {/* Contenido basado en el tab seleccionado */}
              {tabValue === 0 ? (
                // Mis Cursos
                <>
                  {misCursos.length === 0 ? (
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
                        No tienes cursos inscritos
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        Aún no te has inscrito en ningún curso. Explora los cursos disponibles en la pestaña de "Disponibles".
                      </Typography>
                    </Paper>
                  ) : (
                    <>
                      {/* Grid de mis cursos */}
                      <Grid 
                        container 
                        spacing={{ xs: 2, sm: 3, md: 4 }}
                      >
                        {misCursos.map(curso => (
                          <Grid 
                            item 
                            xs={12} 
                            sm={6} 
                            md={4} 
                            lg={3}
                            key={curso.id_cur}
                          >
                            <CursoCard curso={curso} />
                          </Grid>
                        ))}
                      </Grid>
                    </>
                  )}
                </>
              ) : (
                // Cursos Disponibles
                <>
                  {cursosDisponibles.length === 0 ? (
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
                        No hay cursos disponibles para tu carrera o perfil en este momento.
                      </Typography>
                    </Paper>
                  ) : (
                    <>
                      {/* Grid de cursos disponibles */}
                      <Grid 
                        container 
                        spacing={{ xs: 2, sm: 3, md: 4 }}
                      >
                        {cursosDisponibles.map(curso => (
                          <Grid 
                            item 
                            xs={12} 
                            sm={6} 
                            md={4} 
                            lg={3}
                            key={curso.id_cur}
                          >
                            <CursoCard curso={curso} />
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

export default CursosPage;