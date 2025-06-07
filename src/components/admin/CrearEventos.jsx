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
    OutlinedInput,
    Checkbox,
    ListItemText,
} from '@mui/material';
import { Event, Send } from '@mui/icons-material';
import api from '../../services/api';

const AREAS = [
    'PRACTICA', 'INVESTIGACION', 'ACADEMICA', 'TECNICA',
    'INDUSTRIAL', 'EMPRESARIAL', 'IA', 'REDES'
];
const TIPOS_AUDIENCIA = [
    'CARRERA_ESPECIFICA', 'TODAS_CARRERAS', 'PUBLICO_GENERAL'
];

const CrearEvento = ({ eventoEditado = null, onClose, onSuccess }) => {
    const [categorias, setCategorias] = useState([]);
    const [organizadores, setOrganizadores] = useState([]);
    const [carreras, setCarreras] = useState([]);
    const [activeStep, setActiveStep] = useState(0);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const steps = ['Información básica', 'Revisión', 'Confirmación'];

    const [evento, setEvento] = useState({
        nom_eve: '',
        des_eve: '',
        id_cat_eve: '',
        fec_ini_eve: '',
        fec_fin_eve: '',
        hor_ini_eve: '',
        hor_fin_eve: '',
        dur_eve: '',
        are_eve: '',
        ubi_eve: '',
        ced_org_eve: '',
        capacidad_max_eve: '',
        tipo_audiencia_eve: '',
        carreras: [], // array de id_car
    });

    useEffect(() => {
        api.get('/categorias')
            .then((res) => setCategorias(res.data.categorias || []))
            .catch(() => setCategorias([]));
        api.get('/organizadores')
            .then((res) => setOrganizadores(res.data.organizadores || []))
            .catch(() => setOrganizadores([]));
        api.get('/carreras')
            .then((res) => setCarreras(res.data.carreras || []))
            .catch(() => setCarreras([]));
    }, []);

    useEffect(() => {
        if (eventoEditado) {
            setEvento({
                nom_eve: eventoEditado.nom_eve,
                des_eve: eventoEditado.des_eve,
                id_cat_eve: eventoEditado.id_cat_eve,
                fec_ini_eve: eventoEditado.fec_ini_eve?.substring(0, 10),
                fec_fin_eve: eventoEditado.fec_fin_eve?.substring(0, 10),
                hor_ini_eve: eventoEditado.hor_ini_eve?.substring(11, 16),
                hor_fin_eve: eventoEditado.hor_fin_eve?.substring(11, 16),
                dur_eve: eventoEditado.dur_eve,
                are_eve: eventoEditado.are_eve,
                ubi_eve: eventoEditado.ubi_eve,
                ced_org_eve: eventoEditado.ced_org_eve,
                capacidad_max_eve: eventoEditado.capacidad_max_eve,
                tipo_audiencia_eve: eventoEditado.tipo_audiencia_eve,
                carreras: eventoEditado.carreras?.map(c => c.id_car) || [],
            });
        }
    }, [eventoEditado]);

    const handleChange = (field) => (event) => {
        setEvento({ ...evento, [field]: event.target.value });
        setError(null);
    };

    const handleCarrerasChange = (event) => {
        setEvento({ ...evento, carreras: event.target.value });
        setError(null);
    };

    const handleNext = () => {
        if (activeStep === 0) {
            if (!evento.nom_eve.trim() || evento.nom_eve.length < 3) {
                setError('El nombre debe tener al menos 3 caracteres.');
                return;
            }
            if (!evento.id_cat_eve || !evento.ced_org_eve || !evento.are_eve || !evento.tipo_audiencia_eve) {
                setError('Complete todos los campos obligatorios.');
                return;
            }
            if (evento.tipo_audiencia_eve === 'CARRERA_ESPECIFICA' && evento.carreras.length === 0) {
                setError('Seleccione al menos una carrera.');
                return;
            }
        }
        setError(null);
        setActiveStep((prev) => prev + 1);
    };

    const handleBack = () => setActiveStep((prev) => prev - 1);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Prepara el objeto para el backend
            const data = {
                ...evento,
                dur_eve: parseInt(evento.dur_eve, 10),
                capacidad_max_eve: parseInt(evento.capacidad_max_eve, 10),
                // Combina fecha y hora para los campos de hora
                hor_ini_eve: evento.fec_ini_eve && evento.hor_ini_eve
                    ? `${evento.fec_ini_eve}T${evento.hor_ini_eve}:00`
                    : null,
                hor_fin_eve: evento.fec_fin_eve && evento.hor_fin_eve
                    ? `${evento.fec_fin_eve}T${evento.hor_fin_eve}:00`
                    : null,
            };
            // POST o PUT según corresponda
            if (eventoEditado) {
                await api.put(`/eventos/${eventoEditado.id_eve}`, data);
            } else {
                await api.post('/eventos', data);
            }
            // Relacionar carreras si corresponde
            if (evento.tipo_audiencia_eve === 'CARRERA_ESPECIFICA' && evento.carreras.length > 0) {
                // Supón que tu backend tiene un endpoint para esto:
                // POST /eventos/:id_eve/carreras { carreras: [id_car, ...] }
                const id = eventoEditado ? eventoEditado.id_eve : data.id_eve;
                await api.post(`/eventos/${id}/carreras`, { carreras: evento.carreras });
            }
            setSnackbarMessage('Evento guardado correctamente!');
            setSnackbarOpen(true);
            setTimeout(() => {
                if (onSuccess) onSuccess();
                if (onClose) onClose();
            }, 1500);
        } catch (error) {
            setError('Error al guardar evento.');
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
                            label="Nombre del Evento"
                            value={evento.nom_eve}
                            onChange={handleChange('nom_eve')}
                            required
                        />
                        <TextField
                            fullWidth
                            label="Descripción"
                            multiline
                            rows={3}
                            value={evento.des_eve}
                            onChange={handleChange('des_eve')}
                        />
                        <FormControl fullWidth>
                            <InputLabel id="categoria-label">Categoría</InputLabel>
                            <Select
                                labelId="categoria-label"
                                id="categoria-select"
                                value={evento.id_cat_eve}
                                onChange={handleChange('id_cat_eve')}
                                label="Categoría"
                            >
                                {categorias.map((cat) => (
                                    <MenuItem key={cat.id_cat} value={cat.id_cat}>
                                        {cat.nom_cat}
                                    </MenuItem>
                                ))}
                            </Select>

                        </FormControl>
                        <TextField
                            fullWidth
                            type="date"
                            label="Fecha Inicio"
                            InputLabelProps={{ shrink: true }}
                            value={evento.fec_ini_eve}
                            onChange={handleChange('fec_ini_eve')}
                        />
                        <TextField
                            fullWidth
                            type="date"
                            label="Fecha Fin"
                            InputLabelProps={{ shrink: true }}
                            value={evento.fec_fin_eve}
                            onChange={handleChange('fec_fin_eve')}
                        />
                        <TextField
                            fullWidth
                            type="time"
                            label="Hora Inicio"
                            InputLabelProps={{ shrink: true }}
                            value={evento.hor_ini_eve}
                            onChange={handleChange('hor_ini_eve')}
                        />
                        <TextField
                            fullWidth
                            type="time"
                            label="Hora Fin"
                            InputLabelProps={{ shrink: true }}
                            value={evento.hor_fin_eve}
                            onChange={handleChange('hor_fin_eve')}
                        />
                        <TextField
                            fullWidth
                            type="number"
                            label="Duración (horas)"
                            value={evento.dur_eve}
                            onChange={handleChange('dur_eve')}
                        />
                        <FormControl fullWidth>
                            <InputLabel id="area-label">Área</InputLabel>
                            <Select
                                labelId="area-label"
                                id="area-select"
                                value={evento.are_eve}
                                onChange={handleChange('are_eve')}
                                label="Área"
                            >
                                {AREAS.map((area) => (
                                    <MenuItem key={area} value={area}>{area}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            label="Ubicación"
                            value={evento.ubi_eve}
                            onChange={handleChange('ubi_eve')}
                        />
                        <FormControl fullWidth>
                            <InputLabel id="organizador-label">Organizador</InputLabel>
                            <Select
                                labelId="organizador-label"
                                id="organizador-select"
                                value={evento.ced_org_eve}
                                onChange={handleChange('ced_org_eve')}
                                label="Organizador"
                            >
                                {organizadores.map((org) => (
                                    <MenuItem key={org.ced_org} value={org.ced_org}>
                                        {org.nom_org1} {org.ape_org1}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            type="number"
                            label="Capacidad máxima"
                            value={evento.capacidad_max_eve}
                            onChange={handleChange('capacidad_max_eve')}
                        />
                        <FormControl fullWidth>
                            <InputLabel shrink={!!evento.tipo_audiencia_eve}>Tipo de Audiencia</InputLabel>
                            <Select
                                value={evento.tipo_audiencia_eve}
                                onChange={handleChange('tipo_audiencia_eve')}
                                label="Tipo de Audiencia"
                            >
                                {TIPOS_AUDIENCIA.map((tipo) => (
                                    <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        {
                            evento.tipo_audiencia_eve === 'CARRERA_ESPECIFICA' && (
                                <FormControl fullWidth>
                                    <InputLabel>Carreras</InputLabel>
                                    <Select
                                        multiple
                                        value={evento.carreras}
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
                                            <MenuItem key={c.id_car} value={c.id_car}>
                                                <Checkbox checked={evento.carreras.indexOf(c.id_car) > -1} />
                                                <ListItemText primary={c.nom_car} />
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )
                        }
                        {error && <Typography variant="body2" color="error">{error}</Typography>}
                    </Box >
                );
            case 1:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Typography variant="h6">Revisión del Evento</Typography>
                        <Typography variant="body1"><strong>Nombre:</strong> {evento.nom_eve}</Typography>
                        <Typography variant="body1"><strong>Descripción:</strong> {evento.des_eve}</Typography>
                        <Typography variant="body1"><strong>Categoría:</strong> {categorias.find(cat => cat.id_cat === evento.id_cat_eve)?.nom_cat}</Typography>
                        <Typography variant="body1"><strong>Fecha Inicio:</strong> {evento.fec_ini_eve}</Typography>
                        <Typography variant="body1"><strong>Fecha Fin:</strong> {evento.fec_fin_eve}</Typography>
                        <Typography variant="body1"><strong>Hora Inicio:</strong> {evento.hor_ini_eve}</Typography>
                        <Typography variant="body1"><strong>Hora Fin:</strong> {evento.hor_fin_eve}</Typography>
                        <Typography variant="body1"><strong>Duración:</strong> {evento.dur_eve} horas</Typography>
                        <Typography variant="body1"><strong>Área:</strong> {evento.are_eve}</Typography>
                        <Typography variant="body1"><strong>Ubicación:</strong> {evento.ubi_eve}</Typography>
                        <Typography variant="body1"><strong>Organizador:</strong> {organizadores.find(org => org.ced_org === evento.ced_org_eve)?.nom_org1} {organizadores.find(org => org.ced_org === evento.ced_org_eve)?.ape_org1}</Typography>
                        <Typography variant="body1"><strong>Capacidad máxima:</strong> {evento.capacidad_max_eve}</Typography>
                        <Typography variant="body1"><strong>Tipo de Audiencia:</strong> {evento.tipo_audiencia_eve}</Typography>
                        {evento.tipo_audiencia_eve === 'CARRERA_ESPECIFICA' && (
                            <Typography variant="body1"><strong>Carreras:</strong> {carreras.filter(c => evento.carreras.includes(c.id_car)).map(c => c.nom_car).join(', ')}</Typography>
                        )}
                    </Box>
                );
            case 2:
                return (
                    <Typography variant="body1">
                        Revisa la información antes de guardar. Si todo es correcto, presiona "{eventoEditado ? 'Actualizar Evento' : 'Crear Evento'}".
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
                    <Event sx={{ mr: 1 }} /> {eventoEditado ? 'Editar Evento' : 'Crear Nuevo Evento'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Llena los campos necesarios para {eventoEditado ? 'editar los datos del evento' : 'registrar un nuevo evento'} en el sistema.
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
                        {loading ? 'Guardando...' : eventoEditado ? 'Actualizar Evento' : 'Crear Evento'}
                    </Button>
                ) : (
                    <Button variant="contained" onClick={handleNext}>
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
    );
};

export default CrearEvento;