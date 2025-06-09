import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as yup from 'yup';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  IconButton,
  InputAdornment,
  CircularProgress,
  Paper,
  Divider,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Facebook,
  Twitter,
  School,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import utaImage from '../../assets/images/uta1.jpg';

const validationSchema = yup.object().shape({
  email: yup
    .string()
    .email('El correo electrónico no es válido')
    .required('El correo electrónico es obligatorio'),
  password: yup
    .string()
    .required('La contraseña es obligatoria'),
});

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();

  const initialValues = {
    email: '',
    password: ''
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    setIsSubmitting(true);
    try {
      await login(values.email, values.password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error en login:', error);
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
        background: 'linear-gradient(135deg, #6d1313 0%, #5a1010 100%)',
        padding: 2,
      }}
    >
      <Paper
        elevation={24}
        sx={{
          display: 'flex',
          width: '100%',
          maxWidth: 900,
          minHeight: 550,
          borderRadius: 0,
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        }}
      >
        {/* Left Panel - Decorative */}
        <Box
          sx={{
            flex: 1,
            background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 50%, #dc3545 100%)',
            position: 'relative',
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            p: 4,
            backgroundImage: `url(${utaImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundBlendMode: 'overlay',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(220, 53, 69, 0.7) 0%, rgba(238, 85, 82, 0.8) 100%)',
              zIndex: 1,
            },
            '& > *': {
              position: 'relative',
              zIndex: 2,
            },
          }}
        >
          <School sx={{ fontSize: 80, mb: 3, opacity: 0.9 }} />
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              mb: 2,
              textAlign: 'center',
              fontSize: { xs: '2rem', md: '3rem' },
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            }}
          >
            Bienvenido
          </Typography>
          <Typography
            variant="h6"
            sx={{
              textAlign: 'center',
              opacity: 0.9,
              lineHeight: 1.6,
              maxWidth: 300,
              fontSize: '1.1rem',
            }}
          >
            Sistema de Gestión de Eventos Académicos de la Universidad Técnica de Ambato
          </Typography>
          
          <Box sx={{ mt: 4 }}>
            <Typography variant="body2" sx={{ mb: 2, textAlign: 'center', opacity: 0.8 }}>
              Conecta con redes sociales
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<Facebook />}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.3)',
                  },
                }}
              >
                Facebook
              </Button>
              <Button
                variant="contained"
                startIcon={<Twitter />}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.3)',
                  },
                }}
              >
                Twitter
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Right Panel - Login Form */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            p: { xs: 3, md: 5 },
            backgroundColor: 'white',
          }}
        >
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: '#2c3e50',
                mb: 1,
                fontSize: { xs: '1.8rem', md: '2.2rem' },
              }}
            >
              Login
            </Typography>
            <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
              Ingresa a tu cuenta para continuar
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
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
                <Box>
                  <TextField
                    fullWidth
                    id="email"
                    name="email"
                    label="Usuario"
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
                    sx={{
                      mb: 3,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 0,
                        '& fieldset': {
                          borderColor: '#e0e6ed',
                        },
                        '&:hover fieldset': {
                          borderColor: '#dc3545',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#dc3545',
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#dc3545',
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    id="password"
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={values.password}
                    onChange={(e) => {
                      handleChange(e);
                      if (error) clearError();
                    }}
                    onBlur={handleBlur}
                    required
                    autoComplete="current-password"
                    placeholder="Tu contraseña"
                    error={touched.password && !!errors.password}
                    helperText={touched.password && errors.password}
                    sx={{
                      mb: 3,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 0,
                        '& fieldset': {
                          borderColor: '#e0e6ed',
                        },
                        '&:hover fieldset': {
                          borderColor: '#dc3545',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#dc3545',
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#dc3545',
                      },
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            sx={{ color: '#7f8c8d' }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
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
                      borderRadius: 0,
                      backgroundColor: '#dc3545',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      boxShadow: '0 4px 12px rgba(220, 53, 69, 0.3)',
                      '&:hover': {
                        backgroundColor: '#c82333',
                        boxShadow: '0 6px 16px rgba(220, 53, 69, 0.4)',
                      },
                      '&:disabled': {
                        backgroundColor: '#f8d7da',
                      },
                    }}
                  >
                    {isSubmitting ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      'Enviar'
                    )}
                  </Button>

                  <Divider sx={{ mb: 2 }} />

                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                      ¿No tienes cuenta?{' '}
                      <Link
                        to="/register"
                        style={{
                          color: '#dc3545',
                          textDecoration: 'underline',
                          fontWeight: 500,
                        }}
                      >
                        Regístrate
                      </Link>
                    </Typography>
                  </Box>

                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Link
                      to="/forgot-password"
                      style={{
                        color: '#7f8c8d',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                      }}
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </Box>
                </Box>
              </Form>
            )}
          </Formik>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;