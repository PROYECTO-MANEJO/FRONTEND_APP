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
  Chip
} from '@mui/material';
import { 
  InfoOutlined, 
  Close,
  School
} from '@mui/icons-material';

const CursoCard = ({ curso }) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      {/* ✅ CARD IDÉNTICA A EVENTO */}
      <Card 
        elevation={2}
        sx={{ 
          borderRadius: 3,
          transition: 'all 0.2s ease-in-out',
          height: '300px', // ALTURA ABSOLUTA FIJA - IGUAL QUE EVENTOS
          minHeight: '300px', // ALTURA MÍNIMA
          maxHeight: '300px', // ALTURA MÁXIMA
          display: 'flex',
          width: '450px',
          flexDirection: 'column',
          position: 'relative',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4,
          },
        }}
      >
        <CardContent sx={{ 
          p: 2.5, // MISMO PADDING QUE EVENTOS
          display: 'flex', 
          flexDirection: 'column',
          height: '100%',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Chip de CURSO - IGUAL QUE EVENTOS */}
          <Chip 
            label="CURSO" 
            size="small" 
            icon={<School sx={{ fontSize: '0.7rem' }} />}
            sx={{ 
              bgcolor: '#b91c1c', // MISMO COLOR QUE EVENTOS
              color: 'white',
              fontWeight: 600,
              fontSize: '0.7rem',
              height: '20px',
              mb: 1,
              alignSelf: 'flex-start'
            }} 
          />

          {/* Título - ALTURA CONTROLADA IGUAL QUE EVENTOS */}
          <Typography 
            variant="h6" 
            component="h3"
            sx={{ 
              fontWeight: 600, 
              color: 'text.primary',
              fontSize: '1rem', // MISMO TAMAÑO QUE EVENTOS
              lineHeight: 1.2,
              mb: 1,
              height: '2.4rem', // ALTURA FIJA IGUAL QUE EVENTOS
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {curso.nom_cur}
          </Typography>
          
          {/* Descripción - ALTURA CONTROLADA IGUAL QUE EVENTOS */}
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              fontSize: '0.825rem', // MISMO TAMAÑO QUE EVENTOS
              lineHeight: 1.3,
              mb: 1.5,
              height: '3.9rem', // ALTURA FIJA IGUAL QUE EVENTOS
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {curso.des_cur}
          </Typography>

          {/* Información compacta - IGUAL QUE EVENTOS */}
          <Box sx={{ mb: 'auto' }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.3 }}>
              <strong>Fecha:</strong> {new Date(curso.fec_ini_cur).toLocaleDateString()}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              <strong>Duración:</strong> {curso.dur_cur} horas
            </Typography>
          </Box>

          {/* Botón en el fondo - IDÉNTICO A EVENTOS */}
          <Button
            variant="outlined"
            fullWidth
            size="small"
            startIcon={<InfoOutlined sx={{ fontSize: '0.9rem' }} />}
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
              fontSize: '0.8rem',
              height: '32px',
              mt: 'auto'
            }}
          >
            Ver Detalles
          </Button>
        </CardContent>
      </Card>

      {/* ✅ DIALOG MEJORADO IGUAL QUE EVENTOS */}
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="span">
            {curso.nom_cur}
          </Typography>
          <Button
            onClick={handleClose}
            color="inherit"
            size="small"
            sx={{ minWidth: 'auto', p: 1 }}
          >
            <Close />
          </Button>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                Descripción
              </Typography>
              <Typography variant="body2">
                {curso.des_cur}
              </Typography>
            </Box>
            
            <Divider />
            
            {/* Chips como en eventos */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip label={`Duración: ${curso.dur_cur} horas`} color="primary" variant="outlined" />
              {curso.tipo_audiencia_cur && (
                <Chip label={`Audiencia: ${curso.tipo_audiencia_cur.replace('_', ' ')}`} color="secondary" variant="outlined" />
              )}
            </Box>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Fecha de Inicio
                </Typography>
                <Typography variant="body2">
                  {new Date(curso.fec_ini_cur).toLocaleDateString()}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Fecha de Fin
                </Typography>
                <Typography variant="body2">
                  {curso.fec_fin_cur ? new Date(curso.fec_fin_cur).toLocaleDateString() : 'No especificada'}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Duración Total
                </Typography>
                <Typography variant="body2">
                  {curso.dur_cur} horas
                </Typography>
              </Box>
              
              {curso.capacidad_max_cur && (
                <Box>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Capacidad Máxima
                  </Typography>
                  <Typography variant="body2">
                    {curso.capacidad_max_cur} estudiantes
                  </Typography>
                </Box>
              )}
            </Box>
            
            {curso.tipo_audiencia_cur && (
              <Box>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Tipo de Audiencia
                </Typography>
                <Typography variant="body2">
                  {curso.tipo_audiencia_cur.replace('_', ' ')}
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleClose} 
            variant="contained" 
            fullWidth
            sx={{ borderRadius: 2 }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CursoCard;
