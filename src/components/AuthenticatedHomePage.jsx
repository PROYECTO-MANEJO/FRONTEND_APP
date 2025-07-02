import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Container,
  Typography,
  useTheme,
  alpha,
  Button,
  TextField,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Card,
  CardMedia,
  Input,
  Tooltip
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  PhotoCamera,
  DeleteForever
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import paginaPrincipalService from '../services/paginaPrincipalService';
import utaImage from '../assets/images/uta1.jpg';
import CarreraEventosCursos from './CarreraEventosCursos';

const AuthenticatedHomePage = () => {
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Estado para el contenido editable
  const [contenido, setContenido] = useState({
    titulo_hero: 'FISEI - SIGEC',
    subtitulo_hero: 'Sistema Integral de Gestión de Eventos y Cursos',
    descripcion_hero: 'Facultad de Ingeniería en Sistemas, Electrónica e Industrial - Universidad Técnica de Ambato',
    titulo_ofrecemos: '¿Qué Ofrecemos?',
    subtitulo_ofrecemos: 'Descubre todas las oportunidades de crecimiento académico y profesional que tenemos para ti',
    titulo_seccion1: 'Cursos Especializados',
    descripcion_seccion1: 'En FISEI ofrecemos una amplia variedad de cursos técnicos y académicos diseñados específicamente para potenciar tu desarrollo profesional.',
    titulo_seccion2: 'Eventos Académicos',
    descripcion_seccion2: 'Participa en conferencias, seminarios y talleres que enriquecerán tu experiencia universitaria.',
    titulo_seccion3: 'Certificaciones Oficiales',
    descripcion_seccion3: 'Obtén certificados oficiales que validen tus conocimientos y habilidades adquiridas durante tu formación.',
    titulo_seccion4: 'Comunidad Académica',
    descripcion_seccion4: 'Forma parte de una comunidad universitaria comprometida con la excelencia educativa y la innovación.',
    texto_footer1: 'Facultad de Ingeniería en Sistemas, Electrónica e Industrial',
    texto_footer2: 'Universidad Técnica de Ambato - Campus Huachi',
    texto_footer3: '© 2024 FISEI-UTA. Todos los derechos reservados.'
  });

  // Estado para las imágenes
  const [imagenes, setImagenes] = useState({
    imagen_hero: utaImage,
    imagen_seccion1: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    imagen_seccion2: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    imagen_seccion3: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    imagen_seccion4: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  });

  const [imagenesArchivos, setImagenesArchivos] = useState({});

  // Es usuario MASTER?
  const isMaster = user?.rol === 'MASTER';

  // Cargar contenido al montar el componente
  useEffect(() => {
    cargarContenido();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Limpiar URLs de objeto al desmontar el componente
  useEffect(() => {
    return () => {
      // Limpiar URLs de vista previa cuando el componente se desmonte
      Object.values(imagenes).forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [imagenes]);

  const cargarContenido = async () => {
    try {
      setLoading(true);
      const response = await paginaPrincipalService.obtenerContenido();
      
      if (response.success && response.data) {
        const data = response.data;
        
        // Actualizar contenido de texto
        setContenido({
          titulo_hero: data.titulo_hero || 'FISEI - SIGEC',
          subtitulo_hero: data.subtitulo_hero || 'Sistema Integral de Gestión de Eventos y Cursos',
          descripcion_hero: data.descripcion_hero || 'Facultad de Ingeniería en Sistemas, Electrónica e Industrial - Universidad Técnica de Ambato',
          titulo_ofrecemos: data.titulo_ofrecemos || '¿Qué Ofrecemos?',
          subtitulo_ofrecemos: data.subtitulo_ofrecemos || 'Descubre todas las oportunidades de crecimiento académico y profesional que tenemos para ti',
          titulo_seccion1: data.titulo_seccion1 || 'Cursos Especializados',
          descripcion_seccion1: data.descripcion_seccion1 || 'En FISEI ofrecemos una amplia variedad de cursos técnicos y académicos diseñados específicamente para potenciar tu desarrollo profesional.',
          titulo_seccion2: data.titulo_seccion2 || 'Eventos Académicos',
          descripcion_seccion2: data.descripcion_seccion2 || 'Participa en conferencias, seminarios y talleres que enriquecerán tu experiencia universitaria.',
          titulo_seccion3: data.titulo_seccion3 || 'Certificaciones Oficiales',
          descripcion_seccion3: data.descripcion_seccion3 || 'Obtén certificados oficiales que validen tus conocimientos y habilidades adquiridas durante tu formación.',
          titulo_seccion4: data.titulo_seccion4 || 'Comunidad Académica',
          descripcion_seccion4: data.descripcion_seccion4 || 'Forma parte de una comunidad universitaria comprometida con la excelencia educativa y la innovación.',
          texto_footer1: data.texto_footer1 || 'Facultad de Ingeniería en Sistemas, Electrónica e Industrial',
          texto_footer2: data.texto_footer2 || 'Universidad Técnica de Ambato - Campus Huachi',
          texto_footer3: data.texto_footer3 || '© 2024 FISEI-UTA. Todos los derechos reservados.'
        });

        // Actualizar imágenes - convertir URLs del servidor a URLs completas
        setImagenes(prev => ({
          imagen_hero: data.imagen_hero ? paginaPrincipalService.getFullImageUrl(data.imagen_hero) : prev.imagen_hero,
          imagen_seccion1: data.imagen_seccion1 ? paginaPrincipalService.getFullImageUrl(data.imagen_seccion1) : prev.imagen_seccion1,
          imagen_seccion2: data.imagen_seccion2 ? paginaPrincipalService.getFullImageUrl(data.imagen_seccion2) : prev.imagen_seccion2,
          imagen_seccion3: data.imagen_seccion3 ? paginaPrincipalService.getFullImageUrl(data.imagen_seccion3) : prev.imagen_seccion3,
          imagen_seccion4: data.imagen_seccion4 ? paginaPrincipalService.getFullImageUrl(data.imagen_seccion4) : prev.imagen_seccion4
        }));
      }
    } catch (error) {
      console.error('Error al cargar contenido:', error);
      setSnackbar({
        open: true,
        message: 'Error al cargar el contenido de la página',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Funciones para manejar la edición
  const handleInputChange = (field, value) => {
    setContenido(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = async (tipoImagen, file) => {
    if (file && file.type.startsWith('image/')) {
      // Vista previa inmediata usando URL.createObjectURL (más eficiente)
      const previewUrl = URL.createObjectURL(file);
      setImagenes(prev => ({
        ...prev,
        [tipoImagen]: previewUrl
      }));

      // Guardar archivo para envío
      setImagenesArchivos(prev => ({
        ...prev,
        [tipoImagen]: file
      }));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Guardar contenido de texto
      await paginaPrincipalService.actualizarContenido(contenido);

      // Subir imágenes nuevas
      for (const [tipoImagen, archivo] of Object.entries(imagenesArchivos)) {
        if (archivo) {
          await paginaPrincipalService.subirImagen(tipoImagen, archivo);
          
          // Actualizar la URL de la imagen inmediatamente
          const nuevaUrl = paginaPrincipalService.getFullImageUrl(`/api/pagina-principal/imagen/${tipoImagen}?t=${Date.now()}`);
          setImagenes(prev => ({
            ...prev,
            [tipoImagen]: nuevaUrl
          }));
        }
      }

      setSnackbar({
        open: true,
        message: 'Contenido guardado exitosamente',
        severity: 'success'
      });
      
      setIsEditing(false);
      setImagenesArchivos({});
      
      // Recargar contenido
      await cargarContenido();
    } catch (error) {
      console.error('Error al guardar:', error);
      setSnackbar({
        open: true,
        message: 'Error al guardar el contenido',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    // Limpiar URLs de objeto creadas para vista previa
    Object.values(imagenesArchivos).forEach(file => {
      if (file && typeof file === 'object') {
        // Si hay una URL de vista previa, revocarla
        const currentUrl = imagenes[Object.keys(imagenesArchivos).find(key => imagenesArchivos[key] === file)];
        if (currentUrl && currentUrl.startsWith('blob:')) {
          URL.revokeObjectURL(currentUrl);
        }
      }
    });
    
    setIsEditing(false);
    setImagenesArchivos({});
    await cargarContenido(); // Recargar contenido original
  };

  // Componente para campo editable
  const EditableField = ({ value, onChange, multiline = false, placeholder, typographyProps = {} }) => {
    if (!isEditing) {
      return (
        <Typography {...typographyProps}>
          {value}
        </Typography>
      );
    }

    return (
      <TextField
        value={value || ''}
        onChange={onChange}
        multiline={multiline}
        rows={multiline ? 3 : 1}
        placeholder={placeholder}
        variant="outlined"
        fullWidth
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            color: typographyProps.sx?.color || 'inherit',
          },
          '& .MuiInputBase-input': {
            fontSize: typographyProps.sx?.fontSize || 'inherit',
            fontWeight: typographyProps.sx?.fontWeight || 'inherit',
            textAlign: typographyProps.sx?.textAlign || 'inherit',
          },
          mb: typographyProps.sx?.mb || 0,
          mt: typographyProps.sx?.mt || 0,
        }}
      />
    );
  };

  // Componente para imagen editable
  const EditableImage = ({ src, alt, tipoImagen }) => {
    if (!isEditing) {
      return (
        <img
          src={src}
          alt={alt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      );
    }

    return (
      <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
        <img
          src={src}
          alt={alt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.7)'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1
          }}
        >
          <Input
            type="file"
            accept="image/*"
            id={`upload-${tipoImagen}`}
            sx={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                handleImageChange(tipoImagen, file);
              }
            }}
          />
          <label htmlFor={`upload-${tipoImagen}`}>
            <Tooltip title="Cambiar imagen">
              <IconButton
                component="span"
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                  }
                }}
              >
                <PhotoCamera />
              </IconButton>
            </Tooltip>
          </label>
        </Box>
      </Box>
    );
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  const contentSections = [
    {
      titulo: contenido.titulo_seccion1,
      descripcion: contenido.descripcion_seccion1,
      imagen: imagenes.imagen_seccion1,
      tipoImagen: 'imagen_seccion1',
      imagePosition: 'left'
    },
    {
      titulo: contenido.titulo_seccion2,
      descripcion: contenido.descripcion_seccion2,
      imagen: imagenes.imagen_seccion2,
      tipoImagen: 'imagen_seccion2',
      imagePosition: 'right'
    },
    {
      titulo: contenido.titulo_seccion3,
      descripcion: contenido.descripcion_seccion3,
      imagen: imagenes.imagen_seccion3,
      tipoImagen: 'imagen_seccion3',
      imagePosition: 'left'
    },
    {
      titulo: contenido.titulo_seccion4,
      descripcion: contenido.descripcion_seccion4,
      imagen: imagenes.imagen_seccion4,
      tipoImagen: 'imagen_seccion4',
      imagePosition: 'right'
    }
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
        py: 0,
        position: 'relative'
      }}
    >
      {/* Botones de edición para MASTER */}
      {isMaster && (
        <Box
          sx={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 1000,
            display: 'flex',
            gap: 1
          }}
        >
          {!isEditing ? (
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={() => setIsEditing(true)}
              sx={{
                backgroundColor: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                }
              }}
            >
              Editar Página
            </Button>
          ) : (
            <>
              <Button
                variant="contained"
                startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save />}
                onClick={handleSave}
                disabled={saving}
                sx={{
                  backgroundColor: theme.palette.success.main,
                  '&:hover': {
                    backgroundColor: theme.palette.success.dark,
                  }
                }}
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={handleCancel}
                disabled={saving}
              >
                Cancelar
              </Button>
            </>
          )}
        </Box>
      )}

      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${imagenes.imagen_hero})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          minHeight: '50vh',
          display: 'flex',
          alignItems: 'center',
          color: 'white',
          textAlign: 'center',
          position: 'relative'
        }}
      >
        {isEditing && (
          <Box
            sx={{
              position: 'absolute',
              top: 20,
              left: 20,
              zIndex: 1
            }}
          >
            <Input
              type="file"
              accept="image/*"
              id="upload-hero"
              sx={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  handleImageChange('imagen_hero', file);
                }
              }}
            />
            <label htmlFor="upload-hero">
              <Tooltip title="Cambiar imagen de fondo">
                <IconButton
                  component="span"
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 1)',
                    }
                  }}
                >
                  <PhotoCamera />
                </IconButton>
              </Tooltip>
            </label>
          </Box>
        )}
        
        <Container maxWidth="lg">
          <EditableField
            value={contenido.titulo_hero}
            onChange={(e) => handleInputChange('titulo_hero', e.target.value)}
            placeholder="Título principal"
            typographyProps={{
              variant: 'h2',
              component: 'h1',
              sx: {
                fontWeight: 'bold',
                mb: 2,
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                color: 'white'
              }
            }}
          />
          <EditableField
            value={contenido.subtitulo_hero}
            onChange={(e) => handleInputChange('subtitulo_hero', e.target.value)}
            placeholder="Subtítulo"
            typographyProps={{
              variant: 'h5',
              sx: {
                mb: 4,
                opacity: 0.9,
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                fontSize: { xs: '1.2rem', md: '1.5rem' },
                color: 'white'
              }
            }}
          />
          <EditableField
            value={contenido.descripcion_hero}
            onChange={(e) => handleInputChange('descripcion_hero', e.target.value)}
            placeholder="Descripción"
            typographyProps={{
              variant: 'h6',
              sx: {
                mb: 0,
                opacity: 0.8,
                maxWidth: '800px',
                mx: 'auto',
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                color: 'white'
              }
            }}
          />
        </Container>
      </Box>

      {/* Eventos y Cursos filtrados por carrera */}
      <CarreraEventosCursos />

      {/* Content Sections */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <EditableField
          value={contenido.titulo_ofrecemos}
          onChange={(e) => handleInputChange('titulo_ofrecemos', e.target.value)}
          placeholder="Título de sección"
          typographyProps={{
            variant: 'h3',
            component: 'h2',
            sx: {
              textAlign: 'center',
              mb: 2,
              fontWeight: 'bold',
              color: theme.palette.primary.main
            }
          }}
        />
        <EditableField
          value={contenido.subtitulo_ofrecemos}
          onChange={(e) => handleInputChange('subtitulo_ofrecemos', e.target.value)}
          placeholder="Subtítulo de sección"
          typographyProps={{
            variant: 'h6',
            sx: {
              textAlign: 'center',
              mb: 6,
              color: theme.palette.text.secondary,
              maxWidth: '600px',
              mx: 'auto'
            }
          }}
        />

        {contentSections.map((section, index) => (
          <Box 
            key={index} 
            sx={{ 
              mb: 6,
              display: 'flex',
              flexDirection: section.imagePosition === 'left' ? 'row' : 'row-reverse',
              alignItems: 'center',
              gap: 4,
              width: '100%',
              '@media (max-width: 900px)': {
                flexDirection: 'column',
                gap: 3
              }
            }}
          >
            {/* Imagen */}
            <Box
              sx={{
                flex: '0 0 400px',
                height: 300,
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: theme.shadows[4],
                '@media (max-width: 900px)': {
                  flex: '1 1 auto',
                  width: '100%'
                }
              }}
            >
              <EditableImage
                src={section.imagen}
                alt={section.titulo}
                tipoImagen={section.tipoImagen}
              />
            </Box>

            {/* Contenido de texto */}
            <Box 
              sx={{ 
                flex: '1 1 auto',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                minHeight: 300,
                px: 2
              }}
            >
              <EditableField
                value={section.titulo}
                onChange={(e) => handleInputChange(`titulo_seccion${index + 1}`, e.target.value)}
                placeholder="Título de sección"
                typographyProps={{
                  variant: 'h4',
                  component: 'h3',
                  sx: {
                    mb: 3,
                    fontWeight: 'bold',
                    color: theme.palette.primary.main,
                    fontSize: { xs: '1.8rem', md: '2.125rem' }
                  }
                }}
              />
              <EditableField
                value={section.descripcion}
                onChange={(e) => handleInputChange(`descripcion_seccion${index + 1}`, e.target.value)}
                multiline
                placeholder="Descripción de la sección"
                typographyProps={{
                  variant: 'body1',
                  sx: {
                    lineHeight: 1.8,
                    textAlign: 'justify',
                    color: theme.palette.text.primary,
                    fontSize: '1rem'
                  }
                }}
              />
            </Box>
          </Box>
        ))}
      </Container>

      {/* Footer */}
      <Box
        sx={{
          background: theme.palette.grey[900],
          color: 'white',
          py: 4,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="lg">
          <EditableField
            value={contenido.texto_footer1}
            onChange={(e) => handleInputChange('texto_footer1', e.target.value)}
            placeholder="Texto del footer 1"
            typographyProps={{
              variant: 'body1',
              sx: {
                mb: 1,
                color: 'white'
              }
            }}
          />
          <EditableField
            value={contenido.texto_footer2}
            onChange={(e) => handleInputChange('texto_footer2', e.target.value)}
            placeholder="Texto del footer 2"
            typographyProps={{
              variant: 'body2',
              sx: {
                opacity: 0.7,
                color: 'white'
              }
            }}
          />
          <EditableField
            value={contenido.texto_footer3}
            onChange={(e) => handleInputChange('texto_footer3', e.target.value)}
            placeholder="Texto del footer 3"
            typographyProps={{
              variant: 'body2',
              sx: {
                opacity: 0.7,
                mt: 2,
                color: 'white'
              }
            }}
          />
        </Container>
      </Box>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AuthenticatedHomePage; 