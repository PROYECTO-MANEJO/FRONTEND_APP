import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as yup from 'yup';
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

const validationSchema = yup.object().shape({
  email: yup.string().email('El correo electrónico no es válido').required('El correo electrónico es obligatorio'),
  password: yup.string().min(6, 'La contraseña debe tener al menos 6 caracteres').required('La contraseña es obligatoria'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), null], 'Las contraseñas no coinciden')
    .required('La confirmación de contraseña es obligatoria'),
  nombre: yup.string().trim().required('El primer nombre es obligatorio'),
  nombre2: yup.string().trim(),
  apellido: yup.string().trim().required('El primer apellido es obligatorio'),
  apellido2: yup.string().trim(),
  cedula: yup.string()
    .matches(/^\d{10}$/, 'La cédula debe tener 10 dígitos')
    .required('La cédula es obligatoria'),
});

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, error, clearError } = useAuth();
  const navigate = useNavigate();

  const initialValues = {
    email: '',
    password: '',
    confirmPassword: '',
    nombre: '',
    nombre2: '',
    apellido: '',
    apellido2: '',
    cedula: ''
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    setIsSubmitting(true);
    try {
      await register(values);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error en registro:', error);
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
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
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ values, errors, touched, handleChange, handleBlur }) => (
                <Form>
                  <Box sx={{ mt: 2 }}>
                    {/* Cédula */}
                    <TextField
                      fullWidth
                      id="cedula"
                      name="cedula"
                      label="Cédula"
                      type="text"
                      value={values.cedula}
                      onChange={(e) => {
                        handleChange(e);
                        if (error) clearError();
                      }}
                      onBlur={handleBlur}
                      required
                      placeholder="1234567890"
                      error={touched.cedula && !!errors.cedula}
                      helperText={touched.cedula && errors.cedula}
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
                          value={values.nombre}
                          onChange={(e) => {
                            handleChange(e);
                            if (error) clearError();
                          }}
                          onBlur={handleBlur}
                          required
                          placeholder="Juan"
                          error={touched.nombre && !!errors.nombre}
                          helperText={touched.nombre && errors.nombre}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          id="nombre2"
                          name="nombre2"
                          label="Segundo Nombre"
                          type="text"
                          value={values.nombre2}
                          onChange={handleChange}
                          onBlur={handleBlur}
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
                          value={values.apellido}
                          onChange={(e) => {
                            handleChange(e);
                            if (error) clearError();
                          }}
                          onBlur={handleBlur}
                          required
                          placeholder="Pérez"
                          error={touched.apellido && !!errors.apellido}
                          helperText={touched.apellido && errors.apellido}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          id="apellido2"
                          name="apellido2"
                          label="Segundo Apellido"
                          type="text"
                          value={values.apellido2}
                          onChange={handleChange}
                          onBlur={handleBlur}
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
                      value={values.email}
                      onChange={(e) => {
                        handleChange(e);
                        if (error) clearError();
                      }}
                      onBlur={handleBlur}
                      required
                      autoComplete="email"
                      placeholder="tu@uta.edu.ec"
                      error={touched.email && !!errors.email}
                      helperText={touched.email && errors.email}
                      sx={{ mb: 2 }}
                    />

                    {/* Password */}
                    <TextField
                      fullWidth
                      id="password"
                      name="password"
                      label="Contraseña"
                      type={showPassword ? 'text' : 'password'}
                      value={values.password}
                      onChange={(e) => {
                        handleChange(e);
                        if (error) clearError();
                      }}
                      onBlur={handleBlur}
                      required
                      autoComplete="new-password"
                      placeholder="Mínimo 6 caracteres"
                      error={touched.password && !!errors.password}
                      helperText={touched.password && errors.password}
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
                      value={values.confirmPassword}
                      onChange={(e) => {
                        handleChange(e);
                        if (error) clearError();
                      }}
                      onBlur={handleBlur}
                      required
                      autoComplete="new-password"
                      placeholder="Repite tu contraseña"
                      error={touched.confirmPassword && !!errors.confirmPassword}
                      helperText={touched.confirmPassword && errors.confirmPassword}
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
                </Form>
              )}
            </Formik>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Register;