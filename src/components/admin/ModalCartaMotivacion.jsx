import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Avatar,
  Divider,
  IconButton
} from '@mui/material';
import {
  Close,
  Assignment,
  Person,
  Email,
  School
} from '@mui/icons-material';

const ModalCartaMotivacion = ({ open, onClose, carta, usuario }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, maxHeight: '90vh' }
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: '#6d1313',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pr: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Assignment sx={{ mr: 1 }} />
          Carta de Motivación
        </Box>
        <IconButton
          onClick={onClose}
          sx={{ color: 'white' }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Información del usuario */}
        {usuario && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <Person sx={{ mr: 1 }} />
              Información del Usuario
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: '#6d1313', mr: 2 }}>
                {usuario.nombre_completo?.charAt(0) || 'U'}
              </Avatar>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {usuario.nombre_completo || 'Usuario sin nombre'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Cédula: {usuario.cedula || 'No disponible'}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Email sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2">
                {usuario.email || 'Email no disponible'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <School sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2">
                {usuario.carrera || 'Carrera no especificada'}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />
          </Box>
        )}

        {/* Carta de motivación */}
        <Box>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <Assignment sx={{ mr: 1 }} />
            Carta de Motivación
          </Typography>
          
          {carta ? (
            <Box
              sx={{
                bgcolor: '#f8f9fa',
                border: '1px solid #e9ecef',
                borderRadius: 2,
                p: 3,
                minHeight: 200,
                maxHeight: 400,
                overflow: 'auto'
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.6,
                  fontSize: '1rem'
                }}
              >
                {carta}
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                bgcolor: '#f8f9fa',
                border: '1px dashed #dee2e6',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                minHeight: 200,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Assignment sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                Sin carta de motivación
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Este usuario no ha enviado una carta de motivación para esta inscripción.
              </Typography>
            </Box>
          )}
        </Box>

        {/* Información adicional */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="caption" color="text.secondary">
            * Esta carta fue enviada por el usuario al momento de realizar su inscripción.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, bgcolor: '#f5f5f5' }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            bgcolor: '#6d1313',
            '&:hover': { bgcolor: '#8b1a1a' }
          }}
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalCartaMotivacion;