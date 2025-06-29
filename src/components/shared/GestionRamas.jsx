import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
  Alert,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Divider,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField
} from '@mui/material';
import {
  GitHub,
  AccountTree,
  CallMerge,
  Code,
  Check,
  Close,
  Warning,
  Info,
  Send,
  Refresh,
  Launch,
  Merge
} from '@mui/icons-material';
import desarrolladorService from '../../services/desarrolladorService';

const GestionRamas = ({ solicitud, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [ramas, setRamas] = useState([]);
  const [ramasDisponibles, setRamasDisponibles] = useState({
    frontend: [],
    backend: []
  });

  const [permisos, setPermisos] = useState({});
  const [procesando, setProcesando] = useState({});
  const [confirmDialog, setConfirmDialog] = useState({ 
    open: false, 
    action: null, 
    data: null,
    baseBranch: 'develop',
    targetBranch: 'develop'
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (solicitud?.id_sol) {
      cargarDatos();
    }
  }, [solicitud?.id_sol]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Cargar ramas de la solicitud
      const ramasData = await desarrolladorService.obtenerRamas(solicitud.id_sol);

      // Cargar ramas disponibles de ambos repositorios
      const [frontendRamas, backendRamas] = await Promise.all([
        desarrolladorService.obtenerRamasDisponibles('frontend').catch(() => ({ data: [] })),
        desarrolladorService.obtenerRamasDisponibles('backend').catch(() => ({ data: [] }))
      ]);

      // Determinar permisos basado en el estado de la solicitud
      const permisosCalculados = {
        puede_crear_ramas: ['APROBADA', 'EN_DESARROLLO'].includes(solicitud.estado_sol),
        puede_crear_prs: solicitud.estado_sol === 'EN_DESARROLLO',
        puede_enviar_testing: solicitud.estado_sol === 'EN_DESARROLLO'
      };

      setPermisos(permisosCalculados);
      setRamas(ramasData.data || []);
      setRamasDisponibles({
        frontend: frontendRamas.data || [],
        backend: backendRamas.data || []
      });

    } catch (error) {
      console.error('Error cargando datos:', error);
      mostrarSnackbar('Error al cargar datos de ramas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const mostrarSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
    setTimeout(() => setSnackbar({ open: false, message: '', severity }), 5000);
  };

  const handleCrearRama = async (repositoryType, baseBranch) => {
    const key = `crear_rama_${repositoryType}`;
    try {
      setProcesando(prev => ({ ...prev, [key]: true }));
      
      await desarrolladorService.crearRama(solicitud.id_sol, repositoryType, baseBranch);
      mostrarSnackbar(`Rama ${repositoryType} creada exitosamente desde ${baseBranch}`);
      await cargarDatos();
      
      if (onUpdate) onUpdate();
      
    } catch (error) {
      console.error(`Error creando rama ${repositoryType}:`, error);
      mostrarSnackbar(error.response?.data?.message || `Error creando rama ${repositoryType}`, 'error');
    } finally {
      setProcesando(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleCrearPR = async (repositoryType, targetBranch) => {
    const key = `crear_pr_${repositoryType}`;
    try {
      setProcesando(prev => ({ ...prev, [key]: true }));
      
      await desarrolladorService.crearPR(solicitud.id_sol, repositoryType, targetBranch);
      mostrarSnackbar(`Pull Request ${repositoryType} creado exitosamente hacia ${targetBranch}`);
      await cargarDatos();
      
      if (onUpdate) onUpdate();
      
    } catch (error) {
      console.error(`Error creando PR ${repositoryType}:`, error);
      mostrarSnackbar(error.response?.data?.message || `Error creando PR ${repositoryType}`, 'error');
    } finally {
      setProcesando(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleEnviarATesting = async () => {
    try {
      setProcesando(prev => ({ ...prev, enviar_testing: true }));
      
      await desarrolladorService.enviarSolicitudATesting(solicitud.id_sol);
      mostrarSnackbar('Solicitud enviada a testing exitosamente');
      await cargarDatos();
      
      if (onUpdate) onUpdate();
      
    } catch (error) {
      console.error('Error enviando a testing:', error);
      mostrarSnackbar(error.response?.data?.message || 'Error enviando a testing', 'error');
    } finally {
      setProcesando(prev => ({ ...prev, enviar_testing: false }));
    }
  };

  const openConfirmDialog = (action, data) => {
    setConfirmDialog({ 
      open: true, 
      action, 
      data,
      baseBranch: 'develop',
      targetBranch: 'develop'
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ 
      open: false, 
      action: null, 
      data: null,
      baseBranch: 'develop',
      targetBranch: 'develop'
    });
  };

  const executeConfirmedAction = async () => {
    const { action, data, baseBranch, targetBranch } = confirmDialog;
    closeConfirmDialog();

    switch (action) {
      case 'crear_rama':
        await handleCrearRama(data.repositoryType, baseBranch);
        break;
      case 'crear_pr':
        await handleCrearPR(data.repositoryType, targetBranch);
        break;
      case 'enviar_testing':
        await handleEnviarATesting();
        break;
    }
  };

  const getEstadoColor = (status) => {
    const colores = {
      'PENDING': 'default',
      'OPEN': 'primary',
      'IN_REVIEW': 'warning',
      'APPROVED': 'success',
      'REJECTED': 'error',
      'MERGED': 'success'
    };
    return colores[status] || 'default';
  };

  const getEstadoLabel = (status) => {
    const labels = {
      'PENDING': 'Pendiente',
      'OPEN': 'Abierto',
      'IN_REVIEW': 'En Revisión',
      'APPROVED': 'Aprobado',
      'REJECTED': 'Rechazado',
      'MERGED': 'Mergeado'
    };
    return labels[status] || status;
  };

  const getRamaIcon = (repositoryType) => {
    return repositoryType === 'FRONTEND' ? '🎨' : '⚙️';
  };

  const getRamasDisponiblesParaRepo = (repositoryType) => {
    const repoKey = repositoryType.toLowerCase();
    return ramasDisponibles[repoKey] || [];
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <CircularProgress size={24} />
            <Typography>Cargando información de ramas...</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" display="flex" alignItems="center" gap={1}>
          <GitHub />
          Gestión de Ramas y Pull Requests
        </Typography>
        <Tooltip title="Actualizar datos">
          <IconButton onClick={cargarDatos} disabled={loading}>
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Estadísticas */}
      {ramas.length > 0 && (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6} sm={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="primary">
                {ramas.length}
              </Typography>
              <Typography variant="caption">Total Ramas</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="success.main">
                {ramas.filter(r => r.pr_number).length}
              </Typography>
              <Typography variant="caption">PRs Creados</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="warning.main">
                {ramas.filter(r => r.pr_status === 'IN_REVIEW').length}
              </Typography>
              <Typography variant="caption">En Revisión</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="info.main">
                {ramas.filter(r => r.pr_status === 'APPROVED').length}
              </Typography>
              <Typography variant="caption">Aprobados</Typography>
            </Box>
          </Grid>
        </Grid>
      )}

      {/* Botones de Crear Ramas */}
      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
        Crear Ramas
      </Typography>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Button
          variant="contained"
          startIcon={procesando.crear_rama_FRONTEND ? <CircularProgress size={16} /> : <AccountTree />}
          onClick={() => openConfirmDialog('crear_rama', { repositoryType: 'FRONTEND' })}
          disabled={!permisos.puede_crear_ramas || procesando.crear_rama_FRONTEND || ramas.some(r => r.repository_type === 'FRONTEND')}
          color="primary"
        >
          🎨 Crear Rama Frontend
        </Button>
        
        <Button
          variant="contained"
          startIcon={procesando.crear_rama_BACKEND ? <CircularProgress size={16} /> : <AccountTree />}
          onClick={() => openConfirmDialog('crear_rama', { repositoryType: 'BACKEND' })}
          disabled={!permisos.puede_crear_ramas || procesando.crear_rama_BACKEND || ramas.some(r => r.repository_type === 'BACKEND')}
          color="secondary"
        >
          ⚙️ Crear Rama Backend
        </Button>
      </Stack>

      {/* Información de Permisos */}
      {!permisos.puede_crear_ramas && (
        <Alert severity="info" sx={{ mb: 2 }}>
          La solicitud debe estar en estado APROBADA o EN_DESARROLLO para crear ramas
        </Alert>
      )}
      
      {permisos.puede_crear_ramas && ramas.length === 0 && (
        <Alert severity="success" sx={{ mb: 2 }}>
          ✅ Puedes crear ramas para comenzar el desarrollo
        </Alert>
      )}

      {/* Lista de Ramas */}
      {ramas.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Ramas Creadas
          </Typography>
          
          <List>
            {ramas.map((rama, index) => (
              <ListItem key={rama.id} divider={index < ramas.length - 1}>
                <ListItemIcon>
                  <Typography fontSize="1.5rem">
                    {getRamaIcon(rama.repository_type)}
                  </Typography>
                </ListItemIcon>
                
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {rama.branch_name}
                      </Typography>
                      <Chip 
                        label={rama.repository_type} 
                        size="small" 
                        color={rama.repository_type === 'FRONTEND' ? 'primary' : 'secondary'}
                      />
                      <Chip 
                        label={getEstadoLabel(rama.pr_status)} 
                        size="small" 
                        color={getEstadoColor(rama.pr_status)}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Creado: {new Date(rama.created_at).toLocaleString('es-ES')}
                      </Typography>
                      {rama.pr_url && (
                        <Box display="flex" alignItems="center" gap={1} mt={1}>
                          <Typography variant="body2">
                            PR #{rama.pr_number}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => window.open(rama.pr_url, '_blank')}
                            title="Ver PR en GitHub"
                          >
                            <Launch fontSize="small" />
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                  }
                />
                
                <Box>
                  {rama.pr_status === 'PENDING' && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={procesando[`crear_pr_${rama.repository_type}`] ? <CircularProgress size={16} /> : <CallMerge />}
                      onClick={() => openConfirmDialog('crear_pr', { repositoryType: rama.repository_type })}
                      disabled={procesando[`crear_pr_${rama.repository_type}`]}
                    >
                      Crear PR
                    </Button>
                  )}
                </Box>
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* Botón Enviar a Testing */}
      {permisos.puede_enviar_testing && ramas.length > 0 && ramas.every(r => r.pr_number) && (
        <Box>
          <Alert severity="success" sx={{ mb: 2 }}>
            ✅ Todos los Pull Requests han sido creados. Puedes enviar la solicitud a testing.
          </Alert>
          
          <Button
            variant="contained"
            size="large"
            color="success"
            startIcon={procesando.enviar_testing ? <CircularProgress size={20} /> : <Send />}
            onClick={() => openConfirmDialog('enviar_testing', {})}
            disabled={procesando.enviar_testing}
            fullWidth
          >
            🚀 Enviar a Testing
          </Button>
        </Box>
      )}

      {/* Dialog de Confirmación */}
      <Dialog
        open={confirmDialog.open}
        onClose={closeConfirmDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {confirmDialog.action === 'crear_rama' && '🌿 Confirmar Creación de Rama'}
          {confirmDialog.action === 'crear_pr' && '📝 Confirmar Creación de Pull Request'}
          {confirmDialog.action === 'enviar_testing' && '🚀 Confirmar Envío a Testing'}
        </DialogTitle>
        
        <DialogContent>
          {confirmDialog.action === 'crear_rama' && (
            <Box>
              <Typography sx={{ mb: 2 }}>
                ¿Estás seguro de que quieres crear la rama para <strong>{confirmDialog.data?.repositoryType}</strong>?
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Rama Base</InputLabel>
                <Select
                  value={confirmDialog.baseBranch}
                  label="Rama Base"
                  onChange={(e) => setConfirmDialog(prev => ({ ...prev, baseBranch: e.target.value }))}
                >
                  {getRamasDisponiblesParaRepo(confirmDialog.data?.repositoryType).map((rama) => (
                    <MenuItem key={rama.name} value={rama.name}>
                      {rama.name} {rama.protected && '🔒'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Typography variant="body2" color="text.secondary">
                La nueva rama se creará basada en la rama seleccionada.
              </Typography>
            </Box>
          )}
          
          {confirmDialog.action === 'crear_pr' && (
            <Box>
              <Typography sx={{ mb: 2 }}>
                ¿Estás seguro de que quieres crear el Pull Request para <strong>{confirmDialog.data?.repositoryType}</strong>?
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Rama Destino</InputLabel>
                <Select
                  value={confirmDialog.targetBranch}
                  label="Rama Destino"
                  onChange={(e) => setConfirmDialog(prev => ({ ...prev, targetBranch: e.target.value }))}
                >
                  {getRamasDisponiblesParaRepo(confirmDialog.data?.repositoryType).map((rama) => (
                    <MenuItem key={rama.name} value={rama.name}>
                      {rama.name} {rama.protected && '🔒'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Typography variant="body2" color="text.secondary">
                El Pull Request se creará hacia la rama seleccionada.
              </Typography>
            </Box>
          )}
          
          {confirmDialog.action === 'enviar_testing' && (
            <Typography>
              ¿Estás seguro de que quieres enviar esta solicitud a testing?
              <br />
              <br />
              Esto cambiará el estado de la solicitud a <strong>EN_TESTING</strong> y los PRs pasarán a revisión del Master.
            </Typography>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={closeConfirmDialog}>
            Cancelar
          </Button>
          <Button 
            onClick={executeConfirmedAction} 
            variant="contained"
            color={confirmDialog.action === 'enviar_testing' ? 'success' : 'primary'}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      {snackbar.open && (
        <Alert 
          severity={snackbar.severity} 
          sx={{ 
            position: 'fixed', 
            bottom: 16, 
            right: 16, 
            zIndex: 9999 
          }}
        >
          {snackbar.message}
        </Alert>
      )}
    </Box>
  );
};

export default GestionRamas; 