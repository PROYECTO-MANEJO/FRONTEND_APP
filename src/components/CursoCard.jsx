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
  Divider
} from '@mui/material';
import { InfoOutlined, Close } from '@mui/icons-material';

const CursoCard = ({ curso }) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Card sx={{ mb: 2, height: '100%' }}>
        <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" gutterBottom>{curso.nom_cur}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1, mb: 2 }}>
            {curso.des_cur}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Fecha inicio: {new Date(curso.fec_ini_cur).toLocaleDateString()}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Duración: {curso.dur_cur} horas
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
                  {new Date(curso.fec_fin_cur).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                Duración
              </Typography>
              <Typography variant="body2">
                {curso.dur_cur} horas
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                ID del Curso
              </Typography>
              <Typography variant="body2">
                {curso.id_cur}
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

export default CursoCard;