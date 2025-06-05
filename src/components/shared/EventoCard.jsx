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
import { InfoOutlined, Close } from '@mui/icons-material';

const EventoCard = ({ evento }) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Card sx={{ mb: 2, height: '100%' }}>
        <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" gutterBottom>{evento.nom_eve}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1, mb: 2 }}>
            {evento.des_eve}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Fecha: {new Date(evento.fec_ini_eve).toLocaleDateString()}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Área: {evento.are_eve} | Audiencia: {evento.tipo_audiencia_eve}
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<InfoOutlined />}
              fullWidth
              onClick={handleOpen}
              sx={{
                textTransform: 'none',
                fontWeight: 500,
              }}
            >
              Ver Detalles
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Ventana de detalles */}
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="span">
            {evento.nom_eve}
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
                {evento.des_eve}
              </Typography>
            </Box>
            
            <Divider />
            
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip label={`Área: ${evento.are_eve}`} color="primary" variant="outlined" />
              <Chip label={`Audiencia: ${evento.tipo_audiencia_eve}`} color="secondary" variant="outlined" />
            </Box>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Fecha de Inicio
                </Typography>
                <Typography variant="body2">
                  {new Date(evento.fec_ini_eve).toLocaleDateString()}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Fecha de Fin
                </Typography>
                <Typography variant="body2">
                  {evento.fec_fin_eve ? new Date(evento.fec_fin_eve).toLocaleDateString() : 'No especificada'}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Hora de Inicio
                </Typography>
                <Typography variant="body2">
                  {evento.hor_ini_eve}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Hora de Fin
                </Typography>
                <Typography variant="body2">
                  {evento.hor_fin_eve || 'No especificada'}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Duración
                </Typography>
                <Typography variant="body2">
                  {evento.dur_eve} horas
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Capacidad Máxima
                </Typography>
                <Typography variant="body2">
                  {evento.capacidad_max_eve} personas
                </Typography>
              </Box>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                Ubicación
              </Typography>
              <Typography variant="body2">
                {evento.ubi_eve}
              </Typography>
            </Box>
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

export default EventoCard;