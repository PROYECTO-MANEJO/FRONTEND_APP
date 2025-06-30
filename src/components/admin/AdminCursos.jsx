import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  IconButton,
  CircularProgress,

  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Divider,
  OutlinedInput,
  Checkbox,
  ListItemText
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  School,
  LocationOn,
  CalendarToday,
  People,
  Visibility,
  Category,
  Schedule,
  Person,
  Save,
  Cancel,
  Info,
  AttachMoney,
  Close
} from '@mui/icons-material';

import AdminSidebar from './AdminSidebar';
import { useSidebarLayout } from '../../hooks/useSidebarLayout';
import api from '../../services/api';

const AdminCursos = () => {
  const { getMainContentStyle } = useSidebarLayout();
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [refreshKey, setRefreshKey] = useState(0); // Para forzar re-renderización

  const [stats, setStats] = useState({
    totalCursos: 0,
    cursosActivos: 0,
    totalInscripciones: 0,
    capacidadTotal: 0
  });

  // Estados para el modal de crear/editar curso
  const [openModal, setOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loadingModal, setLoadingModal] = useState(false);
  const [errors, setErrors] = useState({});

  // Estados para datos del formulario
  const [categorias, setCategorias] = useState([]);
  const [organizadores, setOrganizadores] = useState([]);
  const [carreras, setCarreras] = useState([]);

  // Estados del curso
  const [curso, setCurso] = useState({
    nom_cur: '',
    des_cur: '',
    id_cat_cur: '',
    fec_ini_cur: '',
    fec_fin_cur: '',
    dur_cur: 0,
    ced_org_cur: '',
    capacidad_max_cur: '',
    tipo_audiencia_cur: '',
    carreras_seleccionadas: [],
    requiere_verificacion_docs: true,
    es_gratuito: true,
    precio: '',
    porcentaje_asistencia_aprobacion: 80,
    nota_minima_aprobacion: 7.0
  });

  const TIPOS_AUDIENCIA = [
    { value: 'CARRERA_ESPECIFICA', label: 'Carrera Específica', description: 'Solo para estudiantes de carreras seleccionadas' },
    { value: 'TODAS_CARRERAS', label: 'Todas las Carreras', description: 'Para estudiantes de todas las carreras de la universidad' },
    { value: 'PUBLICO_GENERAL', label: 'Público General', description: 'Para estudiantes y usuarios externos' }
  ];

  const fechaMinima = new Date().toISOString().split('T')[0];

  useEffect(() => {
    cargarDatos();
    cargarDatosFormulario();
  }, []);

  // Calcular duración automáticamente basada en días
  useEffect(() => {
    if (curso.fec_ini_cur && curso.fec_fin_cur) {
      const fechaInicio = new Date(curso.fec_ini_cur);
      const fechaFin = new Date(curso.fec_fin_cur);
      
      // Calcular días
      const diffTiempo = fechaFin.getTime() - fechaInicio.getTime();
      const diffDias = Math.ceil(diffTiempo / (1000 * 3600 * 24)) + 1;

      if (diffDias > 0) {
        // Asumir 8 horas por día para cursos
        const duracionTotal = diffDias * 8;
        setCurso(prev => ({ ...prev, dur_cur: duracionTotal }));
      }
    }
  }, [curso.fec_ini_cur, curso.fec_fin_cur]);

  const cargarDatosFormulario = async () => {
    try {
      const [categoriasRes, organizadoresRes, carrerasRes] = await Promise.all([
        api.get('/categorias'),
        api.get('/organizadores'),
        api.get('/carreras')
      ]);

      setCategorias(categoriasRes.data.categorias || []);
      setOrganizadores(organizadoresRes.data.organizadores || []);
      setCarreras(carrerasRes.data.data || []);
    } catch (error) {
      console.error('Error cargando datos del formulario:', error);
    }
  };

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Cargar cursos
      const cursosResponse = await api.get('/cursos');
      const cursosData = cursosResponse.data.cursos || [];
      setCursos(cursosData);
      
      // Calcular estadísticas
      const totalCursos = cursosData.length;
      const cursosActivos = cursosData.filter(c => {
        const estado = obtenerEstadoCurso(c.fec_ini_cur, c.fec_fin_cur, c.estado);
        return estado === 'EN_CURSO' || estado === 'PROXIMAMENTE';
      }).length;
      const totalInscripciones = cursosData.reduce((sum, c) => sum + (c.total_inscripciones || 0), 0);
      const capacidadTotal = cursosData.reduce((sum, c) => sum + parseInt(c.capacidad_max_cur || 0), 0);
      
      setStats({
        totalCursos,
        cursosActivos,
        totalInscripciones,
        capacidadTotal
      });
      
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setSnackbar({
        open: true,
        message: 'Error al cargar los datos',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Funciones del modal
  const handleOpenModal = (cursoData = null) => {
    setIsEditing(Boolean(cursoData));
    setSelectedCourse(cursoData);
    
    if (cursoData) {
      // Modo edición - cargar datos del curso
      const formatearFecha = (fecha) => {
        if (!fecha) return '';
        return new Date(fecha).toISOString().split('T')[0];
      };



      setCurso({
        nom_cur: cursoData.nom_cur || '',
        des_cur: cursoData.des_cur || '',
        id_cat_cur: cursoData.id_cat_cur || '',
        fec_ini_cur: formatearFecha(cursoData.fec_ini_cur),
        fec_fin_cur: formatearFecha(cursoData.fec_fin_cur),
        dur_cur: cursoData.dur_cur || 0,
        ced_org_cur: cursoData.ced_org_cur || '',
        capacidad_max_cur: cursoData.capacidad_max_cur || '',
        tipo_audiencia_cur: cursoData.tipo_audiencia_cur || '',
        carreras_seleccionadas: cursoData.carreras ? cursoData.carreras.map(c => c.id) : [],
        requiere_verificacion_docs: cursoData.requiere_verificacion_docs !== undefined ? cursoData.requiere_verificacion_docs : true,
        es_gratuito: cursoData.es_gratuito !== undefined ? cursoData.es_gratuito : true,
        precio: cursoData.precio || '',
        porcentaje_asistencia_aprobacion: cursoData.porcentaje_asistencia_aprobacion || 80,
        nota_minima_aprobacion: cursoData.nota_minima_aprobacion || 7.0
      });
    } else {
      // Modo creación - limpiar formulario
      setCurso({
        nom_cur: '',
        des_cur: '',
        id_cat_cur: '',
        fec_ini_cur: '',
        fec_fin_cur: '',
        dur_cur: 0,
        ced_org_cur: '',
        capacidad_max_cur: '',
        tipo_audiencia_cur: '',
        carreras_seleccionadas: [],
        requiere_verificacion_docs: true,
        es_gratuito: true,
        precio: '',
        porcentaje_asistencia_aprobacion: 80,
        nota_minima_aprobacion: 7.0
      });
    }
    
    setErrors({});
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedCourse(null);
    setIsEditing(false);
    setErrors({});
  };

  const handleSubmitModal = async () => {
    // Validar formulario
    const nuevosErrores = {};

    // Validaciones básicas
    if (!curso.nom_cur.trim()) {
      nuevosErrores.nom_cur = 'El nombre del curso es obligatorio';
    } else if (curso.nom_cur.trim().length < 3) {
      nuevosErrores.nom_cur = 'El nombre debe tener al menos 3 caracteres';
    }

    if (!curso.des_cur.trim()) {
      nuevosErrores.des_cur = 'La descripción es obligatoria';
    }

    if (!curso.id_cat_cur) {
      nuevosErrores.id_cat_cur = 'Seleccione una categoría';
    }

    if (!curso.fec_ini_cur) {
      nuevosErrores.fec_ini_cur = 'La fecha de inicio es obligatoria';
    }

    if (!curso.fec_fin_cur) {
      nuevosErrores.fec_fin_cur = 'La fecha de fin es obligatoria';
    }

    if (!curso.ced_org_cur) {
      nuevosErrores.ced_org_cur = 'Seleccione un organizador';
    }

    if (!curso.capacidad_max_cur || curso.capacidad_max_cur <= 0) {
      nuevosErrores.capacidad_max_cur = 'La capacidad debe ser mayor a 0';
    }

    if (!curso.tipo_audiencia_cur) {
      nuevosErrores.tipo_audiencia_cur = 'Seleccione el tipo de audiencia';
    }

    if (curso.tipo_audiencia_cur === 'CARRERA_ESPECIFICA' && curso.carreras_seleccionadas.length === 0) {
      nuevosErrores.carreras_seleccionadas = 'Seleccione al menos una carrera';
    }

    // Validaciones de fechas
    if (curso.fec_ini_cur && curso.fec_fin_cur && curso.fec_fin_cur < curso.fec_ini_cur) {
      nuevosErrores.fec_fin_cur = 'La fecha de fin no puede ser anterior a la fecha de inicio';
    }

    // Validar configuración de precio
    if (!curso.es_gratuito) {
      if (!curso.precio || curso.precio === '') {
        nuevosErrores.precio = 'El precio es obligatorio para cursos pagados';
      } else {
        const precio = parseFloat(curso.precio);
        if (isNaN(precio) || precio <= 0) {
          nuevosErrores.precio = 'El precio debe ser un número mayor a 0';
        } else if (precio > 10000) {
          nuevosErrores.precio = 'El precio no puede exceder $10,000';
        }
      }
    }

    // Validar criterios de aprobación (OBLIGATORIOS)
    if (!curso.porcentaje_asistencia_aprobacion || curso.porcentaje_asistencia_aprobacion === '') {
      nuevosErrores.porcentaje_asistencia_aprobacion = 'El porcentaje de asistencia mínimo es obligatorio';
    } else {
      const porcentajeAsistencia = parseFloat(curso.porcentaje_asistencia_aprobacion);
      if (isNaN(porcentajeAsistencia) || porcentajeAsistencia < 0 || porcentajeAsistencia > 100) {
        nuevosErrores.porcentaje_asistencia_aprobacion = 'El porcentaje de asistencia debe ser un número entre 0 y 100';
      }
    }

    if (!curso.nota_minima_aprobacion || curso.nota_minima_aprobacion === '') {
      nuevosErrores.nota_minima_aprobacion = 'La nota mínima de aprobación es obligatoria';
    } else {
      const notaMinima = parseFloat(curso.nota_minima_aprobacion);
      if (isNaN(notaMinima) || notaMinima < 0 || notaMinima > 10) {
        nuevosErrores.nota_minima_aprobacion = 'La nota mínima debe ser un número entre 0 y 10';
      }
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrors(nuevosErrores);
      return;
    }

    // Enviar datos
    try {
      setLoadingModal(true);
      
      const cursoData = {
        nom_cur: curso.nom_cur.trim(),
        des_cur: curso.des_cur.trim(),
        id_cat_cur: curso.id_cat_cur,
        fec_ini_cur: curso.fec_ini_cur,
        fec_fin_cur: curso.fec_fin_cur,
        dur_cur: parseInt(curso.dur_cur),
        ced_org_cur: curso.ced_org_cur,
        capacidad_max_cur: parseInt(curso.capacidad_max_cur),
        tipo_audiencia_cur: curso.tipo_audiencia_cur,
        requiere_verificacion_docs: curso.requiere_verificacion_docs,
        es_gratuito: curso.es_gratuito,
        precio: curso.es_gratuito ? null : parseFloat(curso.precio),
        porcentaje_asistencia_aprobacion: parseFloat(curso.porcentaje_asistencia_aprobacion),
        nota_minima_aprobacion: parseFloat(curso.nota_minima_aprobacion)
      };

      let cursoId;
      
      if (isEditing) {
        // Actualizar curso existente
        const response = await api.put(`/cursos/${selectedCourse.id_cur}`, cursoData);
        
        // Verificar que la respuesta sea exitosa
        if (response.data && response.data.success) {
          cursoId = selectedCourse.id_cur;
          
          setSnackbar({
            open: true,
            message: 'Curso actualizado exitosamente',
            severity: 'success'
          });
        } else {
          throw new Error('Respuesta inesperada del servidor');
        }
      } else {
        // Crear nuevo curso (las carreras se incluyen en el payload principal)
        const response = await api.post('/cursos', cursoData);
        
        // Verificar que la respuesta sea exitosa
        if (response.data && response.data.success) {
          cursoId = response.data?.curso?.id_cur;
          
          setSnackbar({
            open: true,
            message: 'Curso creado exitosamente',
            severity: 'success'
          });
        } else {
          throw new Error('Respuesta inesperada del servidor');
        }
      }

      // Manejar carreras si es necesario
      if (curso.tipo_audiencia_cur === 'CARRERA_ESPECIFICA' && cursoId) {
        if (isEditing) {
          // Para edición: eliminar asociaciones existentes
          try {
            const asociacionesResponse = await api.get('/cursosPorCarrera/listar');
            const asociacionesActuales = asociacionesResponse.data.data.filter(
              asoc => asoc.id_cur_per === cursoId
            );

            // Eliminar asociaciones existentes
            for (const asociacion of asociacionesActuales) {
              await api.delete('/cursosPorCarrera/eliminar', {
                data: {
                  cursoId: cursoId,
                  carreraId: asociacion.id_car_per
                }
              });
            }
          } catch (error) {
            console.warn('Error eliminando asociaciones previas:', error);
          }
        }

        // Crear nuevas asociaciones
        if (curso.carreras_seleccionadas.length > 0) {
          for (const carreraId of curso.carreras_seleccionadas) {
            try {
              await api.post('/cursosPorCarrera/asociar', {
                cursoId: cursoId,
                carreraId: carreraId
              });
            } catch (error) {
              console.warn('Error asociando carrera:', carreraId, error);
            }
          }
        }
      }
      
      handleCloseModal();
      cargarDatos(); // Recargar datos
      
    } catch (error) {
      console.error('Error al guardar curso:', error);
      setSnackbar({
        open: true,
        message: `Error al ${isEditing ? 'actualizar' : 'crear'} el curso`,
        severity: 'error'
      });
    } finally {
      setLoadingModal(false);
    }
  };

  const handleDelete = async (cursoId) => {
    if (window.confirm('¿Está seguro de que desea eliminar este curso?')) {
      try {
        await api.delete(`/cursos/${cursoId}`);
        setSnackbar({
          open: true,
          message: 'Curso eliminado exitosamente',
          severity: 'success'
        });
        cargarDatos(); // Recargar datos
      } catch (error) {
        console.error('Error al eliminar curso:', error);
        setSnackbar({
          open: true,
          message: 'Error al eliminar el curso',
          severity: 'error'
        });
      }
    }
  };

  const handleCerrarCurso = async (cursoId, nombreCurso) => {
    console.log('🚀 Iniciando cierre de curso:', { cursoId, nombreCurso });
    
    if (window.confirm(`¿Estás seguro de que quieres cerrar el curso "${nombreCurso}"? Esta acción generará certificados automáticamente para los participantes aprobados y no se puede deshacer.`)) {
      try {
        console.log('📤 Enviando petición de cierre...');
        const response = await api.put(`/cursos/${cursoId}/cerrar`);
        
        console.log('✅ Respuesta del servidor:', response.data);
        
        setSnackbar({
          open: true,
          message: response.data.message || 'Curso cerrado correctamente',
          severity: 'success'
        });
        
        // Mostrar estadísticas si están disponibles
        if (response.data.estadisticas) {
          const stats = response.data.estadisticas;
          console.log('📊 Estadísticas del cierre:', stats);
          
          // Opcional: mostrar un dialogo con más detalles
          setTimeout(() => {
            setSnackbar({
              open: true,
              message: `Certificados generados: ${stats.certificadosGenerados}/${stats.participantesAprobados} participantes aprobados`,
              severity: 'info'
            });
          }, 3000);
        }
        
        console.log('🔄 Recargando datos...');
        // Pequeña pausa para asegurar que el backend procesó el cambio
        await new Promise(resolve => setTimeout(resolve, 500));
        await cargarDatos();
        
        // Verificación adicional: buscar el curso específico para confirmar su estado
        const cursosActualizados = await api.get('/cursos');
        const cursoActualizado = cursosActualizados.data.cursos.find(c => c.id_cur === cursoId);
        console.log('🔍 Estado del curso después del cierre:', {
          cursoId,
          estadoNuevo: cursoActualizado?.estado,
          curso: cursoActualizado
        });
        
        setRefreshKey(prev => prev + 1); // Forzar re-renderización
        console.log('✅ Datos recargados y componente actualizado');
        
      } catch (error) {
        console.error('❌ Error al cerrar curso:', error);
        console.error('📋 Detalles del error:', error.response?.data);
        
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'Error al cerrar el curso',
          severity: 'error'
        });
      }
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'EN_CURSO': return 'success';
      case 'FINALIZADO': return 'error';
      case 'PROXIMAMENTE': return 'warning';
      case 'ACTIVO': return 'success';
      case 'INACTIVO': return 'error';
      case 'PENDIENTE': return 'warning';
      default: return 'default';
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'No especificada';
    return new Date(fecha).toLocaleDateString('es-ES');
  };

  // Función auxiliar para obtener el estado del curso
  const obtenerEstadoCurso = (fechaInicio, fechaFin, estadoDB = null) => {
    // Si el curso está cerrado en la base de datos, siempre mostrar FINALIZADO
    if (estadoDB === 'CERRADO') {
      console.log('✅ Curso cerrado en BD, retornando FINALIZADO para:', { estadoDB });
      return 'FINALIZADO';
    }
    
    const hoy = new Date();
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    
    if (hoy < inicio) return 'PROXIMAMENTE';
    if (hoy >= inicio && hoy <= fin) return 'EN_CURSO';
    if (hoy > fin) return 'FINALIZADO';
    return 'ACTIVO'; // Estado por defecto para cursos sin fechas específicas
  };

  const statsCards = [
    {
      title: 'Total Cursos',
      value: stats.totalCursos,
      icon: <School />,
      color: '#6d1313'
    },
    {
      title: 'Cursos Activos',
      value: stats.cursosActivos,
      icon: <Category />,
      color: '#10b981'
    },
    {
      title: 'Total Inscripciones',
      value: stats.totalInscripciones,
      icon: <People />,
      color: '#3b82f6'
    },
    {
      title: 'Capacidad Total',
      value: stats.capacidadTotal,
      icon: <Person />,
      color: '#8b5cf6'
    }
  ];

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f5f5f5' }}>
      <AdminSidebar />
      
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3, ...getMainContentStyle() }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold', color: '#6d1313' }}>
          Gestión de Cursos
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Administra y visualiza todos los cursos del sistema
        </Typography>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statsCards.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: stat.color, mr: 2 }}>
                    {stat.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Título de la lista */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333' }}>
            Lista de Cursos ({cursos.length})
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenModal()}
            sx={{
              bgcolor: '#6d1313',
              '&:hover': { bgcolor: '#8b1a1a' },
              borderRadius: 2,
              px: 3
            }}
          >
            Nuevo Curso
          </Button>
        </Box>

        {/* Lista de cursos */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {cursos.map((curso) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={`${curso.id_cur}-${refreshKey}`}>
                <Card sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                  }
                }}>
                  <CardContent sx={{ flexGrow: 1, p: 2, width: '400px' }}>
                    {/* Header del curso */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 'bold', 
                          mb: 1, 
                          lineHeight: 1.2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}>
                          {curso.nom_cur}
                        </Typography>
                        <Chip 
                          label={obtenerEstadoCurso(curso.fec_ini_cur, curso.fec_fin_cur, curso.estado)} 
                          color={getEstadoColor(obtenerEstadoCurso(curso.fec_ini_cur, curso.fec_fin_cur, curso.estado))}
                          size="small"
                        />
                      </Box>
                      <Avatar sx={{ bgcolor: '#6d1313', width: 32, height: 32 }}>
                        <School sx={{ fontSize: 18 }} />
                      </Avatar>
                    </Box>

                    {/* Descripción */}
                    <Typography variant="body2" color="text.secondary" sx={{ 
                      mb: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {curso.des_cur}
                    </Typography>

                    {/* Información del curso */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {formatearFecha(curso.fec_ini_cur)} - {formatearFecha(curso.fec_fin_cur)}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Schedule sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {curso.dur_cur} horas totales
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Category sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {curso.categoria_nombre || 'Sin categoría'}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <People sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {curso.total_inscripciones || 0} / {curso.capacidad_max_cur || 'Sin límite'}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Person sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {curso.organizador_nombre || 'Sin organizador'}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AttachMoney sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {curso.es_gratuito ? 'Gratuito' : `$${curso.precio || '0'}`}
                        </Typography>
                        <Chip 
                          label={curso.es_gratuito ? 'GRATIS' : 'PAGADO'} 
                          size="small"
                          color={curso.es_gratuito ? 'success' : 'warning'}
                          variant="outlined"
                          sx={{ ml: 1, fontSize: '0.7rem' }}
                        />
                      </Box>
                    </Box>

                    {/* Tipo de audiencia */}
                    <Box sx={{ mb: 2 }}>
                      {curso.tipo_audiencia_cur && (
                        <Chip 
                          label={curso.tipo_audiencia_cur.replace('_', ' ')} 
                          size="small" 
                          variant="outlined"
                          sx={{ mb: 1 }}
                        />
                      )}
                      {curso.requiere_verificacion_docs && (
                        <Chip 
                          label="Verificación Docs" 
                          size="small" 
                          sx={{ mr: 1, mb: 1, bgcolor: '#6d1313', color: 'white' }}
                        />
                      )}
                    </Box>

                    {/* Carreras asociadas */}
                    {curso.carreras && curso.carreras.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                          Carreras:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {curso.carreras.slice(0, 2).map((carrera) => (
                            <Chip 
                              key={carrera.id}
                              label={carrera.nombre}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem' }}
                            />
                          ))}
                          {curso.carreras.length > 2 && (
                            <Chip 
                              label={`+${curso.carreras.length - 2} más`}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem' }}
                            />
                          )}
                        </Box>
                      </Box>
                    )}
                    
                    {/* Botones de acción */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 'auto' }}>
                      <IconButton
                        color="info" 
                        size="small"
                        title="Ver detalles"
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton
                        color="primary"
                        size="small"
                        title="Editar curso"
                        onClick={() => handleOpenModal(curso)}
                      >
                        <Edit />
                      </IconButton>
                      {/* Botón para cerrar curso - solo visible si está EN_CURSO */}
                      {obtenerEstadoCurso(curso.fec_ini_cur, curso.fec_fin_cur, curso.estado) === 'EN_CURSO' && (
                        <IconButton
                          color="warning"
                          size="small"
                          title="Cerrar curso"
                          onClick={() => handleCerrarCurso(curso.id_cur, curso.nom_cur)}
                        >
                          <Close />
                        </IconButton>
                      )}
                      <IconButton 
                        color="error" 
                        size="small" 
                        onClick={() => handleDelete(curso.id_cur)}
                        title="Eliminar curso"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}



        {/* Modal de Crear/Editar Curso */}
        <Dialog 
          open={openModal} 
          onClose={handleCloseModal} 
          maxWidth="lg" 
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3 }
          }}
        >
          <DialogTitle sx={{ 
            bgcolor: '#6d1313', 
            color: 'white',
            display: 'flex',
            alignItems: 'center'
          }}>
            {isEditing ? <Edit sx={{ mr: 1 }} /> : <School sx={{ mr: 1 }} />}
            {isEditing ? 'Editar Curso' : 'Crear Nuevo Curso'}
          </DialogTitle>
          
          <DialogContent sx={{ p: 3 }}>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {/* Información Básica */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <Info sx={{ mr: 1 }} />
                  Información Básica
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Nombre del Curso"
                      value={curso.nom_cur}
                      onChange={(e) => setCurso(prev => ({ ...prev, nom_cur: e.target.value }))}
                      error={!!errors.nom_cur}
                      helperText={errors.nom_cur}
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth error={!!errors.id_cat_cur}>
                      <InputLabel>Categoría *</InputLabel>
                      <Select
                        value={curso.id_cat_cur}
                        onChange={(e) => setCurso(prev => ({ ...prev, id_cat_cur: e.target.value }))}
                        label="Categoría *"
                      >
                        {categorias.map((categoria) => (
                          <MenuItem key={categoria.id_cat} value={categoria.id_cat}>
                            {categoria.nom_cat}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.id_cat_cur && <FormHelperText>{errors.id_cat_cur}</FormHelperText>}
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Descripción"
                      value={curso.des_cur}
                      onChange={(e) => setCurso(prev => ({ ...prev, des_cur: e.target.value }))}
                      error={!!errors.des_cur}
                      helperText={errors.des_cur}
                      multiline
                      rows={3}
                      required
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* Fechas y Horarios */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <Schedule sx={{ mr: 1 }} />
                  Fechas y Horarios
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Fecha de Inicio"
                      value={curso.fec_ini_cur}
                      onChange={(e) => setCurso(prev => ({ ...prev, fec_ini_cur: e.target.value }))}
                      error={!!errors.fec_ini_cur}
                      helperText={errors.fec_ini_cur}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ min: fechaMinima }}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Fecha de Fin"
                      value={curso.fec_fin_cur}
                      onChange={(e) => setCurso(prev => ({ ...prev, fec_fin_cur: e.target.value }))}
                      error={!!errors.fec_fin_cur}
                      helperText={errors.fec_fin_cur}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ min: curso.fec_ini_cur || fechaMinima }}
                      required
                    />
                  </Grid>



                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Duración Total (horas)"
                      value={curso.dur_cur}
                      onChange={(e) => setCurso(prev => ({ ...prev, dur_cur: e.target.value }))}
                      helperText="Se calcula automáticamente, o puede editarse manualmente"
                      inputProps={{ min: 1 }}
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* Organización */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <People sx={{ mr: 1 }} />
                  Organización y Capacidad
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth error={!!errors.ced_org_cur}>
                      <InputLabel>Organizador *</InputLabel>
                      <Select
                        value={curso.ced_org_cur}
                        onChange={(e) => setCurso(prev => ({ ...prev, ced_org_cur: e.target.value }))}
                        label="Organizador *"
                      >
                        {organizadores.map((org) => (
                          <MenuItem key={org.ced_org} value={org.ced_org}>
                            {org.nom_org1} {org.nom_org2} {org.ape_org1} {org.ape_org2}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.ced_org_cur && <FormHelperText>{errors.ced_org_cur}</FormHelperText>}
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Capacidad Máxima"
                      value={curso.capacidad_max_cur}
                      onChange={(e) => setCurso(prev => ({ ...prev, capacidad_max_cur: e.target.value }))}
                      error={!!errors.capacidad_max_cur}
                      helperText={errors.capacidad_max_cur || 'Máximo 1000 personas'}
                      inputProps={{ min: 1, max: 1000 }}
                      required
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* Tipo de Audiencia */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <Category sx={{ mr: 1 }} />
                  Configuración de Audiencia
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth error={!!errors.tipo_audiencia_cur}>
                      <InputLabel>Tipo de Audiencia *</InputLabel>
                      <Select
                        value={curso.tipo_audiencia_cur}
                        onChange={(e) => setCurso(prev => ({ ...prev, tipo_audiencia_cur: e.target.value }))}
                        label="Tipo de Audiencia *"
                      >
                        {TIPOS_AUDIENCIA.map((tipo) => (
                          <MenuItem key={tipo.value} value={tipo.value}>
                            <Box>
                              <Typography variant="body1">{tipo.label}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {tipo.description}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.tipo_audiencia_cur && <FormHelperText>{errors.tipo_audiencia_cur}</FormHelperText>}
                    </FormControl>
                  </Grid>

                  {/* Selector de carreras solo para CARRERA_ESPECIFICA */}
                  {curso.tipo_audiencia_cur === 'CARRERA_ESPECIFICA' && (
                    <Grid item xs={12}>
                      <FormControl fullWidth error={!!errors.carreras_seleccionadas}>
                        <InputLabel>Carreras Específicas *</InputLabel>
                        <Select
                          multiple
                          value={curso.carreras_seleccionadas}
                          onChange={(e) => setCurso(prev => ({ ...prev, carreras_seleccionadas: e.target.value }))}
                          input={<OutlinedInput label="Carreras Específicas *" />}
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((value) => {
                                const carrera = carreras.find(c => c.id_car === value);
                                return (
                                  <Chip 
                                    key={value} 
                                    label={carrera?.nom_car || value}
                                    size="small"
                                    sx={{ bgcolor: '#6d1313', color: 'white' }}
                                  />
                                );
                              })}
                            </Box>
                          )}
                        >
                          {carreras.map((carrera) => (
                            <MenuItem key={carrera.id_car} value={carrera.id_car}>
                              <Checkbox 
                                checked={curso.carreras_seleccionadas.indexOf(carrera.id_car) > -1} 
                              />
                              <ListItemText 
                                primary={carrera.nom_car}
                                secondary={carrera.des_car}
                              />
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.carreras_seleccionadas && (
                          <FormHelperText>{errors.carreras_seleccionadas}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Checkbox
                        checked={curso.requiere_verificacion_docs}
                        onChange={(e) => setCurso(prev => ({ ...prev, requiere_verificacion_docs: e.target.checked }))}
                      />
                      <Typography>Requiere verificación de documentos</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>

              {/* Configuración de Precio */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <AttachMoney sx={{ mr: 1 }} />
                  Configuración de Precio
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl error={!!errors.es_gratuito}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Checkbox
                          checked={curso.es_gratuito}
                          onChange={(e) => {
                            const isGratuito = e.target.checked;
                            setCurso(prev => ({ 
                              ...prev, 
                              es_gratuito: isGratuito,
                              precio: isGratuito ? '' : prev.precio
                            }));
                          }}
                          sx={{ 
                            color: '#6d1313',
                            '&.Mui-checked': { color: '#6d1313' }
                          }}
                        />
                        <Typography variant="body1">
                          Curso gratuito (sin costo para los participantes)
                        </Typography>
                      </Box>
                      {errors.es_gratuito && <FormHelperText>{errors.es_gratuito}</FormHelperText>}
                    </FormControl>
                  </Grid>

                  {!curso.es_gratuito && (
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Precio (USD)"
                        value={curso.precio}
                        onChange={(e) => setCurso(prev => ({ ...prev, precio: e.target.value }))}
                        error={!!errors.precio}
                        helperText={errors.precio || 'Ingrese el precio del curso en dólares'}
                        inputProps={{ 
                          min: 0.01, 
                          max: 10000,
                          step: 0.01
                        }}
                        InputProps={{
                          startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>$</Typography>
                        }}
                        required
                      />
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <Alert severity={curso.es_gratuito ? "success" : "info"}>
                      {curso.es_gratuito 
                        ? "Este curso será gratuito. Los estudiantes podrán inscribirse sin necesidad de proporcionar información de pago."
                        : "Este curso es pagado. Los estudiantes deberán proporcionar el método de pago y el comprobante al inscribirse."
                      }
                    </Alert>
                  </Grid>
                </Grid>
              </Grid>

              {/* Criterios de Aprobación */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', color: '#6d1313' }}>
                  <School sx={{ mr: 1 }} />
                  📋 Criterios de Aprobación (Obligatorios)
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Porcentaje mínimo de asistencia (%)"
                      value={curso.porcentaje_asistencia_aprobacion}
                      onChange={(e) => setCurso(prev => ({ ...prev, porcentaje_asistencia_aprobacion: e.target.value }))}
                      error={!!errors.porcentaje_asistencia_aprobacion}
                      helperText={errors.porcentaje_asistencia_aprobacion || 'Porcentaje mínimo requerido para aprobar (0-100)'}
                      inputProps={{ 
                        min: 0, 
                        max: 100,
                        step: 1
                      }}
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&.Mui-focused fieldset': {
                            borderColor: '#6d1313',
                          },
                        },
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Nota mínima de aprobación"
                      value={curso.nota_minima_aprobacion}
                      onChange={(e) => setCurso(prev => ({ ...prev, nota_minima_aprobacion: e.target.value }))}
                      error={!!errors.nota_minima_aprobacion}
                      helperText={errors.nota_minima_aprobacion || 'Nota mínima para aprobar el curso (0-10)'}
                      inputProps={{ 
                        min: 0, 
                        max: 10,
                        step: 0.1
                      }}
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&.Mui-focused fieldset': {
                            borderColor: '#6d1313',
                          },
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Alert severity="warning" sx={{ bgcolor: '#fff3cd', borderColor: '#6d1313' }}>
                      <strong>Importante:</strong> Los participantes deberán cumplir con al menos el {curso.porcentaje_asistencia_aprobacion}% de asistencia y obtener una nota mínima de {curso.nota_minima_aprobacion} para aprobar el curso y recibir su certificado.
                    </Alert>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 3, bgcolor: '#f5f5f5' }}>
            <Button 
              onClick={handleCloseModal}
              startIcon={<Cancel />}
              disabled={loadingModal}
            >
              Cancelar
            </Button>
            <Button 
              variant="contained"
              onClick={handleSubmitModal}
              startIcon={loadingModal ? <CircularProgress size={20} /> : <Save />}
              disabled={loadingModal}
              sx={{
                bgcolor: '#6d1313',
                '&:hover': { bgcolor: '#8b1a1a' }
              }}
            >
              {loadingModal 
                ? (isEditing ? 'Actualizando...' : 'Creando...') 
                : (isEditing ? 'Actualizar Curso' : 'Crear Curso')
              }
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default AdminCursos;