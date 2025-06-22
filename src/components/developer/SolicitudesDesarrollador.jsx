import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Assignment,
  Code,
  BugReport,
  CheckCircle,
  Schedule,
  GitHub,
  Visibility,
  PlayArrow,
  Pause,
  Done,
  FilterList,
  Refresh
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import solicitudesService from '../../services/solicitudesService';

const SolicitudesDesarrollador = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState(searchParams.get('estado') || '');
  
  const [stats, setStats] = useState({
    total: 0,
    pendientes: 0,
    enDesarrollo: 0,
    enTesting: 0,
    completadas: 0,
    enPausa: 0
  });

  useEffect(() => {
    loadSolicitudesAsignadas();
  }, [filtroEstado]);

  useEffect(() => {
    const estadoFromUrl = searchParams.get('estado');
    if (estadoFromUrl && estadoFromUrl !== filtroEstado) {
      setFiltroEstado(estadoFromUrl);
    }
  }, [searchParams]);

  const loadSolicitudesAsignadas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await solicitudesService.getSolicitudesAsignadas(user.id);
      let solicitudesFiltradas = response.data || [];
      
      // Aplicar filtro de estado si existe
      if (filtroEstado) {
        solicitudesFiltradas = solicitudesFiltradas.filter(s => s.estado_sol === filtroEstado);
      }
      
      setSolicitudes(solicitudesFiltradas);
      
      // Calcular estadísticas con todas las solicitudes (sin filtro)
      const todasLasSolicitudes = response.data || [];
      const stats = {
        total: todasLasSolicitudes.length,
        pendientes: todasLasSolicitudes.filter(s => s.estado_sol === 'APROBADA').length,
        enDesarrollo: todasLasSolicitudes.filter(s => s.estado_sol === 'EN_DESARROLLO').length,
        enTesting: todasLasSolicitudes.filter(s => s.estado_sol === 'EN_TESTING').length,
        completadas: todasLasSolicitudes.filter(s => s.estado_sol === 'COMPLETADA').length,
        enPausa: todasLasSolicitudes.filter(s => s.estado_sol === 'EN_PAUSA').length
      };
      setStats(stats);
      
    } catch (error) {
      console.error('Error cargando solicitudes:', error);
      setError('Error al cargar las solicitudes asignadas');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (nuevoEstado) => {
    setFiltroEstado(nuevoEstado);
    if (nuevoEstado) {
      setSearchParams({ estado: nuevoEstado });
    } else {
      setSearchParams({});
    }
  };

  const handleAccionRapida = async (solicitudId, nuevoEstado) => {
    try {
      await solicitudesService.actualizarEstadoSolicitud(solicitudId, nuevoEstado);
      loadSolicitudesAsignadas();
    } catch (error) {
      console.error('Error actualizando estado:', error);
      setError('Error al actualizar el estado');
    }
  };

  const getEstadoColor = (estado) => {
    const colores = {
      'APROBADA': 'warning',
      'EN_DESARROLLO': 'primary',
      'EN_TESTING': 'info',
      'EN_PAUSA': 'default',
      'COMPLETADA': 'success'
    };
    return colores[estado] || 'default';
  };

  const getPrioridadColor = (prioridad) => {
    const colores = {
      'BAJA': 'default',
      'MEDIA': 'primary',
      'ALTA': 'warning',
      'CRITICA': 'error',
      'URGENTE': 'error'
    };
    return colores[prioridad] || 'default';
  };

  const getProgresoSegunEstado = (estado) => {
    const progreso = {
      'APROBADA': 0,
      'EN_DESARROLLO': 50,
      'EN_TESTING': 80,
      'COMPLETADA': 100,
      'EN_PAUSA': 25
    };
    return progreso[estado] || 0;
  };

  if (loading && solicitudes.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#7b1fa2', mb: 1 }}>
          Mis Solicitudes de Cambio
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Gestiona las solicitudes de cambio asignadas a ti
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Estadísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card 
            sx={{ 
              bgcolor: '#f3e5f5',
              cursor: 'pointer',
              border: !filtroEstado ? '2px solid #7b1fa2' : '1px solid transparent'
            }}
            onClick={() => handleFiltroChange('')}
          >
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Assignment sx={{ fontSize: 40, color: '#7b1fa2', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#7b1fa2' }}>
                {stats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Asignadas
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card 
            sx={{ 
              bgcolor: '#fff3e0',
              cursor: 'pointer',
              border: filtroEstado === 'APROBADA' ? '2px solid #f57c00' : '1px solid transparent'
            }}
            onClick={() => handleFiltroChange('APROBADA')}
          >
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Schedule sx={{ fontSize: 40, color: '#f57c00', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f57c00' }}>
                {stats.pendientes}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pendientes
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card 
            sx={{ 
              bgcolor: '#e3f2fd',
              cursor: 'pointer',
              border: filtroEstado === 'EN_DESARROLLO' ? '2px solid #1976d2' : '1px solid transparent'
            }}
            onClick={() => handleFiltroChange('EN_DESARROLLO')}
          >
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Code sx={{ fontSize: 40, color: '#1976d2', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                {stats.enDesarrollo}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                En Desarrollo
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card 
            sx={{ 
              bgcolor: '#f3e5f5',
              cursor: 'pointer',
              border: filtroEstado === 'EN_TESTING' ? '2px solid #9c27b0' : '1px solid transparent'
            }}
            onClick={() => handleFiltroChange('EN_TESTING')}
          >
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <BugReport sx={{ fontSize: 40, color: '#9c27b0', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#9c27b0' }}>
                {stats.enTesting}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                En Testing
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card 
            sx={{ 
              bgcolor: '#e8f5e8',
              cursor: 'pointer',
              border: filtroEstado === 'COMPLETADA' ? '2px solid #388e3c' : '1px solid transparent'
            }}
            onClick={() => handleFiltroChange('COMPLETADA')}
          >
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <CheckCircle sx={{ fontSize: 40, color: '#388e3c', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#388e3c' }}>
                {stats.completadas}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completadas
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card 
            sx={{ 
              bgcolor: '#f5f5f5',
              cursor: 'pointer',
              border: filtroEstado === 'EN_PAUSA' ? '2px solid #757575' : '1px solid transparent'
            }}
            onClick={() => handleFiltroChange('EN_PAUSA')}
          >
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Pause sx={{ fontSize: 40, color: '#757575', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#757575' }}>
                {stats.enPausa}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                En Pausa
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtros */}
      <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FilterList sx={{ color: '#7b1fa2' }} />
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Filtrar por Estado</InputLabel>
              <Select
                value={filtroEstado}
                label="Filtrar por Estado"
                onChange={(e) => handleFiltroChange(e.target.value)}
              >
                <MenuItem value="">Todos los Estados</MenuItem>
                <MenuItem value="APROBADA">Pendientes (Aprobadas)</MenuItem>
                <MenuItem value="EN_DESARROLLO">En Desarrollo</MenuItem>
                <MenuItem value="EN_TESTING">En Testing</MenuItem>
                <MenuItem value="EN_PAUSA">En Pausa</MenuItem>
                <MenuItem value="COMPLETADA">Completadas</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <Button 
            variant="outlined" 
            startIcon={<Refresh />}
            onClick={loadSolicitudesAsignadas}
            disabled={loading}
            sx={{ color: '#7b1fa2', borderColor: '#7b1fa2' }}
          >
            Actualizar
          </Button>
        </Box>
      </Paper>

      {/* Tabla de Solicitudes */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {filtroEstado ? `Solicitudes ${filtroEstado.replace('_', ' ')}` : 'Todas las Solicitudes'}
              <Typography component="span" sx={{ ml: 1, color: 'text.secondary' }}>
                ({solicitudes.length})
              </Typography>
            </Typography>
          </Box>

          {solicitudes.length === 0 ? (
            <Alert severity="info">
              {filtroEstado ? 
                `No tienes solicitudes en estado "${filtroEstado.replace('_', ' ')}" en este momento.` :
                'No tienes solicitudes asignadas en este momento.'
              }
            </Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell><strong>Solicitud</strong></TableCell>
                    <TableCell><strong>Tipo</strong></TableCell>
                    <TableCell><strong>Prioridad</strong></TableCell>
                    <TableCell><strong>Estado</strong></TableCell>
                    <TableCell><strong>Progreso</strong></TableCell>
                    <TableCell><strong>Fecha Límite</strong></TableCell>
                    <TableCell><strong>Acciones</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {solicitudes.map((solicitud) => (
                    <TableRow key={solicitud.id_sol} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {solicitud.titulo_sol}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {solicitud.id_sol.substring(0, 8)}...
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            Por: {solicitud.solicitante}
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Chip 
                          label={solicitud.tipo_cambio_sol} 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Chip 
                          label={solicitud.prioridad_sol} 
                          size="small" 
                          color={getPrioridadColor(solicitud.prioridad_sol)}
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Chip 
                          label={solicitud.estado_sol} 
                          size="small" 
                          color={getEstadoColor(solicitud.estado_sol)}
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={getProgresoSegunEstado(solicitud.estado_sol)}
                            sx={{ width: 80, height: 6 }}
                          />
                          <Typography variant="caption">
                            {getProgresoSegunEstado(solicitud.estado_sol)}%
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2">
                          {solicitud.fecha_limite_deseada ? 
                            new Date(solicitud.fecha_limite_deseada).toLocaleDateString('es-ES') : 
                            'No definida'
                          }
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {/* Acciones rápidas según el estado */}
                          {solicitud.estado_sol === 'APROBADA' && (
                            <Tooltip title="Iniciar Desarrollo">
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => handleAccionRapida(solicitud.id_sol, 'EN_DESARROLLO')}
                              >
                                <PlayArrow />
                              </IconButton>
                            </Tooltip>
                          )}
                          
                          {solicitud.estado_sol === 'EN_DESARROLLO' && (
                            <>
                              <Tooltip title="Completar Desarrollo">
                                <IconButton 
                                  size="small" 
                                  color="success"
                                  onClick={() => handleAccionRapida(solicitud.id_sol, 'EN_TESTING')}
                                >
                                  <Done />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Pausar">
                                <IconButton 
                                  size="small" 
                                  color="warning"
                                  onClick={() => handleAccionRapida(solicitud.id_sol, 'EN_PAUSA')}
                                >
                                  <Pause />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                          
                          {solicitud.estado_sol === 'EN_PAUSA' && (
                            <Tooltip title="Reanudar">
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => handleAccionRapida(solicitud.id_sol, 'EN_DESARROLLO')}
                              >
                                <PlayArrow />
                              </IconButton>
                            </Tooltip>
                          )}
                          
                          {solicitud.estado_sol === 'EN_TESTING' && (
                            <Tooltip title="Reportar Bug">
                              <IconButton 
                                size="small" 
                                color="warning"
                                onClick={() => handleAccionRapida(solicitud.id_sol, 'EN_DESARROLLO')}
                              >
                                <BugReport />
                              </IconButton>
                            </Tooltip>
                          )}
                          
                          {/* Ver detalles - siempre disponible */}
                          <Tooltip title="Ver Detalles">
                            <IconButton 
                              size="small" 
                              color="info"
                              onClick={() => navigate(`/developer/solicitud/${solicitud.id_sol}`)}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          
                          {/* GitHub - si existe */}
                          {solicitud.github_repo_url && (
                            <Tooltip title="Ver en GitHub">
                              <IconButton 
                                size="small" 
                                onClick={() => window.open(solicitud.github_repo_url, '_blank')}
                              >
                                <GitHub />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default SolicitudesDesarrollador; 