import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  Divider,
} from '@mui/material';
import {
  Lock,
  School,
  Visibility,
  VisibilityOff,
  CheckCircle,
  Facebook,
  Twitter,
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
      } catch {
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
              backgroundImage: `
                radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%),
                linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.05) 50%, transparent 70%)
              `,
            }}
          >
            <Lock sx={{ fontSize: 80, mb: 3, opacity: 0.9 }} />
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
              Error
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
              Hubo un problema con el enlace de recuperación
            </Typography>
          </Box>

          {/* Right Panel - Error Message */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              p: { xs: 3, md: 5 },
              backgroundColor: 'white',
              textAlign: 'center',
            }}
          >
            <Alert severity="error" sx={{ mb: 3, borderRadius: 0 }}>
              {error}
            </Alert>
            <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                sx={{
                  py: 1.5,
                  px: 4,
                  borderRadius: 2,
                  backgroundColor: '#dc3545',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: '0 4px 12px rgba(220, 53, 69, 0.3)',
                  '&:hover': {
                    backgroundColor: '#c82333',
                    boxShadow: '0 6px 16px rgba(220, 53, 69, 0.4)',
                  },
                }}
              >
                Solicitar nuevo enlace
              </Button>
            </Link>
          </Box>
        </Paper>
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
        <CircularProgress size={60} sx={{ color: '#dc3545' }} />
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
              backgroundImage: `
                radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%),
                linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.05) 50%, transparent 70%)
              `,
            }}
          >
            <CheckCircle sx={{ fontSize: 80, mb: 3, opacity: 0.9 }} />
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
              ¡Listo!
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
              Tu contraseña ha sido actualizada exitosamente
            </Typography>
          </Box>

          {/* Right Panel - Success Message */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              p: { xs: 3, md: 5 },
              backgroundColor: 'white',
              textAlign: 'center',
            }}
          >
            <Alert severity="success" sx={{ mb: 3, borderRadius: 0 }}>
              ¡Contraseña actualizada exitosamente! Serás redirigido al login en unos segundos.
            </Alert>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                sx={{
                  py: 1.5,
                  px: 4,
                  borderRadius: 2,
                  backgroundColor: '#dc3545',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: '0 4px 12px rgba(220, 53, 69, 0.3)',
                  '&:hover': {
                    backgroundColor: '#c82333',
                    boxShadow: '0 6px 16px rgba(220, 53, 69, 0.4)',
                  },
                }}
              >
                Ir al Login
              </Button>
            </Link>
          </Box>
        </Paper>
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
            backgroundImage: `
              radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%),
              linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.05) 50%, transparent 70%)
            `,
          }}
        >
          <Lock sx={{ fontSize: 80, mb: 3, opacity: 0.9 }} />
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
            Renovar
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
            Establece una nueva contraseña segura para tu cuenta
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

        {/* Right Panel - Reset Password Form */}
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
              Nueva Contraseña
            </Typography>
            <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
              Ingresa tu nueva contraseña para completar el proceso
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 0 }}>
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
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                            sx={{ color: '#7f8c8d' }}
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
                      borderRadius: 2,
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
                      'Actualizar Contraseña'
                    )}
                  </Button>

                  <Divider sx={{ mb: 2 }} />

                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                      ¿Recordaste tu contraseña?{' '}
                      <Link
                        to="/login"
                        style={{
                          color: '#dc3545',
                          textDecoration: 'underline',
                          fontWeight: 500,
                        }}
                      >
                        Iniciar sesión
                      </Link>
                    </Typography>
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

export default ResetPassword;