import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Download as DownloadIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Description as DocumentIcon,
  School as StudentIcon,
  Person as UserIcon
} from '@mui/icons-material';
import { documentService } from '../../services/documentService';
import AdminSidebar from './AdminSidebar';
import { useSidebarLayout } from '../../hooks/useSidebarLayout';

const AdminVerificacionDocumentos = () => {
  const { getMainContentStyle } = useSidebarLayout();
  const [tabValue, setTabValue] = useState(0);
  const [documentData, setDocumentData] = useState({
    estudiantes: [],
    usuarios: [],
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    action: '',
    user: null
  });
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' });

  // NUEVO: visor de documentos
  const [viewerDialog, setViewerDialog] = useState({
    open: false,
    pdfUrl: '',
    user: null,
    documentType: ''
  });

  useEffect(() => {
    loadPendingDocuments();
  }, []);

  const loadPendingDocuments = async () => {
    try {
      setLoading(true);
      const response = await documentService.getPendingDocuments();
      if (response.success) {
        setDocumentData(response.data);
      }
    } catch (error) {
      console.error('Error cargando documentos pendientes:', error);
      showAlert('Error al cargar documentos pendientes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, severity = 'success') => {
    setAlert({ show: true, message, severity });
    setTimeout(() => setAlert({ show: false, message: '', severity: 'success' }), 4000);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleViewDocument = async (user, documentType) => {
    try {
      const response = await documentService.downloadUserDocument(user.id_usu, documentType);
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" })
      );

      setViewerDialog({
        open: true,
        pdfUrl: url,
        user,
        documentType
      });
    } catch (error) {
      console.error("Error visualizando documento:", error);
      showAlert("Error al cargar el documento para visualización", "error");
    }
  };

  const handleApproveDocuments = async (user) => {
    setConfirmDialog({
      open: true,
      action: 'approve',
      user
    });
  };

  const handleRejectDocuments = async (user) => {
    setConfirmDialog({
      open: true,
      action: 'reject',
      user
    });
  };

  const executeAction = async () => {
    try {
      setActionLoading(true);
      const { action, user } = confirmDialog;

      if (action === 'approve') {
        await documentService.approveUserDocuments(user.id_usu);
        showAlert(`Documentos de ${user.nombre_completo} aprobados exitosamente`);
      } else if (action === 'reject') {
        await documentService.rejectUserDocuments(user.id_usu);
        showAlert(`Documentos de ${user.nombre_completo} rechazados. El usuario deberá subir nuevos documentos.`, 'warning');
      }

      setConfirmDialog({ open: false, action: '', user: null });
      loadPendingDocuments();
    } catch (error) {
      console.error('Error ejecutando acción:', error);
      showAlert('Error al procesar la acción', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // NUEVO: aprobar/rechazar desde visor
  const executeApproveInViewer = async () => {
    try {
      setActionLoading(true);
      await documentService.approveUserDocuments(viewerDialog.user.id_usu);
      showAlert(`Documentos de ${viewerDialog.user.nombre_completo} aprobados exitosamente`);
      setViewerDialog({ open: false, pdfUrl: '', user: null, documentType: '' });
      loadPendingDocuments();
    } catch (error) {
      console.error(error);
      showAlert("Error aprobando documentos", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const executeRejectInViewer = async () => {
    try {
      setActionLoading(true);
      await documentService.rejectUserDocuments(viewerDialog.user.id_usu);
      showAlert(`Documentos de ${viewerDialog.user.nombre_completo} rechazados`, "warning");
      setViewerDialog({ open: false, pdfUrl: '', user: null, documentType: '' });
      loadPendingDocuments();
    } catch (error) {
      console.error(error);
      showAlert("Error rechazando documentos", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const renderDocumentButtons = (user) => (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
      {user.documentos.cedula_subida && (
        <Tooltip title="Ver Cédula">
          <IconButton
            size="small"
            onClick={() => handleViewDocument(user, 'cedula')}
            sx={{
              backgroundColor: '#d32f2f',
              color: 'white',
              '&:hover': { backgroundColor: '#b71c1c' },
              border: '2px solid #d32f2f'
            }}
          >
            <DocumentIcon />
          </IconButton>
        </Tooltip>
      )}
      {user.documentos.matricula_subida && (
        <Tooltip title="Ver Matrícula">
          <IconButton
            size="small"
            onClick={() => handleViewDocument(user, 'matricula')}
            sx={{
              backgroundColor: '#1976d2',
              color: 'white',
              '&:hover': { backgroundColor: '#1565c0' },
              border: '2px solid #1976d2'
            }}
          >
            <DocumentIcon />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );

  const renderActionButtons = (user) => (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Tooltip title="Aprobar Documentos">
        <IconButton
          size="small"
          color="success"
          onClick={() => handleApproveDocuments(user)}
        >
          <ApproveIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Rechazar Documentos">
        <IconButton
          size="small"
          color="error"
          onClick={() => handleRejectDocuments(user)}
        >
          <RejectIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );

  const renderUserTable = (users, userType) => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Usuario</TableCell>
            <TableCell>Cédula</TableCell>
            <TableCell>Email</TableCell>
            {userType === 'estudiante' && <TableCell>Carrera</TableCell>}
            <TableCell>Documentos</TableCell>
            <TableCell>Ver</TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id_usu}>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {userType === 'estudiante' ? <StudentIcon color="primary" /> : <UserIcon color="secondary" />}
                  <Typography variant="body2" fontWeight="medium">
                    {user.nombre_completo}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>{user.ced_usu}</TableCell>
              <TableCell>{user.email}</TableCell>
              {userType === 'estudiante' && (
                <TableCell>{user.carrera || 'No asignada'}</TableCell>
              )}
              <TableCell>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {user.documentos.cedula_subida && (
                    <Chip label="Cédula" size="small" color="error" icon={<DocumentIcon />} />
                  )}
                  {user.documentos.matricula_subida && (
                    <Chip label="Matrícula" size="small" color="info" icon={<DocumentIcon />} />
                  )}
                </Box>
              </TableCell>
              <TableCell>{renderDocumentButtons(user)}</TableCell>
              <TableCell>{renderActionButtons(user)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <AdminSidebar />

      <Box sx={{ flexGrow: 1, p: 3, ...getMainContentStyle() }}>
        <Box sx={{ background: 'linear-gradient(135deg, #6d1313 0%, #8b1a1a 100%)', borderRadius: 3, p: 4, color: 'white', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            Verificación de Documentos
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Gestión de documentos de identidad de usuarios
          </Typography>
        </Box>

        {alert.show && (
          <Alert severity={alert.severity} sx={{ mb: 2 }}>
            {alert.message}
          </Alert>
        )}

        <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Documentos Pendientes de Verificación ({documentData.total})
            </Typography>

            <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
              <Tab label={`Estudiantes (${documentData.estudiantes.length})`} icon={<StudentIcon />} iconPosition="start" />
              <Tab label={`Usuarios (${documentData.usuarios.length})`} icon={<UserIcon />} iconPosition="start" />
            </Tabs>

            {tabValue === 0 ? (
              documentData.estudiantes.length > 0 ? (
                renderUserTable(documentData.estudiantes, 'estudiante')
              ) : (
                <Alert severity="info">No hay estudiantes con documentos pendientes de verificación</Alert>
              )
            ) : (
              documentData.usuarios.length > 0 ? (
                renderUserTable(documentData.usuarios, 'usuario')
              ) : (
                <Alert severity="info">No hay usuarios con documentos pendientes de verificación</Alert>
              )
            )}
          </CardContent>
        </Card>

        {/* Dialog de confirmación (se mantiene) */}
        <Dialog
          open={confirmDialog.open}
          onClose={() => setConfirmDialog({ open: false, action: '', user: null })}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {confirmDialog.action === 'approve' ? 'Aprobar Documentos' : 'Rechazar Documentos'}
          </DialogTitle>
          <DialogContent>
            <Typography>
              {confirmDialog.action === 'approve'
                ? `¿Está seguro de que desea aprobar los documentos de ${confirmDialog.user?.nombre_completo}?`
                : `¿Está seguro de que desea rechazar los documentos de ${confirmDialog.user?.nombre_completo}? Los documentos serán eliminados.`}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDialog({ open: false, action: '', user: null })} disabled={actionLoading}>
              Cancelar
            </Button>
            <Button onClick={executeAction} color={confirmDialog.action === 'approve' ? 'success' : 'error'} variant="contained" disabled={actionLoading}>
              {confirmDialog.action === 'approve' ? 'Aprobar' : 'Rechazar'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* NUEVO: visor embebido de PDF */}
        <Dialog
          open={viewerDialog.open}
          onClose={() => setViewerDialog({ open: false, pdfUrl: '', user: null, documentType: '' })}
          maxWidth="x1"
          fullWidth
        >
          <DialogTitle>
            Vista previa de {viewerDialog.documentType} de {viewerDialog.user?.nombre_completo}
          </DialogTitle>
          <DialogContent sx={{ height: '80vh' }}>
            {viewerDialog.pdfUrl ? (
              <iframe
                src={viewerDialog.pdfUrl}
                title="Vista previa PDF"
                width="100%"
                height="100%"
                style={{ border: 'none' }}
              ></iframe>
            ) : (
              <CircularProgress />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={executeApproveInViewer} color="success" variant="contained" disabled={actionLoading}>
              Aprobar
            </Button>
            <Button onClick={executeRejectInViewer} color="error" variant="contained" disabled={actionLoading}>
              Rechazar
            </Button>
            <Button onClick={() => setViewerDialog({ open: false, pdfUrl: '', user: null, documentType: '' })}>
              Cerrarr
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default AdminVerificacionDocumentos;
