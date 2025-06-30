import React from 'react';
import {
  Box,
  Container,
  Typography,
  useTheme,
  alpha
} from '@mui/material';
import utaImage from '../assets/images/uta1.jpg';

const AuthenticatedHomePage = () => {
  const theme = useTheme();

  const contentSections = [
    {
      title: 'Cursos Especializados',
      description: 'En FISEI ofrecemos una amplia variedad de cursos técnicos y académicos diseñados específicamente para potenciar tu desarrollo profesional. Nuestros programas están actualizados con las últimas tendencias tecnológicas y metodologías de enseñanza, garantizando una formación de calidad que te prepare para los desafíos del mundo laboral moderno.',
      imagePosition: 'left',
      imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
    },
    {
      title: 'Eventos Académicos',
      description: 'Participa en conferencias, seminarios y talleres que enriquecerán tu experiencia universitaria. Organizamos eventos con expertos de la industria, investigadores reconocidos y profesionales destacados que compartirán sus conocimientos y experiencias contigo, creando oportunidades únicas de networking y aprendizaje.',
      imagePosition: 'right',
      imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
    },
    {
      title: 'Certificaciones Oficiales',
      description: 'Obtén certificados oficiales que validen tus conocimientos y habilidades adquiridas durante tu formación. Nuestras certificaciones están reconocidas por la industria y te brindarán una ventaja competitiva en el mercado laboral, demostrando tu competencia y compromiso con la excelencia académica.',
      imagePosition: 'left',
      imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
    },
    {
      title: 'Comunidad Académica',
      description: 'Forma parte de una comunidad universitaria comprometida con la excelencia educativa y la innovación. En FISEI, fomentamos un ambiente colaborativo donde estudiantes, docentes e investigadores trabajamos juntos para crear soluciones innovadoras y contribuir al desarrollo tecnológico del país.',
      imagePosition: 'right',
      imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
    }
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
        py: 0
      }}
    >
      {/* Hero Section - SIN botón de login */}
      <Box
        sx={{
          background: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${utaImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          minHeight: '50vh', // Reducido ya que no hay botón
          display: 'flex',
          alignItems: 'center',
          color: 'white',
          textAlign: 'center'
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 'bold',
              mb: 2,
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              fontSize: { xs: '2.5rem', md: '3.5rem' }
            }}
          >
            FISEI - SIGEC
          </Typography>
          <Typography
            variant="h5"
            sx={{
              mb: 4,
              opacity: 0.9,
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
              fontSize: { xs: '1.2rem', md: '1.5rem' }
            }}
          >
            Sistema Integral de Gestión de Eventos y Cursos
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mb: 0, // Sin margin bottom ya que no hay botón
              opacity: 0.8,
              maxWidth: '800px',
              mx: 'auto',
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
            }}
          >
            Facultad de Ingeniería en Sistemas, Electrónica e Industrial - Universidad Técnica de Ambato
          </Typography>
        </Container>
      </Box>

      {/* Content Sections */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          component="h2"
          sx={{
            textAlign: 'center',
            mb: 2,
            fontWeight: 'bold',
            color: theme.palette.primary.main
          }}
        >
          ¿Qué Ofrecemos?
        </Typography>
        <Typography
          variant="h6"
          sx={{
            textAlign: 'center',
            mb: 6,
            color: theme.palette.text.secondary,
            maxWidth: '600px',
            mx: 'auto'
          }}
        >
          Descubre todas las oportunidades de crecimiento académico y profesional que tenemos para ti
        </Typography>

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
              <img
                src={section.imageUrl}
                alt={section.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
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
              <Typography
                variant="h4"
                component="h3"
                sx={{
                  mb: 3,
                  fontWeight: 'bold',
                  color: theme.palette.primary.main,
                  fontSize: { xs: '1.8rem', md: '2.125rem' }
                }}
              >
                {section.title}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  lineHeight: 1.8,
                  textAlign: 'justify',
                  color: theme.palette.text.primary,
                  fontSize: '1rem'
                }}
              >
                {section.description}
              </Typography>
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
          <Typography variant="body1" sx={{ mb: 1 }}>
            Facultad de Ingeniería en Sistemas, Electrónica e Industrial
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            Universidad Técnica de Ambato - Campus Huachi
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.7, mt: 2 }}>
            © 2024 FISEI-UTA. Todos los derechos reservados.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default AuthenticatedHomePage; 