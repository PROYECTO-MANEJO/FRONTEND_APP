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
  FormControlLabel,
  Checkbox,
  Container,
  Avatar,
  CircularProgress,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Lock,
  School,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error en login:', error);
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
      <Container maxWidth="sm">
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
                Iniciar Sesión
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sistema de Gestión de Eventos Académicos - UTA
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
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                id="password"
                name="password"
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                placeholder="Tu contraseña"
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

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <FormControlLabel
                  control={<Checkbox size="small" />}
                  label="Recordarme"
                />
                <Link
                  to="#"
                  style={{
                    color: '#dc2626',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                  }}
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <Lock />}
                sx={{ mb: 3, py: 1.5 }}
              >
                {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  ¿No tienes una cuenta?{' '}
                  <Link
                    to="/register"
                    style={{
                      color: '#dc2626',
                      textDecoration: 'none',
                      fontWeight: 500,
                    }}
                  >
                    Regístrate aquí
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

export default Login; 