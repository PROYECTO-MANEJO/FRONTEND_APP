import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Warning,
  CheckCircle,
  Cancel,
  Assignment,
  School,
  Person,
  Schedule
} from '@mui/icons-material';

const DocumentosAlert = ({ 
  open, 
  onClose, 
  user, 
  onGoToProfile 
}) => {
  if (!user) return null;

  const isEstudiante = user.rol === 'ESTUDIANTE';
  const documentos = user.documentos;
  
  const documentosCompletos = documentos ? (
    isEstudiante 
      ? (documentos.cedula_subida && documentos.matricula_subida)
      : documentos.cedula_subida
  ) : false;
  
  const documentosVerificados = documentos?.documentos_verificados || false;

  const handleGoToProfile = () => {
    if (onGoToProfile) {
      onGoToProfile();
    } else {
      window.location.href = '/user/profile';
    }
    onClose();
  };

  const getStatusInfo = () => {
    if (!documentos) {
      return {
        severity: 'warning',
        title: '📄 Documentos Requeridos',
        subtitle: 'Para inscribirte necesitas subir tus documentos',
        icon: <Warning sx={{ fontSize: 40, color: 'warning.main' }} />
      };
    }

    if (!documentosCompletos) {
      return {
        severity: 'warning',
        title: '📤 Documentos Incompletos',
        subtitle: 'Te faltan algunos documentos por subir',
        icon: <Assignment sx={{ fontSize: 40, color: 'warning.main' }} />
      };
    }

    if (!documentosVerificados) {
      return {
        severity: 'info',
        title: '⏳ Verificación Pendiente',
        subtitle: 'Tus documentos están esperando verificación',
        icon: <Schedule sx={{ fontSize: 40, color: 'info.main' }} />
      };
    }

    return {
      severity: 'success',
      title: '✅ Documentos Verificados',
      subtitle: 'Ya puedes inscribirte en eventos y cursos',
      icon: <CheckCircle sx={{ fontSize: 40, color: 'success.main' }} />
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          {statusInfo.icon}
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {statusInfo.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {statusInfo.subtitle}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Alert severity={statusInfo.severity} sx={{ mb: 3, borderRadius: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            Estado de tus documentos:
          </Typography>
        </Alert>

        <List dense>
          <ListItem>
            <ListItemIcon>
              {documentos?.cedula_subida ? 
                <CheckCircle color="success" /> : 
                <Cancel color="error" />
              }
            </ListItemIcon>
            <ListItemText 
              primary="Documento de Cédula"
              secondary={documentos?.cedula_subida ? 'Subido correctamente' : 'Pendiente de subir'}
            />
          </ListItem>

          {isEstudiante && (
            <ListItem>
              <ListItemIcon>
                {documentos?.matricula_subida ? 
                  <CheckCircle color="success" /> : 
                  <Cancel color="error" />
                }
              </ListItemIcon>
              <ListItemText 
                primary="Documento de Matrícula"
                secondary={documentos?.matricula_subida ? 'Subido correctamente' : 'Pendiente de subir'}
              />
            </ListItem>
          )}

          <Divider sx={{ my: 1 }} />

          <ListItem>
            <ListItemIcon>
              {documentosVerificados ? 
                <CheckCircle color="success" /> : 
                <Warning color="warning" />
              }
            </ListItemIcon>
            <ListItemText 
              primary="Verificación Administrativa"
              secondary={documentosVerificados ? 
                'Documentos verificados por administrador' : 
                'Esperando verificación por administrador'
              }
            />
          </ListItem>
        </List>

        {!documentosCompletos && (
          <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
            <Typography variant="body2">
              <strong>¿Qué necesitas hacer?</strong>
              <br />
              1. Ve a tu perfil haciendo clic en "Ir a Mi Perfil"
              <br />
              2. Sube tu documento de cédula
              {isEstudiante && ' y matrícula'}
              <br />
              3. Espera la verificación por parte de un administrador
              <br />
              4. Una vez verificado, podrás inscribirte en eventos y cursos
            </Typography>
          </Alert>
        )}

        {documentosCompletos && !documentosVerificados && (
          <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
            <Typography variant="body2">
              <strong>¡Bien!</strong> Has subido todos los documentos necesarios.
              <br />
              Ahora solo necesitas esperar a que un administrador los verifique.
              <br />
              Te notificaremos cuando estén verificados.
            </Typography>
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{ borderRadius: 2, flex: 1 }}
        >
          Entendido
        </Button>
        
        {!documentosCompletos && (
          <Button
            onClick={handleGoToProfile}
            variant="contained"
            startIcon={<Person />}
            sx={{ borderRadius: 2, flex: 1 }}
          >
            Ir a Mi Perfil
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default DocumentosAlert; 