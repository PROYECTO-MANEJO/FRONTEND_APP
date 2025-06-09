import React, { useState, useEffect, useRef } from 'react'; // ✅ Agregar useRef
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
  Chip,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  LinearProgress,
  IconButton
} from '@mui/material';
import {
  Person,
  Edit,
  Save,
  Cancel,
  School,
  UploadFile,
  CheckCircle,
  Pending,
  Description,
  Delete
} from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import UserSidebar from './UserSidebar';
import { useUserSidebarLayout } from '../../hooks/useUserSidebarLayout';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { carreraService } from '../../services/carreraService';
import { documentService } from '../../services/documentService'; // ✅ NUEVO

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
  const { getMainContentStyle } = useUserSidebarLayout();
  const { updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [userData, setUserData] = useState(null);
  const [carreras, setCarreras] = useState([]);
  
  // ✅ NUEVOS ESTADOS PARA DOCUMENTOS
  const [tabValue, setTabValue] = useState(0);
  const [documentStatus, setDocumentStatus] = useState(null);
  const [documentLoading, setDocumentLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState({
    cedula_pdf: null,
    matricula_pdf: null
  });

  // ✅ AGREGAR NUEVOS ESTADOS
  const [deleting, setDeleting] = useState(false);

  const isEstudiante = userData?.rol === 'ESTUDIANTE';

  // ✅ NUEVOS REFS PARA LOS INPUTS
  const cedulaInputRef = useRef(null);
  const matriculaInputRef = useRef(null);

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

        // ✅ CARGAR ESTADO DE DOCUMENTOS
        await loadDocumentStatus();
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

  // ✅ TODAS ESTAS FUNCIONES DEBEN ESTAR DEFINIDAS:
  
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const loadDocumentStatus = async () => {
    try {
      setDocumentLoading(true);
      const response = await documentService.getDocumentStatus();
      setDocumentStatus(response.data);
    } catch (error) {
      console.error('Error cargando estado de documentos:', error);
    } finally {
      setDocumentLoading(false);
    }
  };

  const handleFileSelect = (event, tipo) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setFiles(prev => ({
        ...prev,
        [tipo]: file
      }));
    } else {
      setMessage({
        type: 'error',
        text: 'Solo se permiten archivos PDF'
      });
    }
  };

  const removeFile = (tipo) => {
    setFiles(prev => ({
      ...prev,
      [tipo]: null
    }));
    const input = document.getElementById(`${tipo}_input`);
    if (input) input.value = '';
  };

  // ✅ CORREGIR la función uploadDocuments
  const uploadDocuments = async () => {
    try {
      setUploading(true);
      setMessage({ type: '', text: '' });

      // ✅ NUEVA LÓGICA: Solo validar los archivos que se están subiendo
      const hayCedulaNueva = files.cedula_pdf;
      const hayMatriculaNueva = files.matricula_pdf;

      // Validar que al menos haya UN archivo para subir
      if (!hayCedulaNueva && !hayMatriculaNueva) {
        setMessage({
          type: 'error',
          text: 'Debes seleccionar al menos un archivo para subir'
        });
        return;
      }

      // ✅ VALIDACIÓN MEJORADA: Solo validar según lo que ya existe y lo que se está subiendo
      const necesitaCedula = !documentStatus.cedula_subida;
      const necesitaMatricula = isEstudiante && !documentStatus.matricula_subida;

      if (necesitaCedula && !hayCedulaNueva) {
        setMessage({
          type: 'error',
          text: 'El archivo de cédula es obligatorio'
        });
        return;
      }

      if (necesitaMatricula && !hayMatriculaNueva) {
        setMessage({
          type: 'error',
          text: 'Para estudiantes es obligatorio el archivo de matrícula'
        });
        return;
      }

      // Crear FormData solo con los archivos nuevos
      const formData = new FormData();
      
      if (hayCedulaNueva) {
        formData.append('cedula_pdf', files.cedula_pdf);
      }
      
      if (hayMatriculaNueva) {
        formData.append('matricula_pdf', files.matricula_pdf);
      }

      console.log('📋 Archivos a subir:', {
        cedula: hayCedulaNueva ? files.cedula_pdf.name : 'No incluido',
        matricula: hayMatriculaNueva ? files.matricula_pdf.name : 'No incluido'
      });

      const response = await documentService.uploadDocuments(formData);
      
      if (response.success) {
        setMessage({
          type: 'success',
          text: 'Documentos subidos exitosamente. Pendientes de verificación.'
        });
        
        // Limpiar solo los archivos que se subieron
        const newFiles = { ...files };
        if (hayCedulaNueva) {
          newFiles.cedula_pdf = null;
          const cedulaInput = document.getElementById('cedula_pdf_input');
          if (cedulaInput) cedulaInput.value = '';
        }
        if (hayMatriculaNueva) {
          newFiles.matricula_pdf = null;
          const matriculaInput = document.getElementById('matricula_pdf_input');
          if (matriculaInput) matriculaInput.value = '';
        }
        
        setFiles(newFiles);
        await loadDocumentStatus();
      }

    } catch (error) {
      console.error('❌ Error subiendo documentos:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error al subir documentos'
      });
    } finally {
      setUploading(false);
    }
  };

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

  // ✅ NUEVA FUNCIÓN: Cambiar tab
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setMessage({ type: '', text: '' }); // Limpiar mensajes al cambiar tab
  };

  // ✅ AGREGAR ESTA FUNCIÓN después de uploadDocuments
  const deleteDocument = async (tipo) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar el documento de ${tipo}?`)) {
      return;
    }

    try {
      setDeleting(true);
      setMessage({ type: '', text: '' });

      console.log('🗑️ Eliminando documento tipo:', tipo);

      const response = await documentService.deleteDocuments(tipo);
      
      if (response.success) {
        setMessage({
          type: 'success',
          text: `Documento de ${tipo} eliminado exitosamente. Puedes subir uno nuevo.`
        });
        
        // Limpiar estado local
        if (tipo === 'cedula' || tipo === 'ambos') {
          setFiles(prev => ({ ...prev, cedula_pdf: null }));
        }
        if (tipo === 'matricula' || tipo === 'ambos') {
          setFiles(prev => ({ ...prev, matricula_pdf: null }));
        }
        
        // Recargar estado de documentos
        await loadDocumentStatus();
      }

    } catch (error) {
      console.error('❌ Error eliminando documento:', error);
      
      let errorMessage = `Error al eliminar documento de ${tipo}`;
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setMessage({
        type: 'error',
        text: errorMessage
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
        <UserSidebar />
        <Box sx={{ 
          flexGrow: 1,
          p: 3, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          ...getMainContentStyle()
        }}>
          <CircularProgress sx={{ color: '#6d1313' }} />
        </Box>
      </Box>
    );
  }

  if (!userData) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
        <UserSidebar />
        <Box sx={{ 
          flexGrow: 1,
          p: 3, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          ...getMainContentStyle()
        }}>
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
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <UserSidebar />
      
      {/* Main Content */}
      <Box sx={{ 
        flexGrow: 1,
        p: 3,
        ...getMainContentStyle()
      }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            Mi Perfil
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestiona tu información personal y documentos
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

        {/* ✅ NUEVAS TABS */}
        <Paper sx={{ mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab 
              icon={<Person />} 
              label="Información Personal" 
              sx={{ minHeight: 64 }}
            />
            <Tab 
              icon={<Description />} 
              label="Documentos" 
              sx={{ minHeight: 64 }}
            />
          </Tabs>
        </Paper>

        {/* TAB 1: Información Personal (código existente igual) */}
        {tabValue === 0 && (
          <Grid container spacing={3}>
            {/* Profile Card - código existente igual */}
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

            {/* Profile Form - código existente igual */}
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
        )}

        {/* ✅ TAB 2: Documentos (NUEVO) */}
        {tabValue === 1 && (
          <Grid container spacing={3}>
            {/* Estado Actual de Documentos */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  📊 Estado de Documentos
                </Typography>
                
                {documentLoading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CircularProgress size={20} />
                    <Typography>Cargando estado...</Typography>
                  </Box>
                ) : documentStatus ? (
                  <Grid container spacing={2}>
                    {/* Cédula */}
                    <Grid item xs={12} sm={6}>
                      <Card variant="outlined" sx={{ 
                        border: documentStatus.cedula_subida ? '2px solid #4caf50' : '2px solid #ff9800'
                      }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {documentStatus.cedula_subida ? (
                              <CheckCircle sx={{ color: '#4caf50' }} />
                            ) : (
                              <Pending sx={{ color: '#ff9800' }} />
                            )}
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="h6">Cédula</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {documentStatus.cedula_subida 
                                  ? `Subida (${documentStatus.archivos_info?.cedula?.tamaño || 'N/A'})`
                                  : 'Pendiente'
                                }
                              </Typography>
                            </Box>
                            
                            {/* ✅ BOTÓN DE ELIMINAR CÉDULA */}
                            {documentStatus.cedula_subida && documentStatus.puede_eliminar && (
                              <IconButton 
                                onClick={() => deleteDocument('cedula')}
                                color="error"
                                disabled={deleting}
                                title="Eliminar documento"
                              >
                                <Delete />
                              </IconButton>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Matrícula (solo estudiantes) */}
                    {documentStatus.matricula_requerida && (
                      <Grid item xs={12} sm={6}>
                        <Card variant="outlined" sx={{ 
                          border: documentStatus.matricula_subida ? '2px solid #4caf50' : '2px solid #ff9800'
                        }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              {documentStatus.matricula_subida ? (
                                <CheckCircle sx={{ color: '#4caf50' }} />
                              ) : (
                                <Pending sx={{ color: '#ff9800' }} />
                              )}
                              <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="h6">Matrícula</Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {documentStatus.matricula_subida 
                                    ? `Subida (${documentStatus.archivos_info?.matricula?.tamaño || 'N/A'})`
                                    : 'Pendiente'
                                  }
                                </Typography>
                              </Box>
                              
                              {/* ✅ BOTÓN DE ELIMINAR MATRÍCULA */}
                              {documentStatus.matricula_subida && documentStatus.puede_eliminar && (
                                <IconButton 
                                  onClick={() => deleteDocument('matricula')}
                                  color="error"
                                  disabled={deleting}
                                  title="Eliminar documento"
                                >
                                  <Delete />
                                </IconButton>
                              )}
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    )}

                    {/* Estado de Verificación */}
                    <Grid item xs={12}>
                      <Alert 
                        severity={documentStatus.documentos_verificados ? "success" : "info"}
                        sx={{ mt: 2 }}
                      >
                        <Typography variant="subtitle1">
                          Estado de Verificación: {' '}
                          {documentStatus.documentos_verificados 
                            ? `✅ Verificados (${new Date(documentStatus.fecha_verificacion).toLocaleDateString()})`
                            : '⏰ Pendiente de verificación administrativa'
                          }
                        </Typography>
                      </Alert>
                    </Grid>
                  </Grid>
                ) : (
                  <Alert severity="warning">
                    No se pudo cargar el estado de los documentos
                  </Alert>
                )}
              </Paper>
            </Grid>

            {/* ✅ SUBIR NUEVOS DOCUMENTOS - SOLO SI PUEDE SUBIR */}
            {documentStatus && (!documentStatus.documentos_verificados) && (
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    📤 Subir Documentos
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {isEstudiante 
                      ? 'Como estudiante, puedes subir o actualizar tu cédula y matrícula por separado.'
                      : 'Puedes subir o actualizar tu documento de cédula.'
                    }
                  </Typography>

                  <Grid container spacing={3}>
                    {/* ✅ MOSTRAR CÉDULA: Si no tiene o si tiene archivos seleccionados */}
                    {(!documentStatus.cedula_subida || files.cedula_pdf) && (
                      <Grid item xs={12} sm={isEstudiante ? 6 : 12}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle1" gutterBottom>
                            📋 Cédula de Identidad {!documentStatus.cedula_subida ? '*' : '(Actualizar)'}
                          </Typography>
                          
                          {files.cedula_pdf ? (
                            <Card variant="outlined" sx={{ p: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Description />
                                  <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                      {files.cedula_pdf.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {formatFileSize(files.cedula_pdf.size)}
                                    </Typography>
                                  </Box>
                                </Box>
                                <IconButton 
                                  onClick={() => removeFile('cedula_pdf')}
                                  color="error"
                                  size="small"
                                >
                                  <Delete />
                                </IconButton>
                              </Box>
                            </Card>
                          ) : (
                            <Box>
                              <input
                                ref={cedulaInputRef}
                                id="cedula_pdf_input"
                                type="file"
                                accept=".pdf"
                                onChange={(e) => handleFileSelect(e, 'cedula_pdf')}
                                style={{ display: 'none' }}
                              />
                              <label htmlFor="cedula_pdf_input">
                                <Button
                                  variant="outlined"
                                  component="span"
                                  startIcon={<UploadFile />}
                                  fullWidth
                                  sx={{ p: 3, borderStyle: 'dashed' }}
                                >
                                  {documentStatus.cedula_subida ? 'Actualizar cédula' : 'Seleccionar archivo PDF'}
                                </Button>
                              </label>
                            </Box>
                          )}
                        </Box>
                      </Grid>
                    )}

                    {/* ✅ MOSTRAR MATRÍCULA: Solo estudiantes y si no tiene o tiene archivos */}
                    {isEstudiante && (!documentStatus.matricula_subida || files.matricula_pdf) && (
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle1" gutterBottom>
                            🎓 Matrícula Estudiantil {!documentStatus.matricula_subida ? '*' : '(Actualizar)'}
                          </Typography>
                          
                          {files.matricula_pdf ? (
                            <Card variant="outlined" sx={{ p: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Description />
                                  <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                      {files.matricula_pdf.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {formatFileSize(files.matricula_pdf.size)}
                                    </Typography>
                                  </Box>
                                </Box>
                                <IconButton 
                                  onClick={() => removeFile('matricula_pdf')}
                                  color="error"
                                  size="small"
                                >
                                  <Delete />
                                </IconButton>
                              </Box>
                            </Card>
                          ) : (
                            <Box>
                              <input
                                ref={matriculaInputRef}
                                id="matricula_pdf_input"
                                type="file"
                                accept=".pdf"
                                onChange={(e) => handleFileSelect(e, 'matricula_pdf')}
                                style={{ display: 'none' }}
                              />
                              <label htmlFor="matricula_pdf_input">
                                <Button
                                  variant="outlined"
                                  component="span"
                                  startIcon={<UploadFile />}
                                  fullWidth
                                  sx={{ p: 3, borderStyle: 'dashed' }}
                                >
                                  {documentStatus.matricula_subida ? 'Actualizar matrícula' : 'Seleccionar archivo PDF'}
                                </Button>
                              </label>
                            </Box>
                          )}
                        </Box>
                      </Grid>
                    )}

                    {/* ✅ BOTÓN DE SUBIDA - Solo si hay archivos seleccionados */}
                    {(files.cedula_pdf || files.matricula_pdf) && (
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                          <Button
                            variant="contained"
                            size="large"
                            startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <UploadFile />}
                            onClick={uploadDocuments}
                            disabled={uploading}
                            sx={{ 
                              bgcolor: '#6d1313', 
                              '&:hover': { bgcolor: '#5a1010' },
                              minWidth: 200
                            }}
                          >
                            {uploading ? 'Subiendo...' : 
                              (files.cedula_pdf && files.matricula_pdf) ? 'Subir Ambos Documentos' :
                              files.cedula_pdf ? 'Subir Cédula' : 'Subir Matrícula'
                            }
                          </Button>
                        </Box>
                        
                        <Typography variant="caption" display="block" textAlign="center" sx={{ mt: 2 }} color="text.secondary">
                          {files.cedula_pdf && files.matricula_pdf 
                            ? 'Se subirán ambos documentos para verificación.'
                            : files.cedula_pdf 
                              ? 'Se subirá solo el documento de cédula.'
                              : 'Se subirá solo el documento de matrícula.'
                          }
                        </Typography>
                      </Grid>
                    )}

                    {/* ✅ MENSAJE INFORMATIVO cuando no hay archivos seleccionados */}
                    {!files.cedula_pdf && !files.matricula_pdf && documentStatus && 
                     (documentStatus.cedula_subida || documentStatus.matricula_subida) && (
                      <Grid item xs={12}>
                        <Alert severity="info" sx={{ mt: 2 }}>
                          <Typography variant="body2">
                            ℹ️ Puedes actualizar tus documentos individualmente. 
                            Elimina el documento que quieras reemplazar y sube uno nuevo.
                          </Typography>
                        </Alert>
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              </Grid>
            )}

            {/* ✅ MENSAJE CUANDO NO PUEDE SUBIR */}
            {!documentStatus?.puede_subir_nuevos && documentStatus && (
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Alert severity="info">
                    <Typography variant="h6" gutterBottom>
                      📋 Documentos Completos
                    </Typography>
                    <Typography variant="body1">
                      {documentStatus.documentos_verificados 
                        ? '✅ Tus documentos han sido verificados exitosamente por el administrador.'
                        : documentStatus.puede_eliminar 
                          ? '📄 Has subido todos los documentos requeridos. Puedes eliminarlos y subir nuevos mientras no sean verificados por el administrador.'
                          : '⏳ Tus documentos están pendientes de verificación administrativa. Por favor espera la respuesta del equipo.'
                      }
                    </Typography>
                    
                    {/* Botón para eliminar todos los documentos */}
                    {documentStatus.puede_eliminar && !documentStatus.documentos_verificados && (
                      <Box sx={{ mt: 2 }}>
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={deleting ? <CircularProgress size={16} /> : <Delete />}
                          onClick={() => deleteDocument('ambos')}
                          disabled={deleting}
                        >
                          {deleting ? 'Eliminando...' : 'Eliminar Todos los Documentos'}
                        </Button>
                      </Box>
                    )}
                  </Alert>
                </Paper>
              </Grid>
            )}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default UserProfile;