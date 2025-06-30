import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Stack,
  IconButton,
  Tooltip,
  Link,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  GitHub,
  AccountTree,
  CallMerge,
  OpenInNew,
  Refresh,
  Code,
  Commit,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Info,
  Launch
} from '@mui/icons-material';
import githubService from '../../services/githubService';

const GitHubManagement = ({ solicitud, onUpdate, userInfo }) => {
  const [githubInfo, setGithubInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Estados para diálogos
  const [branchDialog, setBranchDialog] = useState(false);
  const [prDialog, setPrDialog] = useState(false);
  const [commitsDialog, setCommitsDialog] = useState(false);
  
  // Estados para formularios
  const [repoType, setRepoType] = useState('frontend');
  const [baseBranch, setBaseBranch] = useState('main');
  
  // Estados para commits
  const [commits, setCommits] = useState([]);
  const [commitsType, setCommitsType] = useState('branch'); // 'branch' o 'pr'

  useEffect(() => {
    if (solicitud?.id_sol) {
      console.log('🔄 Iniciando carga de información de GitHub para solicitud:', solicitud.id_sol);
      loadGitHubInfo();
    }
  }, [solicitud?.id_sol]);

  const loadGitHubInfo = async () => {
    if (!solicitud?.id_sol) {
      console.log('⚠️ No hay ID de solicitud disponible');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('📥 Solicitando información de GitHub para solicitud:', solicitud.id_sol);
      const response = await githubService.getGitHubInfo(solicitud.id_sol);
      console.log('✅ Información recibida:', response);
      
      if (response?.data?.error) {
        console.log('⚠️ Error específico recibido:', response.data);
        setError({
          message: response.data.errorMessage,
          details: response.data.errorDetails,
          timestamp: response.data.timestamp,
          type: response.data.errorType || 'ERROR'
        });
        setGithubInfo(null);
        return;
      }
      
      if (response?.data) {
        console.log('✅ Estableciendo información de GitHub:', response.data);
        setGithubInfo(response.data);
      } else {
        console.log('⚠️ No hay información de GitHub disponible');
        setGithubInfo(null);
      }
      
    } catch (error) {
      console.error('❌ Error inesperado:', error);
      setError({
        message: 'Error inesperado al cargar información de GitHub',
        details: error.message,
        timestamp: new Date().toISOString(),
        type: 'UNEXPECTED_ERROR'
      });
      setGithubInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBranch = async () => {
    try {
      setProcessing(true);
      setError(null);
      
      await githubService.createBranch(solicitud.id_sol, {
        repoType,
        baseBranch
      });
      
      setSuccess('Rama creada exitosamente');
      setBranchDialog(false);
      await loadGitHubInfo();
      
      if (onUpdate) {
        onUpdate();
      }
      
    } catch (error) {
      console.error('Error creando rama:', error);
      setError(error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleCreatePullRequest = async () => {
    try {
      setProcessing(true);
      setError(null);
      
      await githubService.createPullRequest(solicitud.id_sol, {
        baseBranch
      });
      
      setSuccess('Pull Request creado exitosamente');
      setPrDialog(false);
      await loadGitHubInfo();
      
      if (onUpdate) {
        onUpdate();
      }
      
    } catch (error) {
      console.error('Error creando Pull Request:', error);
      setError(error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleLoadCommits = async (type = 'branch') => {
    try {
      setProcessing(true);
      setCommits([]);
      setCommitsType(type);
      
      let response;
      if (type === 'branch') {
        response = await githubService.getBranchCommits(solicitud.id_sol);
      } else {
        response = await githubService.getPullRequestCommits(solicitud.id_sol);
      }
      
      setCommits(response.data.commits || []);
      setCommitsDialog(true);
      
    } catch (error) {
      console.error('Error cargando commits:', error);
      setError(error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleSync = async () => {
    try {
      setProcessing(true);
      setError(null);
      
      await githubService.syncWithGitHub(solicitud.id_sol);
      await loadGitHubInfo();
      
      setSuccess('Información sincronizada correctamente');
      
    } catch (error) {
      console.error('Error sincronizando:', error);
      setError(error.message);
    } finally {
      setProcessing(false);
    }
  };

  const isAssignedDeveloper = () => {
    return userInfo && solicitud && 
           (userInfo.nom_usu === solicitud.desarrollador_asignado || 
            userInfo.ape_usu === solicitud.desarrollador_asignado ||
            `${userInfo.nom_usu} ${userInfo.ape_usu}` === solicitud.desarrollador_asignado);
  };

  const canCreateBranch = () => {
    return isAssignedDeveloper() && 
           solicitud.estado_sol === 'APROBADA' && 
           (!githubInfo || !githubService.hasBranch(githubInfo));
  };

  const canCreatePR = () => {
    return isAssignedDeveloper() && 
           githubInfo && 
           githubService.hasBranch(githubInfo) && 
           !githubService.hasPullRequest(githubInfo);
  };

  // Renderizado condicional para estados de carga y error
  if (loading) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <CircularProgress size={24} />
        <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
          Cargando información de GitHub...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        action={
          <Button 
            color="inherit" 
            size="small" 
            onClick={() => {
              console.log('🔄 Reintentando carga de información...');
              loadGitHubInfo();
            }}
            startIcon={<Refresh />}
          >
            Reintentar
          </Button>
        }
      >
        <Box>
          <Typography variant="body1" gutterBottom>
            {error.message}
          </Typography>
          {error.details && (
            <Typography variant="caption" color="text.secondary" component="pre" sx={{ 
              mt: 1,
              p: 1,
              bgcolor: 'rgba(0, 0, 0, 0.04)',
              borderRadius: 1,
              overflowX: 'auto'
            }}>
              {typeof error.details === 'string' ? error.details : JSON.stringify(error.details, null, 2)}
            </Typography>
          )}
          {error.timestamp && (
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
              Ocurrido el: {new Date(error.timestamp).toLocaleString()}
            </Typography>
          )}
        </Box>
      </Alert>
    );
  }

  if (!githubInfo) {
    return (
      <Alert 
        severity="info" 
        action={
          canCreateBranch() && (
            <Button 
              color="primary" 
              size="small" 
              onClick={() => setBranchDialog(true)}
              startIcon={<GitHub />}
            >
              Crear Rama
            </Button>
          )
        }
      >
        No hay información de GitHub disponible para esta solicitud.
      </Alert>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <GitHub />
            Gestión de GitHub
          </Typography>
          
          {githubInfo && (
            <Tooltip title="Sincronizar con GitHub">
              <IconButton onClick={handleSync} disabled={processing}>
                <Refresh />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* Mensajes de estado */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error.message}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Estado actual */}
        {githubInfo ? (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
              Estado Actual:
            </Typography>
            
            <Stack spacing={2}>
              {/* Información de la rama */}
              {githubService.hasBranch(githubInfo) && (
                <Paper sx={{ p: 2, bgcolor: '#f8f9fa' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccountTree />
                      Rama: {githubInfo.branch_name}
                    </Typography>
                    <Chip label={githubInfo.repository} size="small" />
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Button
                      size="small"
                      startIcon={<OpenInNew />}
                      href={githubService.getBranchUrl(githubInfo)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ver Rama
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Commit />}
                      onClick={() => handleLoadCommits('branch')}
                      disabled={processing}
                    >
                      Ver Commits
                    </Button>
                  </Box>
                </Paper>
              )}

              {/* Información del PR */}
              {githubService.hasPullRequest(githubInfo) && (
                <Paper sx={{ p: 2, bgcolor: '#f8f9fa' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CallMerge />
                      Pull Request #{githubInfo.pr_number}
                    </Typography>
                    <Chip 
                      label={githubService.formatPullRequestState(githubInfo.pr_state)}
                      color={githubService.getPullRequestStateColor(githubInfo.pr_state)}
                      size="small"
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Button
                      size="small"
                      startIcon={<Launch />}
                      href={githubService.getPullRequestUrl(githubInfo)}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="contained"
                      color="primary"
                    >
                      Ir al PR
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Commit />}
                      onClick={() => handleLoadCommits('pr')}
                      disabled={processing}
                    >
                      Ver Commits del PR
                    </Button>
                  </Box>
                </Paper>
              )}
            </Stack>
          </Box>
        ) : (
          <Alert severity="info" sx={{ mb: 3 }}>
            Esta solicitud aún no tiene rama ni Pull Request asociados.
          </Alert>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Acciones disponibles */}
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
          Acciones Disponibles:
        </Typography>

        <Stack spacing={2}>
          {/* Crear Rama */}
          <Box>
            <Button
              variant="contained"
              startIcon={<AccountTree />}
              onClick={() => setBranchDialog(true)}
              disabled={!canCreateBranch() || processing}
              fullWidth
            >
              Crear Rama
            </Button>
            {!canCreateBranch() && githubInfo && githubService.hasBranch(githubInfo) && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                Ya existe una rama para esta solicitud
              </Typography>
            )}
          </Box>

          {/* Crear PR */}
          <Box>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<CallMerge />}
              onClick={() => setPrDialog(true)}
              disabled={!canCreatePR() || processing}
              fullWidth
            >
              Crear Pull Request
            </Button>
            {!canCreatePR() && githubInfo && !githubService.hasBranch(githubInfo) && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                Primero debes crear una rama
              </Typography>
            )}
            {!canCreatePR() && githubInfo && githubService.hasPullRequest(githubInfo) && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                Ya existe un Pull Request para esta solicitud
              </Typography>
            )}
          </Box>
        </Stack>

        {/* Diálogo para crear rama */}
        <Dialog open={branchDialog} onClose={() => setBranchDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Crear Rama para la Solicitud</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Repositorio</InputLabel>
                <Select
                  value={repoType}
                  onChange={(e) => setRepoType(e.target.value)}
                  label="Repositorio"
                >
                  <MenuItem value="frontend">Frontend</MenuItem>
                  <MenuItem value="backend">Backend</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth>
                <InputLabel>Rama Base</InputLabel>
                <Select
                  value={baseBranch}
                  onChange={(e) => setBaseBranch(e.target.value)}
                  label="Rama Base"
                >
                  <MenuItem value="main">main</MenuItem>
                  <MenuItem value="master">master</MenuItem>
                  <MenuItem value="develop">develop</MenuItem>
                </Select>
              </FormControl>
              
              <Alert severity="info">
                Se creará una rama con el nombre: <strong>SOL-{solicitud.id_sol?.slice(0, 8)}-{solicitud.titulo_sol?.toLowerCase().replace(/\s+/g, '-').slice(0, 30)}</strong>
              </Alert>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBranchDialog(false)} disabled={processing}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateBranch} 
              variant="contained" 
              disabled={processing}
              startIcon={processing ? <CircularProgress size={16} /> : <AccountTree />}
            >
              {processing ? 'Creando...' : 'Crear Rama'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Diálogo para crear PR */}
        <Dialog open={prDialog} onClose={() => setPrDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Crear Pull Request</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Rama Destino</InputLabel>
                <Select
                  value={baseBranch}
                  onChange={(e) => setBaseBranch(e.target.value)}
                  label="Rama Destino"
                >
                  <MenuItem value="main">main</MenuItem>
                  <MenuItem value="master">master</MenuItem>
                  <MenuItem value="develop">develop</MenuItem>
                </Select>
              </FormControl>
              
              <Alert severity="info">
                Se creará un Pull Request desde la rama <strong>{githubInfo?.branch_name}</strong> hacia <strong>{baseBranch}</strong>
              </Alert>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPrDialog(false)} disabled={processing}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreatePullRequest} 
              variant="contained" 
              disabled={processing}
              startIcon={processing ? <CircularProgress size={16} /> : <CallMerge />}
            >
              {processing ? 'Creando...' : 'Crear PR'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Diálogo para mostrar commits */}
        <Dialog open={commitsDialog} onClose={() => setCommitsDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            Commits de {commitsType === 'branch' ? 'la Rama' : 'el Pull Request'}
          </DialogTitle>
          <DialogContent>
            {commits.length > 0 ? (
              <List>
                {commits.map((commit, index) => (
                  <ListItem key={commit.sha} divider={index < commits.length - 1}>
                    <ListItemIcon>
                      <Commit />
                    </ListItemIcon>
                    <ListItemText
                      primary={commit.message}
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            Por: {commit.author} ({commit.author_email})
                          </Typography>
                          <Typography variant="caption" display="block">
                            {new Date(commit.date).toLocaleString('es-ES')}
                          </Typography>
                          <Link 
                            href={commit.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            variant="caption"
                          >
                            {commit.short_sha}
                          </Link>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Alert severity="info">
                No hay commits disponibles
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCommitsDialog(false)}>
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default GitHubManagement; 