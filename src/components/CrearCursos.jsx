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
} from '@mui/material';
import { Category, Person, Event, School, Send } from '@mui/icons-material';
import api from '../services/api';

const CrearCurso = ({ cursoEditado = null, onClose, onSuccess }) => {
  const [categorias, setCategorias] = useState([]);
  const [organizadores, setOrganizadores] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const steps = ['Información básica', 'Revisión', 'Confirmación']; // Cambié "Asignaciones" por "Revisión"

  const [curso, setCurso] = useState({
    nom_cur: '',
    des_cur: '',
    dur_cur: '',
    fec_ini_cur: '',
    fec_fin_cur: '',
    id_cat_cur: '',
    ced_org_cur: ''
  });

  useEffect(() => {
    api.get('/categorias')
      .then((res) => {
        console.log('Categorias:', res.data);
        setCategorias(res.data.categorias || []);
      })
      .catch((err) => {
        console.error('Error al obtener categorias:', err);
        setCategorias([]);
      });

    api.get('/organizadores')
      .then((res) => {
        console.log('Organizadores:', res.data);
        setOrganizadores(res.data.organizadores || []);
      })
      .catch((err) => {
        console.error('Error al obtener organizadores:', err);
        setOrganizadores([]);
      });
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
        ced_org_cur: cursoEditado.ced_org_cur
      });
    }
  }, [cursoEditado]);

  const handleChange = (field) => (event) => {
    setCurso({ ...curso, [field]: event.target.value });
    setError(null);
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (!curso.nom_cur.trim() || curso.nom_cur.length < 3) {
        setError('El nombre debe tener al menos 3 caracteres.');
        return;
      }
      if (!curso.id_cat_cur || !curso.ced_org_cur) {
        setError('Seleccione categoría y organizador.');
        return;
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
      if (cursoEditado) {
        await api.put(`/cursos/${cursoEditado.id_cur}`, curso);
      } else {
        await api.post('/cursos', curso);
      }
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }, 1500);
    } catch (error) {
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
              type="number"
              label="Duración (horas)"
              value={curso.dur_cur}
              onChange={handleChange('dur_cur')}
            />
            <TextField
              fullWidth
              type="date"
              label="Fecha Inicio"
              InputLabelProps={{ shrink: true }}
              value={curso.fec_ini_cur}
              onChange={handleChange('fec_ini_cur')}
            />
            <TextField
              fullWidth
              type="date"
              label="Fecha Fin"
              InputLabelProps={{ shrink: true }}
              value={curso.fec_fin_cur}
              onChange={handleChange('fec_fin_cur')}
            />
            <FormControl fullWidth error={!!error} sx={{ marginBottom: 3 }}>
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
              {error && <Typography variant="body2" color="error">{error}</Typography>}
            </FormControl>

            <FormControl fullWidth error={!!error} sx={{ marginBottom: 3 }}>
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
              {error && <Typography variant="body2" color="error">{error}</Typography>}
            </FormControl>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6">Revisión del Curso</Typography>
            <Typography variant="body1"><strong>Nombre del Curso:</strong> {curso.nom_cur}</Typography>
            <Typography variant="body1"><strong>Descripción:</strong> {curso.des_cur}</Typography>
            <Typography variant="body1"><strong>Duración:</strong> {curso.dur_cur} horas</Typography>
            <Typography variant="body1"><strong>Fecha Inicio:</strong> {curso.fec_ini_cur}</Typography>
            <Typography variant="body1"><strong>Fecha Fin:</strong> {curso.fec_fin_cur}</Typography>
            <Typography variant="body1"><strong>Categoría:</strong> {categorias.find(cat => cat.id_cat === curso.id_cat_cur)?.nom_cat}</Typography>
            <Typography variant="body1"><strong>Organizador:</strong> {organizadores.find(org => org.ced_org === curso.ced_org_cur)?.nom_org1} {organizadores.find(org => org.ced_org === curso.ced_org_cur)?.ape_org1}</Typography>
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
    <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          <Event sx={{ mr: 1 }} /> {cursoEditado ? 'Editar Curso' : 'Crear Nuevo Curso'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Llena los campos necesarios para {cursoEditado ? 'editar los datos del curso' : 'registrar un nuevo curso'} en el sistema.
        </Typography>
      </Box>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
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
        <Button disabled={activeStep === 0} onClick={handleBack} variant="outlined">
          Atrás
        </Button>

        {activeStep === steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Send />}
          >
            {loading ? 'Guardando...' : cursoEditado ? 'Actualizar Curso' : 'Crear Curso'}
          </Button>
        ) : (
          <Button variant="contained" onClick={handleNext}>
            Siguiente
          </Button>
        )}
      </Box>
    </Paper>
  );
};

export default CrearCurso;
