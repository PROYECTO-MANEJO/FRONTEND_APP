import { useState } from 'react';
import { Link } from 'react-router-dom';
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
  Container,
  Avatar,
  CircularProgress,
} from '@mui/material';
import {
  Email,
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
          background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
          padding: 2,
        }}
      >
        <Container maxWidth="sm">
          <Card elevation={3} sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: 'success.main',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <Email fontSize="large" />
              </Avatar>
              <Typography variant="h5" gutterBottom>
                Correo Enviado
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Si el correo existe en nuestro sistema, recibirás instrucciones para restablecer tu contraseña en breve.
              </Typography>
              <Link to="/login">
                <Button
                  variant="contained"
                  startIcon={<ArrowBack />}
                  sx={{ mt: 2 }}
                >
                  Volver al Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </Container>
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
        background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
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
                  bgcolor: 'primary.main',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <School fontSize="large" />
              </Avatar>
              <Typography variant="h4" component="h1" gutterBottom>
                Recuperar Contraseña
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ingresa tu correo institucional y te enviaremos instrucciones para restablecer tu contraseña.
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
                    sx={{ mb: 3 }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={isSubmitting}
                    startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <Email />}
                    sx={{ mb: 3, py: 1.5 }}
                  >
                    {isSubmitting ? 'Enviando...' : 'Enviar Instrucciones'}
                  </Button>

                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      ¿Recordaste tu contraseña?{' '}
                      <Link
                        to="/login"
                        style={{
                          color: '#dc2626',
                          textDecoration: 'none',
                          fontWeight: 500,
                        }}
                      >
                        Volver al Login
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

export default ForgotPassword;