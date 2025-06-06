import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  Avatar,
  CircularProgress,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Lock,
  School,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import authService from '../../services/authService';

const validationSchema = Yup.object().shape({
  password: Yup.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .required('La contraseña es obligatoria'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Las contraseñas no coinciden')
    .required('Debes confirmar la contraseña'),
});

const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [validToken, setValidToken] = useState(null);
  
  const { token } = useParams();
  const navigate = useNavigate();

  // Verificar token al cargar el componente
  useEffect(() => {
    const verifyToken = async () => {
      try {
        await authService.verifyResetToken(token);
        setValidToken(true);
      } catch (error) {
        setValidToken(false);
        setError('El enlace de recuperación es inválido o ha expirado.');
      }
    };

    if (token) {
      verifyToken();
    }
  }, [token]);

  const handleSubmit = async (values, { setSubmitting }) => {
    setIsSubmitting(true);
    setError('');
    
    try {
      await authService.resetPassword(token, values.password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  // Mostrar error si el token no es válido
  if (validToken === false) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #6d1313 0%, #5a1010 100%)',
          padding: 2,
        }}
      >
        <Container maxWidth="sm">
          <Card elevation={3} sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
              <Button 
                component={Link} 
                to="/forgot-password" 
                variant="contained"
              >
                Solicitar nuevo enlace
              </Button>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  // Mostrar loading mientras verifica el token
  if (validToken === null) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #6d1313 0%, #5a1010 100%)',
          padding: 2,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Mostrar éxito si la contraseña se actualizó
  if (success) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #6d1313 0%, #5a1010 100%)',
          padding: 2,
        }}
      >
        <Container maxWidth="sm">
          <Card elevation={3} sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Alert severity="success" sx={{ mb: 3 }}>
                ¡Contraseña actualizada exitosamente! Serás redirigido al login en unos segundos.
              </Alert>
              <Button 
                component={Link} 
                to="/login" 
                variant="contained"
              >
                Ir al Login
              </Button>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  const initialValues = {
    password: '',
    confirmPassword: ''
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #6d1313 0%, #5a1010 100%)',
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Card elevation={3} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: '#6d1313',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <School fontSize="large" />
              </Avatar>
              <Typography variant="h4" component="h1" gutterBottom>
                Nueva Contraseña
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ingresa tu nueva contraseña para completar el restablecimiento.
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ values, errors, touched, handleChange, handleBlur }) => (
                <Form>
                  <TextField
                    fullWidth
                    id="password"
                    name="password"
                    label="Nueva Contraseña"
                    type={showPassword ? 'text' : 'password'}
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    placeholder="Mínimo 6 caracteres"
                    error={touched.password && !!errors.password}
                    helperText={touched.password && errors.password}
                    sx={{ mb: 2 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    fullWidth
                    id="confirmPassword"
                    name="confirmPassword"
                    label="Confirmar Contraseña"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={values.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    placeholder="Repite tu contraseña"
                    error={touched.confirmPassword && !!errors.confirmPassword}
                    helperText={touched.confirmPassword && errors.confirmPassword}
                    sx={{ mb: 3 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
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
                    sx={{ 
                      mb: 3, 
                      py: 1.5,
                      backgroundColor: '#6d1313',
                      '&:hover': {
                        backgroundColor: '#5a1010',
                      },
                    }}
                  >
                    {isSubmitting ? 'Actualizando...' : 'Actualizar Contraseña'}
                  </Button>

                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      ¿Recordaste tu contraseña?{' '}
                      <Link
                        to="/login"
                        style={{
                          color: '#6d1313',
                          textDecoration: 'none',
                          fontWeight: 500,
                        }}
                      >
                        Iniciar sesión
                      </Link>
                    </Typography>
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

export default ResetPassword;