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
  Grid,
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
import { validarCedulaEcuatoriana } from '../../utils/cedulaValidator';

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
    .required('La cédula es obligatoria')
    .length(10, 'La cédula debe tener exactamente 10 dígitos')
    .matches(/^\d{10}$/, 'La cédula solo debe contener números')
    .test('cedula-ecuatoriana', 'Debe ser una cédula ecuatoriana válida', function(value) {
      if (!value) return false;
      const resultado = validarCedulaEcuatoriana(value);
      if (!resultado.isValid) {
        return this.createError({ message: resultado.error });
      }
      return true;
    }),
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
        background: 'linear-gradient(135deg, #6d1313 0%, #5a1010 100%)',
        padding: 2,
      }}
    >
      <Paper
        elevation={24}
        sx={{
          display: 'flex',
          width: '100%',
          maxWidth: 1200,
          minHeight: 750,
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
            Únete
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
            Crea tu cuenta y forma parte del Sistema de Gestión de Eventos Académicos
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

        {/* Right Panel - Register Form */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            p: { xs: 3, md: 4 },
            backgroundColor: 'white',
          }}
        >
          <Box sx={{ mb: 2, mt: 2 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: '#2c3e50',
                mb: 1,
                fontSize: { xs: '1.6rem', md: '2rem' },
              }}
            >
              Crear Cuenta
            </Typography>
            <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
              Completa todos los campos para registrarte
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
                    sx={{
                      mb: 2,
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

                  {/* Nombres */}
                  <Grid container spacing={2} sx={{ mb: 1.5 }}>
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
                        sx={{
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
                        sx={{
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
                    </Grid>
                  </Grid>

                  {/* Apellidos */}
                  <Grid container spacing={2} sx={{ mb: 1.5 }}>
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
                        sx={{
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
                        sx={{
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
                    sx={{
                      mb: 2,
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
                    sx={{
                      mb: 2,
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
                            aria-label="toggle confirm password visibility"
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
                      mb: 2,
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
                      'Crear Cuenta'
                    )}
                  </Button>

                  <Divider sx={{ mb: 2 }} />

                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                      ¿Ya tienes cuenta?{' '}
                      <Link
                        to="/login"
                        style={{
                          color: '#dc3545',
                          textDecoration: 'underline',
                          fontWeight: 500,
                        }}
                      >
                        Inicia sesión
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

export default Register;