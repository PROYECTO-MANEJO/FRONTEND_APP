import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import {
  Close,
  Save,
  PriorityHigh,
  Settings,
  Assessment,
  Engineering,
  Schedule,
  GitHub,
  Sync,
  OpenInNew,
  Add,
  Code,
  CallMerge
} from '@mui/icons-material';
import solicitudesService from '../../services/solicitudesService';
import githubService from '../../services/githubService';

const GestionTecnicaSolicitud = ({ 
  open, 
  onClose, 
  solicitud, 
  onGestionCompleta 
}) => {
  const [formData, setFormData] = useState({
    // =========================================
    // CAMPOS BÁSICOS DE GESTIÓN
    // =========================================
    estado_sol: '',
    prioridad_sol: '',
    comentarios_admin_sol: '',
    comentarios_internos_sol: '',
    
    // =========================================
    // ANÁLISIS DE RIESGO Y CATEGORIZACIÓN
    // =========================================
    riesgo_cambio_sol: '',
    categoria_cambio_sol: '',
    comentarios_tecnicos_sol: '',
    
    // =========================================
    // ANÁLISIS DE IMPACTO
    // =========================================
    impacto_negocio_sol: '',
    impacto_tecnico_sol: '',
    tiempo_inactividad_estimado_sol: '',
    
    // =========================================
    // PLANES DE IMPLEMENTACIÓN
    // =========================================
    plan_implementacion_sol: '',
    plan_rollout_sol: '',
    plan_backout_sol: '',
    plan_rollback_sol: '',
    plan_testing_sol: '',
    observaciones_implementacion_sol: '',
    
    // =========================================
    // PLANIFICACIÓN TEMPORAL
    // =========================================
    fecha_planificada_inicio_sol: '',
    hora_planificada_inicio_sol: '',
    fecha_planificada_fin_sol: '',
    hora_planificada_fin_sol: '',
    
    fecha_real_inicio_sol: '',
    hora_real_inicio_sol: '',
    fecha_real_fin_sol: '',
    hora_real_fin_sol: '',
    
    tiempo_estimado_horas_sol: '',
    tiempo_real_horas_sol: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Estados para GitHub
  const [githubInfo, setGithubInfo] = useState(null);
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubError, setGithubError] = useState(null);
  const [githubConfig, setGithubConfig] = useState(null);
  const [selectedRepo, setSelectedRepo] = useState('frontend');
  
  // Estados para creación de branches y PRs
  const [creandoBranch, setCreandoBranch] = useState(false);
  const [creandoPR, setCreandoPR] = useState(false);
  const [baseBranch, setBaseBranch] = useState('main');
  const [mostrarCrearBranch, setMostrarCrearBranch] = useState(false);
  const [mostrarCrearPR, setMostrarCrearPR] = useState(false);
  const [branchInfoDetallada, setBranchInfoDetallada] = useState(null);

  // Opciones para selects
  const riesgos = solicitudesService.getOpcionesRiesgo();
  const categorias = solicitudesService.getOpcionesCategoria();
  const estados = solicitudesService.getOpcionesEstado();
  const prioridades = solicitudesService.getOpcionesPrioridad();

  useEffect(() => {
    if (solicitud) {
      // Cargar información de GitHub
      loadGithubInfo();
      loadGithubConfig();
      
      setFormData({
        // =========================================
        // CAMPOS BÁSICOS DE GESTIÓN
        // =========================================
        estado_sol: solicitud.estado_sol || '',
        prioridad_sol: solicitud.prioridad_sol || '',
        comentarios_admin_sol: solicitud.comentarios_admin_sol || '',
        comentarios_internos_sol: solicitud.comentarios_internos_sol || '',
        
        // =========================================
        // ANÁLISIS DE RIESGO Y CATEGORIZACIÓN
        // =========================================
        riesgo_cambio_sol: solicitud.riesgo_cambio_sol || '',
        categoria_cambio_sol: solicitud.categoria_cambio_sol || '',
        comentarios_tecnicos_sol: solicitud.comentarios_tecnicos_sol || '',
        
        // =========================================
        // ANÁLISIS DE IMPACTO
        // =========================================
        impacto_negocio_sol: solicitud.impacto_negocio_sol || '',
        impacto_tecnico_sol: solicitud.impacto_tecnico_sol || '',
        tiempo_inactividad_estimado_sol: solicitud.tiempo_inactividad_estimado_sol || '',
        
        // =========================================
        // PLANES DE IMPLEMENTACIÓN
        // =========================================
        plan_implementacion_sol: solicitud.plan_implementacion_sol || '',
        plan_rollout_sol: solicitud.plan_rollout_sol || '',
        plan_backout_sol: solicitud.plan_backout_sol || '',
        plan_rollback_sol: solicitud.plan_rollback_sol || '',
        plan_testing_sol: solicitud.plan_testing_sol || '',
        observaciones_implementacion_sol: solicitud.observaciones_implementacion_sol || '',
        
        // =========================================
        // PLANIFICACIÓN TEMPORAL
        // =========================================
        fecha_planificada_inicio_sol: solicitud.fecha_planificada_inicio_sol ? 
          solicitud.fecha_planificada_inicio_sol.split('T')[0] : '',
        hora_planificada_inicio_sol: solicitud.hora_planificada_inicio_sol || '',
        fecha_planificada_fin_sol: solicitud.fecha_planificada_fin_sol ? 
          solicitud.fecha_planificada_fin_sol.split('T')[0] : '',
        hora_planificada_fin_sol: solicitud.hora_planificada_fin_sol || '',
        
        fecha_real_inicio_sol: solicitud.fecha_real_inicio_sol ? 
          solicitud.fecha_real_inicio_sol.split('T')[0] : '',
        hora_real_inicio_sol: solicitud.hora_real_inicio_sol || '',
        fecha_real_fin_sol: solicitud.fecha_real_fin_sol ? 
          solicitud.fecha_real_fin_sol.split('T')[0] : '',
        hora_real_fin_sol: solicitud.hora_real_fin_sol || '',
        
        tiempo_estimado_horas_sol: solicitud.tiempo_estimado_horas_sol || '',
        tiempo_real_horas_sol: solicitud.tiempo_real_horas_sol || ''
      });
    }
  }, [solicitud]);

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Funciones para GitHub
  const loadGithubConfig = async () => {
    try {
      const response = await githubService.obtenerEstadoConfiguracion();
      setGithubConfig(response.data);
    } catch (error) {
      console.error('Error cargando configuración de GitHub:', error);
    }
  };

  const loadGithubInfo = async () => {
    if (!solicitud?.id_sol) return;
    
    try {
      setGithubLoading(true);
      setGithubError(null);
      const response = await githubService.obtenerInfoGitHub(solicitud.id_sol);
      setGithubInfo(response.data);
    } catch (error) {
      setGithubError(error.response?.data?.message || 'Error cargando información de GitHub');
    } finally {
      setGithubLoading(false);
    }
  };

  const handleSyncGithub = async () => {
    if (!solicitud?.id_sol) return;
    
    try {
      setGithubLoading(true);
      setGithubError(null);
      await githubService.sincronizarSolicitud(solicitud.id_sol);
      await loadGithubInfo(); // Recargar información
    } catch (error) {
      setGithubError(error.response?.data?.message || 'Error sincronizando con GitHub');
    } finally {
      setGithubLoading(false);
    }
  };

  const handleSyncRepoEspecifico = async () => {
    if (!solicitud?.id_sol || !selectedRepo) return;
    
    try {
      setGithubLoading(true);
      setGithubError(null);
      await githubService.sincronizarSolicitudEnRepo(solicitud.id_sol, selectedRepo);
      await loadGithubInfo(); // Recargar información
    } catch (error) {
      setGithubError(error.response?.data?.message || 'Error sincronizando repositorio específico');
    } finally {
      setGithubLoading(false);
    }
  };



  // Función para crear un nuevo branch
  const handleCrearBranch = async () => {
    if (!solicitud?.id_sol) return;
    
    try {
      setCreandoBranch(true);
      setGithubError(null);
      await githubService.crearBranch(solicitud.id_sol, selectedRepo, baseBranch);
      await loadGithubInfo(); // Recargar información
      setMostrarCrearBranch(false);
      setBaseBranch('main');
    } catch (error) {
      setGithubError(error.response?.data?.message || 'Error creando branch');
    } finally {
      setCreandoBranch(false);
    }
  };

  // Función para crear Pull Request
  const handleCrearPR = async () => {
    if (!solicitud?.id_sol || !githubInfo?.branch?.name) return;
    
    try {
      setCreandoPR(true);
      setGithubError(null);
      await githubService.crearPullRequest(
        solicitud.id_sol, 
        githubInfo.branch.name, 
        selectedRepo, 
        baseBranch
      );
      await loadGithubInfo(); // Recargar información
      setMostrarCrearPR(false);
      setBaseBranch('main');
    } catch (error) {
      setGithubError(error.response?.data?.message || 'Error creando Pull Request');
    } finally {
      setCreandoPR(false);
    }
  };

  // Función para obtener información detallada del branch
  const handleObtenerInfoBranch = async (branchName) => {
    if (!branchName) return;
    
    try {
      setGithubLoading(true);
      const response = await githubService.obtenerInfoBranch(branchName, selectedRepo);
      setBranchInfoDetallada(response.data);
    } catch (error) {
      setGithubError(error.response?.data?.message || 'Error obteniendo información del branch');
    } finally {
      setGithubLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Si la solicitud no ha sido respondida aún, usar responderSolicitud
      const esRespuestaInicial = !solicitud.fec_respuesta_sol && 
                                ['PENDIENTE', 'EN_REVISION'].includes(solicitud.estado_sol);
      
      if (esRespuestaInicial) {
        // Para respuesta inicial, enviar solo campos básicos
        const datosRespuesta = {
          estado_sol: formData.estado_sol,
          prioridad_sol: formData.prioridad_sol,
          comentarios_admin_sol: formData.comentarios_admin_sol,
          comentarios_internos_sol: formData.comentarios_internos_sol
        };
        await solicitudesService.responderSolicitud(solicitud.id_sol, datosRespuesta);
      }
      
      // Siempre enviar gestión técnica para campos avanzados
      await solicitudesService.gestionarSolicitudTecnica(solicitud.id_sol, formData);
      
      onGestionCompleta();
      onClose();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!solicitud) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: { height: '90vh' }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        bgcolor: '#f5f5f5'
      }}>
        <Typography variant="h6">
          Gestión Completa de Solicitud
        </Typography>
        <Button
          onClick={onClose}
          size="small"
          sx={{ minWidth: 'auto', p: 1 }}
        >
          <Close />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Información de la Solicitud */}
        <Card elevation={1} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {solicitud?.titulo_sol}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip 
                label={solicitud?.estado_sol} 
                size="small"
                sx={{ 
                  bgcolor: solicitudesService.getColorPorEstado(solicitud?.estado_sol),
                  color: 'white'
                }}
              />
              <Chip 
                label={solicitud?.prioridad_sol} 
                size="small"
                sx={{ 
                  bgcolor: solicitudesService.getColorPorPrioridad(solicitud?.prioridad_sol),
                  color: 'white'
                }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {solicitud?.descripcion_sol}
            </Typography>
          </CardContent>
        </Card>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Sección 1: Gestión Básica */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <Settings sx={{ color: '#6d1313' }} />
            <Typography variant="h6" sx={{ color: '#6d1313', fontWeight: 'bold' }}>
              Gestión Básica
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Estado de la Solicitud *</InputLabel>
              <Select
                value={formData.estado_sol}
                onChange={handleChange('estado_sol')}
                label="Estado de la Solicitud *"
              >
                {estados.map((estado) => (
                  <MenuItem key={estado.value} value={estado.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: estado.color
                        }}
                      />
                      <Box sx={{ flexGrow: 1 }}>
                        {estado.label}
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Prioridad *</InputLabel>
              <Select
                value={formData.prioridad_sol}
                onChange={handleChange('prioridad_sol')}
                label="Prioridad *"
              >
                {prioridades.map((prioridad) => (
                  <MenuItem key={prioridad.value} value={prioridad.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PriorityHigh sx={{ fontSize: 20, color: prioridad.color }} />
                      {prioridad.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Comentarios para el Usuario"
              value={formData.comentarios_admin_sol}
              onChange={handleChange('comentarios_admin_sol')}
              placeholder="Comentarios que verá el usuario sobre la decisión..."
              helperText="Este comentario será visible para el usuario que hizo la solicitud"
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Comentarios Internos (Equipo de Desarrollo)"
              value={formData.comentarios_internos_sol}
              onChange={handleChange('comentarios_internos_sol')}
              placeholder="Instrucciones técnicas, notas para desarrolladores..."
              helperText="Solo visible para administradores y desarrolladores"
            />
          </Box>
        </Paper>

        {/* Sección 2: Análisis de Riesgo y Categorización */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <Assessment sx={{ color: '#6d1313' }} />
            <Typography variant="h6" sx={{ color: '#6d1313', fontWeight: 'bold' }}>
              Análisis de Riesgo y Categorización
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Riesgo del Cambio *</InputLabel>
              <Select
                value={formData.riesgo_cambio_sol}
                onChange={handleChange('riesgo_cambio_sol')}
                label="Riesgo del Cambio *"
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                    },
                  },
                }}
                renderValue={(selected) => {
                  const riesgo = riesgos.find(r => r.value === selected);
                  return riesgo ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 10,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: riesgo.color
                        }}
                      />
                      {riesgo.label}
                    </Box>
                  ) : '';
                }}
              >
                {riesgos.map((riesgo) => (
                  <MenuItem key={riesgo.value} value={riesgo.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: riesgo.color,
                          flexShrink: 0
                        }}
                      />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          {riesgo.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {riesgo.description}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Categoría del Cambio *</InputLabel>
              <Select
                value={formData.categoria_cambio_sol}
                onChange={handleChange('categoria_cambio_sol')}
                label="Categoría del Cambio *"
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                    },
                  },
                }}
                renderValue={(selected) => {
                  const categoria = categorias.find(c => c.value === selected);
                  return categoria ? categoria.label : '';
                }}
              >
                {categorias.map((categoria) => (
                  <MenuItem key={categoria.value} value={categoria.value}>
                    <Box sx={{ width: '100%' }}>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        {categoria.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {categoria.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Comentarios Técnicos"
              value={formData.comentarios_tecnicos_sol}
              onChange={handleChange('comentarios_tecnicos_sol')}
              placeholder="Análisis técnico, consideraciones especiales, dependencias..."
            />
          </Box>
        </Paper>

        {/* Sección 3: Análisis de Impacto */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <Assessment sx={{ color: '#6d1313' }} />
            <Typography variant="h6" sx={{ color: '#6d1313', fontWeight: 'bold' }}>
              Análisis de Impacto
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Impacto en el Negocio *"
              value={formData.impacto_negocio_sol}
              onChange={handleChange('impacto_negocio_sol')}
              placeholder="Describe cómo afectará este cambio a los procesos de negocio..."
              required
            />
            
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Impacto Técnico *"
              value={formData.impacto_tecnico_sol}
              onChange={handleChange('impacto_tecnico_sol')}
              placeholder="Describe el impacto técnico en sistemas, bases de datos, integraciones..."
              required
            />

            <TextField
              fullWidth
              label="Tiempo de Inactividad Estimado"
              value={formData.tiempo_inactividad_estimado_sol}
              onChange={handleChange('tiempo_inactividad_estimado_sol')}
              placeholder="Ej: 2 horas, 30 minutos, Sin inactividad"
              helperText="Tiempo estimado que el sistema estará fuera de servicio"
            />
          </Box>
        </Paper>

        {/* Sección 4: Planes de Implementación */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <Engineering sx={{ color: '#6d1313' }} />
            <Typography variant="h6" sx={{ color: '#6d1313', fontWeight: 'bold' }}>
              Planes de Implementación
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Plan de Implementación *"
              value={formData.plan_implementacion_sol}
              onChange={handleChange('plan_implementacion_sol')}
              placeholder="Pasos detallados para implementar el cambio..."
              required
            />
            
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Plan de Rollout *"
              value={formData.plan_rollout_sol}
              onChange={handleChange('plan_rollout_sol')}
              placeholder="Plan de despliegue gradual, fases de implementación..."
              required
              helperText="Estrategia de despliegue progresivo del cambio"
            />
            
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Plan de Backout *"
              value={formData.plan_backout_sol}
              onChange={handleChange('plan_backout_sol')}
              placeholder="Plan de contingencia si el cambio no funciona como esperado..."
              required
              helperText="Estrategia de salida de emergencia"
            />

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Plan de Rollback *"
              value={formData.plan_rollback_sol}
              onChange={handleChange('plan_rollback_sol')}
              placeholder="Pasos específicos para revertir completamente el cambio..."
              required
              helperText="Procedimiento técnico para volver al estado anterior"
            />
            
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Plan de Testing *"
              value={formData.plan_testing_sol}
              onChange={handleChange('plan_testing_sol')}
              placeholder="Casos de prueba, validaciones, criterios de aceptación..."
              required
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Observaciones de Implementación"
              value={formData.observaciones_implementacion_sol}
              onChange={handleChange('observaciones_implementacion_sol')}
              placeholder="Notas adicionales, precauciones especiales, coordinación necesaria..."
            />
          </Box>
        </Paper>

        {/* Sección 5: Integración con GitHub */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <GitHub sx={{ color: '#6d1313' }} />
            <Typography variant="h6" sx={{ color: '#6d1313', fontWeight: 'bold' }}>
              Integración con GitHub
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
              {githubConfig?.repositorios && githubConfig.repositorios.length > 1 && (
                <>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Repositorio</InputLabel>
                    <Select
                      value={selectedRepo}
                      label="Repositorio"
                      onChange={(e) => setSelectedRepo(e.target.value)}
                    >
                      {githubConfig.repositorios.map((repo) => (
                        <MenuItem key={repo.type} value={repo.type}>
                          {repo.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={githubLoading ? <CircularProgress size={16} /> : <Sync />}
                    onClick={handleSyncRepoEspecifico}
                    disabled={githubLoading}
                  >
                    Sync {selectedRepo}
                  </Button>
                </>
              )}
              <Button
                size="small"
                variant="outlined"
                startIcon={githubLoading ? <CircularProgress size={16} /> : <Sync />}
                onClick={handleSyncGithub}
                disabled={githubLoading}
              >
                {githubLoading ? 'Sincronizando...' : 'Sync Todos'}
              </Button>
            </Box>
          </Box>

          {githubError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {githubError}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Información actual de GitHub */}
            {githubInfo && (
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#6d1313', mb: 2 }}>
                  📋 Información Actual
                </Typography>

                {/* Mostrar información por repositorio si hay múltiples */}
                {githubInfo.repositories && Object.keys(githubInfo.repositories).length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Por Repositorio:
                    </Typography>
                    {Object.entries(githubInfo.repositories).map(([repoType, repoData]) => (
                      <Box key={repoType} sx={{ mb: 1, p: 1, bgcolor: '#f8f8f8', borderRadius: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                          {repoData.name} ({repoType})
                        </Typography>
                        {repoData.branches.length > 0 && (
                          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                            Branches: {repoData.branches.map(b => b.name).join(', ')}
                          </Typography>
                        )}
                        {repoData.pullRequests.length > 0 && (
                          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                            PRs: {repoData.pullRequests.map(pr => `#${pr.number}`).join(', ')}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Box>
                )}
                
                {githubInfo.github_branch_name && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Chip 
                      label={`Branch: ${githubInfo.github_branch_name}`}
                      color="primary" 
                      size="small"
                    />
                    {githubInfo.github_repo_url && (
                      <Button
                        size="small"
                        startIcon={<OpenInNew />}
                        onClick={() => window.open(githubInfo.github_repo_url, '_blank')}
                      >
                        Ver Repositorio
                      </Button>
                    )}
                  </Box>
                )}

                {githubInfo.github_pr_number && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Chip 
                      label={`PR #${githubInfo.github_pr_number}`}
                      color="secondary" 
                      size="small"
                    />
                    {githubInfo.github_pr_url && (
                      <Button
                        size="small"
                        startIcon={<OpenInNew />}
                        onClick={() => window.open(githubInfo.github_pr_url, '_blank')}
                      >
                        Ver Pull Request
                      </Button>
                    )}
                  </Box>
                )}

                {githubInfo.github_commits && Array.isArray(githubInfo.github_commits) && githubInfo.github_commits.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Commits Relacionados ({githubInfo.github_commits.length})
                    </Typography>
                    <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                      {githubService.formatearCommits(githubInfo.github_commits).slice(0, 5).map((commit, index) => (
                        <Box key={index} sx={{ p: 1, bgcolor: '#f5f5f5', borderRadius: 1, mb: 1 }}>
                          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                            {commit.shortSha} - {commit.author}
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            {commit.shortMessage}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {commit.formattedDate}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                {githubInfo.github_last_sync && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {githubService.obtenerEstadoSincronizacion(githubInfo.github_last_sync)}
                  </Typography>
                )}
              </Box>
            )}



            {/* Sección de Creación de Branches y PRs */}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#6d1313', mb: 2 }}>
                🚀 Crear Branch y Pull Request
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => setMostrarCrearBranch(!mostrarCrearBranch)}
                  color="success"
                >
                  {mostrarCrearBranch ? 'Ocultar' : 'Crear Branch'}
                </Button>
                
                {githubInfo?.github_branch_name && (
                  <Button
                    variant="outlined"
                    startIcon={<CallMerge />}
                    onClick={() => setMostrarCrearPR(!mostrarCrearPR)}
                    color="info"
                  >
                    {mostrarCrearPR ? 'Ocultar' : 'Crear Pull Request'}
                  </Button>
                )}
                
                {githubInfo?.github_branch_name && (
                  <Button
                    variant="outlined"
                    startIcon={<Code />}
                    onClick={() => handleObtenerInfoBranch(githubInfo.github_branch_name)}
                    size="small"
                  >
                    Ver Commits
                  </Button>
                )}
              </Box>

              {/* Formulario para crear branch */}
              {mostrarCrearBranch && (
                <Box sx={{ p: 2, bgcolor: '#e8f5e8', borderRadius: 1, mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Crear Nuevo Branch
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {githubConfig?.repositorios && githubConfig.repositorios.length > 1 && (
                      <FormControl fullWidth size="small">
                        <InputLabel>Repositorio Destino</InputLabel>
                        <Select
                          value={selectedRepo}
                          label="Repositorio Destino"
                          onChange={(e) => setSelectedRepo(e.target.value)}
                        >
                          {githubConfig.repositorios.map((repo) => (
                            <MenuItem key={repo.type} value={repo.type}>
                              {repo.name} ({repo.type})
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                    
                    <TextField
                      fullWidth
                      size="small"
                      label="Branch Base"
                      value={baseBranch}
                      onChange={(e) => setBaseBranch(e.target.value)}
                      placeholder="main"
                      helperText="Branch desde el cual crear el nuevo branch"
                    />
                    
                    <Alert severity="info" sx={{ fontSize: '0.85rem' }}>
                      Se creará automáticamente un branch con el nombre: <strong>SOL-{solicitud?.id_sol?.substring(0, 8)}-{solicitud?.titulo_sol?.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 30)}</strong>
                    </Alert>
                    
                    <Button
                      variant="contained"
                      startIcon={creandoBranch ? <CircularProgress size={16} /> : <Add />}
                      onClick={handleCrearBranch}
                      disabled={creandoBranch || !selectedRepo}
                      color="success"
                      sx={{ alignSelf: 'flex-start' }}
                    >
                      {creandoBranch ? 'Creando Branch...' : 'Crear Branch'}
                    </Button>
                  </Box>
                </Box>
              )}

              {/* Formulario para crear PR */}
              {mostrarCrearPR && githubInfo?.github_branch_name && (
                <Box sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 1, mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Crear Pull Request
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Alert severity="info" sx={{ fontSize: '0.85rem' }}>
                      Se creará un PR desde el branch <strong>{githubInfo.github_branch_name}</strong>
                    </Alert>
                    
                    {githubConfig?.repositorios && githubConfig.repositorios.length > 1 && (
                      <FormControl fullWidth size="small">
                        <InputLabel>Repositorio</InputLabel>
                        <Select
                          value={selectedRepo}
                          label="Repositorio"
                          onChange={(e) => setSelectedRepo(e.target.value)}
                        >
                          {githubConfig.repositorios.map((repo) => (
                            <MenuItem key={repo.type} value={repo.type}>
                              {repo.name} ({repo.type})
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                    
                    <TextField
                      fullWidth
                      size="small"
                      label="Branch Destino"
                      value={baseBranch}
                      onChange={(e) => setBaseBranch(e.target.value)}
                      placeholder="main"
                      helperText="Branch al cual hacer merge"
                    />
                    
                    <Button
                      variant="contained"
                      startIcon={creandoPR ? <CircularProgress size={16} /> : <CallMerge />}
                      onClick={handleCrearPR}
                      disabled={creandoPR || !githubInfo?.github_branch_name}
                      color="info"
                      sx={{ alignSelf: 'flex-start' }}
                    >
                      {creandoPR ? 'Creando PR...' : 'Crear Pull Request'}
                    </Button>
                  </Box>
                </Box>
              )}

              {/* Información detallada del branch */}
              {branchInfoDetallada && (
                <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1, mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                    📊 Información Detallada del Branch: {branchInfoDetallada.name}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body2">
                      <strong>Repositorio:</strong> {branchInfoDetallada.repository}
                    </Typography>
                    
                    <Typography variant="body2">
                      <strong>Último Commit:</strong> {branchInfoDetallada.lastCommit?.message}
                    </Typography>
                    
                    <Typography variant="body2">
                      <strong>Autor:</strong> {branchInfoDetallada.lastCommit?.author} 
                      ({githubService.formatearTiempo(branchInfoDetallada.lastCommit?.date)})
                    </Typography>
                    
                    <Button
                      size="small"
                      startIcon={<OpenInNew />}
                      onClick={() => window.open(branchInfoDetallada.url, '_blank')}
                      sx={{ alignSelf: 'flex-start', mt: 1 }}
                    >
                      Ver Branch en GitHub
                    </Button>
                    
                    {branchInfoDetallada.commits && branchInfoDetallada.commits.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" sx={{ fontWeight: 'bold', mb: 1, display: 'block' }}>
                          Últimos Commits ({branchInfoDetallada.commits.length})
                        </Typography>
                        <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                          {branchInfoDetallada.commits.slice(0, 5).map((commit, index) => (
                            <Box key={index} sx={{ p: 1, bgcolor: '#ffffff', borderRadius: 1, mb: 1, border: '1px solid #e0e0e0' }}>
                              <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                                {commit.sha.substring(0, 7)} - {commit.author}
                              </Typography>
                              <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                                {commit.message}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {githubService.formatearTiempo(commit.date)}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Paper>

        {/* Sección 6: Planificación y Recursos */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <Schedule sx={{ color: '#6d1313' }} />
            <Typography variant="h6" sx={{ color: '#6d1313', fontWeight: 'bold' }}>
              Planificación y Recursos
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Fechas y Horas Planificadas */}
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#6d1313', mb: 1 }}>
              📅 Fechas y Horas Planificadas
            </Typography>
            
            <TextField
              fullWidth
              type="date"
              label="Fecha Planificada de Inicio"
              value={formData.fecha_planificada_inicio_sol}
              onChange={handleChange('fecha_planificada_inicio_sol')}
              InputLabelProps={{ shrink: true }}
            />
            
            <TextField
              fullWidth
              type="time"
              label="Hora Planificada de Inicio"
              value={formData.hora_planificada_inicio_sol}
              onChange={handleChange('hora_planificada_inicio_sol')}
              InputLabelProps={{ shrink: true }}
              placeholder="19:00"
            />
            
            <TextField
              fullWidth
              type="date"
              label="Fecha Planificada de Fin"
              value={formData.fecha_planificada_fin_sol}
              onChange={handleChange('fecha_planificada_fin_sol')}
              InputLabelProps={{ shrink: true }}
            />
            
            <TextField
              fullWidth
              type="time"
              label="Hora Planificada de Fin"
              value={formData.hora_planificada_fin_sol}
              onChange={handleChange('hora_planificada_fin_sol')}
              InputLabelProps={{ shrink: true }}
              placeholder="17:00"
            />

            {/* Fechas y Horas Reales */}
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#6d1313', mb: 1, mt: 2 }}>
              ⏰ Fechas y Horas Reales de Ejecución
            </Typography>
            
            <TextField
              fullWidth
              type="date"
              label="Fecha Real de Inicio"
              value={formData.fecha_real_inicio_sol}
              onChange={handleChange('fecha_real_inicio_sol')}
              InputLabelProps={{ shrink: true }}
              helperText="Cuándo realmente comenzó"
            />
            
            <TextField
              fullWidth
              type="time"
              label="Hora Real de Inicio"
              value={formData.hora_real_inicio_sol}
              onChange={handleChange('hora_real_inicio_sol')}
              InputLabelProps={{ shrink: true }}
              helperText="Hora exacta de inicio"
            />
            
            <TextField
              fullWidth
              type="date"
              label="Fecha Real de Fin"
              value={formData.fecha_real_fin_sol}
              onChange={handleChange('fecha_real_fin_sol')}
              InputLabelProps={{ shrink: true }}
              helperText="Cuándo realmente terminó"
            />
            
            <TextField
              fullWidth
              type="time"
              label="Hora Real de Fin"
              value={formData.hora_real_fin_sol}
              onChange={handleChange('hora_real_fin_sol')}
              InputLabelProps={{ shrink: true }}
              helperText="Hora exacta de finalización"
            />

            {/* Otros campos de planificación */}
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#6d1313', mb: 1, mt: 2 }}>
              🔧 Recursos y Estimaciones
            </Typography>

            <TextField
              fullWidth
              type="number"
              label="Tiempo Estimado (horas)"
              value={formData.tiempo_estimado_horas_sol}
              onChange={handleChange('tiempo_estimado_horas_sol')}
              placeholder="Ej: 8"
            />

            <TextField
              fullWidth
              label="Ventana de Mantenimiento"
              value={formData.ventana_mantenimiento_sol}
              onChange={handleChange('ventana_mantenimiento_sol')}
              placeholder="Ej: Sábado 02:00-06:00"
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Recursos Técnicos Necesarios"
              value={formData.recursos_tecnicos_necesarios_sol}
              onChange={handleChange('recursos_tecnicos_necesarios_sol')}
              placeholder="Personal, herramientas, accesos especiales..."
            />
          </Box>
        </Paper>
      </DialogContent>

      <DialogActions sx={{ p: 3, bgcolor: '#f5f5f5' }}>
        <Button 
          onClick={onClose}
          variant="outlined"
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <Save />}
          sx={{
            bgcolor: '#6d1313',
            '&:hover': { bgcolor: '#5a1010' }
          }}
        >
          {loading ? 'Guardando...' : 'Guardar Gestión'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GestionTecnicaSolicitud; 