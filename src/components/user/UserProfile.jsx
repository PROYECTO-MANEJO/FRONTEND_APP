import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import {
  Person,
  Edit,
  Save,
  Cancel,
  School
} from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import UserSidebar from './UserSidebar';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { carreraService } from '../../services/carreraService';

const validationSchema = Yup.object().shape({
  nom_usu1: Yup.string().required('El primer nombre es obligatorio'),
  nom_usu2: Yup.string(),
  ape_usu1: Yup.string().required('El primer apellido es obligatorio'),
  ape_usu2: Yup.string(),
  fec_nac_usu: Yup.date().required('La fecha de nacimiento es obligatoria'),
  num_tel_usu: Yup.string()
    .matches(/^[0-9+\-\s()]+$/, 'Número de teléfono inválido')
    .min(10, 'Mínimo 10 dígitos'),
  id_car_per: Yup.string().when('isEstudiante', {
    is: true,
    then: () => Yup.string().required('Debes seleccionar una carrera'),
    otherwise: () => Yup.string()
  })
});

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [userData, setUserData] = useState(null);
  const [carreras, setCarreras] = useState([]);

  const isEstudiante = userData?.rol === 'ESTUDIANTE';

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Cargar datos del usuario
        const userResponse = await userService.getProfile();
        console.log('User data loaded:', userResponse);
        setUserData(userResponse);

        // Si es estudiante, cargar carreras
        if (userResponse?.rol === 'ESTUDIANTE') {
          const carrerasResponse = await carreraService.getAll();
          console.log('Carreras loaded:', carrerasResponse);
          setCarreras(carrerasResponse);
        }
      } catch (error) {
        setMessage({
          type: 'error',
          text: 'Error al cargar los datos del perfil'
        });
        console.error('Error loading profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSubmit = async (values, { setSubmitting }) => {
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      // Preparar datos para enviar (sin isEstudiante)
      const dataToSubmit = {
        nom_usu1: values.nom_usu1,
        nom_usu2: values.nom_usu2,
        ape_usu1: values.ape_usu1,
        ape_usu2: values.ape_usu2,
        fec_nac_usu: values.fec_nac_usu,
        num_tel_usu: values.num_tel_usu,
        id_car_per: values.id_car_per || null
      };

      console.log('Submitting data:', dataToSubmit);
      
      const updatedUser = await userService.updateProfile(dataToSubmit);
      console.log('User updated:', updatedUser);
      
      // Actualizar el contexto de autenticación si es necesario
      if (updateUser) {
        updateUser(updatedUser);
      }
      setUserData(updatedUser);
      
      setMessage({
        type: 'success',
        text: 'Perfil actualizado exitosamente'
      });
      
      setIsEditing(false);
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Error al actualizar el perfil'
      });
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  const getCarreraNombre = (carreraId) => {
    if (!carreraId) return 'No asignada';
    const carrera = carreras.find(c => c.id_car === carreraId);
    return carrera ? carrera.nom_car : 'No encontrada';
  };

  const handleCancel = () => {
    setIsEditing(false);
    setMessage({ type: '', text: '' });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f5f5f5' }}>
        <UserSidebar />
        <Box sx={{ flexGrow: 1, p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress sx={{ color: '#6d1313' }} />
        </Box>
      </Box>
    );
  }

  if (!userData) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f5f5f5' }}>
        <UserSidebar />
        <Box sx={{ flexGrow: 1, p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Alert severity="error">
            Error al cargar los datos del perfil
          </Alert>
        </Box>
      </Box>
    );
  }

  const initialValues = {
    nom_usu1: userData?.nom_usu1 || '',
    nom_usu2: userData?.nom_usu2 || '',
    ape_usu1: userData?.ape_usu1 || '',
    ape_usu2: userData?.ape_usu2 || '',
    fec_nac_usu: formatDate(userData?.fec_nac_usu) || '',
    num_tel_usu: userData?.num_tel_usu || '',
    id_car_per: userData?.id_car_per || '',
    isEstudiante: isEstudiante
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f5f5f5' }}>
      <UserSidebar />
      
      {/* Main Content */}
      <Box sx={{ flexGrow: 1, p: 3, overflow: 'auto' }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            Mi Perfil
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestiona tu información personal y académica
          </Typography>
        </Box>

        {message.text && (
          <Alert 
            severity={message.type} 
            sx={{ mb: 3 }}
            onClose={() => setMessage({ type: '', text: '' })}
          >
            {message.text}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Profile Card */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: '#6d1313',
                  mx: 'auto',
                  mb: 2,
                  fontSize: '3rem'
                }}
              >
                <Person fontSize="inherit" />
              </Avatar>
              
              <Typography variant="h5" gutterBottom>
                {userData?.nom_usu1} {userData?.ape_usu1}
              </Typography>
              
              <Chip 
                label={userData?.rol || 'Usuario'} 
                color={isEstudiante ? "primary" : "secondary"}
                sx={{ mb: 2 }}
              />
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {userData?.email}
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                Cédula: {userData?.ced_usu}
              </Typography>

              {isEstudiante && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                    <School sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Carrera
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    {userData?.carrera?.nom_car || getCarreraNombre(userData?.id_car_per)}
                  </Typography>
                  {userData?.carrera?.nom_fac_per && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {userData.carrera.nom_fac_per}
                    </Typography>
                  )}
                </>
              )}
            </Paper>
          </Grid>

          {/* Profile Form */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  Información Personal
                </Typography>
                
                {!isEditing ? (
                  <Button
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={() => setIsEditing(true)}
                    sx={{ borderColor: '#6d1313', color: '#6d1313', '&:hover': { borderColor: '#5a1010', bgcolor: 'rgba(109, 19, 19, 0.04)' } }}
                  >
                    Editar
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Cancel />}
                    onClick={handleCancel}
                  >
                    Cancelar
                  </Button>
                )}
              </Box>

              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
              >
                {({ values, errors, touched, handleChange, handleBlur }) => (
                  <Form>
                    <Grid container spacing={3}>
                      {/* Nombres */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          name="nom_usu1"
                          label="Primer Nombre"
                          value={values.nom_usu1}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          disabled={!isEditing}
                          error={touched.nom_usu1 && !!errors.nom_usu1}
                          helperText={touched.nom_usu1 && errors.nom_usu1}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          name="nom_usu2"
                          label="Segundo Nombre"
                          value={values.nom_usu2}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          disabled={!isEditing}
                          error={touched.nom_usu2 && !!errors.nom_usu2}
                          helperText={touched.nom_usu2 && errors.nom_usu2}
                        />
                      </Grid>

                      {/* Apellidos */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          name="ape_usu1"
                          label="Primer Apellido"
                          value={values.ape_usu1}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          disabled={!isEditing}
                          error={touched.ape_usu1 && !!errors.ape_usu1}
                          helperText={touched.ape_usu1 && errors.ape_usu1}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          name="ape_usu2"
                          label="Segundo Apellido"
                          value={values.ape_usu2}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          disabled={!isEditing}
                          error={touched.ape_usu2 && !!errors.ape_usu2}
                          helperText={touched.ape_usu2 && errors.ape_usu2}
                        />
                      </Grid>

                      {/* Fecha de nacimiento */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          name="fec_nac_usu"
                          label="Fecha de Nacimiento"
                          type="date"
                          value={values.fec_nac_usu}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          disabled={!isEditing}
                          InputLabelProps={{ shrink: true }}
                          error={touched.fec_nac_usu && !!errors.fec_nac_usu}
                          helperText={touched.fec_nac_usu && errors.fec_nac_usu}
                        />
                      </Grid>

                      {/* Teléfono */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          name="num_tel_usu"
                          label="Número de Teléfono"
                          value={values.num_tel_usu}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          disabled={!isEditing}
                          placeholder="Ej: 0987654321"
                          error={touched.num_tel_usu && !!errors.num_tel_usu}
                          helperText={touched.num_tel_usu && errors.num_tel_usu}
                        />
                      </Grid>

                      {/* Carrera (solo para estudiantes) */}
                      {isEstudiante && (
                        <Grid item xs={12}>
                          <FormControl fullWidth disabled={!isEditing}>
                            <InputLabel>Carrera</InputLabel>
                            <Select
                              name="id_car_per"
                              value={values.id_car_per}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              label="Carrera"
                              error={touched.id_car_per && !!errors.id_car_per}
                            >
                              <MenuItem value="">
                                <em>Selecciona una carrera</em>
                              </MenuItem>
                              {carreras.map((carrera) => (
                                <MenuItem key={carrera.id_car} value={carrera.id_car}>
                                  <Box>
                                    <Typography variant="body1">
                                      {carrera.nom_car}
                                    </Typography>
                                    {carrera.nom_fac_per && (
                                      <Typography variant="caption" color="text.secondary">
                                        {carrera.nom_fac_per}
                                      </Typography>
                                    )}
                                  </Box>
                                </MenuItem>
                              ))}
                            </Select>
                            {touched.id_car_per && errors.id_car_per && (
                              <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                                {errors.id_car_per}
                              </Typography>
                            )}
                          </FormControl>
                        </Grid>
                      )}

                      {/* Información del sistema (solo lectura) */}
                      <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="h6" gutterBottom>
                          Información del Sistema
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="Email"
                          value={userData?.email || ''}
                          disabled
                          helperText="El email no se puede modificar"
                        />
                      </Grid>

                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="Rol"
                          value={userData?.rol || ''}
                          disabled
                        />
                      </Grid>

                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="ID Usuario"
                          value={userData?.id_usu || ''}
                          disabled
                          inputProps={{ style: { fontSize: '0.8rem' } }}
                        />
                      </Grid>

                      {/* Botón de guardar */}
                      {isEditing && (
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                            <Button
                              type="submit"
                              variant="contained"
                              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <Save />}
                              disabled={isSubmitting}
                              sx={{ bgcolor: '#6d1313', '&:hover': { bgcolor: '#5a1010' } }}
                            >
                              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                            </Button>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </Form>
                )}
              </Formik>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default UserProfile;