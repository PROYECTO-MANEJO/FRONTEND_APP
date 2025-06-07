import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Chip,
  IconButton
} from '@mui/material';
import { 
  InfoOutlined, 
  Close, 
  CalendarToday, 
  AccessTime, 
  People,
  School
} from '@mui/icons-material';

const CursoCard = ({ curso }) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      {/* ✅ CARD CON MISMAS PROPORCIONES QUE EVENTOS */}
      <Card 
        elevation={2}
        sx={{ 
          borderRadius: 3,
          transition: 'all 0.2s ease-in-out',
          height: '100%',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4,
          },
        }}
      >
        <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Chip de CURSO en la parte superior */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
            <Chip 
              label="CURSO" 
              size="small" 
              icon={<School sx={{ fontSize: '0.8rem' }} />}
              sx={{ 
                bgcolor: '#b91c1c', 
                color: 'white',
                fontWeight: 600,
                fontSize: '0.75rem',
                height: '24px'
              }} 
            />
          </Box>

          {/* Título del curso */}
          <Typography 
            variant="h6" 
            component="h3"
            sx={{ 
              fontWeight: 600, 
              mb: 1,
              color: 'text.primary',
              fontSize: '1.1rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '2.2rem'
            }}
          >
            {curso.nom_cur}
          </Typography>
          
          {/* Descripción resumida */}
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              flexGrow: 1,
              mb: 2, 
              lineHeight: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {curso.des_cur}
          </Typography>

          {/* Información compacta */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              <strong>Fecha:</strong> {new Date(curso.fec_ini_cur).toLocaleDateString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Duración:</strong> {curso.dur_cur} horas | <strong>Audiencia:</strong> {curso.tipo_audiencia_cur?.replace('_', ' ') || 'General'}
            </Typography>
          </Box>

          {/* Botón Ver Detalles */}
          <Button
            variant="outlined"
            fullWidth
            startIcon={<InfoOutlined />}
            onClick={handleOpen}
            sx={{
              borderColor: '#b91c1c',
              color: '#b91c1c',
              '&:hover': {
                borderColor: '#991b1b',
                backgroundColor: '#fef2f2',
              },
              textTransform: 'none',
              fontWeight: 500,
              mt: 'auto'
            }}
          >
            Ver Detalles
          </Button>
        </CardContent>
      </Card>

      {/* ✅ DIALOG COMPLETAMENTE REDISEÑADO */}
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: 4,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)',
            color: 'white',
            position: 'relative',
            p: 3
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <School sx={{ fontSize: '1.5rem' }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h5" component="div" sx={{ fontWeight: 700 }}>
                {curso.nom_cur}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                Información detallada del curso
              </Typography>
            </Box>
            <IconButton
              onClick={handleClose}
              sx={{ 
                color: 'white',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
              }}
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 4 }}>
            {/* Descripción */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#b91c1c' }}>
                📋 Descripción del Curso
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.7, color: 'text.secondary' }}>
                {curso.des_cur}
              </Typography>
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            {/* Información en grid */}
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#b91c1c' }}>
              📊 Información General
            </Typography>
            
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, 
              gap: 3,
              mb: 3
            }}>
              <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#374151', mb: 1 }}>
                  📅 Fecha de Inicio
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {new Date(curso.fec_ini_cur).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Typography>
              </Box>
              
              <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#374151', mb: 1 }}>
                  📅 Fecha de Fin
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {new Date(curso.fec_fin_cur).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Typography>
              </Box>
              
              <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#374151', mb: 1 }}>
                  ⏱️ Duración Total
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {curso.dur_cur} horas académicas
                </Typography>
              </Box>

              <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#374151', mb: 1 }}>
                  👥 Audiencia Objetivo
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {curso.tipo_audiencia_cur?.replace('_', ' ') || 'Audiencia General'}
                </Typography>
              </Box>
            </Box>

            {/* Capacidad si está disponible */}
            {curso.capacidad_max_cur && (
              <Box sx={{ p: 3, bgcolor: '#fef2f2', borderRadius: 2, border: '1px solid #fecaca' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#b91c1c', mb: 1 }}>
                  👨‍🎓 Capacidad Máxima
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, color: '#991b1b' }}>
                  {curso.capacidad_max_cur} estudiantes
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, bgcolor: '#f8fafc' }}>
          <Button 
            onClick={handleClose} 
            variant="contained"
            fullWidth
            sx={{
              background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)',
              py: 1.5,
              borderRadius: 3,
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(135deg, #991b1b 0%, #b91c1c 100%)',
              }
            }}
          >
            Cerrar Información
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CursoCard;
