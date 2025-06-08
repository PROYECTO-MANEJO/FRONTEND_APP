import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Avatar,
  CircularProgress,
  Alert,
  Snackbar,
  TablePagination
} from '@mui/material';
import {
  People,
  Add,
  Edit,
  Delete,
  Search,
  AdminPanelSettings,
  Person
} from '@mui/icons-material';
import AdminSidebar from './AdminSidebar';
import api from '../../services/api';

const AdminUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const [userForm, setUserForm] = useState({
    ced_usu: '',
    nom_usu1: '',
    nom_usu2: '',
    ape_usu1: '',
    ape_usu2: '',
    ema_usu: '',
    tel_usu: '',
    rol_cue: 'USUARIO',
    con_cue: ''
  });

  const [stats, setStats] = useState({
    totalUsuarios: 0,
    administradores: 0,
    masters: 0,
    usuariosRegulares: 0
  });

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/admins');
      const usuariosData = response.data.usuarios || [];
      setUsuarios(usuariosData);
      
      // Calcular estadísticas (solo administradores)
      const totalUsuarios = usuariosData.length;
      const administradores = usuariosData.filter(u => u.rol_cue === 'ADMINISTRADOR').length;
      
      setStats({
        totalUsuarios,
        administradores,
        masters: 0, // No mostramos masters en esta vista
        usuariosRegulares: 0 // No mostramos usuarios regulares en esta vista
      });
      
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      setSnackbar({
        open: true,
        message: 'Error al cargar los administradores',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (usuario = null) => {
    if (usuario) {
      setEditingUser(usuario);
      setUserForm({
        ced_usu: usuario.ced_usu || '',
        nom_usu1: usuario.nom_usu1 || '',
        nom_usu2: usuario.nom_usu2 || '',
        ape_usu1: usuario.ape_usu1 || '',
        ape_usu2: usuario.ape_usu2 || '',
        ema_usu: usuario.ema_usu || '',
        tel_usu: usuario.tel_usu || '',
        rol_cue: usuario.rol_cue || 'USUARIO',
        con_cue: '' // No mostrar contraseña existente
      });
    } else {
      setEditingUser(null);
      setUserForm({
        ced_usu: '',
        nom_usu1: '',
        nom_usu2: '',
        ape_usu1: '',
        ape_usu2: '',
        ema_usu: '',
        tel_usu: '',
        rol_cue: 'USUARIO',
        con_cue: ''
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingUser(null);
  };

  const handleInputChange = (field) => (event) => {
    setUserForm({
      ...userForm,
      [field]: event.target.value
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      if (editingUser) {
        // Para edición, solo enviar campos que no estén vacíos
        const updateData = { ...userForm };
        if (!updateData.con_cue) {
          delete updateData.con_cue; // No actualizar contraseña si está vacía
        }
        
        await api.put(`/usuarios/${editingUser.ced_usu}`, updateData);
        setSnackbar({
          open: true,
          message: 'Usuario actualizado correctamente',
          severity: 'success'
        });
      } else {
        await api.post('/usuarios', userForm);
        setSnackbar({
          open: true,
          message: 'Usuario creado correctamente',
          severity: 'success'
        });
      }
      
      handleCloseDialog();
      cargarUsuarios();
      
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error al guardar el usuario',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (cedula) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        await api.delete(`/usuarios/${cedula}`);
        setSnackbar({
          open: true,
          message: 'Usuario eliminado correctamente',
          severity: 'success'
        });
        cargarUsuarios();
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
        setSnackbar({
          open: true,
          message: 'Error al eliminar el usuario',
          severity: 'error'
        });
      }
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMINISTRADOR': return '#6d1313';
      case 'MASTER': return '#8b1a1a';
      case 'USUARIO': return '#666';
      default: return '#666';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'ADMINISTRADOR': return <AdminPanelSettings />;
      case 'MASTER': return <AdminPanelSettings />;
      case 'USUARIO': return <Person />;
      default: return <Person />;
    }
  };

  // Filtrar usuarios
  const filteredUsers = usuarios.filter(usuario => {
    const matchesSearch = 
      usuario.nom_usu1?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.ape_usu1?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.ced_usu?.includes(searchTerm) ||
      usuario.ema_usu?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === '' || usuario.rol_cue === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  // Paginación
  const paginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading && usuarios.length === 0) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
        <AdminSidebar />
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress size={60} sx={{ color: '#6d1313' }} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <AdminSidebar />
      
      <Box sx={{ flexGrow: 1, p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h5" sx={{ color: '#6d1313', fontWeight: 'bold', mb: 1 }}>
              <AdminPanelSettings sx={{ mr: 1 }} />
              Gestión de Administradores
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Administra las cuentas de administradores del sistema
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{
              bgcolor: '#6d1313',
              '&:hover': { bgcolor: '#8b1a1a' }
            }}
          >
            Crear Administrador
          </Button>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={6}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#6d1313', mr: 2 }}>
                    <AdminPanelSettings />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#6d1313' }}>
                      {stats.totalUsuarios}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Administradores
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={6}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#6d1313', mr: 2 }}>
                    <People />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#6d1313' }}>
                      {stats.administradores}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Administradores Activos
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        <Card sx={{ borderRadius: 3, boxShadow: 3, mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Buscar por nombre, cédula o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Filtrar por Estado</InputLabel>
                  <Select
                    value={roleFilter}
                    label="Filtrar por Estado"
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <MenuItem value="">Todos los administradores</MenuItem>
                    <MenuItem value="ADMINISTRADOR">Solo Administradores</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    setSearchTerm('');
                    setRoleFilter('');
                  }}
                  sx={{
                    borderColor: '#6d1313',
                    color: '#6d1313',
                    '&:hover': {
                      borderColor: '#8b1a1a',
                      bgcolor: 'rgba(109, 19, 19, 0.04)'
                    }
                  }}
                >
                  Limpiar Filtros
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Usuario</TableCell>
                    <TableCell>Cédula</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Teléfono</TableCell>
                    <TableCell>Rol</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedUsers.map((usuario) => (
                    <TableRow key={usuario.ced_usu} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2, bgcolor: getRoleColor(usuario.rol_cue) }}>
                            {getRoleIcon(usuario.rol_cue)}
                          </Avatar>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                              {usuario.nom_usu1} {usuario.nom_usu2} {usuario.ape_usu1} {usuario.ape_usu2}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{usuario.ced_usu}</TableCell>
                      <TableCell>{usuario.ema_usu}</TableCell>
                      <TableCell>{usuario.tel_usu}</TableCell>
                      <TableCell>
                        <Chip
                          label={usuario.rol_cue}
                          size="small"
                          sx={{
                            bgcolor: getRoleColor(usuario.rol_cue),
                            color: 'white'
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(usuario)}
                          sx={{ color: '#6d1313', mr: 1 }}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(usuario.ced_usu)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              component="div"
              count={filteredUsers.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Filas por página:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            />
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingUser ? 'Editar Administrador' : 'Crear Nuevo Administrador'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Cédula"
                    value={userForm.ced_usu}
                    onChange={handleInputChange('ced_usu')}
                    disabled={editingUser !== null}
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Primer Nombre"
                    value={userForm.nom_usu1}
                    onChange={handleInputChange('nom_usu1')}
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Segundo Nombre"
                    value={userForm.nom_usu2}
                    onChange={handleInputChange('nom_usu2')}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Primer Apellido"
                    value={userForm.ape_usu1}
                    onChange={handleInputChange('ape_usu1')}
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Segundo Apellido"
                    value={userForm.ape_usu2}
                    onChange={handleInputChange('ape_usu2')}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={userForm.ema_usu}
                    onChange={handleInputChange('ema_usu')}
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Teléfono"
                    value={userForm.tel_usu}
                    onChange={handleInputChange('tel_usu')}
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Rol</InputLabel>
                    <Select
                      value={userForm.rol_cue}
                      label="Rol"
                      onChange={handleInputChange('rol_cue')}
                    >
                      <MenuItem value="ADMINISTRADOR">Administrador</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={editingUser ? "Nueva Contraseña (dejar vacío para no cambiar)" : "Contraseña"}
                    type="password"
                    value={userForm.con_cue}
                    onChange={handleInputChange('con_cue')}
                    required={!editingUser}
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              sx={{
                bgcolor: '#6d1313',
                '&:hover': { bgcolor: '#8b1a1a' }
              }}
            >
              {loading ? 'Guardando...' : editingUser ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default AdminUsuarios; 