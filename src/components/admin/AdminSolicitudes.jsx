import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Pagination,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Avatar,
  Tooltip,
  Badge,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormHelperText
} from '@mui/material';
import {
  Visibility,
  FilterList,
  Refresh,
  Check,
  Close,
  Assignment,
  Person,
  AccessTime,
  RequestPage,
  Settings,
  Clear,
  AdminPanelSettings,
  Done,
  CallMerge,
  GitHub,
  Warning,
  Code,
  Commit,
  Add,
  Remove,
  Edit,
  Description,
  Schedule,
  AccountCircle
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import solicitudesAdminService from '../../services/solicitudesAdminService';
import solicitudesService from '../../services/solicitudesService';
import AdminSidebar from './AdminSidebar';
import { useSidebarLayout } from '../../hooks/useSidebarLayout';
import { es } from 'date-fns/locale';

const AdminSolicitudes = () => {
  const { getMainContentStyle } = useSidebarLayout();
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const [dialogDetalles, setDialogDetalles] = useState(false);
  const [dialogGestion, setDialogGestion] = useState(false);
  const [dialogAccion, setDialogAccion] = useState(false);
  const [dialogRevisionPR, setDialogRevisionPR] = useState(false);
  const [dialogRechazoPR, setDialogRechazoPR] = useState(false);
  const [loadingPR, setLoadingPR] = useState(false);
  const [prInfo, setPrInfo] = useState(null);

  // Abrir modal de revisión de PR
  const abrirRevisionPR = async (solicitud) => {
    try {
      setSelectedSolicitud(solicitud);
      setDialogRevisionPR(true);
      setLoadingPR(true);
      
      // Obtener múltiples PRs de la solicitud
      const response = await solicitudesAdminService.obtenerMultiplesPRs(solicitud.id_sol);
      if (response.success) {
        setPrInfo(response.data || []);
      } else {
        setError('No se pudo cargar la información de los PRs');
        setPrInfo([]);
      }
    } catch (err) {
      setError('Error al cargar información de los PRs: ' + err.message);
      setPrInfo([]);
    } finally {
      setLoadingPR(false);
    }
  };

  const [desarrolladores, setDesarrolladores] = useState({
    success: false,
    data: []
  });
  const [loadingDesarrolladores, setLoadingDesarrolladores] = useState(false);
  const [errorDesarrolladores, setErrorDesarrolladores] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);
  
  // Estados para el formulario de rechazo de PR
  const [comentarioUsuario, setComentarioUsuario] = useState('');
  const [comentarioDesarrollador, setComentarioDesarrollador] = useState('');
  
  // Estados para múltiples PRs
  const [tabActivoPR, setTabActivoPR] = useState(0);
  const [comentariosPR, setComentariosPR] = useState({});
  const [procesandoPR, setProcesandoPR] = useState({});
  
  // Filtros y paginación
  const [filtros, setFiltros] = useState({
    estado: '',
    tipo_cambio: '',
    prioridad: '',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Formulario de gestión master
  const [gestionForm, setGestionForm] = useState({
    impacto_negocio_sol: '',
    impacto_tecnico_sol: '',
    riesgo_cambio_sol: '',
    categoria_cambio_sol: '',
    comentarios_admin_sol: '',
    fecha_planificada_inicio_sol: null,
    fecha_planificada_fin_sol: null,
    hora_planificada_inicio_sol: '',
    hora_planificada_fin_sol: '',
    tiempo_estimado_horas_sol: '',
    id_desarrollador_asignado: '',
    // Nuevos campos para planes técnicos
    plan_implementacion_sol: '',
    plan_rollout_sol: '',
    plan_backout_sol: '',
    plan_testing_sol: ''
  });

  // Formulario de aprobación/rechazo
  const [accionForm, setAccionForm] = useState({
    accion: '', // 'aprobar' | 'rechazar'
    comentarios_admin_sol: '',
    motivo_rechazo: ''
  });

  const tiposCambio = solicitudesService.obtenerTiposCambio();
  const prioridades = solicitudesService.obtenerPrioridades();

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await solicitudesAdminService.obtenerTodasLasSolicitudes(filtros);
        console.log('DATOS EXACTOS RECIBIDOS EN EL COMPONENTE:', response);
        setSolicitudes(response.solicitudes || []);
        setPagination(response.pagination || {});
      } catch (err) {
        console.error('Error al cargar solicitudes:', err);
        setError('Error al cargar solicitudes: ' + err.message);
        setSolicitudes([]);
      } finally {
        setLoading(false);
      }
    };

    const cargarStats = async () => {
      try {
        const response = await solicitudesAdminService.obtenerEstadisticasAdmin();
        setEstadisticas(response.data);
      } catch (err) {
        console.error('Error al cargar estadísticas:', err);
      }
    };

    cargarDatos();
    cargarStats();
  }, [filtros]);

  // Efecto para cargar desarrolladores al montar el componente
  useEffect(() => {
    const inicializarDesarrolladores = async () => {
      try {
        console.log('🚀 Iniciando carga inicial de desarrolladores...');
        await cargarDesarrolladores();
      } catch (error) {
        console.error('❌ Error en carga inicial de desarrolladores:', error);
      }
    };
    
    inicializarDesarrolladores();
  }, []); // Solo se ejecuta al montar el componente

  // Effect para debuggear cambios en desarrolladores
  useEffect(() => {
    console.log('🔄 useEffect - Desarrolladores cambiaron:', {
      cantidad: desarrolladores.data.length,
      loading: loadingDesarrolladores,
      error: errorDesarrolladores,
      desarrolladores: desarrolladores.data.map(d => ({ id: d.id_usu, nombre: d.nombre_completo }))
    });
  }, [desarrolladores, loadingDesarrolladores, errorDesarrolladores]);

  const cargarDesarrolladores = async () => {
    try {
      setLoadingDesarrolladores(true);
      setErrorDesarrolladores(null);
      console.log('🔄 Iniciando carga de desarrolladores...');
      
      const response = await solicitudesAdminService.obtenerDesarrolladores();
      console.log('📥 DATOS EXACTOS RECIBIDOS EN EL COMPONENTE:', response);
      
      // Validar la estructura de la respuesta
      if (!response || typeof response !== 'object') {
        throw new Error('Respuesta inválida del servicio');
      }

      // Asegurarnos de que tenemos la estructura correcta
      const desarrolladoresData = {
        success: response.success || false,
        data: Array.isArray(response.data) ? response.data : []
      };

      console.log('🔄 Actualizando estado con desarrolladores:', desarrolladoresData);
      setDesarrolladores(desarrolladoresData);
      console.log('🔄 Desarrolladores actualizados en el estadoaaaaaaaa:', desarrolladores);
      setErrorDesarrolladores(null);
    } catch (error) {
      console.error('❌ Error al cargar desarrolladores:', error);
      setErrorDesarrolladores(error.message || 'Error al cargar desarrolladores');
      setDesarrolladores({ success: false, data: [] });
    } finally {
      setLoadingDesarrolladores(false);
    }
  };

  const cargarSolicitudes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await solicitudesAdminService.obtenerTodasLasSolicitudes(filtros);
      setSolicitudes(response.solicitudes || []);
      setPagination(response.pagination || {});
    } catch (err) {
      console.error('Error al cargar solicitudes:', err);
      setError('Error al cargar solicitudes: ' + err.message);
      setSolicitudes([]);
    } finally {
      setLoading(false);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const response = await solicitudesAdminService.obtenerEstadisticasAdmin();
      setEstadisticas(response.data);
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
    }
  };

  const handleFiltroChange = (campo) => (event) => {
    setFiltros({
      ...filtros,
      [campo]: event.target.value,
      page: 1
    });
  };

  const handlePageChange = (event, newPage) => {
    setFiltros({
      ...filtros,
      page: newPage
    });
  };

  const limpiarFiltros = () => {
    setFiltros({
      estado: '',
      tipo_cambio: '',
      prioridad: '',
      page: 1,
      limit: 10
    });
  };

  const verDetalle = async (solicitud) => {
    try {
      setLoading(true);
      const response = await solicitudesAdminService.obtenerSolicitudParaAdmin(solicitud.id_sol);
      setSelectedSolicitud(response.data);
      setDialogDetalles(true);
      // Recargar la tabla para reflejar el cambio de estado automático a EN_REVISION
      await cargarSolicitudes();
      await cargarEstadisticas();
    } catch (err) {abrirGestion
      setError('Error al cargar detalles: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const abrirGestion = async (solicitud) => {
    try {
      setSelectedSolicitud(solicitud);
      console.log('🔄 Desarrolladores al abrir gestión:', desarrolladores);

      // Siempre recargar desarrolladores para asegurar datos frescos
      console.log('🔄 Cargando desarrolladores al abrir gestión...');
      await cargarDesarrolladores();
      
      // Validar que el desarrollador asignado existe en la lista actual
      let desarrolladorAsignado = solicitud.id_desarrollador_asignado || '';
      
      // Si hay un desarrollador asignado, verificar que existe en la lista actual
      if (desarrolladorAsignado && desarrolladores && desarrolladores.data && desarrolladores.data.length > 0) {
        const existeDesarrollador = desarrolladores.data.some(dev => dev.id_usu === desarrolladorAsignado);
        if (!existeDesarrollador) {
          console.warn(`⚠️ Desarrollador asignado ${desarrolladorAsignado} no existe en la lista actual. Se limpiará la asignación.`);
          desarrolladorAsignado = ''; // Limpiar si no existe
        }
      }
      
      setGestionForm({
        impacto_negocio_sol: solicitud.impacto_negocio_sol || '',
        impacto_tecnico_sol: solicitud.impacto_tecnico_sol || '',
        riesgo_cambio_sol: solicitud.riesgo_cambio_sol || '',
        categoria_cambio_sol: solicitud.categoria_cambio_sol || '',
        comentarios_admin_sol: solicitud.comentarios_admin_sol || '',
        fecha_planificada_inicio_sol: solicitud.fecha_planificada_inicio_sol ? new Date(solicitud.fecha_planificada_inicio_sol) : null,
        fecha_planificada_fin_sol: solicitud.fecha_planificada_fin_sol ? new Date(solicitud.fecha_planificada_fin_sol) : null,
        hora_planificada_inicio_sol: solicitud.hora_planificada_inicio_sol || '',
        hora_planificada_fin_sol: solicitud.hora_planificada_fin_sol || '',
        tiempo_estimado_horas_sol: solicitud.tiempo_estimado_horas_sol || '',
        id_desarrollador_asignado: desarrolladorAsignado,
        plan_implementacion_sol: solicitud.plan_implementacion_sol || '',
        plan_rollout_sol: solicitud.plan_rollout_sol || '',
        plan_backout_sol: solicitud.plan_backout_sol || '',
        plan_testing_sol: solicitud.plan_testing_sol || ''
      });
      
      console.log('� Formulario configurado, abriendo diálogo...'); 
      setDialogGestion(true);
      
    } catch (err) {
      console.error('Error al abrir gestión:', err);
      setError('Error al cargar desarrolladores: ' + err.message);
    }
  };

  const abrirAccion = (solicitud, accion) => {
    setSelectedSolicitud(solicitud);
    setAccionForm({
      accion,
      comentarios_admin_sol: '',
      motivo_rechazo: ''
    });
    setDialogAccion(true);
  };


  const handleGuardarGestion = async () => {
    if (!selectedSolicitud) {
      setError('No hay solicitud seleccionada');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      // Si la solicitud está aprobada y se asigna desarrollador con planes técnicos,
      // cambiar estado directamente a EN_DESARROLLO
      let datosActualizados = { ...gestionForm };
      if (selectedSolicitud.estado_sol === 'APROBADA' && 
          gestionForm.id_desarrollador_asignado && 
          (gestionForm.plan_implementacion_sol || 
           gestionForm.plan_rollout_sol || 
           gestionForm.plan_backout_sol || 
           gestionForm.plan_testing_sol)) {
        datosActualizados.estado_sol = 'EN_DESARROLLO';
      }
      
      const response = await solicitudesAdminService.actualizarSolicitudMaster(selectedSolicitud.id_sol, datosActualizados);
      setSuccess(response.message);
      setDialogGestion(false);
      await cargarSolicitudes();
      await cargarEstadisticas();
    } catch (err) {
      setError('Error al actualizar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAprobarRechazar = async () => {
    if (!selectedSolicitud) {
      setError('No hay solicitud seleccionada');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      let response;
      if (accionForm.accion === 'aprobar') {
        response = await solicitudesAdminService.aprobarSolicitud(
          selectedSolicitud.id_sol,
          accionForm.comentarios_admin_sol
        );
      } else {
        response = await solicitudesAdminService.rechazarSolicitud(
          selectedSolicitud.id_sol,
          accionForm.comentarios_admin_sol,
          accionForm.motivo_rechazo
        );
      }
      
      setSuccess(response.message);
      setDialogAccion(false);
      setAccionForm({ accion: '', comentarios_admin_sol: '', motivo_rechazo: '' });
      await cargarSolicitudes();
      await cargarEstadisticas();
    } catch (err) {
      setError(`Error al ${accionForm.accion}: ` + err.message);
    } finally {
      setLoading(false);
    }
  };



  // Función para manejar el rechazo de PR con comentarios diferenciados
  const handleRechazarPRConComentarios = async () => {
    if (!selectedSolicitud) return;
    
    try {
      setLoading(true);
      setError(null);

      // Primero rechazamos el PR en GitHub
      if (selectedSolicitud.github_pr_number) {
        await solicitudesAdminService.rechazarPR(selectedSolicitud.id_sol, {
          comentarios: comentarioDesarrollador || 'Se requieren cambios antes de continuar.'
        });
      }
      
      // Luego actualizamos el estado de la solicitud
      await solicitudesAdminService.actualizarSolicitudMaster(selectedSolicitud.id_sol, {
        estado_sol: 'EN_DESARROLLO',
        comentarios_admin_sol: comentarioUsuario || 'Pull Request rechazado. Se requieren cambios antes de continuar.',
        comentarios_internos_sol: comentarioDesarrollador || 'Se requieren cambios antes de continuar.'
      });
      
      setSuccess('Pull Request rechazado. La solicitud ha regresado a desarrollo.');
      setDialogRechazoPR(false);
      
      // Limpiar formularios
      setComentarioUsuario('');
      setComentarioDesarrollador('');
      
      await cargarSolicitudes();
      await cargarEstadisticas();
    } catch (err) {
      setError('Error al rechazar PR: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Aprobar PR específico por repositorio
  const handleAprobarPRIndividual = async (repositoryType) => {
    try {
      setProcesandoPR(prev => ({ ...prev, [`aprobar_${repositoryType}`]: true }));
      
      const comentarios = comentariosPR[repositoryType] || '';
      await solicitudesAdminService.aprobarPRPorRepositorio(
        selectedSolicitud.id_sol,
        repositoryType,
        comentarios
      );

      setSuccess(`PR ${repositoryType} aprobado exitosamente`);
      
      // Recargar información de PRs
      await abrirRevisionPR(selectedSolicitud);
      await cargarSolicitudes();
      await cargarEstadisticas();
      
    } catch (error) {
      setError(`Error al aprobar PR ${repositoryType}: ` + error.message);
    } finally {
      setProcesandoPR(prev => ({ ...prev, [`aprobar_${repositoryType}`]: false }));
    }
  };

  // Rechazar PR específico por repositorio
  const handleRechazarPRIndividual = async (repositoryType) => {
    try {
      setProcesandoPR(prev => ({ ...prev, [`rechazar_${repositoryType}`]: true }));
      
      const comentarios = comentariosPR[repositoryType] || '';
      if (!comentarios.trim()) {
        setError('Debes agregar un comentario para rechazar el PR');
        return;
      }

      await solicitudesAdminService.rechazarPRPorRepositorio(
        selectedSolicitud.id_sol,
        repositoryType,
        comentarios
      );

      setSuccess(`PR ${repositoryType} rechazado. Solicitud devuelta a desarrollo`);
      
      // Recargar información de PRs
      await abrirRevisionPR(selectedSolicitud);
      await cargarSolicitudes();
      await cargarEstadisticas();
      
    } catch (error) {
      setError(`Error al rechazar PR ${repositoryType}: ` + error.message);
    } finally {
      setProcesandoPR(prev => ({ ...prev, [`rechazar_${repositoryType}`]: false }));
    }
  };

  // Función para renderizar información detallada del PR
  const renderPRDetails = (rama) => {
    if (!rama.pr_info) return null;

    const { pr_info } = rama;

    return (
      <Box sx={{ mt: 2 }}>
        {/* Información del PR de GitHub */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Description />
              Información del Pull Request
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">Título:</Typography>
                <Typography variant="body1">{pr_info.title}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">Estado:</Typography>
                <Chip 
                  label={pr_info.state === 'open' ? 'ABIERTO' : pr_info.merged ? 'MERGEADO' : 'CERRADO'} 
                  color={pr_info.state === 'open' ? 'warning' : pr_info.merged ? 'success' : 'default'}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">Autor:</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccountCircle />
                  <Typography variant="body1">{pr_info.user?.login}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">Creado:</Typography>
                <Typography variant="body1">
                  {new Date(pr_info.created_at).toLocaleDateString('es-ES')}
                </Typography>
              </Grid>
              {pr_info.body && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Descripción:</Typography>
                  <Typography variant="body2" sx={{ 
                    backgroundColor: '#f5f5f5', 
                    p: 1, 
                    borderRadius: 1,
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {pr_info.body}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>

        {/* Estadísticas del PR */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Code />
              Estadísticas de Cambios
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ color: '#4caf50' }}>
                    +{pr_info.stats?.additions || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Líneas agregadas</Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ color: '#f44336' }}>
                    -{pr_info.stats?.deletions || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Líneas eliminadas</Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ color: '#2196f3' }}>
                    {pr_info.stats?.changed_files || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Archivos modificados</Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Commits */}
        {pr_info.commits && pr_info.commits.length > 0 && (
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Commit />
                Commits ({pr_info.commits.length})
              </Typography>
              
              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                {pr_info.commits.map((commit, index) => (
                  <Box key={index} sx={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: 2, 
                    p: 1,
                    borderBottom: index < pr_info.commits.length - 1 ? '1px solid #eee' : 'none'
                  }}>
                    <Chip 
                      label={commit.sha} 
                      size="small" 
                      sx={{ fontFamily: 'monospace', minWidth: 70 }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {commit.message.split('\n')[0]}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        por {commit.author} • {new Date(commit.date).toLocaleDateString('es-ES')}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Archivos modificados */}
        {pr_info.files && pr_info.files.length > 0 && (
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Edit />
                Archivos Modificados ({pr_info.files.length})
              </Typography>
              
              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                {pr_info.files.map((file, index) => (
                  <Box key={index} sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2, 
                    p: 1,
                    borderBottom: index < pr_info.files.length - 1 ? '1px solid #eee' : 'none'
                  }}>
                    <Chip 
                      label={file.status.toUpperCase()} 
                      size="small"
                      color={
                        file.status === 'added' ? 'success' :
                        file.status === 'removed' ? 'error' :
                        file.status === 'modified' ? 'warning' : 'default'
                      }
                      sx={{ minWidth: 80 }}
                    />
                    <Typography variant="body2" sx={{ 
                      fontFamily: 'monospace', 
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {file.filename}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {file.additions > 0 && (
                        <Chip 
                          icon={<Add />}
                          label={file.additions}
                          size="small"
                          sx={{ backgroundColor: '#e8f5e8', color: '#2e7d32' }}
                        />
                      )}
                      {file.deletions > 0 && (
                        <Chip 
                          icon={<Remove />}
                          label={file.deletions}
                          size="small"
                          sx={{ backgroundColor: '#ffebee', color: '#d32f2f' }}
                        />
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
    );
  };

  // Función para obtener información del estado con colores distintivos
  const getEstadoInfo = (estado) => {
    const estadosInfo = {
      'BORRADOR': { 
        color: '#9e9e9e',
        bgcolor: '#f5f5f5',
        label: 'Borrador' 
      },
      'PENDIENTE': { 
        color: '#ff9800',
        bgcolor: '#fff3e0',
        label: 'Pendiente' 
      },
      'EN_REVISION': { 
        color: '#2196f3',
        bgcolor: '#e3f2fd',
        label: 'En Revisión' 
      },
      'APROBADA': { 
        color: '#4caf50',
        bgcolor: '#e8f5e8',
        label: 'Aprobada' 
      },
      'RECHAZADA': { 
        color: '#f44336',
        bgcolor: '#ffebee',
        label: 'Rechazada' 
      },
      'CANCELADA': { 
        color: '#6b7280',
        bgcolor: '#f9fafb',
        label: 'Cancelada' 
      },
      'EN_DESARROLLO': { 
        color: '#7c3aed',
        bgcolor: '#f3e8ff',
        label: 'En Desarrollo' 
      },
      'PLANES_PENDIENTES_APROBACION': { 
        color: '#ea580c',
        bgcolor: '#fed7aa',
        label: 'Planes en Revisión' 
      },
      'LISTO_PARA_IMPLEMENTAR': { 
        color: '#059669',
        bgcolor: '#d1fae5',
        label: 'Listo para Implementar' 
      },
      'EN_TESTING': { 
        color: '#dc2626',
        bgcolor: '#fee2e2',
        label: 'En Testing' 
      },
      'EN_DESPLIEGUE': { 
        color: '#f57c00',
        bgcolor: '#fff3e0',
        label: 'En Despliegue' 
      },
      'COMPLETADA': { 
        color: '#16a34a',
        bgcolor: '#dcfce7',
        label: 'Completada' 
      },
      'FALLIDA': { 
        color: '#dc2626',
        bgcolor: '#fef2f2',
        label: 'Fallida' 
      }
    };
    
    return estadosInfo[estado] || { 
      color: '#9e9e9e', 
      bgcolor: '#f5f5f5',
      label: 'Desconocido' 
    };
  };

  const renderEstadisticas = () => {
    if (!estadisticas) return null;

    const statsCards = [
      { 
        label: 'Total', 
        value: estadisticas.por_estado.total, 
        color: '#333',
        icon: <Assignment />
      },
      { 
        label: 'Pendientes', 
        value: estadisticas.por_estado.pendientes, 
        color: '#ff9800',
        icon: <AccessTime />
      },
      { 
        label: 'En Revisión', 
        value: estadisticas.por_estado.en_revision, 
        color: '#2196f3',
        icon: <RequestPage />
      },
      { 
        label: 'Aprobadas', 
        value: estadisticas.por_estado.aprobadas, 
        color: '#4caf50',
        icon: <Check />
      },
      { 
        label: 'Rechazadas', 
        value: estadisticas.por_estado.rechazadas, 
        color: '#f44336',
        icon: <Close />
      }
    ];

    return (
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {statsCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={2.4} key={index}>
            <Card sx={{ textAlign: 'center', height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                  <Avatar sx={{ bgcolor: stat.color, width: 32, height: 32, mr: 1 }}>
                    {stat.icon}
                  </Avatar>
                  <Typography variant="h4" sx={{ color: stat.color, fontWeight: 'bold' }}>
                    {stat.value}
              </Typography>
                </Box>
              <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderTablaInicial = () => (
    <TableContainer component={Paper} elevation={1} sx={{ borderRadius: 2 }}>
      <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
          Gestión de Solicitudes de Cambio ({pagination.total || 0})
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={cargarSolicitudes}
          disabled={loading}
            sx={{
            color: '#666',
            borderColor: '#ddd',
            '&:hover': {
              bgcolor: '#f5f5f5',
              borderColor: '#ccc'
            }
          }}
        >
          Actualizar
        </Button>
        </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Solicitud</TableCell>
            <TableCell>Usuario</TableCell>
            <TableCell>Tipo</TableCell>
            <TableCell>Prioridad</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell>Fecha</TableCell>
            <TableCell align="center">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {solicitudes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  {loading ? 'Cargando solicitudes...' : 'No hay solicitudes para mostrar'}
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            solicitudes.map((solicitud) => {
              const estadoInfo = getEstadoInfo(solicitud.estado_sol);
              return (
                <TableRow key={solicitud.id_sol} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {solicitud.titulo_sol}
        </Typography>
                      <Typography variant="caption" color="text.secondary">
                        #{solicitud.id_sol}
          </Typography>
        </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: '#666' }}>
                        <Person />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {solicitud.usuario?.nom_usu1} {solicitud.usuario?.ape_usu1}
          </Typography>
          <Typography variant="caption" color="text.secondary">
                          {solicitud.usuario?.email_usu}
          </Typography>
        </Box>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {solicitud.tipo_cambio_sol}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      label={solicitud.prioridad_sol}
              size="small"
                      sx={{
                        bgcolor: solicitud.prioridad_sol === 'CRITICA' ? '#d32f2f' : 
                                solicitud.prioridad_sol === 'ALTA' ? '#ff9800' :
                                solicitud.prioridad_sol === 'MEDIA' ? '#2196f3' :
                                solicitud.prioridad_sol === 'BAJA' ? '#4caf50' : '#9e9e9e',
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      label={estadoInfo.label}
              size="small"
              sx={{
                        bgcolor: estadoInfo.color,
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(solicitud.fec_creacion_sol).toLocaleDateString('es-ES')}
                    </Typography>
                  </TableCell>
                  
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <Tooltip title="Ver Detalles">
                        <IconButton
                          size="small"
                          onClick={() => verDetalle(solicitud)}
                          sx={{ color: '#666' }}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>

                      {/* Botón para revisar PR cuando está EN_TESTING */}
                      {solicitud.estado_sol === 'EN_TESTING' && (
                        <Tooltip title="Revisar Pull Requests">
                          <IconButton
                            size="small"
                            onClick={() => abrirRevisionPR(solicitud)}
                            sx={{ 
                              color: '#333',
                              bgcolor: 'rgba(99, 102, 241, 0.1)',
                              '&:hover': {
                                bgcolor: 'rgba(99, 102, 241, 0.2)',
                                color: '#4f46e5'
                              }
                            }}
                          >
                            <GitHub />
                          </IconButton>
                        </Tooltip>
                      )}

                      {solicitud.estado_sol === 'APROBADA' && (
                        <Tooltip title="Gestionar">
                          <IconButton
                            size="small"
                            onClick={() => abrirGestion(solicitud)}
                            sx={{ color: '#333' }}
                          >
                            <Settings />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {pagination.pages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <Pagination
            count={pagination.pages}
            page={pagination.page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}
    </TableContainer>
  );

  if (loading && solicitudes.length === 0) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
        <AdminSidebar />
        <Box component="main" sx={{ flexGrow: 1, ...getMainContentStyle(), display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress />
        </Box>
      </Box>
  );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <AdminSidebar />
      
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1,
            ...getMainContentStyle()
          }}
        >
          <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#6d1313' }}>
          Gestión de Solicitudes de Cambio
        </Typography>
              <Typography variant="body1" color="text.secondary">
                Revisar, gestionar y aprobar solicitudes de cambio del sistema
        </Typography>
      </Box>

            {/* Alertas */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
                {success}
              </Alert>
            )}

            {/* Estadísticas */}
            {renderEstadisticas()}

          {/* Filtros */}
          <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <FilterList sx={{ color: '#b91c1c' }} />
                <Typography variant="h6" sx={{ color: '#6d1313' }}>Filtros</Typography>
            </Box>
            
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={filtros.estado}
                    label="Estado"
                    onChange={handleFiltroChange('estado')}
                  >
                    <MenuItem value="">Todos</MenuItem>
                      <MenuItem value="PENDIENTE">Pendiente</MenuItem>
                      <MenuItem value="EN_REVISION">En Revisión</MenuItem>
                      <MenuItem value="APROBADA">Aprobada</MenuItem>
                      <MenuItem value="RECHAZADA">Rechazada</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    value={filtros.tipo_cambio}
                    label="Tipo"
                    onChange={handleFiltroChange('tipo_cambio')}
                  >
                    <MenuItem value="">Todos</MenuItem>
                    {tiposCambio.map((tipo) => (
                      <MenuItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Prioridad</InputLabel>
                  <Select
                    value={filtros.prioridad}
                    label="Prioridad"
                    onChange={handleFiltroChange('prioridad')}
                  >
                    <MenuItem value="">Todas</MenuItem>
                    {prioridades.map((prioridad) => (
                      <MenuItem key={prioridad.value} value={prioridad.value}>
                        {prioridad.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                      variant="outlined" 
                      onClick={limpiarFiltros} 
                      size="small"
                      startIcon={<Clear />}
                      sx={{ 
                        color: '#666',
                        borderColor: '#ddd',
                        '&:hover': {
                          bgcolor: '#f5f5f5',
                          borderColor: '#ccc'
                        }
                      }}
                    >
                    Limpiar
                  </Button>
                  <Tooltip title="Actualizar">
                      <IconButton 
                        onClick={cargarSolicitudes} 
                        size="small"
                        sx={{ color: '#666' }}
                      >
                      <Refresh />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>
            </Grid>
          </Paper>

            {/* Tabla de Solicitudes */}
            {renderTablaInicial()}
            </Box>
                </Box>

      {/* Dialog para ver detalles */}
      <Dialog
          open={dialogDetalles}
          onClose={() => setDialogDetalles(false)}
          maxWidth="lg"
        fullWidth
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            bgcolor: '#6d1313',
            color: 'white',
            py: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <RequestPage sx={{ fontSize: 28 }} />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, color: 'white' }}>
                  Solicitud #{selectedSolicitud?.id_sol || 'N/A'}
          </Typography>
                <Typography variant="body2" sx={{ color: 'white', fontStyle: 'italic', opacity: 0.9 }}>
                  Gestión completa de solicitud de cambio
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={() => setDialogDetalles(false)}
              sx={{ color: 'white' }}
            >
              <Close />
            </IconButton>
        </DialogTitle>
        
          <DialogContent dividers sx={{ p: 0 }}>
          {selectedSolicitud && (
              <Box>
                {/* Header con información clave */}
                <Box sx={{ 
                  bgcolor: '#fef2f2', 
                  p: 3, 
                  borderBottom: '1px solid #fecaca'
                }}>
                  <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Typography variant="h5" sx={{ fontWeight: 600, color: '#6d1313' }}>
                          {selectedSolicitud.titulo_sol}
                        </Typography>
                <Chip
                          label={getEstadoInfo(selectedSolicitud.estado_sol).label}
                  sx={{
                            bgcolor: getEstadoInfo(selectedSolicitud.estado_sol).color,
                    color: 'white',
                            fontWeight: 'bold'
                  }}
                />
              </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <strong>ID:</strong> #{selectedSolicitud.id_sol}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                        <strong>Solicitante:</strong> {selectedSolicitud.usuario?.nom_usu1} {selectedSolicitud.usuario?.ape_usu1}
                </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Assignment sx={{ fontSize: 16, color: '#b91c1c' }} />
                <Typography variant="body2">
                            <strong>Tipo:</strong> {selectedSolicitud.tipo_cambio_sol}
                </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccessTime sx={{ fontSize: 16, color: '#b91c1c' }} />
                <Typography variant="body2">
                            <strong>Prioridad:</strong> {selectedSolicitud.prioridad_sol}
                </Typography>
              </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Person sx={{ fontSize: 16, color: '#b91c1c' }} />
                <Typography variant="body2">
                            <strong>Urgencia:</strong> {selectedSolicitud.urgencia_sol}
                </Typography>
              </Box>
                      </Box>
                    </Grid>
                  </Grid>
              </Box>

                                {/* Contenido principal - DISEÑO ESTÁTICO 50-50 */}
                <Box sx={{ p: 2 }}>
                  <Box sx={{ 
                    display: 'flex',
                    height: '600px',
                    gap: 2
                  }}>
                    {/* Columna izquierda - EXACTAMENTE 50% */}
                    <Box sx={{ 
                      width: '50%',
                      height: '600px'
                    }}>
                      <Paper elevation={1} sx={{ 
                        p: 2.5, 
                        height: '600px',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                      }}>
                        {/* Título fijo - 50px */}
                        <Box sx={{ 
                          height: '50px',
                          display: 'flex',
                          alignItems: 'center',
                          mb: 2
                        }}>
                          <Typography variant="h6" sx={{ 
                            color: '#6d1313', 
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                          }}>
                            <Person sx={{ color: '#b91c1c' }} />
                            Información del Solicitante
                          </Typography>
                        </Box>
                        
                        <Divider sx={{ mb: 2 }} />
                        
                        {/* Contenido - altura fija 530px */}
                        <Box sx={{ 
                          height: '530px',
                          display: 'flex',
                          flexDirection: 'column'
                        }}>
                          {/* Descripción - EXACTAMENTE 175px */}
                          <Box sx={{ height: '175px', mb: 2 }}>
                            <Typography variant="subtitle2" sx={{ 
                              color: '#6d1313', 
                              fontWeight: 600, 
                              mb: 1,
                              height: '25px',
                              display: 'flex',
                              alignItems: 'center'
                            }}>
                              Descripción del Cambio
                            </Typography>
                            <Paper variant="outlined" sx={{ 
                              p: 1.5, 
                              bgcolor: '#fef2f2',
                              height: '140px',
                              overflow: 'auto'
                            }}>
                              <Typography variant="body2" sx={{ 
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                                lineHeight: 1.4
                              }}>
                                {selectedSolicitud.descripcion_sol || 'Sin descripción'}
                              </Typography>
                            </Paper>
                          </Box>

                          {/* Justificación - EXACTAMENTE 175px */}
                          <Box sx={{ height: '175px', mb: 2 }}>
                            <Typography variant="subtitle2" sx={{ 
                              color: '#6d1313', 
                              fontWeight: 600, 
                              mb: 1,
                              height: '25px',
                              display: 'flex',
                              alignItems: 'center'
                            }}>
                              Justificación del Negocio
                            </Typography>
                            <Paper variant="outlined" sx={{ 
                              p: 1.5, 
                              bgcolor: '#fef2f2',
                              height: '140px',
                              overflow: 'auto'
                            }}>
                              <Typography variant="body2" sx={{ 
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                                lineHeight: 1.4
                              }}>
                                {selectedSolicitud.justificacion_sol || 'Sin justificación'}
                              </Typography>
                            </Paper>
                          </Box>

                          {/* Fechas - EXACTAMENTE 170px */}
                          <Box sx={{ height: '170px' }}>
                            <Typography variant="subtitle2" sx={{ 
                              color: '#6d1313', 
                              fontWeight: 600, 
                              mb: 1,
                              height: '25px',
                              display: 'flex',
                              alignItems: 'center'
                            }}>
                              Fechas de Solicitud
                            </Typography>
                            <Box sx={{ 
                              height: '135px',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'flex-start',
                              gap: 1,
                              pt: 1
                            }}>
                              <Typography variant="body2" sx={{ height: '24px', display: 'flex', alignItems: 'center' }}>
                                <strong>Creada:</strong> {new Date(selectedSolicitud.fec_creacion_sol).toLocaleDateString('es-ES')}
                              </Typography>
                              <Typography variant="body2" sx={{ height: '24px', display: 'flex', alignItems: 'center' }}>
                                <strong>Última respuesta:</strong> {selectedSolicitud.fec_respuesta_sol ? new Date(selectedSolicitud.fec_respuesta_sol).toLocaleDateString('es-ES') : 'N/A'}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Paper>
                    </Box>

                    {/* Columna derecha - EXACTAMENTE 50% */}
                    <Box sx={{ 
                      width: '50%',
                      height: '600px'
                    }}>
                      <Paper elevation={1} sx={{ 
                        p: 2.5, 
                        height: '600px',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                      }}>
                        <Typography variant="h6" sx={{ 
                          mb: 2, 
                          color: '#6d1313', 
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          height: '32px'
                        }}>
                          <Assignment sx={{ color: '#b91c1c' }} />
                          Análisis Master
                      </Typography>
                        <Divider sx={{ mb: 2 }} />
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
                          {/* Evaluación de Impactos - Altura fija */}
                          <Box sx={{ height: '180px' }}>
                            <Typography variant="subtitle2" sx={{ 
                              color: '#6d1313', 
                              fontWeight: 600, 
                              mb: 2,
                              height: '20px'
                            }}>
                              Evaluación de Impactos
                          </Typography>
                            <Grid container spacing={1.5} sx={{ height: '150px' }}>
                              <Grid item xs={6}>
                                <Box sx={{ 
                                  textAlign: 'center', 
                                  p: 1, 
                                  bgcolor: '#fef2f2', 
                                  borderRadius: 1,
                                  height: '65px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'center'
                                }}>
                                  <Typography variant="caption" color="text.secondary" sx={{ height: '16px' }}>
                                    Impacto Negocio
                          </Typography>
                                  <Typography variant="body2" sx={{ 
                                    color: selectedSolicitud.impacto_negocio_sol ? '#6d1313' : '#999',
                                    fontWeight: 600,
                                    height: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}>
                                    {selectedSolicitud.impacto_negocio_sol || 'Pendiente'}
                        </Typography>
                    </Box>
                              </Grid>
                              <Grid item xs={6}>
                                <Box sx={{ 
                                  textAlign: 'center', 
                                  p: 1, 
                                  bgcolor: '#fef2f2', 
                                  borderRadius: 1,
                                  height: '65px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'center'
                                }}>
                                  <Typography variant="caption" color="text.secondary" sx={{ height: '16px' }}>
                                    Impacto Técnico
                      </Typography>
                                  <Typography variant="body2" sx={{ 
                                    color: selectedSolicitud.impacto_tecnico_sol ? '#6d1313' : '#999',
                                    fontWeight: 600,
                                    height: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}>
                                    {selectedSolicitud.impacto_tecnico_sol || 'Pendiente'}
                          </Typography>
                        </Box>
                              </Grid>
                              <Grid item xs={6}>
                                <Box sx={{ 
                                  textAlign: 'center', 
                                  p: 1, 
                                  bgcolor: '#fef2f2', 
                                  borderRadius: 1,
                                  height: '65px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'center'
                                }}>
                                  <Typography variant="caption" color="text.secondary" sx={{ height: '16px' }}>
                                    Riesgo
                          </Typography>
                                  <Typography variant="body2" sx={{ 
                                    color: selectedSolicitud.riesgo_cambio_sol ? '#6d1313' : '#999',
                                    fontWeight: 600,
                                    height: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}>
                                    {selectedSolicitud.riesgo_cambio_sol || 'Pendiente'}
                          </Typography>
                        </Box>
                              </Grid>
                              <Grid item xs={6}>
                                <Box sx={{ 
                                  textAlign: 'center', 
                                  p: 1, 
                                  bgcolor: '#fef2f2', 
                                  borderRadius: 1,
                                  height: '65px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'center'
                                }}>
                                  <Typography variant="caption" color="text.secondary" sx={{ height: '16px' }}>
                                    Categoría
                          </Typography>
                                  <Typography variant="body2" sx={{ 
                                    color: selectedSolicitud.categoria_cambio_sol ? '#6d1313' : '#999',
                                    fontWeight: 600,
                                    height: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}>
                                    {selectedSolicitud.categoria_cambio_sol || 'Pendiente'}
                          </Typography>
                        </Box>
                              </Grid>
                            </Grid>
                          </Box>

                          {/* Comentarios del Administrador - Altura fija */}
                          <Box sx={{ height: '120px' }}>
                            <Typography variant="subtitle2" sx={{ 
                              color: '#6d1313', 
                              fontWeight: 600, 
                              mb: 1,
                              height: '20px'
                            }}>
                              Comentarios del Administrador
                      </Typography>
                            <Paper variant="outlined" sx={{ 
                              p: 1.5, 
                              bgcolor: '#f0fdf4',
                              height: '90px',
                              overflow: 'auto'
                            }}>
                              <Typography variant="body2" sx={{ 
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                                lineHeight: 1.4
                              }}>
                                {selectedSolicitud.comentarios_admin_sol || 'Sin comentarios del administrador'}
                            </Typography>
                            </Paper>
                          </Box>

                          {/* Planificación - Altura fija */}
                          <Box sx={{ height: '140px' }}>
                            <Typography variant="subtitle2" sx={{ 
                              color: '#6d1313', 
                              fontWeight: 600, 
                              mb: 1,
                              height: '20px'
                            }}>
                              Planificación
                            </Typography>
                            <Box sx={{ 
                              display: 'flex', 
                              flexDirection: 'column', 
                              gap: 1,
                              height: '110px',
                              justifyContent: 'flex-start'
                            }}>
                              <Typography variant="body2" sx={{ height: '20px' }}>
                                <strong>Inicio:</strong> {selectedSolicitud.fecha_planificada_inicio_sol ? new Date(selectedSolicitud.fecha_planificada_inicio_sol).toLocaleDateString('es-ES') : 'No definido'}
                            </Typography>
                              <Typography variant="body2" sx={{ height: '20px' }}>
                                <strong>Fin:</strong> {selectedSolicitud.fecha_planificada_fin_sol ? new Date(selectedSolicitud.fecha_planificada_fin_sol).toLocaleDateString('es-ES') : 'No definido'}
                        </Typography>
                              <Typography variant="body2" sx={{ height: '20px' }}>
                                <strong>Tiempo:</strong> {selectedSolicitud.tiempo_estimado_horas_sol ? `${selectedSolicitud.tiempo_estimado_horas_sol} horas` : 'No definido'}
                        </Typography>
                              <Typography variant="body2" sx={{ height: '20px' }}>
                                <strong>Desarrollador:</strong> {selectedSolicitud.desarrollador_asignado?.nombre_completo || 'No asignado'}
                          </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Paper>
                    </Box>
                  </Box>

                  {/* Sección de Planes Técnicos del Desarrollador */}
                  {(selectedSolicitud.plan_implementacion_sol || selectedSolicitud.plan_rollout_sol || 
                    selectedSolicitud.plan_backout_sol || selectedSolicitud.plan_testing_sol) && (
                    <Box sx={{ mt: 3 }}>
                      <Paper elevation={1} sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ 
                          mb: 3, 
                          color: '#6d1313', 
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}>
                          <Assignment sx={{ color: '#b91c1c' }} />
                          Planes Técnicos del Desarrollador
                        </Typography>

                        {/* Estado de los planes */}
                        {selectedSolicitud.estado_sol === 'PLANES_PENDIENTES_APROBACION' && (
                          <Alert severity="warning" sx={{ mb: 3 }}>
                            <strong>Planes pendientes de aprobación</strong> - El desarrollador ha enviado los planes técnicos para revisión.
                            {selectedSolicitud.fecha_envio_planes && (
                              <Typography variant="body2" sx={{ mt: 1 }}>
                                Enviados el {new Date(selectedSolicitud.fecha_envio_planes).toLocaleDateString('es-ES')}
                              </Typography>
                            )}
                          </Alert>
                        )}

                        {selectedSolicitud.planes_aprobados === true && (
                          <Alert severity="success" sx={{ mb: 3 }}>
                            <strong>Planes aprobados</strong> - Los planes técnicos han sido revisados y aprobados.
                            {selectedSolicitud.fecha_aprobacion_planes && (
                              <Typography variant="body2" sx={{ mt: 1 }}>
                                Aprobados el {new Date(selectedSolicitud.fecha_aprobacion_planes).toLocaleDateString('es-ES')}
                              </Typography>
                            )}
                          </Alert>
                        )}

                        {selectedSolicitud.planes_aprobados === false && selectedSolicitud.fecha_aprobacion_planes && (
                          <Alert severity="error" sx={{ mb: 3 }}>
                            <strong>Planes rechazados</strong> - Los planes técnicos requieren revisión.
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              Revisados el {new Date(selectedSolicitud.fecha_aprobacion_planes).toLocaleDateString('es-ES')}
                            </Typography>
                          </Alert>
                        )}

                        {/* Planes técnicos uno debajo del otro */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          {selectedSolicitud.plan_implementacion_sol && (
                            <Box>
                              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#1976d2' }}>
                                📋 Plan de Implementación:
                              </Typography>
                              <Paper sx={{ p: 2, bgcolor: '#f8f9fa', minHeight: 100, border: '1px solid #e0e0e0' }}>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                  {selectedSolicitud.plan_implementacion_sol}
                                </Typography>
                              </Paper>
                            </Box>
                          )}

                          {selectedSolicitud.plan_rollout_sol && (
                            <Box>
                              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#2e7d32' }}>
                                🚀 Plan de Roll-out:
                              </Typography>
                              <Paper sx={{ p: 2, bgcolor: '#f8f9fa', minHeight: 100, border: '1px solid #e0e0e0' }}>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                  {selectedSolicitud.plan_rollout_sol}
                                </Typography>
                              </Paper>
                            </Box>
                          )}

                          {selectedSolicitud.plan_backout_sol && (
                            <Box>
                              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#d32f2f' }}>
                                🔄 Plan de Back-out:
                              </Typography>
                              <Paper sx={{ p: 2, bgcolor: '#f8f9fa', minHeight: 100, border: '1px solid #e0e0e0' }}>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                  {selectedSolicitud.plan_backout_sol}
                                </Typography>
                              </Paper>
                            </Box>
                          )}

                          {selectedSolicitud.plan_testing_sol && (
                            <Box>
                              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#ed6c02' }}>
                                🧪 Plan de Testing:
                              </Typography>
                              <Paper sx={{ p: 2, bgcolor: '#f8f9fa', minHeight: 100, border: '1px solid #e0e0e0' }}>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                  {selectedSolicitud.plan_testing_sol}
                                </Typography>
                              </Paper>
                            </Box>
                          )}
                        </Box>

                        {/* Comentarios de aprobación existentes */}
                        {selectedSolicitud.comentarios_aprobacion_planes && (
                          <Paper sx={{ 
                            mt: 3, 
                            p: 3, 
                            bgcolor: selectedSolicitud.planes_aprobados ? '#e8f5e8' : '#ffebee',
                            border: `1px solid ${selectedSolicitud.planes_aprobados ? '#4caf50' : '#f44336'}`
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                              <Avatar sx={{ 
                                bgcolor: selectedSolicitud.planes_aprobados ? '#4caf50' : '#f44336', 
                                width: 32, 
                                height: 32 
                              }}>
                                <Assignment />
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                  MASTER - {selectedSolicitud.planes_aprobados ? 'Planes Aprobados' : 'Planes Rechazados'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {selectedSolicitud.fecha_aprobacion_planes && 
                                    new Date(selectedSolicitud.fecha_aprobacion_planes).toLocaleDateString('es-ES')}
                                </Typography>
                              </Box>
                            </Box>
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                              {selectedSolicitud.comentarios_aprobacion_planes}
                            </Typography>
                          </Paper>
                        )}
                      </Paper>
                    </Box>
                  )}
                </Box>
              
            </Box>
          )}
          </DialogContent>

          <DialogActions sx={{ 
            p: 3, 
            gap: 2, 
            bgcolor: '#fef2f2',
            borderTop: '1px solid #fecaca'
          }}>
            <Button
              onClick={() => setDialogDetalles(false)} 
              variant="outlined"
              sx={{ 
                color: '#6d1313', 
                borderColor: '#b91c1c',
                '&:hover': { borderColor: '#991b1b', color: '#991b1b' }
              }}
            >
              Cerrar
            </Button>
            
            {selectedSolicitud?.estado_sol === 'EN_REVISION' && (
              <>
                <Button
                  onClick={() => {
                    setDialogDetalles(false);
                    abrirAccion(selectedSolicitud, 'rechazar');
                  }}
                  variant="contained"
                  startIcon={<Close />}
                  sx={{ 
                    bgcolor: '#ef4444', 
                    '&:hover': { bgcolor: '#dc2626' },
                    minWidth: 120
                  }}
                >
                  Rechazar
                </Button>
                <Button 
                  onClick={() => {
                    setDialogDetalles(false);
                    abrirAccion(selectedSolicitud, 'aprobar');
                  }}
                  variant="contained"
                  startIcon={<Check />}
                  sx={{ 
                    bgcolor: '#991b1b', 
                    '&:hover': { bgcolor: '#7f1d1d' },
                    minWidth: 120
                  }}
                >
                  Aprobar
                </Button>
              </>
            )}

            {/* NUEVA SECCIÓN: Revisión de PR para solicitudes EN_TESTING */}
            {selectedSolicitud?.estado_sol === 'EN_TESTING' && selectedSolicitud?.github_pr_number && (
              <></>
            )}



            {/* NUEVA SECCIÓN: Gestión de Despliegue para solicitudes EN_DESPLIEGUE */}
            {selectedSolicitud?.estado_sol === 'EN_DESPLIEGUE' && (
              <>
                <Box sx={{ 
                  bgcolor: '#fff3e0', 
                  p: 2, 
                  borderRadius: 1, 
                  mb: 2, 
                  width: '100%',
                  mx: -3
                }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#f57c00' }}>
                    🚀 Solicitud en Despliegue
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    El PR fue aprobado y está siendo desplegado en producción. 
                    Confirma el resultado del despliegue para completar el flujo.
                  </Typography>
                  {selectedSolicitud.github_pr_url && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<GitHub />}
                      onClick={() => window.open(selectedSolicitud.github_pr_url, '_blank')}
                      sx={{ mt: 1 }}
                    >
                      Ver PR Desplegado
                    </Button>
                  )}
                </Box>
                
                <Button
                  onClick={async () => {
                    try {
                      setLoading(true);
                      await solicitudesAdminService.actualizarSolicitudMaster(selectedSolicitud.id_sol, {
                        estado_sol: 'FALLIDA',
                        comentarios_admin_sol: 'Despliegue fallido. Se requiere revisar y corregir antes de continuar.',
                        comentarios_internos_sol: `MASTER marcó despliegue como fallido el ${new Date().toLocaleString()}`,
                        exito_implementacion: false,
                        fecha_real_fin_sol: new Date().toISOString()
                      });
                      setDialogDetalles(false);
                      await cargarSolicitudes();
                      await cargarEstadisticas();
                    } catch (error) {
                      setError('Error al marcar despliegue como fallido: ' + error.message);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  variant="outlined"
                  startIcon={<Close />}
                  disabled={loading}
                  sx={{ 
                    borderColor: '#ef4444',
                    color: '#ef4444', 
                    '&:hover': { 
                      bgcolor: '#fef2f2',
                      borderColor: '#dc2626',
                      color: '#dc2626'
                    },
                    minWidth: 180
                  }}
                >
                  Marcar como Fallido
                </Button>
                
                <Button 
                  onClick={async () => {
                    try {
                      setLoading(true);
                      await solicitudesAdminService.actualizarSolicitudMaster(selectedSolicitud.id_sol, {
                        estado_sol: 'COMPLETADA',
                        comentarios_admin_sol: 'Despliegue exitoso. La solicitud ha sido implementada correctamente en producción.',
                        comentarios_internos_sol: `MASTER confirmó despliegue exitoso el ${new Date().toLocaleString()}`,
                        exito_implementacion: true,
                        fecha_real_fin_sol: new Date().toISOString()
                      });
                      setDialogDetalles(false);
                      await cargarSolicitudes();
                      await cargarEstadisticas();
                    } catch (error) {
                      setError('Error al completar despliegue: ' + error.message);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  variant="contained"
                  startIcon={<Done />}
                  disabled={loading}
                  sx={{ 
                    bgcolor: '#4caf50', 
                    '&:hover': { bgcolor: '#388e3c' },
                    minWidth: 180
                  }}
                >
                  Confirmar Despliegue Exitoso
                </Button>
              </>
            )}


        </DialogActions>
      </Dialog>

        {/* Dialog para gestión master */}
      <Dialog
          open={dialogGestion}
          onClose={() => setDialogGestion(false)}
        maxWidth="md"
        fullWidth
      >
          <DialogTitle sx={{ bgcolor: '#6d1313', color: 'white' }}>
          <Typography variant="h6">
              Gestión Master - {selectedSolicitud?.titulo_sol}
          </Typography>
        </DialogTitle>
        
          <DialogContent dividers>
            <Box sx={{ py: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#6d1313', fontWeight: 600 }}>
                Análisis de Impactos y Riesgos
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Impacto de Negocio */}
            <FormControl fullWidth>
                  <InputLabel>Impacto de Negocio</InputLabel>
              <Select
                    value={gestionForm.impacto_negocio_sol}
                    label="Impacto de Negocio"
                    onChange={(e) => setGestionForm({...gestionForm, impacto_negocio_sol: e.target.value})}
                  >
                    {solicitudesAdminService.obtenerOpcionesImpactosRiesgos().map((opcion) => (
                      <MenuItem key={opcion.value} value={opcion.value}>
                        {opcion.label}
                    </MenuItem>
                    ))}
              </Select>
            </FormControl>

                {/* Impacto Técnico */}
              <FormControl fullWidth>
                  <InputLabel>Impacto Técnico</InputLabel>
                <Select
                    value={gestionForm.impacto_tecnico_sol}
                    label="Impacto Técnico"
                    onChange={(e) => setGestionForm({...gestionForm, impacto_tecnico_sol: e.target.value})}
                  >
                    {solicitudesAdminService.obtenerOpcionesImpactosRiesgos().map((opcion) => (
                      <MenuItem key={opcion.value} value={opcion.value}>
                        {opcion.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Riesgo del Cambio */}
                <FormControl fullWidth>
                  <InputLabel>Riesgo del Cambio</InputLabel>
                  <Select
                    value={gestionForm.riesgo_cambio_sol}
                    label="Riesgo del Cambio"
                    onChange={(e) => setGestionForm({...gestionForm, riesgo_cambio_sol: e.target.value})}
                  >
                    {solicitudesAdminService.obtenerOpcionesImpactosRiesgos().map((opcion) => (
                      <MenuItem key={opcion.value} value={opcion.value}>
                        {opcion.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Categoría del Cambio */}
                <FormControl fullWidth>
                  <InputLabel>Categoría del Cambio</InputLabel>
                  <Select
                    value={gestionForm.categoria_cambio_sol}
                    label="Categoría del Cambio"
                    onChange={(e) => setGestionForm({...gestionForm, categoria_cambio_sol: e.target.value})}
                  >
                    {solicitudesAdminService.obtenerCategoriasCambio().map((categoria) => (
                      <MenuItem key={categoria.value} value={categoria.value}>
                        {categoria.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Typography variant="h6" gutterBottom sx={{ color: '#6d1313', fontWeight: 600, mt: 4 }}>
                Planificación Temporal
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Fecha y Hora de Inicio */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <DatePicker
                    label="Fecha de Inicio"
                    value={gestionForm.fecha_planificada_inicio_sol}
                    onChange={(newValue) => setGestionForm({...gestionForm, fecha_planificada_inicio_sol: newValue})}
                    slotProps={{
                      textField: {
                        sx: { flex: 1 }
                      }
                    }}
                  />
                  <TimePicker
                    label="Hora de Inicio"
                    value={gestionForm.hora_planificada_inicio_sol ? new Date(`2000-01-01T${gestionForm.hora_planificada_inicio_sol}`) : null}
                    onChange={(newValue) => {
                      const timeString = newValue ? `${newValue.getHours().toString().padStart(2, '0')}:${newValue.getMinutes().toString().padStart(2, '0')}` : '';
                      setGestionForm({...gestionForm, hora_planificada_inicio_sol: timeString});
                    }}
                    slotProps={{
                      textField: {
                        sx: { flex: 1 }
                      }
                    }}
                  />
                </Box>

                {/* Fecha y Hora de Fin */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <DatePicker
                    label="Fecha de Fin"
                    value={gestionForm.fecha_planificada_fin_sol}
                    onChange={(newValue) => setGestionForm({...gestionForm, fecha_planificada_fin_sol: newValue})}
                    slotProps={{
                      textField: {
                        sx: { flex: 1 }
                      }
                    }}
                  />
                  <TimePicker
                    label="Hora de Fin"
                    value={gestionForm.hora_planificada_fin_sol ? new Date(`2000-01-01T${gestionForm.hora_planificada_fin_sol}`) : null}
                    onChange={(newValue) => {
                      const timeString = newValue ? `${newValue.getHours().toString().padStart(2, '0')}:${newValue.getMinutes().toString().padStart(2, '0')}` : '';
                      setGestionForm({...gestionForm, hora_planificada_fin_sol: timeString});
                    }}
                    slotProps={{
                      textField: {
                        sx: { flex: 1 }
                      }
                    }}
                  />
                </Box>

                {/* Tiempo Estimado */}
            <TextField
              fullWidth
                  type="number"
                  label="Tiempo Estimado (horas)"
                  value={gestionForm.tiempo_estimado_horas_sol}
                  onChange={(e) => setGestionForm({...gestionForm, tiempo_estimado_horas_sol: e.target.value})}
                  placeholder="Ej: 8, 16, 24"
                  helperText="Estimación en horas totales de trabajo"
                  inputProps={{ min: 0, step: 0.5 }}
                />
              </Box>

              <Typography variant="h6" gutterBottom sx={{ color: '#6d1313', fontWeight: 600, mt: 4 }}>
                Asignación de Desarrollador
              </Typography>

              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth error={errorDesarrolladores !== null}>
                  <InputLabel>Desarrollador Asignado</InputLabel>
                  <Select
                    value={gestionForm.id_desarrollador_asignado}
                    label="Desarrollador Asignado"
                    onChange={(e) => setGestionForm({...gestionForm, id_desarrollador_asignado: e.target.value})}
                    disabled={loadingDesarrolladores}
                  >
                    {desarrolladores.data.map((dev) => (
                      <MenuItem key={dev.id_usu} value={dev.id_usu}>
                        {dev.nombre_completo}
                      </MenuItem>
                    ))}
                  </Select>
                  {errorDesarrolladores && (
                    <FormHelperText error>{errorDesarrolladores}</FormHelperText>
                  )}
                  {loadingDesarrolladores && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <CircularProgress size={16} />
                      <Typography variant="caption" color="text.secondary">
                        Cargando desarrolladores...
                      </Typography>
                    </Box>
                  )}
                </FormControl>
              </Box>

              <Typography variant="h6" gutterBottom sx={{ color: '#6d1313', fontWeight: 600, mt: 4 }}>
                Planes Técnicos
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Plan de Implementación */}
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="📋 Plan de Implementación"
                  value={gestionForm.plan_implementacion_sol || ''}
                  onChange={(e) => setGestionForm({...gestionForm, plan_implementacion_sol: e.target.value})}
                  placeholder="Detalle los pasos específicos para implementar el cambio..."
                  helperText="Incluye tareas técnicas, dependencias, y secuencia de implementación"
                />

                {/* Plan de Roll-out */}
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="🚀 Plan de Roll-out"
                  value={gestionForm.plan_rollout_sol || ''}
                  onChange={(e) => setGestionForm({...gestionForm, plan_rollout_sol: e.target.value})}
                  placeholder="Estrategia para el despliegue y puesta en producción..."
                  helperText="Incluye ambiente de despliegue, validaciones, y comunicaciones"
                />

                {/* Plan de Back-out */}
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="🔄 Plan de Back-out"
                  value={gestionForm.plan_backout_sol || ''}
                  onChange={(e) => setGestionForm({...gestionForm, plan_backout_sol: e.target.value})}
                  placeholder="Procedimiento de reversa en caso de fallas..."
                  helperText="Incluye pasos de reversión, tiempo estimado, y validaciones"
                />

                {/* Plan de Testing */}
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="🧪 Plan de Testing"
                  value={gestionForm.plan_testing_sol || ''}
                  onChange={(e) => setGestionForm({...gestionForm, plan_testing_sol: e.target.value})}
                  placeholder="Estrategia de pruebas y validación..."
                  helperText="Incluye tipos de pruebas, casos de prueba, y criterios de aceptación"
                />
              </Box>

              <Typography variant="h6" gutterBottom sx={{ color: '#6d1313', fontWeight: 600, mt: 4 }}>
                Comentarios
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Comentarios */}
              <TextField
                fullWidth
                multiline
                  rows={4}
                  label="Comentarios del Administrador"
                  value={gestionForm.comentarios_admin_sol}
                  onChange={(e) => setGestionForm({...gestionForm, comentarios_admin_sol: e.target.value})}
                  placeholder="Comentarios que verán el equipo y el usuario..."
                  helperText="Incluye análisis, consideraciones especiales, etc."
                />
              </Box>
          </Box>
        </DialogContent>
        
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setDialogGestion(false)}>
            Cancelar
          </Button>
          <Button 
            variant="contained" 
              onClick={handleGuardarGestion}
              disabled={loading}
              sx={{ bgcolor: '#6d1313', '&:hover': { bgcolor: '#991b1b' } }}
          >
              {loading ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

        {/* Dialog para aprobar/rechazar */}
      <Dialog
          open={dialogAccion}
          onClose={() => setDialogAccion(false)}
        maxWidth="sm"
        fullWidth
      >
          <DialogTitle sx={{ 
            bgcolor: accionForm.accion === 'aprobar' ? '#991b1b' : '#ef4444', 
            color: 'white' 
          }}>
          <Typography variant="h6">
              {accionForm.accion === 'aprobar' ? 'Aprobar Solicitud' : 'Rechazar Solicitud'}
          </Typography>
        </DialogTitle>
        
          <DialogContent dividers>
            <Box sx={{ py: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Comentarios"
                    value={accionForm.comentarios_admin_sol}
                    onChange={(e) => setAccionForm({...accionForm, comentarios_admin_sol: e.target.value})}
                    placeholder="Comentarios que verá el usuario..."
                  />
                </Grid>

                {accionForm.accion === 'rechazar' && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Motivo del Rechazo"
                      value={accionForm.motivo_rechazo}
                      onChange={(e) => setAccionForm({...accionForm, motivo_rechazo: e.target.value})}
                      placeholder="Motivo específico del rechazo..."
                      required
                    />
                  </Grid>
                )}
              </Grid>
          </Box>
        </DialogContent>
        
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setDialogAccion(false)}>
            Cancelar
          </Button>
          <Button 
            variant="contained" 
              onClick={handleAprobarRechazar}
              disabled={loading || (accionForm.accion === 'rechazar' && !accionForm.motivo_rechazo)}
              sx={{ 
                bgcolor: accionForm.accion === 'aprobar' ? '#991b1b' : '#ef4444',
                '&:hover': { 
                  bgcolor: accionForm.accion === 'aprobar' ? '#7f1d1d' : '#dc2626'
                }
              }}
            >
              {loading ? 'Procesando...' : accionForm.accion === 'aprobar' ? 'Aprobar' : 'Rechazar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Revisión de Múltiples Pull Requests */}
      <Dialog
        open={dialogRevisionPR}
        onClose={() => setDialogRevisionPR(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ 
          bgcolor: '#6366f1', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <GitHub />
          <Typography variant="h6">
            Revisión de Pull Requests - {selectedSolicitud?.titulo_sol}
          </Typography>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 0 }}>
          {loadingPR ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Cargando información de los Pull Requests...</Typography>
            </Box>
          ) : prInfo && prInfo.length > 0 ? (
            <Box>
              {/* Tabs si hay múltiples PRs */}
              {prInfo.length > 1 ? (
                <Box>
                  <Tabs 
                    value={tabActivoPR} 
                    onChange={(e, newValue) => setTabActivoPR(newValue)}
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                  >
                    {prInfo.map((rama) => (
                      <Tab 
                        key={rama.id}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {rama.repository_type === 'FRONTEND' ? '🎨' : '⚙️'}
                            {rama.repository_type}
                            <Chip 
                              label={rama.pr_status || 'PENDING'} 
                              size="small" 
                              color={
                                rama.pr_status === 'APPROVED' ? 'success' : 
                                rama.pr_status === 'REJECTED' ? 'error' : 
                                rama.pr_status === 'IN_REVIEW' ? 'warning' : 'default'
                              }
                            />
                          </Box>
                        }
                      />
                    ))}
                  </Tabs>
                  
                  {/* Contenido del tab activo */}
                  {prInfo.filter((_, index) => tabActivoPR === index).map((rama) => (
                      <Box key={rama.id} sx={{ p: 3 }}>
                        {/* Información básica del PR */}
                        <Card sx={{ mb: 3 }}>
                          <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <GitHub />
                              Pull Request {rama.repository_type}
                            </Typography>
                            
                            <Grid container spacing={2}>
                              <Grid item xs={12} md={6}>
                                <Typography variant="body2" color="text.secondary">Rama:</Typography>
                                <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>{rama.branch_name}</Typography>
                              </Grid>
                              <Grid item xs={12} md={6}>
                                <Typography variant="body2" color="text.secondary">Estado en BD:</Typography>
                                <Chip 
                                  label={rama.pr_status || 'PENDING'} 
                                  color={
                                    rama.pr_status === 'APPROVED' ? 'success' : 
                                    rama.pr_status === 'REJECTED' ? 'error' : 
                                    rama.pr_status === 'IN_REVIEW' ? 'warning' : 'default'
                                  }
                                  size="small"
                                />
                              </Grid>
                              <Grid item xs={12} md={6}>
                                <Typography variant="body2" color="text.secondary">PR #:</Typography>
                                <Typography variant="body1">{rama.pr_number || 'No creado'}</Typography>
                              </Grid>
                              {rama.pr_url && (
                                <Grid item xs={12} md={6}>
                                  <Button
                                    variant="outlined"
                                    startIcon={<Visibility />}
                                    href={rama.pr_url}
                                    target="_blank"
                                    sx={{ mt: 1 }}
                                  >
                                    Ver en GitHub
                                  </Button>
                                </Grid>
                              )}
                            </Grid>
                          </CardContent>
                        </Card>

                        {/* Información detallada del PR de GitHub */}
                        {renderPRDetails(rama)}

                        {/* Comentarios y acciones para este PR */}
                        {rama.pr_number && (
                          <Card>
                            <CardContent>
                              <Typography variant="h6" gutterBottom>
                                Revisión del PR {rama.repository_type}
                              </Typography>
                              
                              <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label={`Comentarios para ${rama.repository_type}`}
                                placeholder="Agregar comentarios sobre este Pull Request..."
                                value={comentariosPR[rama.repository_type] || ''}
                                onChange={(e) => setComentariosPR(prev => ({
                                  ...prev,
                                  [rama.repository_type]: e.target.value
                                }))}
                                sx={{ mb: 2 }}
                              />
                              
                              <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button
                                  variant="outlined"
                                  color="error"
                                  startIcon={<Close />}
                                  onClick={() => handleRechazarPRIndividual(rama.repository_type)}
                                  disabled={procesandoPR[`rechazar_${rama.repository_type}`] || rama.pr_status === 'REJECTED'}
                                >
                                  {procesandoPR[`rechazar_${rama.repository_type}`] ? 'Rechazando...' : 'Rechazar'}
                                </Button>
                                
                                <Button
                                  variant="contained"
                                  color="success"
                                  startIcon={<Check />}
                                  onClick={() => handleAprobarPRIndividual(rama.repository_type)}
                                  disabled={procesandoPR[`aprobar_${rama.repository_type}`] || rama.pr_status === 'APPROVED'}
                                >
                                  {procesandoPR[`aprobar_${rama.repository_type}`] ? 'Aprobando...' : 'Aprobar'}
                                </Button>
                              </Box>
                            </CardContent>
                          </Card>
                        )}
                      </Box>
                    )
                  )}
                </Box>
              ) : (
                /* Un solo PR - sin tabs */
                <Box sx={{ p: 3 }}>
                  {prInfo.map((rama) => (
                    <Box key={rama.id}>
                      {/* Información básica del PR */}
                      <Card sx={{ mb: 3 }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <GitHub />
                            Pull Request {rama.repository_type}
                          </Typography>
                          
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                              <Typography variant="body2" color="text.secondary">Rama:</Typography>
                              <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>{rama.branch_name}</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Typography variant="body2" color="text.secondary">Estado en BD:</Typography>
                              <Chip 
                                label={rama.pr_status || 'PENDING'} 
                                color={
                                  rama.pr_status === 'APPROVED' ? 'success' : 
                                  rama.pr_status === 'REJECTED' ? 'error' : 
                                  rama.pr_status === 'IN_REVIEW' ? 'warning' : 'default'
                                }
                                size="small"
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Typography variant="body2" color="text.secondary">PR #:</Typography>
                              <Typography variant="body1">{rama.pr_number || 'No creado'}</Typography>
                            </Grid>
                            {rama.pr_url && (
                              <Grid item xs={12} md={6}>
                                <Button
                                  variant="outlined"
                                  startIcon={<Visibility />}
                                  href={rama.pr_url}
                                  target="_blank"
                                  sx={{ mt: 1 }}
                                >
                                  Ver en GitHub
                                </Button>
                              </Grid>
                            )}
                          </Grid>
                        </CardContent>
                      </Card>

                      {/* Información detallada del PR de GitHub */}
                      {renderPRDetails(rama)}

                      {/* Comentarios y acciones para este PR */}
                      {rama.pr_number && (
                        <Card>
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              Revisión del PR {rama.repository_type}
                            </Typography>
                            
                            <TextField
                              fullWidth
                              multiline
                              rows={3}
                              label={`Comentarios para ${rama.repository_type}`}
                              placeholder="Agregar comentarios sobre este Pull Request..."
                              value={comentariosPR[rama.repository_type] || ''}
                              onChange={(e) => setComentariosPR(prev => ({
                                ...prev,
                                [rama.repository_type]: e.target.value
                              }))}
                              sx={{ mb: 2 }}
                            />
                            
                            <Box sx={{ display: 'flex', gap: 2 }}>
                              <Button
                                variant="outlined"
                                color="error"
                                startIcon={<Close />}
                                onClick={() => handleRechazarPRIndividual(rama.repository_type)}
                                disabled={procesandoPR[`rechazar_${rama.repository_type}`] || rama.pr_status === 'REJECTED'}
                              >
                                {procesandoPR[`rechazar_${rama.repository_type}`] ? 'Rechazando...' : 'Rechazar'}
                              </Button>
                              
                              <Button
                                variant="contained"
                                color="success"
                                startIcon={<Check />}
                                onClick={() => handleAprobarPRIndividual(rama.repository_type)}
                                disabled={procesandoPR[`aprobar_${rama.repository_type}`] || rama.pr_status === 'APPROVED'}
                              >
                                {procesandoPR[`aprobar_${rama.repository_type}`] ? 'Aprobando...' : 'Aprobar'}
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      )}
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          ) : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No se encontraron Pull Requests para esta solicitud
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={() => setDialogRevisionPR(false)}
            disabled={loading}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIÁLOGO DE RECHAZO DE PR CON COMENTARIOS DIFERENCIADOS */}
      <Dialog
        open={dialogRechazoPR}
        onClose={() => setDialogRechazoPR(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#fef2f2', color: '#dc2626' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Close />
            Rechazar Pull Request
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Proporciona comentarios específicos para el rechazo del PR:
            </Typography>
          </Box>

          {/* Comentario para el usuario solicitante */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#2563eb' }}>
              👤 Mensaje para el Usuario Solicitante
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Este mensaje será visible para el usuario que creó la solicitud:
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Ej: Se requieren cambios en la funcionalidad solicitada antes de proceder con el despliegue."
              value={comentarioUsuario}
              onChange={(e) => setComentarioUsuario(e.target.value)}
              variant="outlined"
            />
          </Box>

          {/* Comentario para el desarrollador */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#16a34a' }}>
              💻 Mensaje Técnico para el Desarrollador
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Este mensaje solo será visible para el desarrollador encargado del código:
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Ej: El código presenta problemas de performance en la línea 45. Considera usar useMemo para optimizar el renderizado. También revisa la lógica de validación en el componente FormUser.jsx"
              value={comentarioDesarrollador}
              onChange={(e) => setComentarioDesarrollador(e.target.value)}
              variant="outlined"
            />
          </Box>

          {selectedSolicitud?.github_pr_url && (
            <Box sx={{ 
              mt: 2, 
              p: 2, 
              bgcolor: '#f8fafc', 
              borderRadius: 1,
              border: 1,
              borderColor: 'divider'
            }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                PR a rechazar:
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<GitHub />}
                onClick={() => window.open(selectedSolicitud.github_pr_url, '_blank')}
              >
                Ver PR #{selectedSolicitud.github_pr_number} en GitHub
              </Button>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={() => {
              setDialogRechazoPR(false);
              setComentarioUsuario('');
              setComentarioDesarrollador('');
            }}
            disabled={loading}
          >
            Cancelar
          </Button>
          
          <Button
            variant="contained"
            color="error"
            startIcon={<Close />}
            onClick={handleRechazarPRConComentarios}
            disabled={loading || !comentarioUsuario.trim()}
          >
            {loading ? 'Rechazando...' : 'Confirmar Rechazo'}
          </Button>
        </DialogActions>
      </Dialog>

      </Box>
    </LocalizationProvider>
  );
};

export default AdminSolicitudes; 