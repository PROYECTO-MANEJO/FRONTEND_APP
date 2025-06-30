import { useState, useEffect } from 'react';
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
  Stepper,
  Step,
  StepLabel,
  Snackbar,
  Checkbox,
  OutlinedInput,
  ListItemText,
} from '@mui/material';
import { School, Send } from '@mui/icons-material';
import api from '../../services/api';
import AdminSidebar from './AdminSidebar';
import { useSidebarLayout } from '../../hooks/useSidebarLayout';
import { useNavigate } from 'react-router-dom';

const TIPOS_AUDIENCIA = [
  'CARRERA_ESPECIFICA',
  'TODAS_CARRERAS',
  'PUBLICO_GENERAL'
];

const CrearCurso = ({ cursoEditado = null, onClose, onSuccess }) => {
  const { getMainContentStyle } = useSidebarLayout();
  const [categorias, setCategorias] = useState([]);
  const [organizadores, setOrganizadores] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const navigate = useNavigate();

  const steps = ['Información básica', 'Revisión', 'Confirmación'];

  const hoy = new Date().toISOString().split('T')[0];

  const [curso, setCurso] = useState({
    nom_cur: '',
    des_cur: '',
    dur_cur: '',
    fec_ini_cur: '',
    fec_fin_cur: '',
    id_cat_cur: '',
    ced_org_cur: '',
    capacidad_max_cur: '',
    tipo_audiencia_cur: '',
    carreras: [],
    requiere_verificacion_docs: true,
    es_gratuito: true,
    precio: '',
    requiere_carta_motivacion: true, // <--- NUEVO
    carta_motivacion: '',            // <--- NUEVO
  });

  useEffect(() => {
    api.get('/categorias')
      .then((res) => setCategorias(res.data.categorias || []))
      .catch(() => setCategorias([]));

    api.get('/organizadores')
      .then((res) => setOrganizadores(res.data.organizadores || []))
      .catch(() => setOrganizadores([]));

    api.get('/carreras')
      .then((res) => setCarreras(res.data.data || []))
      .catch(() => setCarreras([]));
  }, []);

  useEffect(() => {
    if (cursoEditado) {
      setCurso({
        nom_cur: cursoEditado.nom_cur,
        des_cur: cursoEditado.des_cur,
        dur_cur: cursoEditado.dur_cur,
        fec_ini_cur: cursoEditado.fec_ini_cur?.substring(0, 10),
        fec_fin_cur: cursoEditado.fec_fin_cur?.substring(0, 10),
        id_cat_cur: cursoEditado.id_cat_cur,
        ced_org_cur: cursoEditado.ced_org_cur,
        capacidad_max_cur: cursoEditado.capacidad_max_cur,
        tipo_audiencia_cur: cursoEditado.tipo_audiencia_cur,
        carreras: cursoEditado.carreras?.map(c => c.id_car) || [],
        requiere_verificacion_docs: cursoEditado.requiere_verificacion_docs ?? true,
        es_gratuito: cursoEditado.es_gratuito !== undefined ? cursoEditado.es_gratuito : true,
        precio: cursoEditado.precio || '',
        requiere_carta_motivacion: cursoEditado.requiere_carta_motivacion !== undefined ? cursoEditado.requiere_carta_motivacion : true,
        carta_motivacion: cursoEditado.carta_motivacion || '',
      });
    }
  }, [cursoEditado]);

  // Calcula duración automáticamente
  useEffect(() => {
    if (
      curso.fec_ini_cur &&
      curso.fec_fin_cur &&
      curso.hor_ini_cur &&
      curso.hor_fin_cur
    ) {
      const fechaInicio = new Date(curso.fec_ini_cur);
      const fechaFin = new Date(curso.fec_fin_cur);
      const diffDias = Math.floor((fechaFin - fechaInicio) / (1000 * 60 * 60 * 24)) + 1;
      const [hIni, mIni] = curso.hor_ini_cur.split(':').map(Number);
      const [hFin, mFin] = curso.hor_fin_cur.split(':').map(Number);
      const minutosPorDia = (hFin * 60 + mFin) - (hIni * 60 + mIni);
      const horasPorDia = minutosPorDia / 60;
      if (diffDias > 0 && horasPorDia > 0) {
        setCurso(ev => ({
          ...ev,
          dur_cur: horasPorDia * diffDias
        }));
      }
    }
  }, [curso.fec_ini_cur, curso.fec_fin_cur, curso.hor_ini_cur, curso.hor_fin_cur]);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    
    // Lógica especial para configuración de precio
    if (field === 'es_gratuito' && value) {
      // Si se marca como gratuito, limpiar el precio
      setCurso({ ...curso, [field]: value, precio: '' });
    } else {
      setCurso({ ...curso, [field]: value });
    }
    
    setError(null);
  };

  const handleCarrerasChange = (event) => {
    const value = event.target.value;
    if (value.length <= 4) {
      setCurso({ ...curso, carreras: value });
      setError(null);
    }
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (!curso.nom_cur.trim() || curso.nom_cur.length < 3) {
        setError('El nombre debe tener al menos 3 caracteres.');
        return;
      }
      if (!curso.id_cat_cur || !curso.ced_org_cur || !curso.tipo_audiencia_cur) {
        setError('Complete todos los campos obligatorios.');
        return;
      }
      if (curso.tipo_audiencia_cur === 'CARRERA_ESPECIFICA' && curso.carreras.length === 0) {
        setError('Seleccione al menos una carrera.');
        return;
      }
      if (curso.fec_ini_cur < hoy) {
        setError('La fecha de inicio no puede ser anterior a hoy.');
        return;
      }
      if (curso.fec_fin_cur && curso.fec_fin_cur < curso.fec_ini_cur) {
        setError('La fecha de fin no puede ser anterior a la de inicio.');
        return;
      }
      if (curso.hor_ini_cur) {
        const [hIni] = curso.hor_ini_cur.split(':').map(Number);
        if (hIni < 8 || hIni > 18) {
          setError('La hora de inicio debe ser entre 08:00 y 18:00.');
          return;
        }
      }
      if (curso.hor_fin_cur) {
        const [hFin] = curso.hor_fin_cur.split(':').map(Number);
        if (hFin < 10 || hFin > 20) {
          setError('La hora de fin debe ser entre 10:00 y 20:00.');
          return;
        }
      }
      if (curso.hor_ini_cur && curso.hor_fin_cur) {
        const [hIni, mIni] = curso.hor_ini_cur.split(':').map(Number);
        const [hFin, mFin] = curso.hor_fin_cur.split(':').map(Number);
        const iniMins = hIni * 60 + mIni;
        const finMins = hFin * 60 + mFin;
        if (finMins <= iniMins) {
          setError('La hora de fin debe ser mayor a la hora de inicio.');
          return;
        }
        if (
          curso.fec_fin_cur &&
          curso.fec_ini_cur &&
          curso.fec_fin_cur === curso.fec_ini_cur &&
          finMins - iniMins < 120
        ) {
          setError('La hora de fin debe ser al menos 2 horas después de la hora de inicio.');
          return;
        }
      }
      if (curso.dur_cur <= 0) {
        setError('La duración debe ser mayor a 0.');
        return;
      }
      if (curso.capacidad_max_cur <= 0) {
        setError('La capacidad máxima debe ser mayor a 0.');
        return;
      }
      
      // Validar configuración de precio
      if (!curso.es_gratuito) {
        if (!curso.precio || curso.precio === '') {
          setError('El precio es obligatorio para cursos pagados.');
          return;
        }
        const precio = parseFloat(curso.precio);
        if (isNaN(precio) || precio <= 0) {
          setError('El precio debe ser un número mayor a 0.');
          return;
        }
        if (precio > 10000) {
          setError('El precio no puede exceder $10,000.');
          return;
        }
      }
    }
    setError(null);
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const data = {
        ...curso,
        dur_cur: parseInt(curso.dur_cur, 10),
        capacidad_max_cur: parseInt(curso.capacidad_max_cur, 10),
        requiere_verificacion_docs: !!curso.requiere_verificacion_docs,
        es_gratuito: curso.es_gratuito,
        precio: curso.es_gratuito ? null : parseFloat(curso.precio),
        requiere_carta_motivacion: curso.requiere_carta_motivacion,
        carta_motivacion: curso.requiere_carta_motivacion ? curso.carta_motivacion : '',
      };
      let idCur = cursoEditado ? cursoEditado.id_cur : undefined;
      if (cursoEditado) {
        await api.put(`/cursos/${idCur}`, data);
        if (curso.tipo_audiencia_cur === 'CARRERA_ESPECIFICA' && curso.carreras.length > 0) {
          await api.post(`/cursos/${idCur}/carreras`, { carreras: curso.carreras });
        }
      } else {
        const res = await api.post('/cursos', data);
        idCur = res.data?.data?.id_cur;
        if (curso.tipo_audiencia_cur === 'CARRERA_ESPECIFICA' && curso.carreras.length > 0 && idCur) {
          await api.post(`/cursos/${idCur}/carreras`, { carreras: curso.carreras });
        }
      }
      setSnackbarMessage('Curso guardado correctamente!');
      setSnackbarOpen(true);

      setTimeout(() => {
        navigate('/admin/dashboard'); // Redirige al dashboard
      }, 1500);
    } catch (err) {
      setError('Error al guardar curso.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="Nombre del Curso"
              value={curso.nom_cur}
              onChange={handleChange('nom_cur')}
              required
            />
            <TextField
              fullWidth
              label="Descripción"
              multiline
              rows={3}
              value={curso.des_cur}
              onChange={handleChange('des_cur')}
            />
            <TextField
              fullWidth
              type="date"
              label="Fecha Inicio"
              InputLabelProps={{ shrink: true }}
              value={curso.fec_ini_cur}
              onChange={handleChange('fec_ini_cur')}
              inputProps={{ min: hoy }}
            />
            <TextField
              fullWidth
              type="date"
              label="Fecha Fin"
              InputLabelProps={{ shrink: true }}
              value={curso.fec_fin_cur}
              onChange={handleChange('fec_fin_cur')}
              inputProps={{ min: curso.fec_ini_cur || hoy }}
            />
            <TextField
              fullWidth
              type="time"
              label="Hora Inicio"
              InputLabelProps={{ shrink: true }}
              value={curso.hor_ini_cur || ''}
              onChange={handleChange('hor_ini_cur')}
              inputProps={{ min: "08:00", max: "18:00" }}
            />
            <TextField
              fullWidth
              type="time"
              label="Hora Fin"
              InputLabelProps={{ shrink: true }}
              value={curso.hor_fin_cur || ''}
              onChange={handleChange('hor_fin_cur')}
              inputProps={{
                min: (() => {
                  if (!curso.hor_ini_cur) return "10:00";
                  const [h, m] = curso.hor_ini_cur.split(':').map(Number);
                  let minHour = h + 2;
                  if (minHour < 10) minHour = 10;
                  if (minHour > 20) minHour = 20;
                  return `${minHour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                })(),
                max: "20:00"
              }}
            />
            <TextField
              fullWidth
              type="number"
              label="Duración (horas)"
              value={curso.dur_cur}
              InputProps={{ readOnly: true }}
            />
            <TextField
              fullWidth
              type="number"
              label="Capacidad máxima"
              value={curso.capacidad_max_cur}
              onChange={handleChange('capacidad_max_cur')}
              inputProps={{ min: 1 }}
            />
            <FormControl fullWidth>
              <InputLabel>Tipo de Audiencia</InputLabel>
              <Select
                value={curso.tipo_audiencia_cur}
                onChange={handleChange('tipo_audiencia_cur')}
                label="Tipo de Audiencia"
              >
                {TIPOS_AUDIENCIA.map((tipo) => (
                  <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {curso.tipo_audiencia_cur === 'CARRERA_ESPECIFICA' && (
              <FormControl fullWidth>
                <InputLabel>Carreras</InputLabel>
                <Select
                  multiple
                  value={curso.carreras}
                  onChange={handleCarrerasChange}
                  input={<OutlinedInput label="Carreras" />}
                  renderValue={(selected) =>
                    carreras
                      .filter((c) => selected.includes(c.id_car))
                      .map((c) => c.nom_car)
                      .join(', ')
                  }
                >
                  {carreras.map((c) => (
                    <MenuItem
                      key={c.id_car}
                      value={c.id_car}
                      disabled={curso.carreras.length >= 4 && !curso.carreras.includes(c.id_car)}
                    >
                      <Checkbox checked={curso.carreras.indexOf(c.id_car) > -1} />
                      <ListItemText primary={c.nom_car} />
                    </MenuItem>
                  ))}
                </Select>
                <Typography variant="caption" color="text.secondary">
                  Puedes seleccionar hasta 4 carreras.
                </Typography>
              </FormControl>
            )}
            <FormControl fullWidth>
              <InputLabel>¿Requiere verificación de documentos?</InputLabel>
              <Select
                value={curso.requiere_verificacion_docs}
                onChange={handleChange('requiere_verificacion_docs')}
                label="¿Requiere verificación de documentos?"
              >
                <MenuItem value={true}>Sí</MenuItem>
                <MenuItem value={false}>No</MenuItem>
              </Select>
            </FormControl>
            
            {/* Configuración de Precio */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
              <Checkbox
                checked={curso.es_gratuito}
                onChange={(e) => handleChange('es_gratuito')({ target: { value: e.target.checked } })}
                sx={{ 
                  color: '#6d1313',
                  '&.Mui-checked': { color: '#6d1313' }
                }}
              />
              <Typography variant="body1">
                Curso gratuito (sin costo para los participantes)
              </Typography>
            </Box>
            
            {!curso.es_gratuito && (
              <TextField
                fullWidth
                type="number"
                label="Precio (USD)"
                value={curso.precio}
                onChange={handleChange('precio')}
                helperText="Ingrese el precio del curso en dólares"
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
            )}
            <FormControl fullWidth sx={{ marginBottom: 3 }}>
              <InputLabel shrink={!!curso.ced_org_cur}>Organizador</InputLabel>
              <Select
                value={curso.ced_org_cur}
                onChange={handleChange('ced_org_cur')}
                label="Organizador"
              >
                {organizadores.map((org) => (
                  <MenuItem key={org.ced_org} value={org.ced_org}>
                    {org.nom_org1} {org.ape_org1}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ marginBottom: 3 }}>
              <InputLabel shrink={!!curso.id_cat_cur}>Categoría</InputLabel>
              <Select
                value={curso.id_cat_cur}
                onChange={handleChange('id_cat_cur')}
                label="Categoría"
              >
                {categorias.map((cat) => (
                  <MenuItem key={cat.id_cat} value={cat.id_cat}>
                    {cat.nom_cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Nueva sección para carta de motivación */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
              <Checkbox
                checked={curso.requiere_carta_motivacion}
                onChange={e => setCurso({ ...curso, requiere_carta_motivacion: e.target.checked })}
                sx={{
                  color: '#6d1313',
                  '&.Mui-checked': { color: '#6d1313' }
                }}
              />
              <Typography variant="body1">
                Se requiere carta de motivación
              </Typography>
            </Box>

          </Box>
        );
      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6" sx={{ color: '#6d1313', fontWeight: 'bold' }}>
              Revisión del Curso
            </Typography>
            <Typography variant="body1"><strong>Nombre del Curso:</strong> {curso.nom_cur}</Typography>
            <Typography variant="body1"><strong>Descripción:</strong> {curso.des_cur}</Typography>
            <Typography variant="body1"><strong>Duración:</strong> {curso.dur_cur} horas</Typography>
            <Typography variant="body1"><strong>Fecha Inicio:</strong> {curso.fec_ini_cur}</Typography>
            <Typography variant="body1"><strong>Fecha Fin:</strong> {curso.fec_fin_cur}</Typography>
            <Typography variant="body1"><strong>Hora Inicio:</strong> {curso.hor_ini_cur}</Typography>
            <Typography variant="body1"><strong>Hora Fin:</strong> {curso.hor_fin_cur}</Typography>
            <Typography variant="body1"><strong>Capacidad máxima:</strong> {curso.capacidad_max_cur}</Typography>
            <Typography variant="body1"><strong>Categoría:</strong> {categorias.find(cat => cat.id_cat === curso.id_cat_cur)?.nom_cat}</Typography>
            <Typography variant="body1"><strong>Organizador:</strong> {organizadores.find(org => org.ced_org === curso.ced_org_cur)?.nom_org1} {organizadores.find(org => org.ced_org === curso.ced_org_cur)?.ape_org1}</Typography>
            <Typography variant="body1"><strong>Tipo de Audiencia:</strong> {curso.tipo_audiencia_cur}</Typography>
            {curso.tipo_audiencia_cur === 'CARRERA_ESPECIFICA' && (
              <Typography variant="body1"><strong>Carreras:</strong> {carreras.filter(c => curso.carreras.includes(c.id_car)).map(c => c.nom_car).join(', ')}</Typography>
            )}
            <Typography variant="body1"><strong>¿Requiere verificación de documentos?:</strong> {curso.requiere_verificacion_docs ? 'Sí' : 'No'}</Typography>
            <Typography variant="body1"><strong>Tipo de curso:</strong> {curso.es_gratuito ? 'Gratuito' : `Pagado - $${curso.precio}`}</Typography>
          </Box>
        );
      case 2:
        return (
          <Typography variant="body1">
            Revisa la información antes de guardar. Si todo es correcto, presiona "{cursoEditado ? 'Actualizar Curso' : 'Crear Curso'}".
          </Typography>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <AdminSidebar />
      <Box sx={{ flexGrow: 1, p: 3, ...getMainContentStyle() }}>
        <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ color: '#6d1313', fontWeight: 'bold' }}>
              <School sx={{ mr: 1 }} /> {cursoEditado ? 'Editar Curso' : 'Crear Nuevo Curso'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Llena los campos necesarios para {cursoEditado ? 'editar los datos del curso' : 'registrar un nuevo curso'} en el sistema.
            </Typography>
          </Box>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel
                  sx={{
                    '& .MuiStepLabel-label.Mui-active': {
                      color: '#6d1313'
                    },
                    '& .MuiStepIcon-root.Mui-active': {
                      color: '#6d1313'
                    }
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ mb: 4 }}>{renderStepContent(activeStep)}</Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
              sx={{
                borderColor: '#6d1313',
                color: '#6d1313',
                '&:hover': {
                  borderColor: '#8b1a1a',
                  bgcolor: 'rgba(109, 19, 19, 0.04)'
                }
              }}
            >
              Atrás
            </Button>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <Send />}
                sx={{
                  bgcolor: '#6d1313',
                  '&:hover': {
                    bgcolor: '#8b1a1a'
                  }
                }}
              >
                {loading ? 'Guardando...' : cursoEditado ? 'Actualizar Curso' : 'Crear Curso'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                sx={{
                  bgcolor: '#6d1313',
                  '&:hover': {
                    bgcolor: '#8b1a1a'
                  }
                }}
              >
                Siguiente
              </Button>
            )}
          </Box>
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={6000}
            onClose={() => setSnackbarOpen(false)}
          >
            <Alert onClose={() => setSnackbarOpen(false)} severity="success">
              {snackbarMessage}
            </Alert>
          </Snackbar>
        </Paper>
      </Box>
    </Box>
  );
};

export default CrearCurso;
