import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  IconButton,
  InputAdornment,
  Container,
  Avatar,
  CircularProgress,
  Grid,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  PersonAdd,
  School,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nombre: '',
    nombre2: '',
    apellido: '',
    apellido2: '',
    cedula: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const { register, error, clearError } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};

    if (!formData.email) {
      errors.email = 'El correo electrónico es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'El correo electrónico no es válido';
    }

    if (!formData.password) {
      errors.password = 'La contraseña es obligatoria';
    } else if (formData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (!formData.nombre.trim()) {
      errors.nombre = 'El primer nombre es obligatorio';
    }

    if (!formData.apellido.trim()) {
      errors.apellido = 'El primer apellido es obligatorio';
    }

    if (!formData.cedula.trim()) {
      errors.cedula = 'La cédula es obligatoria';
    } else if (!/^\d{10}$/.test(formData.cedula)) {
      errors.cedula = 'La cédula debe tener 10 dígitos';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (error) clearError();
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await register(formData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error en registro:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
        padding: 2,
      }}
    >
      <Container maxWidth="md">
        <Card
          elevation={3}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: 'primary.main',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <School fontSize="large" />
              </Avatar>
              <Typography variant="h4" component="h1" gutterBottom>
                Crear Cuenta
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Regístrate en el Sistema de Gestión de Eventos - UTA
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Form */}
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              {/* Cédula */}
              <TextField
                fullWidth
                id="cedula"
                name="cedula"
                label="Cédula"
                type="text"
                value={formData.cedula}
                onChange={handleChange}
                required
                placeholder="1234567890"
                error={!!validationErrors.cedula}
                helperText={validationErrors.cedula}
                sx={{ mb: 2 }}
              />

              {/* Nombres */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="nombre"
                    name="nombre"
                    label="Primer Nombre"
                    type="text"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    placeholder="Juan"
                    error={!!validationErrors.nombre}
                    helperText={validationErrors.nombre}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="nombre2"
                    name="nombre2"
                    label="Segundo Nombre"
                    type="text"
                    value={formData.nombre2}
                    onChange={handleChange}
                    placeholder="Carlos"
                  />
                </Grid>
              </Grid>

              {/* Apellidos */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="apellido"
                    name="apellido"
                    label="Primer Apellido"
                    type="text"
                    value={formData.apellido}
                    onChange={handleChange}
                    required
                    placeholder="Pérez"
                    error={!!validationErrors.apellido}
                    helperText={validationErrors.apellido}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="apellido2"
                    name="apellido2"
                    label="Segundo Apellido"
                    type="text"
                    value={formData.apellido2}
                    onChange={handleChange}
                    placeholder="González"
                  />
                </Grid>
              </Grid>

              {/* Email */}
              <TextField
                fullWidth
                id="email"
                name="email"
                label="Correo Electrónico"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                placeholder="tu@uta.edu.ec"
                error={!!validationErrors.email}
                helperText={validationErrors.email}
                sx={{ mb: 2 }}
              />

              {/* Password */}
              <TextField
                fullWidth
                id="password"
                name="password"
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                placeholder="Mínimo 6 caracteres"
                error={!!validationErrors.password}
                helperText={validationErrors.password}
                sx={{ mb: 2 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* Confirm Password */}
              <TextField
                fullWidth
                id="confirmPassword"
                name="confirmPassword"
                label="Confirmar Contraseña"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
                placeholder="Repite tu contraseña"
                error={!!validationErrors.confirmPassword}
                helperText={validationErrors.confirmPassword}
                sx={{ mb: 3 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <PersonAdd />}
                sx={{ mb: 3, py: 1.5 }}
              >
                {isSubmitting ? 'Creando cuenta...' : 'Crear Cuenta'}
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  ¿Ya tienes una cuenta?{' '}
                  <Link
                    to="/login"
                    style={{
                      color: '#dc2626',
                      textDecoration: 'none',
                      fontWeight: 500,
                    }}
                  >
                    Inicia sesión aquí
                  </Link>
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Register; 