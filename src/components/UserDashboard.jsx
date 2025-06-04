import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Box,
  Button,
  Grid,
  CircularProgress,
  Divider,
} from '@mui/material';
import { Person, CheckCircle, RequestPage, Event, School } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { eventoService } from '../services/eventoService';
import { cursoService } from '../services/cursoService';

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
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
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
        ¡Bienvenido al Dashboard!
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Has iniciado sesión exitosamente en el sistema.
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
                color="primary"
                size="small"
                sx={{
                  bgcolor: '#dbeafe',
                  color: '#1d4ed8',
                  fontWeight: 500,
                }}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

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

      <Divider sx={{ my: 4 }} />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Event color="primary" /> Eventos
            </Typography>
            {eventos.length === 0 ? (
              <Typography color="text.secondary">No hay eventos disponibles.</Typography>
            ) : (
              eventos.map((evento) => (
                <Card key={evento.id_eve} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6">{evento.nom_eve}</Typography>
                    <Typography variant="body2" color="text.secondary">{evento.des_eve}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Fecha: {new Date(evento.fec_ini_eve).toLocaleDateString()}
                    </Typography>
                    <br />
                    <Typography variant="caption" color="text.secondary">
                      Área: {evento.are_eve} | Audiencia: {evento.tipo_audiencia_eve}
                    </Typography>
                  </CardContent>
                </Card>
              ))
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <School color="secondary" /> Cursos
            </Typography>
            {cursos.length === 0 ? (
              <Typography color="text.secondary">No hay cursos disponibles.</Typography>
            ) : (
              cursos.map((curso) => (
                <Card key={curso.id_cur} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6">{curso.nom_cur}</Typography>
                    <Typography variant="body2" color="text.secondary">{curso.des_cur}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Fecha inicio: {new Date(curso.fec_ini_cur).toLocaleDateString()}
                    </Typography>
                    <br />
                    <Typography variant="caption" color="text.secondary">
                      Duración: {curso.dur_cur} horas
                    </Typography>
                  </CardContent>
                </Card>
              ))
            )}
          </Grid>
        </Grid>
      )}

      <Box sx={{ mt: 4 }}>
        <Typography variant="body2" color="text.secondary">
          Próximamente: Gestión de eventos, cursos, participantes y más funcionalidades.
        </Typography>
      </Box>
    </>
  );
};

export default UserDashboard;