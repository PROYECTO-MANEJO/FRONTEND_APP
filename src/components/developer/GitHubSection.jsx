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

  useEffect(() => {
    console.log('🎯 GitHubSection useEffect - ID Solicitud:', solicitud?.id_sol);
    if (solicitud?.id_sol) {
      cargarDatosIniciales();
    } else {
      console.log('⚠️ No hay ID de solicitud disponible');
    }
  }, [solicitud?.id_sol]);

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
        alert(`Branch ${response.data.branch.alreadyExists ? 'ya existía' : 'creado exitosamente'}: ${response.data.branch.branchName}`);
        await cargarInfoGitHub();
        setShowCrearBranch(false);
        onSolicitudUpdate?.(response.data.solicitud);
      }
    } catch (error) {
      console.error('Error creando branch:', error);
      alert('Error creando branch: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCrearPR = async () => {
    try {
      setLoading(true);
      
      const response = await githubService.crearPullRequestDesarrollador(
        solicitud.id_sol,
        formCrearPR.branchName,
        formCrearPR.repoType,
        formCrearPR.baseBranch
      );

      if (response.success) {
        alert(`Pull Request creado exitosamente: #${response.data.pullRequest.number}\n\nLa solicitud cambió automáticamente a estado EN_TESTING para revisión del MASTER.`);
        await cargarInfoGitHub();
        setShowCrearPR(false);
        onSolicitudUpdate?.(response.data.solicitud);
      }
    } catch (error) {
      console.error('Error creando PR:', error);
      alert('Error creando Pull Request: ' + (error.response?.data?.message || error.message));
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
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <GitHub />
            Gestión de GitHub
          </Typography>
          
          {solicitud.github_repo_url && (
            <Button
              variant="outlined"
              startIcon={<Launch />}
              onClick={() => window.open(solicitud.github_repo_url, '_blank')}
              size="small"
            >
              Ver en GitHub
            </Button>
          )}
        </Box>
        
        <Stack spacing={1} sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            color="secondary"
            size="small"
            fullWidth
            startIcon={<Security />}
            onClick={validarTokenPersonal}
            disabled={validatingToken || !user?.github_token}
            title={!user?.github_token ? 'Configura tu token GitHub en el perfil' : 'Validar token GitHub personal'}
          >
            {validatingToken ? 'Validando...' : 'Validar Token'}
          </Button>
          
          <Button
            variant="outlined"
            color="primary"
            size="small"
            fullWidth
            startIcon={<Create />}
            onClick={() => setShowCrearBranch(!showCrearBranch)}
            disabled={loading}
          >
            Crear Branch
          </Button>
          
          <Button
            variant="outlined"
            color="success"
            size="small"
            fullWidth
            startIcon={<CallMerge />}
            onClick={() => setShowCrearPR(!showCrearPR)}
            disabled={loading}
          >
            Crear PR
          </Button>
        </Stack>

        {/* Información compacta */}
        {githubConfigError && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              GitHub no configurado - Funcionalidad limitada
            </Typography>
          </Alert>
        )}

        {tokenValidation && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">Token GitHub:</Typography>
            <Chip 
              label={tokenValidation.valid ? `${tokenValidation.user?.login || 'Válido'}` : 'Inválido'} 
              color={tokenValidation.valid ? 'success' : 'error'}
              size="small"
              sx={{ mt: 0.5 }}
            />
          </Box>
        )}

        {/* Estado actual compacto */}
        {infoGitHub && (
          <Box sx={{ mb: 2 }}>
            {console.log('🔍 Datos completos de GitHub:', infoGitHub)}
            {console.log('🌿 Branch name:', infoGitHub.github_branch_name)}
            {infoGitHub.github_branch_name && (
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Branch:</Typography>
                {console.log('🌿 Renderizando branch:', {
                  nombre: infoGitHub.github_branch_name,
                  repositorio: infoGitHub.github_repository,
                  repoUrl: infoGitHub.github_repo_url
                })}
                <Chip 
                  label={infoGitHub.github_branch_name} 
                  color="primary" 
                  size="small"
                  variant="outlined"
                  sx={{ mt: 0.5 }}
                />
              </Box>
            )}
            
            {console.log('🔄 PR number:', infoGitHub.github_pr_number)}
            {infoGitHub.github_pr_number && (
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Pull Request:</Typography>
                {console.log('🔄 Renderizando PR:', {
                  número: infoGitHub.github_pr_number,
                  url: infoGitHub.github_pr_url,
                  estado: infoGitHub.github_pr_state,
                  fusionadoEn: infoGitHub.github_merged_at
                })}
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Launch />}
                  href={infoGitHub.github_pr_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ mt: 0.5 }}
                >
                  #{infoGitHub.github_pr_number}
                </Button>
              </Box>
            )}
          </Box>
        )}

        {/* Formularios compactos */}
        {showCrearBranch && (
          <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Crear Branch</Typography>
            <Stack spacing={1}>
              <FormControl fullWidth size="small">
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={formCrearBranch.branchType}
                  label="Tipo"
                  onChange={(e) => handleTipoBranchChange(e.target.value)}
                >
                  {tiposGitFlow.map(tipo => (
                    <MenuItem key={tipo.type} value={tipo.type}>
                      {tipo.type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth size="small">
                <InputLabel>Base</InputLabel>
                <Select
                  value={formCrearBranch.baseBranch}
                  label="Base"
                  onChange={(e) => setFormCrearBranch(prev => ({ ...prev, baseBranch: e.target.value }))}
                >
                  {branchesDisponibles[formCrearBranch.repoType]?.map(branch => (
                    <MenuItem key={branch.name} value={branch.name}>
                      {branch.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth size="small">
                <InputLabel>Repo</InputLabel>
                <Select
                  value={formCrearBranch.repoType}
                  label="Repo"
                  onChange={(e) => setFormCrearBranch(prev => ({ ...prev, repoType: e.target.value }))}
                >
                  <MenuItem value="frontend">Frontend</MenuItem>
                  <MenuItem value="backend">Backend</MenuItem>
                </Select>
              </FormControl>
              
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setShowCrearBranch(false)}
                  disabled={loading}
                  fullWidth
                >
                  Cancelar
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleCrearBranch}
                  disabled={loading}
                  fullWidth
                >
                  {loading ? 'Creando...' : 'Crear'}
                </Button>
              </Stack>
            </Stack>
          </Box>
        )}

        {showCrearPR && (
          <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Crear Pull Request</Typography>
            <Stack spacing={1}>
              <TextField
                fullWidth
                size="small"
                label="Nombre del Branch"
                value={formCrearPR.branchName}
                onChange={(e) => setFormCrearPR(prev => ({ ...prev, branchName: e.target.value }))}
                placeholder="feature/12345_mi_branch"
              />
              
              <FormControl fullWidth size="small">
                <InputLabel>Base</InputLabel>
                <Select
                  value={formCrearPR.baseBranch}
                  label="Base"
                  onChange={(e) => setFormCrearPR(prev => ({ ...prev, baseBranch: e.target.value }))}
                >
                  {branchesDisponibles[formCrearPR.repoType]?.map(branch => (
                    <MenuItem key={branch.name} value={branch.name}>
                      {branch.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth size="small">
                <InputLabel>Repo</InputLabel>
                <Select
                  value={formCrearPR.repoType}
                  label="Repo"
                  onChange={(e) => setFormCrearPR(prev => ({ ...prev, repoType: e.target.value }))}
                >
                  <MenuItem value="frontend">Frontend</MenuItem>
                  <MenuItem value="backend">Backend</MenuItem>
                </Select>
              </FormControl>
              
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setShowCrearPR(false)}
                  disabled={loading}
                  fullWidth
                >
                  Cancelar
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  color="success"
                  onClick={handleCrearPR}
                  disabled={loading || !formCrearPR.branchName}
                  fullWidth
                >
                  {loading ? 'Creando...' : 'Crear'}
                </Button>
              </Stack>
            </Stack>
          </Box>
        )}

        {/* Información de estado automático */}
        {solicitud.estado_sol === 'EN_TESTING' && infoGitHub?.github_pr_number && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              El PR fue creado y la solicitud pasó automáticamente a revisión del MASTER.
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default GitHubSection; 