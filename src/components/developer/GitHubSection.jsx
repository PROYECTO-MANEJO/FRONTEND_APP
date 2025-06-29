import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Box,
  Chip,
  Stack,
  Paper,
  Divider,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  GitHub,
  Create,
  CallMerge,
  CheckCircle,
  Error,
  Launch,
  ExpandMore,
  Refresh,
  Visibility,
  Security
} from '@mui/icons-material';
import githubService from '../../services/githubService';
import { useAuth } from '../../context/AuthContext';

const GitHubSection = ({ solicitud, onSolicitudUpdate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [tiposGitFlow, setTiposGitFlow] = useState([]);
  const [branchesDisponibles, setBranchesDisponibles] = useState({
    frontend: [],
    backend: []
  });
  const [infoGitHub, setInfoGitHub] = useState(null);
  const [tokenValidation, setTokenValidation] = useState(null);
  const [validatingToken, setValidatingToken] = useState(false);
  const [githubConfigError, setGithubConfigError] = useState(false);
  
  // Estados para controlar la disponibilidad de los botones
  const [githubStatus, setGithubStatus] = useState({
    hasBranch: false,
    hasPR: false,
    prMerged: false,
    currentBranch: null,
    currentPR: null
  });

  // Estados para formularios
  const [formCrearBranch, setFormCrearBranch] = useState({
    branchType: 'feature',
    baseBranch: '',
    repoType: 'frontend'
  });
  
  const [formCrearPR, setFormCrearPR] = useState({
    branchName: '',
    repoType: 'frontend',
    baseBranch: 'main'
  });

  const [showCrearBranch, setShowCrearBranch] = useState(false);
  const [showCrearPR, setShowCrearPR] = useState(false);

  // Función para verificar si se puede crear un branch
  const canCreateBranch = () => {
    return !githubStatus.hasBranch && !githubStatus.hasPR;
  };

  // Función para verificar si se puede crear un PR
  const canCreatePR = () => {
    return githubStatus.hasBranch && !githubStatus.hasPR;
  };

  // Función para actualizar el estado de GitHub
  const updateGitHubStatus = (info) => {
    setGithubStatus({
      hasBranch: !!info?.github_branch_name,
      hasPR: !!info?.github_pr_number,
      prMerged: !!info?.github_merged_at,
      currentBranch: info?.github_branch_name || null,
      currentPR: info?.github_pr_number || null
    });
  };

  useEffect(() => {
    console.log('🎯 GitHubSection useEffect - ID Solicitud:', solicitud?.id_sol);
    if (solicitud?.id_sol) {
      cargarDatosIniciales();
    } else {
      console.log('⚠️ No hay ID de solicitud disponible');
    }
  }, [solicitud?.id_sol]);

  useEffect(() => {
    if (solicitud) {
      updateGitHubStatus(solicitud);
    }
  }, [solicitud]);

  const cargarDatosIniciales = async () => {
    try {
      setLoading(true);
      
      // Cargar tipos GitFlow
      try {
        const tiposResponse = await githubService.obtenerTiposGitFlow();
        if (tiposResponse.success) {
          setTiposGitFlow(tiposResponse.data);
          if (tiposResponse.data.length > 0) {
            setFormCrearBranch(prev => ({
              ...prev,
              baseBranch: tiposResponse.data[0].defaultBase
            }));
          }
        }
      } catch (error) {
        console.warn('Error cargando tipos GitFlow:', error);
        
        // Detectar si es error de configuración de GitHub
        if (error.code === 'GITHUB_NOT_CONFIGURED' || error.response?.status === 503) {
          setGithubConfigError(true);
        }
        
        // Valores por defecto si no se puede cargar
        setTiposGitFlow([
          { type: 'feature', defaultBase: 'develop', description: 'Nueva funcionalidad' },
          { type: 'hotfix', defaultBase: 'main', description: 'Corrección urgente' },
          { type: 'bugfix', defaultBase: 'develop', description: 'Corrección de errores' }
        ]);
        setFormCrearBranch(prev => ({ ...prev, baseBranch: 'develop' }));
      }

      // Cargar branches disponibles
      await cargarBranchesDisponibles();
      
      // Cargar información actual de GitHub
      await cargarInfoGitHub();
      
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarBranchesDisponibles = async () => {
    try {
      // Valores por defecto seguros
      const defaultBranches = [
        { name: 'main', protected: true },
        { name: 'develop', protected: false }
      ];

      const [frontendResponse, backendResponse] = await Promise.all([
        githubService.obtenerBranchesRepositorio('frontend').catch(e => {
          console.warn('Error cargando branches frontend:', e.message);
          return { success: false, error: e.message };
        }),
        githubService.obtenerBranchesRepositorio('backend').catch(e => {
          console.warn('Error cargando branches backend:', e.message);
          return { success: false, error: e.message };
        })
      ]);

      // Validar y filtrar branches válidos
      const validarBranches = (branches) => {
        if (!Array.isArray(branches)) return defaultBranches;
        
        return branches.filter(branch => 
          branch && 
          typeof branch.name === 'string' && 
          branch.name.trim() && 
          branch.name.length < 100 && // Evitar nombres muy largos
          !/[^\w\-./_]/.test(branch.name) // Solo caracteres válidos para branches
        );
      };

      const frontendBranches = frontendResponse.success 
        ? validarBranches(frontendResponse.data) 
        : defaultBranches;
        
      const backendBranches = backendResponse.success 
        ? validarBranches(backendResponse.data) 
        : defaultBranches;

      setBranchesDisponibles({
        frontend: frontendBranches.length > 0 ? frontendBranches : defaultBranches,
        backend: backendBranches.length > 0 ? backendBranches : defaultBranches
      });

      // Asegurar que formCrearPR tenga un baseBranch válido
      setFormCrearPR(prev => ({
        ...prev,
        baseBranch: prev.baseBranch && 
                   (frontendBranches.some(b => b.name === prev.baseBranch) || 
                    backendBranches.some(b => b.name === prev.baseBranch)) 
                   ? prev.baseBranch 
                   : 'main'
      }));

    } catch (error) {
      console.error('Error cargando branches:', error);
      // Valores por defecto seguros
      const defaultBranches = [
        { name: 'main', protected: true },
        { name: 'develop', protected: false }
      ];
      
      setBranchesDisponibles({
        frontend: defaultBranches,
        backend: defaultBranches
      });
      
      // Asegurar baseBranch válido
      setFormCrearPR(prev => ({ ...prev, baseBranch: 'main' }));
    }
  };

  const cargarInfoGitHub = async () => {
    try {
      console.log('🔄 Iniciando carga de info GitHub para solicitud:', solicitud?.id_sol);
      
      const response = await githubService.obtenerInfoGitHub(solicitud.id_sol);
      console.log('📦 Respuesta recibida de githubService:', response);
      
      if (response.success) {
        console.log('✨ Actualizando estado con datos:', response.data);
        setInfoGitHub(response.data);
        
        // Actualizar formulario de PR con datos existentes
        if (response.data.github_branch_name) {
          console.log('🌿 Branch encontrado:', response.data.github_branch_name);
          setFormCrearPR(prev => ({
            ...prev,
            branchName: response.data.github_branch_name
          }));
        }
      } else {
        console.log('⚠️ Respuesta sin éxito:', response);
      }
    } catch (error) {
      console.error('❌ Error cargando info GitHub:', error);
      // No lanzar el error, manejarlo silenciosamente
    }
  };

  const handleTipoBranchChange = (branchType) => {
    const tipoSeleccionado = tiposGitFlow.find(t => t.type === branchType);
    setFormCrearBranch(prev => ({
      ...prev,
      branchType,
      baseBranch: tipoSeleccionado?.defaultBase || 'main'
    }));
  };

  const handleCrearBranch = async () => {
    try {
      setLoading(true);
      const response = await githubService.crearBranchGitFlow(
        solicitud.id_sol,
        formCrearBranch.branchType,
        formCrearBranch.baseBranch,
        formCrearBranch.repoType
      );

      if (response.success) {
        // Actualizar el estado local
        updateGitHubStatus({
          ...solicitud,
          github_branch_name: response.data.branchName
        });
        
        // Cerrar el formulario y actualizar la solicitud
        setShowCrearBranch(false);
        if (onSolicitudUpdate) {
          await onSolicitudUpdate();
        }
      }
    } catch (error) {
      console.error('Error creando branch:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCrearPR = async () => {
    try {
      setLoading(true);
      const response = await githubService.crearPullRequest(
        solicitud.id_sol,
        formCrearPR.branchName,
        formCrearPR.repoType,
        formCrearPR.baseBranch
      );

      if (response.success) {
        // Actualizar el estado local
        updateGitHubStatus({
          ...solicitud,
          github_pr_number: response.data.pullRequest.number,
          github_pr_url: response.data.pullRequest.url
        });
        
        // Cerrar el formulario y actualizar la solicitud
        setShowCrearPR(false);
        if (onSolicitudUpdate) {
          await onSolicitudUpdate();
        }
      }
    } catch (error) {
      console.error('Error creando PR:', error);
    } finally {
      setLoading(false);
    }
  };

  const validarTokenPersonal = async () => {
    if (!user?.github_token) {
      alert('No tienes un token GitHub configurado en tu perfil.');
      return;
    }

    try {
      setValidatingToken(true);
      
      const response = await githubService.validarTokenPersonal(user.github_token);
      
      if (response.success) {
        setTokenValidation(response.data);
        
        if (response.data.valid) {
          alert(`Token válido ✅\nUsuario: ${response.data.user.login}\nNombre: ${response.data.user.name || 'No especificado'}`);
        } else {
          alert(`Token inválido ❌\n${response.data.error}`);
        }
      }
    } catch (error) {
      console.error('Error validando token:', error);
      alert('Error validando token: ' + (error.response?.data?.message || error.message));
    } finally {
      setValidatingToken(false);
    }
  };

  if (loading && !infoGitHub) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card 
      sx={{ 
        height: '100%', 
        p: 2,
        bgcolor: 'background.paper',
        boxShadow: 1,
        '& .MuiPaper-root': {
          boxShadow: 'none'
        }
      }}
    >
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <GitHub sx={{ mr: 1 }} />
          <Typography variant="h6">
            Integración con GitHub
          </Typography>
        </Box>

        {/* Estado actual */}
        <Box>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            Estado actual de la integración
          </Typography>
          
          <Stack spacing={1.5} sx={{ mt: 2 }}>
            <Box display="flex" alignItems="center">
              <Create sx={{ mr: 1, fontSize: 20, color: githubStatus.hasBranch ? 'success.main' : 'text.disabled' }} />
              <Typography variant="body2" sx={{ minWidth: 80 }}>Branch:</Typography>
              {githubStatus.hasBranch ? (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    bgcolor: 'success.main',
                    color: 'white',
                    py: 0.5,
                    px: 1,
                    borderRadius: 1,
                    maxWidth: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {githubStatus.currentBranch}
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No creado
                </Typography>
              )}
            </Box>

            <Box display="flex" alignItems="center">
              <CallMerge sx={{ mr: 1, fontSize: 20, color: githubStatus.hasPR ? 'success.main' : 'text.disabled' }} />
              <Typography variant="body2" sx={{ minWidth: 80 }}>Pull Request:</Typography>
              {githubStatus.hasPR ? (
                <Chip 
                  size="small"
                  label={`#${githubStatus.currentPR}`}
                  color="success"
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No creado
                </Typography>
              )}
            </Box>

            {githubStatus.prMerged && (
              <Box display="flex" alignItems="center">
                <CheckCircle sx={{ mr: 1, fontSize: 20, color: 'success.main' }} />
                <Typography variant="body2" sx={{ minWidth: 80 }}>Estado:</Typography>
                <Chip 
                  size="small"
                  label="Integrado"
                  color="success"
                />
              </Box>
            )}
          </Stack>
        </Box>

        <Divider />

        {/* Acciones de GitHub */}
        <Box>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            Acciones disponibles
          </Typography>

          <Stack spacing={2} sx={{ mt: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Create />}
              onClick={() => setShowCrearBranch(!showCrearBranch)}
              disabled={!canCreateBranch()}
              color={showCrearBranch ? "primary" : "inherit"}
            >
              Crear Branch
            </Button>

            {showCrearBranch && (
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Stack spacing={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Tipo de Branch</InputLabel>
                    <Select
                      value={formCrearBranch.branchType}
                      onChange={(e) => setFormCrearBranch({ ...formCrearBranch, branchType: e.target.value })}
                      label="Tipo de Branch"
                    >
                      {tiposGitFlow.map((tipo) => (
                        <MenuItem key={tipo.type} value={tipo.type}>
                          {tipo.description}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size="small">
                    <InputLabel>Repositorio</InputLabel>
                    <Select
                      value={formCrearBranch.repoType}
                      onChange={(e) => setFormCrearBranch({ ...formCrearBranch, repoType: e.target.value })}
                      label="Repositorio"
                    >
                      <MenuItem value="frontend">Frontend</MenuItem>
                      <MenuItem value="backend">Backend</MenuItem>
                    </Select>
                  </FormControl>

                  <Button
                    variant="contained"
                    onClick={handleCrearBranch}
                    disabled={loading}
                  >
                    {loading ? 'Creando...' : 'Crear Branch'}
                  </Button>
                </Stack>
              </Paper>
            )}

            <Button
              fullWidth
              variant="outlined"
              startIcon={<CallMerge />}
              onClick={() => setShowCrearPR(!showCrearPR)}
              disabled={!canCreatePR()}
              color={showCrearPR ? "primary" : "inherit"}
            >
              Crear Pull Request
            </Button>

            {showCrearPR && (
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Stack spacing={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Repositorio</InputLabel>
                    <Select
                      value={formCrearPR.repoType}
                      onChange={(e) => setFormCrearPR({ ...formCrearPR, repoType: e.target.value })}
                      label="Repositorio"
                    >
                      <MenuItem value="frontend">Frontend</MenuItem>
                      <MenuItem value="backend">Backend</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size="small">
                    <InputLabel>Branch Base</InputLabel>
                    <Select
                      value={formCrearPR.baseBranch}
                      onChange={(e) => setFormCrearPR({ ...formCrearPR, baseBranch: e.target.value })}
                      label="Branch Base"
                    >
                      {branchesDisponibles[formCrearPR.repoType].map((branch) => (
                        <MenuItem key={branch.name} value={branch.name}>
                          {branch.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Button
                    variant="contained"
                    onClick={handleCrearPR}
                    disabled={loading}
                  >
                    {loading ? 'Creando...' : 'Crear Pull Request'}
                  </Button>
                </Stack>
              </Paper>
            )}
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
};

export default GitHubSection; 