import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Person,
  Email,
  Phone,
  Badge,
  AdminPanelSettings
} from '@mui/icons-material';
import AdminSidebar from './AdminSidebar';

const AdminUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    rol: 'USUARIO'
  });

  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      // Aquí iría la llamada real a la API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Datos simulados
      setUsuarios([
        {
          id: 1,
          nombre: 'Juan',
          apellido: 'Pérez',
          email: 'juan@example.com',
          telefono: '123456789',
          rol: 'USUARIO',
          fechaRegistro: '2024-01-15'
        },
        {
          id: 2,
          nombre: 'María',
          apellido: 'García',
          email: 'maria@example.com',
          telefono: '987654321',
          rol: 'ADMINISTRADOR',
          fechaRegistro: '2024-01-10'
        },
        {
          id: 3,
          nombre: 'Carlos',
          apellido: 'López',
          email: 'carlos@example.com',
          telefono: '456789123',
          rol: 'MASTER',
          fechaRegistro: '2024-01-05'
        }
      ]);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user = null) => {
    setSelectedUser(user);
    if (user) {
      setFormData({
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        telefono: user.telefono,
        rol: user.rol
      });
    } else {
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        rol: 'USUARIO'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleSaveUser = async () => {
    try {
      // Aquí iría la lógica para guardar/actualizar usuario
      console.log('Guardando usuario:', formData);
      handleCloseDialog();
      loadUsuarios();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
    }
  };

  const getRolColor = (rol) => {
    switch (rol) {
      case 'MASTER':
        return '#ef4444';
      case 'ADMINISTRADOR':
        return '#7c3aed';
      case 'USUARIO':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const stats = [
    {
      title: 'Total Usuarios',
      value: usuarios.length,
      icon: <Person />,
      color: '#3b82f6'
    },
    {
      title: 'Administradores',
      value: usuarios.filter(u => u.rol === 'ADMINISTRADOR').length,
      icon: <AdminPanelSettings />,
      color: '#7c3aed'
    },
    {
      title: 'Masters',
      value: usuarios.filter(u => u.rol === 'MASTER').length,
      icon: <Badge />,
      color: '#ef4444'
    },
    {
      title: 'Usuarios Normales',
      value: usuarios.filter(u => u.rol === 'USUARIO').length,
      icon: <Person />,
      color: '#10b981'
    }
  ];

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f5f5f5' }}>
      <AdminSidebar />
      
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Gestión de Usuarios
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Administra los usuarios del sistema
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: stat.color, mr: 2 }}>
                    {stat.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Actions */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Lista de Usuarios
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{ bgcolor: '#7c3aed', '&:hover': { bgcolor: '#6d28d9' } }}
          >
            Nuevo Usuario
          </Button>
        </Box>

        {/* Users Table */}
        <Paper elevation={2}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Usuario</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Teléfono</TableCell>
                  <TableCell>Rol</TableCell>
                  <TableCell>Fecha Registro</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : (
                  usuarios.map((usuario) => (
                    <TableRow key={usuario.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2, bgcolor: '#e5e7eb' }}>
                            <Person />
                          </Avatar>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {usuario.nombre} {usuario.apellido}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{usuario.email}</TableCell>
                      <TableCell>{usuario.telefono}</TableCell>
                      <TableCell>
                        <Chip
                          label={usuario.rol}
                          sx={{
                            bgcolor: getRolColor(usuario.rol),
                            color: 'white',
                            fontWeight: 500
                          }}
                        />
                      </TableCell>
                      <TableCell>{usuario.fechaRegistro}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={() => handleOpenDialog(usuario)}
                          color="primary"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton color="error">
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Dialog for Create/Edit User */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {selectedUser ? 'Editar Usuario' : 'Nuevo Usuario'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Apellido"
                  value={formData.apellido}
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Rol"
                  value={formData.rol}
                  onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="USUARIO">Usuario</option>
                  <option value="ADMINISTRADOR">Administrador</option>
                  <option value="MASTER">Master</option>
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button 
              onClick={handleSaveUser} 
              variant="contained"
              sx={{ bgcolor: '#7c3aed', '&:hover': { bgcolor: '#6d28d9' } }}
            >
              {selectedUser ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default AdminUsuarios; 