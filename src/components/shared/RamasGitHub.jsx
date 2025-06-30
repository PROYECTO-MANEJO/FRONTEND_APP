import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Stack,
  Divider
} from '@mui/material';
import {
  GitHub as GitHubIcon,
  Add as AddIcon,
  Code as CodeIcon,
  Merge as MergeIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  BugReport as BugReportIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

// Mapeo de estados a colores y etiquetas
const estadosRama = {
  PENDING: { color: 'default', label: 'Pendiente', icon: HistoryIcon },
  OPEN: { color: 'info', label: 'Abierto', icon: CodeIcon },
  APPROVED: { color: 'success', label: 'Aprobado', icon: CheckCircleIcon },
  REJECTED: { color: 'error', label: 'Rechazado', icon: CancelIcon },
  MERGED: { color: 'secondary', label: 'Mergeado', icon: MergeIcon }
};

const RamasGitHub = ({ solicitudId, onUpdate }) => {
  const { user } = useAuth();
  const [ramas, setRamas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creandoRama, setCreandoRama] = useState(false);
  const [creandoPR, setCreandoPR] = useState(false);

  // Cargar ramas al montar y cuando se actualice
  useEffect(() => {
    cargarRamas();
  }, [solicitudId]);

  // Función para cargar ramas
  const cargarRamas = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/github/solicitud/${solicitudId}/ramas`);
      setRamas(response.data.data);
    } catch (error) {
      console.error('Error cargando ramas:', error);
      setError('Error al cargar las ramas de GitHub');
    } finally {
      setLoading(false);
    }
  };

  // Crear nueva rama
  const crearRama = async (tipo) => {
    try {
      setCreandoRama(true);
      setError(null);
      
      await api.post(`/github/dev/solicitud/${solicitudId}/crear-rama`, {
        repository_type: tipo
      });

      await cargarRamas();
      if (onUpdate) onUpdate();

    } catch (error) {
      console.error('Error creando rama:', error);
      setError(error.response?.data?.message || 'Error al crear la rama');
    } finally {
      setCreandoRama(false);
    }
  };

  // Crear PR para una rama
  const crearPR = async (tipo) => {
    try {
      setCreandoPR(true);
      setError(null);
      
      await api.post(`/github/dev/solicitud/${solicitudId}/crear-pr`, {
        repository_type: tipo
      });

      await cargarRamas();
      if (onUpdate) onUpdate();

    } catch (error) {
      console.error('Error creando PR:', error);
      setError(error.response?.data?.message || 'Error al crear el PR');
    } finally {
      setCreandoPR(false);
    }
  };

  // Renderizar estado de rama
  const RamaEstado = ({ estado }) => {
    const config = estadosRama[estado] || estadosRama.PENDING;
    const Icon = config.icon;

    return (
      <Chip
        icon={<Icon />}
        label={config.label}
        color={config.color}
        size="small"
      />
    );
  };

  // Renderizar acciones según estado
  const RamaAcciones = ({ rama }) => {
    if (!rama.pr_number) {
      return (
        <Button
          variant="outlined"
          size="small"
          startIcon={<GitHubIcon />}
          onClick={() => crearPR(rama.repository_type)}
          disabled={creandoPR}
        >
          Crear PR
        </Button>
      );
    }

    return (
      <Tooltip title="Ver en GitHub">
        <IconButton
          size="small"
          color="primary"
          href={rama.pr_url}
          target="_blank"
        >
          <GitHubIcon />
        </IconButton>
      </Tooltip>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={2}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          {/* Título y botones de creación */}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" component="h2">
              <GitHubIcon sx={{ mr: 1 }} />
              Ramas de GitHub
            </Typography>
            
            {user.rol === 'DESARROLLADOR' && (
              <Stack direction="row" spacing={1}>
                {!ramas.find(r => r.repository_type === 'FRONTEND') && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => crearRama('FRONTEND')}
                    disabled={creandoRama}
                  >
                    Frontend
                  </Button>
                )}
                
                {!ramas.find(r => r.repository_type === 'BACKEND') && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => crearRama('BACKEND')}
                    disabled={creandoRama}
                  >
                    Backend
                  </Button>
                )}
              </Stack>
            )}
          </Box>

          {/* Mensajes de error */}
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Lista de ramas */}
          {ramas.length === 0 ? (
            <Alert severity="info">
              No hay ramas creadas para esta solicitud
            </Alert>
          ) : (
            ramas.map((rama, index) => (
              <React.Fragment key={rama.id}>
                {index > 0 && <Divider />}
                <Box display="flex" alignItems="center" justifyContent="space-between" py={1}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle1">
                      {rama.repository_type === 'FRONTEND' ? '🎨 Frontend' : '⚙️ Backend'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {rama.branch_name}
                    </Typography>
                    <RamaEstado estado={rama.pr_status} />
                  </Stack>
                  
                  <Stack direction="row" spacing={1} alignItems="center">
                    {rama.pr_number && (
                      <Typography variant="body2" color="textSecondary">
                        PR #{rama.pr_number}
                      </Typography>
                    )}
                    <RamaAcciones rama={rama} />
                  </Stack>
                </Box>
              </React.Fragment>
            ))
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default RamasGitHub; 