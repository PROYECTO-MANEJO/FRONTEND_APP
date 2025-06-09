import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as yup from 'yup';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Divider,
} from '@mui/material';
import {
  Email,
  Facebook,
  Twitter,
  School,
  ArrowBack,
} from '@mui/icons-material';
import authService from '../../services/authService';

const validationSchema = yup.object().shape({
  email: yup
    .string()
    .email('El correo electrónico no es válido')
    .required('El correo electrónico es obligatorio'),
});

const ForgotPassword = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const initialValues = {
    email: ''
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    setIsSubmitting(true);
    setError('');
    
    try {
      await authService.forgotPassword(values.email);
      setSubmitted(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  if (submitted) {
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
            <Email sx={{ fontSize: 80, mb: 3, opacity: 0.9 }} />
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
              ¡Perfecto!
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
              Revisa tu correo electrónico para continuar con el proceso de recuperación
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
            <Email sx={{ fontSize: 64, color: '#dc3545', mx: 'auto', mb: 3 }} />
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: '#2c3e50',
                mb: 2,
                fontSize: { xs: '1.8rem', md: '2.2rem' },
              }}
            >
              Correo Enviado
            </Typography>
            <Typography variant="body1" sx={{ color: '#7f8c8d', mb: 4, lineHeight: 1.6 }}>
              Si el correo existe en nuestro sistema, recibirás instrucciones para restablecer tu contraseña en breve.
            </Typography>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                startIcon={<ArrowBack />}
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
                Volver al Login
              </Button>
            </Link>
          </Box>
        </Paper>
      </Box>
    );
  }

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
            Recuperar
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
            No te preocupes, te ayudamos a recuperar el acceso a tu cuenta de manera segura
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

        {/* Right Panel - Forgot Password Form */}
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
              Recuperar Contraseña
            </Typography>
            <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
              Ingresa tu correo institucional y te enviaremos instrucciones
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
                    id="email"
                    name="email"
                    label="Correo Institucional"
                    type="email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
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
                      'Enviar Instrucciones'
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
                        Volver al login
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

export default ForgotPassword;