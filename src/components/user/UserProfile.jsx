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
  Chip,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  LinearProgress,
  IconButton,
  Container,
  AlertTitle
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
  Delete,
  Email,
  Phone,
  CalendarToday,
  Work
} from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import UserSidebar from './UserSidebar';
import { useUserSidebarLayout } from '../../hooks/useUserSidebarLayout';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { documentService } from '../../services/documentService';

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
  }),
  github_token: Yup.string()
    .matches(/^ghp_[a-zA-Z0-9]{36}$/, 'Formato de token GitHub inválido (debe comenzar con ghp_ y tener 40 caracteres)')
});

const UserProfile = () => {
  const { getMainContentStyle } = useUserSidebarLayout();
  const { updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [userData, setUserData] = useState(null);
  
  // Estados para documentos
  const [tabValue, setTabValue] = useState(0);
  const [documentStatus, setDocumentStatus] = useState(null);
  const [documentLoading, setDocumentLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState({
    cedula_pdf: null,
    matricula_pdf: null
  });
  const [deleting, setDeleting] = useState(false);

  const isEstudiante = userData?.rol === 'ESTUDIANTE';

  // Refs para los inputs (se pueden agregar si se necesitan en el futuro)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        const userResponse = await userService.getProfile();
        setUserData(userResponse);

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
      
      // También actualizar userData con información fresca
      const userResponse = await userService.getProfile();
      setUserData(userResponse);
      updateUser(userResponse);
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

  const uploadDocuments = async () => {
    try {
      setUploading(true);
      setMessage({ type: '', text: '' });

      const hayCedulaNueva = files.cedula_pdf;
      const hayMatriculaNueva = files.matricula_pdf;

      if (!hayCedulaNueva && !hayMatriculaNueva) {
        setMessage({
          type: 'error',
          text: 'Debes seleccionar al menos un archivo para subir'
        });
        return;
      }

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
          text: 'El archivo de matrícula es obligatorio para estudiantes'
        });
        return;
      }

      const formData = new FormData();
      if (hayCedulaNueva) formData.append('cedula_pdf', files.cedula_pdf);
      if (hayMatriculaNueva) formData.append('matricula_pdf', files.matricula_pdf);

      await documentService.uploadDocuments(formData);
      
      setMessage({
        type: 'success',
        text: 'Documentos subidos exitosamente'
      });

      setFiles({ cedula_pdf: null, matricula_pdf: null });
      const cedulaInput = document.getElementById('cedula_pdf_input');
      const matriculaInput = document.getElementById('matricula_pdf_input');
      if (cedulaInput) cedulaInput.value = '';
      if (matriculaInput) matriculaInput.value = '';

      await loadDocumentStatus();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error al subir documentos'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setIsSubmitting(true);
      
      const updateData = {
        nom_usu1: values.nom_usu1,
        nom_usu2: values.nom_usu2 || null,
        ape_usu1: values.ape_usu1,
        ape_usu2: values.ape_usu2 || null,
        fec_nac_usu: values.fec_nac_usu,
        num_tel_usu: values.num_tel_usu || null,
      };

      const updatedUser = await userService.updateProfile(updateData);
      
      setUserData(updatedUser);
      updateUser(updatedUser);
      setIsEditing(false);
      
      setMessage({
        type: 'success',
        text: 'Perfil actualizado correctamente'
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error al actualizar el perfil'
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

  const handleCancel = () => {
    setIsEditing(false);
    setMessage({ type: '', text: '' });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const deleteDocument = async (tipo) => {
    try {
      setDeleting(true);
      await documentService.deleteDocument(tipo);
      setMessage({
        type: 'success',
        text: 'Documento eliminado correctamente'
      });
      await loadDocumentStatus();
    } catch {
      setMessage({
        type: 'error',
        text: 'Error al eliminar documento'
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
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          ...getMainContentStyle()
        }}>
          <CircularProgress size={60} sx={{ color: '#b91c1c' }} />
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
    github_token: userData?.github_token || '',

  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <UserSidebar />
      
      <Box sx={{ 
        flexGrow: 1,
        ...getMainContentStyle()
      }}>
        <Container maxWidth="lg" sx={{ py: 3 }}>
          {/* Header compacto */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, color: '#1a1a1a' }}>
              Mi Perfil
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Gestiona tu información personal y documentos
            </Typography>
          </Box>

          {message.text && (
            <Alert 
              severity={message.type} 
              sx={{ mb: 2 }}
              onClose={() => setMessage({ type: '', text: '' })}
            >
              {message.text}
            </Alert>
          )}

          {/* Pestañas */}
          <Paper elevation={1} sx={{ mb: 3, borderRadius: 2 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  py: 2
                }
              }}
            >
              <Tab 
                icon={<Person />} 
                label="Información Personal" 
                iconPosition="start"
              />
              <Tab 
                icon={<Description />} 
                label="Documentos" 
                iconPosition="start"
              />
            </Tabs>
          </Paper>

                     {/* TAB 1: Información Personal */}
           {tabValue === 0 && (
             <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                 <Typography variant="h6" sx={{ fontWeight: 600 }}>
                   Información Personal
                 </Typography>
                 
                 {!isEditing ? (
                   <Button
                     variant="contained"
                     startIcon={<Edit />}
                     onClick={() => setIsEditing(true)}
                     sx={{ 
                       bgcolor: '#b91c1c', 
                       '&:hover': { bgcolor: '#991b1b' },
                       borderRadius: 2
                     }}
                   >
                     Editar
                   </Button>
                 ) : (
                   <Button
                     variant="outlined"
                     color="error"
                     startIcon={<Cancel />}
                     onClick={handleCancel}
                     sx={{ borderRadius: 2 }}
                   >
                     Cancelar
                   </Button>
                 )}
               </Box>

               <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                 {/* Card de perfil compacta */}
                 <Box sx={{ 
                   p: 3, 
                   borderRadius: 3, 
                   bgcolor: '#f8f9fa', 
                   border: '1px solid #e9ecef',
                   height: 'fit-content',
                   minWidth: '280px',
                   flexShrink: 0
                 }}>
                   <Box sx={{ textAlign: 'center', mb: 2 }}>
                     <Avatar
                       sx={{
                         width: 100,
                         height: 100,
                         bgcolor: '#b91c1c',
                         mx: 'auto',
                         mb: 2,
                         fontSize: '2.5rem',
                         boxShadow: 3
                       }}
                     >
                       <Person fontSize="inherit" />
                     </Avatar>
                     
                     <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                       {userData?.nom_usu1} {userData?.ape_usu1}
                     </Typography>
                     
                     <Chip 
                       label={userData?.rol || 'Usuario'} 
                       color={isEstudiante ? "primary" : "secondary"}
                       sx={{ mb: 2, fontWeight: 600 }}
                     />
                   </Box>

                   <Divider sx={{ my: 2 }} />

                   {/* Información compacta */}
                   <Box sx={{ space: 1.5 }}>
                     <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                       <Email sx={{ mr: 1.5, color: 'text.secondary', fontSize: '1.1rem' }} />
                       <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                         {userData?.email}
                       </Typography>
                     </Box>

                     <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                       <Person sx={{ mr: 1.5, color: 'text.secondary', fontSize: '1.1rem' }} />
                       <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                         Cédula: {userData?.ced_usu}
                       </Typography>
                     </Box>

                     {userData?.num_tel_usu && (
                       <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                         <Phone sx={{ mr: 1.5, color: 'text.secondary', fontSize: '1.1rem' }} />
                         <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                           {userData.num_tel_usu}
                         </Typography>
                       </Box>
                     )}

                     {userData?.fec_nac_usu && (
                       <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                         <CalendarToday sx={{ mr: 1.5, color: 'text.secondary', fontSize: '1.1rem' }} />
                         <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                           {new Date(userData.fec_nac_usu).toLocaleDateString('es-ES')}
                         </Typography>
                       </Box>
                     )}

                     {isEstudiante && (
                       <Box sx={{ display: 'flex', alignItems: 'center' }}>
                         <School sx={{ mr: 1.5, color: 'text.secondary', fontSize: '1.1rem' }} />
                         <Box>
                           <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                             {userData?.carrera?.nom_car || 'Carrera asignada'}
                           </Typography>
                           {userData?.carrera?.nom_fac_per && (
                             <Typography variant="caption" color="text.secondary">
                               {userData.carrera.nom_fac_per}
                             </Typography>
                           )}
                         </Box>
                       </Box>
                     )}
                   </Box>
                 </Box>

                 {/* Formulario al lado */}
                 <Box sx={{ flexGrow: 1 }}>
                   <Formik
                     initialValues={initialValues}
                     validationSchema={validationSchema}
                     onSubmit={handleSubmit}
                     enableReinitialize
                   >
                     {({ values, errors, touched, handleChange, handleBlur }) => (
                       <Form>
                         {/* SECCIÓN: Información Editable */}
                         <Box sx={{ mb: 4 }}>
                           <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#1976d2' }}>
                             📝 Información Personal (Editable)
                           </Typography>
                           <Grid container spacing={2}>
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
                                 size="small"
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
                                 size="small"
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
                                 size="small"
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
                                 size="small"
                               />
                             </Grid>

                             {/* Información personal */}
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
                                 error={touched.fec_nac_usu && !!errors.fec_nac_usu}
                                 helperText={touched.fec_nac_usu && errors.fec_nac_usu}
                                 InputLabelProps={{ shrink: true }}
                                 size="small"
                               />
                             </Grid>
                             
                             <Grid item xs={12} sm={6}>
                               <TextField
                                 fullWidth
                                 name="num_tel_usu"
                                 label="Número de Teléfono"
                                 value={values.num_tel_usu}
                                 onChange={handleChange}
                                 onBlur={handleBlur}
                                 disabled={!isEditing}
                                 error={touched.num_tel_usu && !!errors.num_tel_usu}
                                 helperText={touched.num_tel_usu && errors.num_tel_usu}
                                 size="small"
                               />
                             </Grid>


                             {/* GitHub Token para desarrolladores */}
                             {(userData?.rol === 'DESARROLLADOR' || userData?.rol === 'MASTER') && (
                               <Grid item xs={12}>
                                 <TextField
                                   fullWidth
                                   name="github_token"
                                   label="GitHub Personal Access Token"
                                   type="password"
                                   value={values.github_token}
                                   onChange={handleChange}
                                   onBlur={handleBlur}
                                   disabled={!isEditing}
                                   error={touched.github_token && !!errors.github_token}
                                   helperText={
                                     touched.github_token && errors.github_token
                                       ? errors.github_token
                                       : "Token personal para crear branches y PRs en GitHub. Si no se proporciona, se usará el token del sistema."
                                   }
                                   size="small"
                                   placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                 />
                               </Grid>
                             )}

                             {/* Carrera solo para estudiantes */}
                             {isEstudiante && (
                               <Grid item xs={12} sm={6}>
                                 <FormControl fullWidth size="small">
                                   <InputLabel>Carrera</InputLabel>
                                   <Select
                                     name="id_car_per"
                                     value={values.id_car_per}
                                     label="Carrera"
                                     onChange={handleChange}
                                     disabled={!isEditing}
                                     error={touched.id_car_per && !!errors.id_car_per}
                                   >
                                     {carreras.map((carrera) => (
                                       <MenuItem key={carrera.id_car} value={carrera.id_car}>
                                         {carrera.nom_car}
                                       </MenuItem>
                                     ))}
                                   </Select>
                                   {touched.id_car_per && errors.id_car_per && (
                                     <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1 }}>
                                       {errors.id_car_per}
                                     </Typography>
                                   )}
                                 </FormControl>
                               </Grid>
                             )}
                           </Grid>
                         </Box>

                         {/* SECCIÓN: Información del Sistema (No Editable) */}
                         <Box sx={{ 
                           p: 2, 
                           bgcolor: '#f5f5f5', 
                           borderRadius: 2, 
                           border: '1px solid #e0e0e0' 
                         }}>
                           <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#757575' }}>
                             🔒 Información del Sistema (Solo Lectura)
                           </Typography>
                           <Grid container spacing={2}>
                             <Grid item xs={12} sm={6}>
                               <TextField
                                 fullWidth
                                 label="Email"
                                 value={userData?.email || ''}
                                 disabled
                                 helperText="El email no se puede modificar"
                                 size="small"
                                 sx={{
                                   '& .MuiInputBase-root': {
                                     bgcolor: '#fafafa'
                                   }
                                 }}
                               />
                             </Grid>

                             <Grid item xs={12} sm={6}>
                               <TextField
                                 fullWidth
                                 label="Rol"
                                 value={userData?.rol || ''}
                                 disabled
                                 helperText="Definido por el sistema"
                                 size="small"
                                 sx={{
                                   '& .MuiInputBase-root': {
                                     bgcolor: '#fafafa'
                                   }
                                 }}
                               />
                             </Grid>

                             <Grid item xs={12} sm={6}>
                               <TextField
                                 fullWidth
                                 label="Cédula"
                                 value={userData?.ced_usu || ''}
                                 disabled
                                 helperText="Identificador único del usuario"
                                 size="small"
                                 sx={{
                                   '& .MuiInputBase-root': {
                                     bgcolor: '#fafafa'
                                   }
                                 }}
                               />
                             </Grid>

                             <Grid item xs={12} sm={6}>
                               <TextField
                                 fullWidth
                                 label="ID Usuario"
                                 value={userData?.id_usu || ''}
                                 disabled
                                 helperText="Identificador interno del sistema"
                                 size="small"
                                 sx={{
                                   '& .MuiInputBase-root': {
                                     bgcolor: '#fafafa'
                                   }
                                 }}
                               />
                             </Grid>
                           </Grid>
                         </Box>

                         {isEditing && (
                           <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                             <Button
                               type="submit"
                               variant="contained"
                               startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <Save />}
                               disabled={isSubmitting}
                               sx={{ 
                                 bgcolor: '#b91c1c', 
                                 '&:hover': { bgcolor: '#991b1b' },
                                 borderRadius: 2
                               }}
                             >
                               {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                             </Button>
                           </Box>
                         )}
                       </Form>
                                            )}
                     </Formik>
                   </Box>
                 </Box>
               </Paper>
           )}

          {/* TAB 2: Documentos */}
          {tabValue === 1 && (
            <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Gestión de Documentos
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={loadDocumentStatus}
                  disabled={documentLoading}
                  sx={{ textTransform: 'none' }}
                >
                  {documentLoading ? 'Actualizando...' : '🔄 Actualizar Estado'}
                </Button>
              </Box>
              
              {/* Estado de Verificación */}
              {documentStatus && (
                <Alert 
                  severity={documentStatus.documentos_verificados ? "success" : "warning"}
                  sx={{ mb: 3 }}
                >
                  <AlertTitle>
                    {documentStatus.documentos_verificados ? "✅ Documentos Verificados" : "⏳ Documentos Pendientes de Verificación"}
                  </AlertTitle>
                  {documentStatus.documentos_verificados ? (
                    <Typography variant="body2">
                      Tus documentos han sido verificados por un administrador. ¡Ya puedes inscribirte en eventos y cursos!
                      {documentStatus.fecha_verificacion && (
                        <> Verificados el: {new Date(documentStatus.fecha_verificacion).toLocaleDateString()}</>
                      )}
                    </Typography>
                  ) : (
                    <Typography variant="body2">
                      Tus documentos están siendo revisados por un administrador. Una vez verificados, podrás inscribirte en eventos y cursos.
                      {documentStatus.fecha_subida && (
                        <> Subidos el: {documentStatus.fecha_subida ? new Date(documentStatus.fecha_subida).toLocaleDateString() : 'Fecha no disponible'}</>
                      )}
                    </Typography>
                  )}
                </Alert>
              )}
              
              {documentLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {/* Cédula */}
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ borderRadius: 2 }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Description sx={{ mr: 1 }} />
                          Cédula de Identidad
                        </Typography>
                        
                        {documentStatus?.cedula_subida ? (
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <CheckCircle sx={{ color: 'success.main', mr: 1 }} />
                              <Typography variant="body2" color="success.main">
                                Documento subido
                              </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              Subido: {documentStatus.fecha_subida ? new Date(documentStatus.fecha_subida).toLocaleDateString() : 'Fecha no disponible'}
                            </Typography>
                          </Box>
                        ) : (
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              Documento requerido
                            </Typography>
                            <input
                              accept="application/pdf"
                              style={{ display: 'none' }}
                              id="cedula_pdf_input"
                              type="file"
                              onChange={(e) => handleFileSelect(e, 'cedula_pdf')}
                            />
                            <label htmlFor="cedula_pdf_input">
                              <Button variant="outlined" component="span" size="small">
                                Seleccionar PDF
                              </Button>
                            </label>
                            {files.cedula_pdf && (
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="caption">
                                  {files.cedula_pdf.name} ({formatFileSize(files.cedula_pdf.size)})
                                </Typography>
                                <IconButton size="small" onClick={() => removeFile('cedula_pdf')}>
                                  <Delete />
                                </IconButton>
                              </Box>
                            )}
                          </Box>
                        )}
                      </CardContent>
                      
                      {documentStatus?.cedula_subida && (
                        <CardActions>
                          <Button 
                            size="small" 
                            color="error" 
                            onClick={() => deleteDocument('cedula')}
                            disabled={deleting || documentStatus?.documentos_verificados}
                            sx={{ 
                              display: documentStatus?.documentos_verificados ? 'none' : 'inline-flex'
                            }}
                          >
                            Eliminar
                          </Button>
                        </CardActions>
                      )}
                    </Card>
                  </Grid>

                  {/* Matrícula (solo para estudiantes) */}
                  {isEstudiante && (
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined" sx={{ borderRadius: 2 }}>
                        <CardContent>
                          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <School sx={{ mr: 1 }} />
                            Matrícula Estudiantil
                          </Typography>
                          
                          {documentStatus?.matricula_subida ? (
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <CheckCircle sx={{ color: 'success.main', mr: 1 }} />
                                <Typography variant="body2" color="success.main">
                                  Documento subido
                                </Typography>
                              </Box>
                              <Typography variant="caption" color="text.secondary">
                                Subido: {documentStatus.fecha_subida ? new Date(documentStatus.fecha_subida).toLocaleDateString() : 'Fecha no disponible'}
                              </Typography>
                            </Box>
                          ) : (
                            <Box>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Documento requerido para estudiantes
                              </Typography>
                              <input
                                accept="application/pdf"
                                style={{ display: 'none' }}
                                id="matricula_pdf_input"
                                type="file"
                                onChange={(e) => handleFileSelect(e, 'matricula_pdf')}
                              />
                              <label htmlFor="matricula_pdf_input">
                                <Button variant="outlined" component="span" size="small">
                                  Seleccionar PDF
                                </Button>
                              </label>
                              {files.matricula_pdf && (
                                <Box sx={{ mt: 1 }}>
                                  <Typography variant="caption">
                                    {files.matricula_pdf.name} ({formatFileSize(files.matricula_pdf.size)})
                                  </Typography>
                                  <IconButton size="small" onClick={() => removeFile('matricula_pdf')}>
                                    <Delete />
                                  </IconButton>
                                </Box>
                              )}
                            </Box>
                          )}
                        </CardContent>
                        
                        {documentStatus?.matricula_subida && (
                          <CardActions>
                            <Button 
                              size="small" 
                              color="error" 
                              onClick={() => deleteDocument('matricula')}
                              disabled={deleting || documentStatus?.documentos_verificados}
                              sx={{ 
                                display: documentStatus?.documentos_verificados ? 'none' : 'inline-flex'
                              }}
                            >
                              Eliminar
                            </Button>
                          </CardActions>
                        )}
                      </Card>
                    </Grid>
                  )}

                  {/* Botón de subida */}
                  {(files.cedula_pdf || files.matricula_pdf) && (
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Button
                          variant="contained"
                          startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : <UploadFile />}
                          onClick={uploadDocuments}
                          disabled={uploading}
                          sx={{ 
                            bgcolor: '#b91c1c', 
                            '&:hover': { bgcolor: '#991b1b' },
                            borderRadius: 2
                          }}
                        >
                          {uploading ? 'Subiendo...' : 'Subir Documentos'}
                        </Button>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              )}
            </Paper>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default UserProfile;