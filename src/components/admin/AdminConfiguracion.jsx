import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton
} from '@mui/material';
import {
  Settings,
  Security,
  Notifications,
  Email,
  Storage,
  Backup,
  Save,
  Edit,
  Delete,
  Add,
  AdminPanelSettings
} from '@mui/icons-material';
import AdminSidebar from './AdminSidebar';

const AdminConfiguracion = () => {
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [config, setConfig] = useState({
    siteName: 'Sistema de Gestión de Eventos',
    siteDescription: 'Plataforma para la gestión de eventos y cursos',
    allowRegistration: true,
    requireEmailVerification: true,
    enableNotifications: true,
    maxFileSize: 10,
    backupFrequency: 'daily',
    maintenanceMode: false,
    adminEmail: 'admin@sistema.com',
    supportEmail: 'soporte@sistema.com'
  });

  const admins = [
    {
      id: 1,
      nombre: 'Juan Pérez',
      email: 'juan@admin.com',
      rol: 'MASTER',
      activo: true
    },
    {
      id: 2,
      nombre: 'María García',
      email: 'maria@admin.com',
      rol: 'ADMINISTRADOR',
      activo: true
    }
  ];

  const handleConfigChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveConfig = async () => {
    try {
      setLoading(true);
      // Aquí iría la llamada a la API para guardar la configuración
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error al guardar configuración:', error);
    } finally {
      setLoading(false);
    }
  };

  const configSections = [
    {
      title: 'Configuración General',
      icon: <Settings />,
      color: '#3b82f6',
      fields: [
        {
          key: 'siteName',
          label: 'Nombre del Sitio',
          type: 'text',
          value: config.siteName
        },
        {
          key: 'siteDescription',
          label: 'Descripción del Sitio',
          type: 'text',
          value: config.siteDescription
        },
        {
          key: 'adminEmail',
          label: 'Email del Administrador',
          type: 'email',
          value: config.adminEmail
        },
        {
          key: 'supportEmail',
          label: 'Email de Soporte',
          type: 'email',
          value: config.supportEmail
        }
      ]
    },
    {
      title: 'Configuración de Seguridad',
      icon: <Security />,
      color: '#ef4444',
      switches: [
        {
          key: 'allowRegistration',
          label: 'Permitir Registro de Usuarios',
          description: 'Los usuarios pueden registrarse automáticamente',
          value: config.allowRegistration
        },
        {
          key: 'requireEmailVerification',
          label: 'Verificación de Email Requerida',
          description: 'Los usuarios deben verificar su email',
          value: config.requireEmailVerification
        },
        {
          key: 'maintenanceMode',
          label: 'Modo Mantenimiento',
          description: 'Activar modo mantenimiento del sistema',
          value: config.maintenanceMode
        }
      ]
    },
    {
      title: 'Configuración del Sistema',
      icon: <Storage />,
      color: '#10b981',
      fields: [
        {
          key: 'maxFileSize',
          label: 'Tamaño Máximo de Archivo (MB)',
          type: 'number',
          value: config.maxFileSize
        },
        {
          key: 'backupFrequency',
          label: 'Frecuencia de Respaldo',
          type: 'select',
          value: config.backupFrequency,
          options: [
            { value: 'daily', label: 'Diario' },
            { value: 'weekly', label: 'Semanal' },
            { value: 'monthly', label: 'Mensual' }
          ]
        }
      ],
      switches: [
        {
          key: 'enableNotifications',
          label: 'Notificaciones Habilitadas',
          description: 'Enviar notificaciones por email',
          value: config.enableNotifications
        }
      ]
    }
  ];

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f5f5f5' }}>
      <AdminSidebar />
      
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Configuración del Sistema
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Administra la configuración general del sistema
          </Typography>
        </Box>

        {saveSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Configuración guardada exitosamente
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Configuration Sections */}
          {configSections.map((section, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Paper elevation={2} sx={{ p: 3, height: 'fit-content' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: section.color, mr: 2 }}>
                    {section.icon}
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {section.title}
                  </Typography>
                </Box>

                {/* Text Fields */}
                {section.fields && (
                  <Box sx={{ mb: 3 }}>
                    {section.fields.map((field) => (
                      <TextField
                        key={field.key}
                        fullWidth
                        label={field.label}
                        type={field.type}
                        value={field.value}
                        onChange={(e) => handleConfigChange(field.key, e.target.value)}
                        sx={{ mb: 2 }}
                        select={field.type === 'select'}
                        SelectProps={field.type === 'select' ? { native: true } : undefined}
                      >
                        {field.type === 'select' && field.options?.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </TextField>
                    ))}
                  </Box>
                )}

                {/* Switches */}
                {section.switches && (
                  <Box>
                    {section.switches.map((switchItem, switchIndex) => (
                      <Box key={switchItem.key}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={switchItem.value}
                              onChange={(e) => handleConfigChange(switchItem.key, e.target.checked)}
                              color="primary"
                            />
                          }
                          label={switchItem.label}
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
                          {switchItem.description}
                        </Typography>
                        {switchIndex < section.switches.length - 1 && <Divider sx={{ my: 2 }} />}
                      </Box>
                    ))}
                  </Box>
                )}
              </Paper>
            </Grid>
          ))}

          {/* Admin Management */}
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: '#7c3aed', mr: 2 }}>
                    <AdminPanelSettings />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Gestión de Administradores
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  sx={{ bgcolor: '#7c3aed', '&:hover': { bgcolor: '#6d28d9' } }}
                >
                  Nuevo Admin
                </Button>
              </Box>

              <List>
                {admins.map((admin, index) => (
                  <ListItem key={admin.id} divider={index < admins.length - 1}>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: admin.rol === 'MASTER' ? '#ef4444' : '#7c3aed' }}>
                        <AdminPanelSettings />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={admin.nombre}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {admin.email}
                          </Typography>
                          <Typography variant="caption" sx={{ 
                            color: admin.rol === 'MASTER' ? '#ef4444' : '#7c3aed',
                            fontWeight: 500
                          }}>
                            {admin.rol}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" color="primary" sx={{ mr: 1 }}>
                        <Edit />
                      </IconButton>
                      <IconButton edge="end" color="error">
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Save Button */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<Save />}
                onClick={handleSaveConfig}
                disabled={loading}
                sx={{
                  bgcolor: '#10b981',
                  '&:hover': { bgcolor: '#059669' },
                  px: 4,
                  py: 1.5
                }}
              >
                {loading ? 'Guardando...' : 'Guardar Configuración'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default AdminConfiguracion; 