import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Alert,
    CircularProgress,
  Grid,
  Card,
  CardContent,
  Chip,
  FormHelperText,
  Divider,
    OutlinedInput,
    Checkbox,
  ListItemText
} from '@mui/material';
import {
  Event,
  Save,
  Cancel,
  Info,
  Schedule,
  LocationOn,
  People,
  Category,
  Edit,
  AttachMoney,
  Assignment,
  CheckCircle
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { useSidebarLayout } from '../../hooks/useSidebarLayout';
import api from '../../services/api';

const AREAS_EVENTO = [
  'PRACTICA',
  'INVESTIGACION', 
  'ACADEMICA',
  'TECNICA',
  'INDUSTRIAL',
  'EMPRESARIAL',
  'IA',
  'REDES'
];

const TIPOS_AUDIENCIA = [
  { value: 'CARRERA_ESPECIFICA', label: 'Carrera Específica', description: 'Solo para estudiantes de carreras seleccionadas' },
  { value: 'TODAS_CARRERAS', label: 'Todas las Carreras', description: 'Para estudiantes de todas las carreras de la universidad' },
  { value: 'PUBLICO_GENERAL', label: 'Público General', description: 'Para estudiantes y usuarios externos' }
];

const CrearEventos = () => {
  const { getMainContentStyle } = useSidebarLayout();
  const { id } = useParams(); // Para detectar si estamos editando
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  // Estados principales
    const [evento, setEvento] = useState({
        nom_eve: '',
        des_eve: '',
        id_cat_eve: '',
        fec_ini_eve: '',
        fec_fin_eve: '',
        hor_ini_eve: '',
        hor_fin_eve: '',
        dur_eve: 0,
        are_eve: '',
        ubi_eve: '',
        ced_org_eve: '',
        capacidad_max_eve: '',
        tipo_audiencia_eve: '',
        es_gratuito: true,
        precio: '',
        carreras_seleccionadas: [],
        requiere_carta_motivacion: true,
        carta_motivacion: '',
    porcentaje_asistencia_aprobacion: 80,
    estado: 'ACTIVO', // ACTIVO, CERRADO
  });


  // Estados para datos del backend
  const [categorias, setCategorias] = useState([]);
  const [organizadores, setOrganizadores] = useState([]);
  const [carreras, setCarreras] = useState([]);

  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [loadingEvento, setLoadingEvento] = useState(false);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'info' });

  // Fecha mínima (hoy)
  const fechaMinima = new Date().toISOString().split('T')[0];

    // Cargar datos iniciales
    useEffect(() => {
    const cargarDatos = async () => {
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
        console.error('Error cargando datos:', error);
        setAlert({
          show: true,
          message: 'Error al cargar los datos necesarios',
          severity: 'error'
        });
      }
    };

    cargarDatos();
    }, []);

  // Cargar evento para editar
  useEffect(() => {
    if (isEditing && id) {
      cargarEvento();
    }
  }, [isEditing, id]);

  const cargarEvento = async () => {
    try {
      setLoadingEvento(true);
      const response = await api.get(`/eventos/${id}`);
      const eventoData = response.data.evento;
      
      // Formatear fechas para los inputs
      const formatearFecha = (fecha) => {
        if (!fecha) return '';
        return new Date(fecha).toISOString().split('T')[0];
      };

      const formatearHora = (hora) => {
        if (!hora) return '';
        if (typeof hora === 'string' && hora.includes(':')) {
          return hora.substring(0, 5); // HH:MM
        }
        return hora;
      };

      setEvento({
        nom_eve: eventoData.nom_eve || '',
        des_eve: eventoData.des_eve || '',
        id_cat_eve: eventoData.id_cat_eve || '',
        fec_ini_eve: formatearFecha(eventoData.fec_ini_eve),
        fec_fin_eve: formatearFecha(eventoData.fec_fin_eve),
        hor_ini_eve: formatearHora(eventoData.hora_inicio || eventoData.hor_ini_eve),
        hor_fin_eve: formatearHora(eventoData.hora_fin || eventoData.hor_fin_eve),
        dur_eve: eventoData.dur_eve || 0,
        are_eve: eventoData.are_eve || '',
        ubi_eve: eventoData.ubi_eve || '',
        ced_org_eve: eventoData.ced_org_eve || '',
        capacidad_max_eve: eventoData.capacidad_max_eve || '',
        tipo_audiencia_eve: eventoData.tipo_audiencia_eve || '',
        es_gratuito: eventoData.es_gratuito !== undefined ? eventoData.es_gratuito : true,
        precio: eventoData.precio || '',
        carreras_seleccionadas: eventoData.carreras ? eventoData.carreras.map(c => c.id) : [],

        requiere_carta_motivacion: Boolean(eventoData.requiere_carta_motivacion),
        carta_motivacion: eventoData.carta_motivacion || '',

        porcentaje_asistencia_aprobacion: eventoData.porcentaje_asistencia_aprobacion || 80,
        estado: eventoData.estado || 'ACTIVO'
      });

    } catch (error) {
      console.error('Error cargando evento:', error);
      setAlert({
        show: true,
        message: 'Error al cargar el evento',
        severity: 'error'
      });
      navigate('/admin/eventos');
    } finally {
      setLoadingEvento(false);
    }
  };

  // Calcular duración automáticamente
  useEffect(() => {
    if (evento.fec_ini_eve && evento.fec_fin_eve && evento.hor_ini_eve && evento.hor_fin_eve) {
      const fechaInicio = new Date(evento.fec_ini_eve);
      const fechaFin = new Date(evento.fec_fin_eve);
      
      // Calcular días
      const diffTiempo = fechaFin.getTime() - fechaInicio.getTime();
      const diffDias = Math.ceil(diffTiempo / (1000 * 3600 * 24)) + 1;

      // Calcular horas por día
      const [horaIni, minIni] = evento.hor_ini_eve.split(':').map(Number);
      const [horaFin, minFin] = evento.hor_fin_eve.split(':').map(Number);
      
      const minutosInicio = horaIni * 60 + minIni;
      const minutosFin = horaFin * 60 + minFin;
      const horasPorDia = (minutosFin - minutosInicio) / 60;

      if (horasPorDia > 0 && diffDias > 0) {
        const duracionTotal = horasPorDia * diffDias;
        setEvento(prev => ({ ...prev, dur_eve: duracionTotal }));
      }
    }
  }, [evento.fec_ini_eve, evento.fec_fin_eve, evento.hor_ini_eve, evento.hor_fin_eve]);

  // Manejar cambios en los campos
  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setEvento(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Lógica especial para tipo de audiencia
    if (field === 'tipo_audiencia_eve') {
      if (value !== 'CARRERA_ESPECIFICA') {
        setEvento(prev => ({ ...prev, carreras_seleccionadas: [] }));
      }
    }

    // Lógica especial para configuración de precio
    if (field === 'es_gratuito') {
      if (value) {
        // Si se marca como gratuito, limpiar el precio
        setEvento(prev => ({ ...prev, precio: '' }));
      }
    }

    // Validación en tiempo real para porcentaje de asistencia
    if (field === 'porcentaje_asistencia_aprobacion') {
      const porcentaje = parseFloat(value);
      if (value && !isNaN(porcentaje)) {
        if (porcentaje < 0 || porcentaje > 100) {
          setErrors(prev => ({ ...prev, [field]: 'El porcentaje debe estar entre 0 y 100' }));
        } else if (porcentaje < 50 && porcentaje > 0) {
          setErrors(prev => ({ ...prev, [field]: 'Se recomienda un mínimo del 50% para eventos académicos' }));
        }
      }
    }

    // Validaciones en tiempo real
    if (field === 'fec_fin_eve' && evento.fec_ini_eve && value < evento.fec_ini_eve) {
      setErrors(prev => ({ ...prev, fec_fin_eve: 'La fecha de fin no puede ser anterior a la fecha de inicio' }));
    }
  };

  // Manejar selección de carreras
  const handleCarrerasChange = (event) => {
    const value = event.target.value;
    setEvento(prev => ({ ...prev, carreras_seleccionadas: value }));
    
    if (errors.carreras_seleccionadas) {
      setErrors(prev => ({ ...prev, carreras_seleccionadas: '' }));
    }
  };

  // Validar formulario
  const validarFormulario = () => {
    const nuevosErrores = {};

    // Validaciones básicas
    if (!evento.nom_eve.trim()) {
      nuevosErrores.nom_eve = 'El nombre del evento es obligatorio';
    } else if (evento.nom_eve.trim().length < 3) {
      nuevosErrores.nom_eve = 'El nombre debe tener al menos 3 caracteres';
    }

    if (!evento.des_eve.trim()) {
      nuevosErrores.des_eve = 'La descripción es obligatoria';
    }

    if (!evento.id_cat_eve) {
      nuevosErrores.id_cat_eve = 'Seleccione una categoría';
    }

    if (!evento.fec_ini_eve) {
      nuevosErrores.fec_ini_eve = 'La fecha de inicio es obligatoria';
    } else if (evento.fec_ini_eve < fechaMinima) {
      nuevosErrores.fec_ini_eve = 'La fecha de inicio no puede ser anterior a hoy';
    }

    if (!evento.fec_fin_eve) {
      nuevosErrores.fec_fin_eve = 'La fecha de fin es obligatoria';
    } else if (evento.fec_fin_eve < evento.fec_ini_eve) {
      nuevosErrores.fec_fin_eve = 'La fecha de fin no puede ser anterior a la fecha de inicio';
    }

    if (!evento.hor_ini_eve) {
      nuevosErrores.hor_ini_eve = 'La hora de inicio es obligatoria';
    } else {
      const [hora] = evento.hor_ini_eve.split(':').map(Number);
      if (hora < 8 || hora > 18) {
        nuevosErrores.hor_ini_eve = 'La hora de inicio debe estar entre 08:00 y 18:00';
      }
    }

    if (!evento.hor_fin_eve) {
      nuevosErrores.hor_fin_eve = 'La hora de fin es obligatoria';
    } else {
      const [hora] = evento.hor_fin_eve.split(':').map(Number);
      if (hora < 10 || hora > 20) {
        nuevosErrores.hor_fin_eve = 'La hora de fin debe estar entre 10:00 y 20:00';
      }
    }

    // Validar que hora fin sea mayor que hora inicio
    if (evento.hor_ini_eve && evento.hor_fin_eve) {
      const [hIni, mIni] = evento.hor_ini_eve.split(':').map(Number);
      const [hFin, mFin] = evento.hor_fin_eve.split(':').map(Number);
      const minutosIni = hIni * 60 + mIni;
      const minutosFin = hFin * 60 + mFin;

      if (minutosFin <= minutosIni) {
        nuevosErrores.hor_fin_eve = 'La hora de fin debe ser posterior a la hora de inicio';
      } else if (evento.fec_ini_eve === evento.fec_fin_eve && (minutosFin - minutosIni) < 120) {
        nuevosErrores.hor_fin_eve = 'Para eventos de un día, debe haber al menos 2 horas de diferencia';
      }
    }

    if (!evento.are_eve) {
      nuevosErrores.are_eve = 'Seleccione un área';
    }

    if (!evento.ubi_eve.trim()) {
      nuevosErrores.ubi_eve = 'La ubicación es obligatoria';
    }

    if (!evento.ced_org_eve) {
      nuevosErrores.ced_org_eve = 'Seleccione un organizador';
    }

    if (!evento.capacidad_max_eve || evento.capacidad_max_eve <= 0) {
      nuevosErrores.capacidad_max_eve = 'La capacidad debe ser mayor a 0';
    } else if (evento.capacidad_max_eve > 1000) {
      nuevosErrores.capacidad_max_eve = 'La capacidad no puede exceder 1000 personas';
    }

    if (!evento.tipo_audiencia_eve) {
      nuevosErrores.tipo_audiencia_eve = 'Seleccione el tipo de audiencia';
    }

    // Validar carreras si es carrera específica
    if (evento.tipo_audiencia_eve === 'CARRERA_ESPECIFICA' && evento.carreras_seleccionadas.length === 0) {
      nuevosErrores.carreras_seleccionadas = 'Debe seleccionar al menos una carrera';
    }

    // Validar configuración de precio
    if (!evento.es_gratuito) {
      if (!evento.precio || evento.precio === '') {
        nuevosErrores.precio = 'El precio es obligatorio para eventos pagados';
      } else {
        const precio = parseFloat(evento.precio);
        if (isNaN(precio) || precio <= 0) {
          nuevosErrores.precio = 'El precio debe ser un número mayor a 0';
        } else if (precio > 10000) {
          nuevosErrores.precio = 'El precio no puede exceder $10,000';
        }
      }
    }

    // Validar campos de aprobación
    if (!evento.porcentaje_asistencia_aprobacion || evento.porcentaje_asistencia_aprobacion === '') {
      nuevosErrores.porcentaje_asistencia_aprobacion = 'El porcentaje de asistencia mínimo es obligatorio';
    } else {
      const porcentajeAsistencia = parseFloat(evento.porcentaje_asistencia_aprobacion);
      if (isNaN(porcentajeAsistencia)) {
        nuevosErrores.porcentaje_asistencia_aprobacion = 'Debe ser un número válido';
      } else if (porcentajeAsistencia < 0) {
        nuevosErrores.porcentaje_asistencia_aprobacion = 'El porcentaje no puede ser menor a 0';
      } else if (porcentajeAsistencia > 100) {
        nuevosErrores.porcentaje_asistencia_aprobacion = 'El porcentaje no puede ser mayor a 100';
      } else if (porcentajeAsistencia < 50) {
        nuevosErrores.porcentaje_asistencia_aprobacion = 'Se recomienda un mínimo del 50% para eventos académicos';
      }
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

    // Manejar envío del formulario
    const handleSubmit = async () => {
    if (!validarFormulario()) {
      setAlert({
        show: true,
        message: 'Por favor corrija los errores en el formulario',
        severity: 'error'
      });
      return;
    }

        setLoading(true);
        try {
      // Preparar datos para el backend
      const datosEvento = {
        nom_eve: evento.nom_eve.trim(),
        des_eve: evento.des_eve.trim(),
        id_cat_eve: evento.id_cat_eve,
        fec_ini_eve: evento.fec_ini_eve,
        fec_fin_eve: evento.fec_fin_eve,
        hor_ini_eve: `${evento.hor_ini_eve}:00`,
        hor_fin_eve: `${evento.hor_fin_eve}:00`,
        dur_eve: parseInt(evento.dur_eve),
        are_eve: evento.are_eve,
        ubi_eve: evento.ubi_eve.trim(),
        ced_org_eve: evento.ced_org_eve,
        capacidad_max_eve: parseInt(evento.capacidad_max_eve),
        tipo_audiencia_eve: evento.tipo_audiencia_eve,
        es_gratuito: evento.es_gratuito,
        precio: evento.es_gratuito ? null : parseFloat(evento.precio),

        requiere_carta_motivacion: Boolean(evento.requiere_carta_motivacion),

        porcentaje_asistencia_aprobacion: parseInt(evento.porcentaje_asistencia_aprobacion, 10),
        estado: evento.estado || 'ACTIVO'

      };

      let eventoId;
      let response;

      if (isEditing) {
        // Actualizar evento existente
        response = await api.put(`/eventos/${id}`, datosEvento);
        eventoId = id;
        
        setAlert({
          show: true,
          message: 'Evento actualizado exitosamente',
          severity: 'success'
        });
      } else {
        // Crear nuevo evento
        response = await api.post('/eventos', datosEvento);
        eventoId = response.data?.data?.id_eve;
        
        setAlert({
          show: true,
          message: 'Evento creado exitosamente',
          severity: 'success'
        });
      }

      // Manejar asociaciones de carreras
      if (evento.tipo_audiencia_eve === 'CARRERA_ESPECIFICA' && eventoId) {
        if (isEditing) {
          // Para edición: eliminar asociaciones existentes y crear nuevas
          try {
            // Obtener asociaciones actuales
            const asociacionesResponse = await api.get('/eventosPorCarrera/listar');
            const asociacionesActuales = asociacionesResponse.data.data.filter(
              asoc => asoc.id_eve_per === eventoId
            );

            // Eliminar asociaciones existentes
            for (const asociacion of asociacionesActuales) {
              await api.delete('/eventosPorCarrera/eliminar', {
                data: {
                  eventoId: eventoId,
                  carreraId: asociacion.id_car_per
                }
              });
            }
          } catch (error) {
            console.warn('Error eliminando asociaciones previas:', error);
          }
        }

        // Crear nuevas asociaciones
        if (evento.carreras_seleccionadas.length > 0) {
          for (const carreraId of evento.carreras_seleccionadas) {
            try {
              await api.post('/eventosPorCarrera/asociar', {
                eventoId: eventoId,
                carreraId: carreraId
              });
            } catch (error) {
              console.warn('Error asociando carrera:', carreraId, error);
            }
          }
        }
      }

      // Redirigir después de un tiempo
      setTimeout(() => {
        if (isEditing) {
          navigate('/admin/eventos');
        } else {
          // Limpiar formulario para crear nuevo
          setEvento({
            nom_eve: '',
            des_eve: '',
            id_cat_eve: '',
            fec_ini_eve: '',
            fec_fin_eve: '',
            hor_ini_eve: '',
            hor_fin_eve: '',
            dur_eve: 0,
            are_eve: '',
            ubi_eve: '',
            ced_org_eve: '',
            capacidad_max_eve: '',
            tipo_audiencia_eve: '',
            carreras_seleccionadas: [],
            es_gratuito: true,
            precio: '',
            porcentaje_asistencia_aprobacion: 80,
            estado: 'ACTIVO'
          });
        }
        setAlert({ show: false, message: '', severity: 'info' });
      }, 2000);

        } catch (error) {
      console.error('Error al procesar evento:', error);
      setAlert({
        show: true,
        message: error.response?.data?.message || `Error al ${isEditing ? 'actualizar' : 'crear'} el evento`,
        severity: 'error'
      });
        } finally {
            setLoading(false);
        }
    };

  // Limpiar formulario
  const handleLimpiar = () => {
    setEvento({
      nom_eve: '',
      des_eve: '',
      id_cat_eve: '',
      fec_ini_eve: '',
      fec_fin_eve: '',
      hor_ini_eve: '',
      hor_fin_eve: '',
      dur_eve: 0,
      are_eve: '',
      ubi_eve: '',
      ced_org_eve: '',
      capacidad_max_eve: '',
      tipo_audiencia_eve: '',
      es_gratuito: true,
      precio: '',
      carreras_seleccionadas: [],
      porcentaje_asistencia_aprobacion: 80,
      estado: 'ACTIVO'
    });
    setErrors({});
    setAlert({ show: false, message: '', severity: 'info' });
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <AdminSidebar />
      
      <Box sx={{ flexGrow: 1, p: 3, ...getMainContentStyle() }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ color: '#6d1313', fontWeight: 'bold', mb: 1 }}>
            {isEditing ? <Edit sx={{ mr: 1, fontSize: '2rem' }} /> : <Event sx={{ mr: 1, fontSize: '2rem' }} />}
            {isEditing ? 'Editar Evento' : 'Crear Nuevo Evento'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isEditing 
              ? 'Modifique la información del evento según sea necesario'
              : 'Complete la información para registrar un nuevo evento en el sistema'
            }
          </Typography>
        </Box>

        {/* Alert */}
        {alert.show && (
          <Alert 
            severity={alert.severity} 
            sx={{ mb: 3 }}
            onClose={() => setAlert({ show: false, message: '', severity: 'info' })}
          >
            {alert.message}
          </Alert>
        )}

        {/* Loading del evento */}
        {loadingEvento && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3 }}>
            <CircularProgress sx={{ color: '#6d1313', mr: 2 }} />
            <Typography>Cargando datos del evento...</Typography>
          </Box>
        )}

        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Grid container spacing={4}>
            {/* Información Básica */}
            <Grid xs={12}>
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <Info sx={{ mr: 1 }} />
                    Información Básica
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Nombre del Evento"
                        value={evento.nom_eve}
                        onChange={handleChange('nom_eve')}
                        error={!!errors.nom_eve}
                        helperText={errors.nom_eve}
                        required
                      />
                    </Grid>
                    
                    <Grid xs={12} md={6}>
                      <FormControl fullWidth error={!!errors.id_cat_eve}>
                        <InputLabel>Categoría *</InputLabel>
                        <Select
                          value={evento.id_cat_eve}
                          onChange={handleChange('id_cat_eve')}
                          label="Categoría *"
                        >
                          {categorias.map((categoria) => (
                            <MenuItem key={categoria.id_cat} value={categoria.id_cat}>
                              {categoria.nom_cat}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.id_cat_eve && <FormHelperText>{errors.id_cat_eve}</FormHelperText>}
                      </FormControl>
                    </Grid>
                  </Grid>

                  <Grid container spacing={3}>
                    <Grid xs={12}>
                      <TextField
                        fullWidth
                        label="Descripción"
                        value={evento.des_eve}
                        onChange={handleChange('des_eve')}
                        error={!!errors.des_eve}
                        helperText={errors.des_eve}
                        multiline
                        rows={3}
                        required
                      />
                    </Grid>
                  </Grid>
                  
                  {/* Campos de aprobación - EXACTAMENTE COMO EN CURSOS */}
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Box sx={{ mt: 2, mb: 2, p: 2, border: '2px solid #6d1313', borderRadius: 2, bgcolor: '#fafafa' }}>
                        <Typography variant="h6" sx={{ color: '#6d1313', fontWeight: 'bold', mb: 2 }}>
                          📋 Criterios de Aprobación (Obligatorios)
                        </Typography>
                        
                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Porcentaje mínimo de asistencia (%)"
                            value={evento.porcentaje_asistencia_aprobacion}
                            onChange={handleChange('porcentaje_asistencia_aprobacion')}
                            error={!!errors.porcentaje_asistencia_aprobacion}
                            helperText={errors.porcentaje_asistencia_aprobacion || "Porcentaje mínimo requerido para aprobar (0-100)"}
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
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                  
                  <Grid container spacing={3}>
                    <Grid xs={12} md={6}>
                      <FormControl fullWidth error={!!errors.are_eve}>
                        <InputLabel>Área *</InputLabel>
                        <Select
                          value={evento.are_eve}
                          onChange={handleChange('are_eve')}
                          label="Área *"
                        >
                          {AREAS_EVENTO.map((area) => (
                            <MenuItem key={area} value={area}>
                              {area}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.are_eve && <FormHelperText>{errors.are_eve}</FormHelperText>}
                      </FormControl>
                    </Grid>

                    <Grid xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Ubicación"
                        value={evento.ubi_eve}
                        onChange={handleChange('ubi_eve')}
                        error={!!errors.ubi_eve}
                        helperText={errors.ubi_eve}
                        InputProps={{
                          startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                        }}
                        required
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Fechas y Horarios */}
            <Grid xs={12}>
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <Schedule sx={{ mr: 1 }} />
                    Fechas y Horarios
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid xs={12} md={6}>
                      <TextField
                        fullWidth
                        type="date"
                        label="Fecha de Inicio"
                        value={evento.fec_ini_eve}
                        onChange={handleChange('fec_ini_eve')}
                        error={!!errors.fec_ini_eve}
                        helperText={errors.fec_ini_eve}
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ min: fechaMinima }}
                        required
                      />
                    </Grid>

                    <Grid xs={12} md={6}>
                      <TextField
                        fullWidth
                        type="date"
                        label="Fecha de Fin"
                        value={evento.fec_fin_eve}
                        onChange={handleChange('fec_fin_eve')}
                        error={!!errors.fec_fin_eve}
                        helperText={errors.fec_fin_eve}
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ min: evento.fec_ini_eve || fechaMinima }}
                        required
                      />
                    </Grid>

                    <Grid xs={12} md={6}>
                      <TextField
                        fullWidth
                        type="time"
                        label="Hora de Inicio"
                        value={evento.hor_ini_eve}
                        onChange={handleChange('hor_ini_eve')}
                        error={!!errors.hor_ini_eve}
                        helperText={errors.hor_ini_eve || 'Entre 08:00 y 18:00'}
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ min: '08:00', max: '18:00' }}
                        required
                      />
                    </Grid>

                    <Grid xs={12} md={6}>
                      <TextField
                        fullWidth
                        type="time"
                        label="Hora de Fin"
                        value={evento.hor_fin_eve}
                        onChange={handleChange('hor_fin_eve')}
                        error={!!errors.hor_fin_eve}
                        helperText={errors.hor_fin_eve || 'Entre 10:00 y 20:00'}
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ min: '10:00', max: '20:00' }}
                        required
                      />
                    </Grid>

                    <Grid xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Duración Total (horas)"
                        value={evento.dur_eve}
                        InputProps={{ readOnly: true }}
                        helperText="Se calcula automáticamente"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Organización y Capacidad */}
            <Grid xs={12}>
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <People sx={{ mr: 1 }} />
                    Organización y Capacidad
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid xs={12} md={6}>
                      <FormControl fullWidth error={!!errors.ced_org_eve}>
                        <InputLabel>Organizador *</InputLabel>
                        <Select
                          value={evento.ced_org_eve}
                          onChange={handleChange('ced_org_eve')}
                          label="Organizador *"
                        >
                          {organizadores.map((org) => (
                            <MenuItem key={org.ced_org} value={org.ced_org}>
                              {org.nom_org1} {org.nom_org2} {org.ape_org1} {org.ape_org2}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.ced_org_eve && <FormHelperText>{errors.ced_org_eve}</FormHelperText>}
                      </FormControl>
                    </Grid>

                    <Grid xs={12} md={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Capacidad Máxima"
                        value={evento.capacidad_max_eve}
                        onChange={handleChange('capacidad_max_eve')}
                        error={!!errors.capacidad_max_eve}
                        helperText={errors.capacidad_max_eve || 'Máximo 1000 personas'}
                        inputProps={{ min: 1, max: 1000 }}
                        required
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Tipo de Audiencia */}
            <Grid xs={12}>
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <Category sx={{ mr: 1 }} />
                    Tipo de Audiencia
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid xs={12}>
                      <FormControl fullWidth error={!!errors.tipo_audiencia_eve}>
                        <InputLabel>Tipo de Audiencia *</InputLabel>
                        <Select
                          value={evento.tipo_audiencia_eve}
                          onChange={handleChange('tipo_audiencia_eve')}
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
                        {errors.tipo_audiencia_eve && <FormHelperText>{errors.tipo_audiencia_eve}</FormHelperText>}
                      </FormControl>
                    </Grid>

                    {/* Mostrar información del tipo seleccionado */}
                    {evento.tipo_audiencia_eve && (
                      <Grid xs={12}>
                        <Alert severity="info" sx={{ mb: 2 }}>
                          {TIPOS_AUDIENCIA.find(t => t.value === evento.tipo_audiencia_eve)?.description}
                        </Alert>
                      </Grid>
                    )}

                    {/* Selector de carreras solo para CARRERA_ESPECIFICA */}
                    {evento.tipo_audiencia_eve === 'CARRERA_ESPECIFICA' && (
                      <Grid xs={12}>
                        <FormControl fullWidth error={!!errors.carreras_seleccionadas}>
                          <InputLabel>Carreras Específicas *</InputLabel>
                          <Select
                            multiple
                            value={evento.carreras_seleccionadas}
                            onChange={handleCarrerasChange}
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
                                  checked={evento.carreras_seleccionadas.indexOf(carrera.id_car) > -1} 
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

                    {/* Mostrar mensaje para otros tipos */}
                    {(evento.tipo_audiencia_eve === 'TODAS_CARRERAS' || evento.tipo_audiencia_eve === 'PUBLICO_GENERAL') && (
                      <Grid xs={12}>
                        <Alert severity="success">
                          {evento.tipo_audiencia_eve === 'TODAS_CARRERAS' 
                            ? 'Este evento estará disponible automáticamente para todas las carreras de la universidad'
                            : 'Este evento estará disponible para estudiantes de todas las carreras y usuarios externos'
                          }
                        </Alert>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Configuración de Precio */}
            <Grid xs={12}>
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <AttachMoney sx={{ mr: 1 }} />
                    Configuración de Precio
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid xs={12}>
                      <FormControl error={!!errors.es_gratuito}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Checkbox
                            checked={evento.es_gratuito}
                            onChange={(e) => handleChange('es_gratuito')({ target: { value: e.target.checked } })}
                            sx={{ 
                              color: '#6d1313',
                              '&.Mui-checked': { color: '#6d1313' }
                            }}
                          />
                          <Typography variant="body1">
                            Evento gratuito (sin costo para los participantes)
                          </Typography>
                        </Box>
                        {errors.es_gratuito && <FormHelperText>{errors.es_gratuito}</FormHelperText>}
                      </FormControl>
                    </Grid>

                    {!evento.es_gratuito && (
                      <Grid xs={12} md={6}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Precio (USD)"
                          value={evento.precio}
                          onChange={handleChange('precio')}
                          error={!!errors.precio}
                          helperText={errors.precio || 'Ingrese el precio del evento en dólares'}
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

                    <Grid xs={12}>
                      <Alert severity={evento.es_gratuito ? "success" : "info"}>
                        {evento.es_gratuito 
                          ? "Este evento será gratuito. Los estudiantes podrán inscribirse sin necesidad de proporcionar información de pago."
                          : "Este evento es pagado. Los estudiantes deberán proporcionar el método de pago y el comprobante al inscribirse."
                        }
                      </Alert>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>


            {/* Requiere Carta de Motivación */}
            <Grid item xs={12}>
              <Box sx={{ mt: 3, mb: 1, p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ color: '#6d1313', fontWeight: 'bold', mr: 1 }}>
                    <span role="img" aria-label="motivación">📝</span> Configuración de Carta de Motivación
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Checkbox
                    checked={evento.requiere_carta_motivacion}
                    onChange={e => setEvento({ ...evento, requiere_carta_motivacion: e.target.checked })}
                    sx={{
                      color: '#6d1313',
                      '&.Mui-checked': { color: '#6d1313' }
                    }}
                  />
                  <Typography variant="body1">
                    Requiere carta de motivación
                  </Typography>
                </Box>
                {evento.requiere_carta_motivacion && (
                  <TextField
                    fullWidth
                    label="Carta de Motivación (opcional)"
                    multiline
                    rows={4}
                    value={evento.carta_motivacion || ''}
                    onChange={handleChange('carta_motivacion')}
                    placeholder="Texto de ejemplo para la carta de motivación"
                    sx={{ mt: 2 }}
                  />
                )}
              </Box>
            </Grid>

            {/* Botones de acción */}
            <Grid item xs={12}>
              <Divider sx={{ mb: 3 }} />
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>

                <Button
                  variant="contained"
                  size="large"
                  onClick={handleSubmit}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                  sx={{
                    minWidth: 200,
                    height: 50,
                    bgcolor: '#6d1313',
                    '&:hover': { bgcolor: '#5a1010' },
                    fontSize: '1.1rem',
                    fontWeight: 'bold'
                  }}
                >
                  {loading ? 'Guardando...' : (isEditing ? 'Actualizar Evento' : 'Crear Evento')}
                </Button>

                {!isEditing && (
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={handleLimpiar}
                    disabled={loading}
                    startIcon={<Cancel />}
                    sx={{
                      minWidth: 150,
                      height: 50,
                      borderColor: '#6d1313',
                      color: '#6d1313',
                      '&:hover': {
                        borderColor: '#5a1010',
                        bgcolor: '#f5f5f5'
                      },
                      fontSize: '1.1rem',
                      fontWeight: 'bold'
                    }}
                  >
                    Limpiar
                  </Button>
                )}

                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/admin/eventos')}
                  disabled={loading}
                  startIcon={<Cancel />}
                  sx={{
                    minWidth: 150,
                    height: 50,
                    borderColor: '#666',
                    color: '#666',
                    '&:hover': {
                      borderColor: '#555',
                      bgcolor: '#f5f5f5'
                    },
                    fontSize: '1.1rem',
                    fontWeight: 'bold'
                  }}
                >
                  Cancelar
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Box>
  );
};

export default CrearEventos;

