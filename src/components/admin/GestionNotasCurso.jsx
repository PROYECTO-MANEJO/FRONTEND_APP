import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Chip,
  Grid,
  Divider
} from '@mui/material';
import {
  ArrowBack,
  Save,
  School,
  Assignment,
  CheckCircle,
  Cancel
} from '@mui/icons-material';
import AdminSidebar from './AdminSidebar';
import { useSidebarLayout } from '../../hooks/useSidebarLayout';
import api from '../../services/api';

const GestionNotasCurso = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getMainContentStyle } = useSidebarLayout();
  const [loading, setLoading] = useState(true);
  const [curso, setCurso] = useState(null);
  const [participaciones, setParticipaciones] = useState([]);
  const [editando, setEditando] = useState({});

  useEffect(() => {
    obtenerParticipaciones();
  }, [id]);

  const obtenerParticipaciones = async () => {
    try {
      const response = await api.get(`/participaciones/cursos/${id}`);

      if (response.data.success) {
        setCurso(response.data.curso);
        setParticipaciones(response.data.participaciones);
      } else {
        toast.error(response.data.message || 'Error al cargar las participaciones');
      }
    } catch (error) {
      console.error('Error:', error);
      if (error.response?.status === 400 && error.response?.data?.message?.includes('cerrado')) {
        toast.error(error.response.data.message);
        navigate(`/admin/detalle-curso/${id}`);
      } else {
        toast.error('Error de conexión');
      }
    } finally {
      setLoading(false);
    }
  };

  const manejarCambioNota = (inscripcionId, campo, valor) => {
    setEditando(prev => ({
      ...prev,
      [inscripcionId]: {
        ...prev[inscripcionId],
        [campo]: valor
      }
    }));
  };

  const guardarParticipacion = async (inscripcionId) => {
    const cambios = editando[inscripcionId];
    if (!cambios) return;

    const participacionActual = participaciones.find(p => p.inscripcionId === inscripcionId);
    const notaFinal = cambios.nota_final !== undefined ? cambios.nota_final : (participacionActual.participacion?.nota_final || 0);
    const asistencia = cambios.asistencia_porcentaje !== undefined ? cambios.asistencia_porcentaje : (participacionActual.participacion?.asistencia_porcentaje || 0);

    // Validar nota según el rango permitido (1-10 o porcentaje)
    if (notaFinal < 0 || (notaFinal > 10 && notaFinal > 100)) {
      toast.error('La nota debe estar entre 0-10 o ser un porcentaje válido (0-100)');
      return;
    }

    if (asistencia < 0 || asistencia > 100) {
      toast.error('La asistencia debe estar entre 0% y 100%');
      return;
    }

    try {
      const response = await api.put(`/participaciones/cursos/${id}/inscripcion/${inscripcionId}`, {
        nota_final: parseFloat(notaFinal),
        asistencia_porcentaje: parseFloat(asistencia)
      });

      if (response.data.success) {
        toast.success('Participación actualizada correctamente');
        obtenerParticipaciones();
        setEditando(prev => {
          const newEditando = { ...prev };
          delete newEditando[inscripcionId];
          return newEditando;
        });
      } else {
        toast.error(response.data.message || 'Error al actualizar la participación');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Error de conexión');
    }
  };

  const formatearNota = (nota) => {
    if (nota > 10) {
      return `${nota}%`;
    }
    return nota.toFixed(1);
  };

  const calcularAprobacion = (nota, asistencia) => {
    const notaMinima = curso?.nota_minima_aprobacion || 7.0;
    const asistenciaMinima = curso?.porcentaje_asistencia_aprobacion || 80;
    
    // Validar que la nota esté en el rango correcto según el tipo de calificación
    const notaNormalizada = nota > 10 ? (nota / 100) * 10 : nota; // Si es porcentaje, convertir a escala 1-10
    
    return notaNormalizada >= notaMinima && asistencia >= asistenciaMinima;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
        <AdminSidebar />
        <Box
          sx={{
            flexGrow: 1,
            p: 3,
            ...getMainContentStyle(),
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <CircularProgress size={60} />
        </Box>
      </Box>
    );
  }

  if (!curso) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
        <AdminSidebar />
        <Box sx={{ flexGrow: 1, p: 3, ...getMainContentStyle() }}>
          <Alert severity="error">
            Error al cargar el curso
          </Alert>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <AdminSidebar />
      <Box sx={{ flexGrow: 1, p: 3, ...getMainContentStyle() }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ color: '#6d1313', fontWeight: 'bold', mb: 1 }}>
            <School sx={{ mr: 1, fontSize: '2rem', verticalAlign: 'middle' }} />
            Gestión de Notas - {curso.nombre}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Administre las notas y asistencia de los estudiantes inscritos en el curso
          </Typography>

          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/admin/gestion-inscripciones')}
            variant="outlined"
            sx={{ 
              mb: 3, 
              color: '#6d1313', 
              borderColor: '#6d1313',
              '&:hover': {
                backgroundColor: '#6d1313',
                color: 'white'
              }
            }}
          >
            Volver a Gestión de Inscripciones
          </Button>
          {/* Criterios de aprobación */}
          <Card sx={{ backgroundColor: '#e3f2fd', boxShadow: 2, mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 'bold', mb: 2 }}>
                <Assignment sx={{ mr: 1 }} />
                Criterios de Aprobación
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1" sx={{ color: '#1976d2', fontSize: '1rem' }}>
                    📝 Nota mínima: <strong>{formatearNota(curso.nota_minima_aprobacion || 7.0)}</strong>
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1" sx={{ color: '#1976d2', fontSize: '1rem' }}>
                    👥 Asistencia mínima: <strong>{curso.porcentaje_asistencia_aprobacion || 80}%</strong>
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>

        {/* Tabla de participaciones */}
        <Paper elevation={3} sx={{ borderRadius: 3 }}>
          <TableContainer sx={{ maxHeight: '60vh' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                    👤 Estudiante
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                    🆔 Cédula
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', textAlign: 'center' }}>
                    📊 Nota Final (0-10)
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', textAlign: 'center' }}>
                    📈 Asistencia (%)
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', textAlign: 'center' }}>
                    🏆 Estado
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', textAlign: 'center' }}>
                    ⚡ Acciones
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {participaciones.map((participacion) => {
                  const { inscripcionId, usuario, participacion: part, estadoPago } = participacion;
                  const editandoActual = editando[inscripcionId] || {};
                const notaActual = editandoActual.nota_final !== undefined ? editandoActual.nota_final : (part?.nota_final || '');
                const asistenciaActual = editandoActual.asistencia_porcentaje !== undefined ? editandoActual.asistencia_porcentaje : (part?.asistencia_porcentaje || '');
                const estaAprobado = part ? calcularAprobacion(notaActual || part.nota_final, asistenciaActual || part.asistencia_porcentaje) : false;

                return (
                  <TableRow 
                    key={inscripcionId} 
                    sx={{ 
                      backgroundColor: estadoPago !== 'APROBADO' ? '#fff3e0' : 'transparent',
                      '&:hover': { backgroundColor: estadoPago !== 'APROBADO' ? '#ffe0b2' : '#f5f5f5' }
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {usuario.nom_usu1} {usuario.nom_usu2} {usuario.ape_usu1} {usuario.ape_usu2}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {usuario.ced_usu}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <TextField
                        type="number"
                        inputProps={{ min: 0, max: 10, step: 0.1 }}
                        value={notaActual}
                        onChange={(e) => manejarCambioNota(inscripcionId, 'nota_final', e.target.value)}
                        disabled={estadoPago !== 'APROBADO'}
                        size="small"
                        sx={{ width: '100px' }}
                      />
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <TextField
                        type="number"
                        inputProps={{ min: 0, max: 100, step: 1 }}
                        value={asistenciaActual}
                        onChange={(e) => manejarCambioNota(inscripcionId, 'asistencia_porcentaje', e.target.value)}
                        disabled={estadoPago !== 'APROBADO'}
                        size="small"
                        sx={{ width: '100px' }}
                      />
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      {estadoPago !== 'APROBADO' ? (
                        <Chip
                          label="Pago Pendiente"
                          color="warning"
                          size="small"
                        />
                      ) : estaAprobado ? (
                        <Chip
                          label="Aprobado"
                          color="success"
                          size="small"
                          icon={<CheckCircle />}
                        />
                      ) : (
                        <Chip
                          label="Reprobado"
                          color="error"
                          size="small"
                          icon={<Cancel />}
                        />
                      )}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      {estadoPago === 'APROBADO' && editandoActual && Object.keys(editandoActual).length > 0 && (
                        <Button
                          onClick={() => guardarParticipacion(inscripcionId)}
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<Save />}
                        >
                          Guardar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              </TableBody>
            </Table>
          </TableContainer>

          {participaciones.length === 0 && (
            <Box sx={{ 
              textAlign: 'center', 
              py: 8,
              backgroundColor: '#f8f9fa',
              borderRadius: 2,
              border: '2px dashed #dee2e6',
              mt: 2
            }}>
              <School sx={{ fontSize: 48, color: '#6c757d', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                No hay participantes inscritos
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Los estudiantes aparecerán aquí una vez que se inscriban en el curso.
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default GestionNotasCurso;
