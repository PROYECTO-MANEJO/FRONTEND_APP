import React, { useState, useEffect } from 'react';
import {
  Alert,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Box,
  Chip,
  CircularProgress,
  Tabs,
  Tab,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
  Event as EventIcon,
  School as SchoolIcon,
  HourglassEmpty as HourglassEmptyIcon,
  PlayArrow as PlayArrowIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { 
  obtenerParticipacionesTerminadas, 
  obtenerTodasLasInscripciones,
  visualizarCertificado
} from '../../services/certificadoService';
import DocumentViewer from '../DocumentViewer';

const MisCertificados = () => {
  const [participaciones, setParticipaciones] = useState({ eventos: [], cursos: [] });
  const [todasLasInscripciones, setTodasLasInscripciones] = useState({ eventos: [], cursos: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [downloading, setDownloading] = useState(null);
  const [detalleDialogOpen, setDetalleDialogOpen] = useState(false);
  const [itemSeleccionado, setItemSeleccionado] = useState(null);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    cargarParticipaciones();
  }, []);

  const cargarParticipaciones = async () => {
    try {
      setLoading(true);
      
      // Cargar participaciones terminadas (para pestañas aprobados/reprobados)
      try {
        const responseTerminadas = await obtenerParticipacionesTerminadas();
        console.log('Participaciones terminadas:', responseTerminadas);
        setParticipaciones(responseTerminadas?.participaciones || { eventos: [], cursos: [] });
      } catch (err) {
        console.warn('No se pudieron cargar participaciones terminadas:', err);
        setParticipaciones({ eventos: [], cursos: [] });
      }
      
      // Cargar TODAS las inscripciones (incluyendo las que no tienen participación)
      try {
        const responseTodas = await obtenerTodasLasInscripciones();
        console.log('Todas las inscripciones:', responseTodas);
        setTodasLasInscripciones(responseTodas?.data || { eventos: [], cursos: [] });
      } catch (err) {
        console.warn('No se pudieron cargar todas las inscripciones:', err);
        setTodasLasInscripciones({ eventos: [], cursos: [] });
      }
      
      setError(null);
    } catch (err) {
      console.error('Error general:', err);
      setError(err.message || 'Error al cargar participaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleVisualizarCertificado = async (tipo, idParticipacion, item) => {
    try {
      setDownloading(idParticipacion);
      
      // Debug: Ver qué datos tenemos
      console.log('Datos del item para certificado:', item);
      
      if (tipo === 'curso') {
        // Para cursos, usar el nuevo método de visualización
        console.log('🔍 Visualizando certificado curso con ID:', idParticipacion);
        
        // Obtener URL para visualización (esto también genera el certificado)
        const pdfUrl = await visualizarCertificado('curso', idParticipacion);
        console.log('📄 URL del PDF:', pdfUrl);
        
        setPdfUrl(pdfUrl);
        setPdfModalOpen(true);
      } else if (tipo === 'evento') {
        // Para eventos, usar el nuevo método de visualización
        console.log('🔍 Visualizando certificado evento con ID:', idParticipacion);
        
        // Obtener URL para visualización (esto también genera el certificado)
        const pdfUrl = await visualizarCertificado('evento', idParticipacion);
        console.log('📄 URL del PDF:', pdfUrl);
        
        setPdfUrl(pdfUrl);
        setPdfModalOpen(true);
      }
      
    } catch (err) {
      setError(err.message || 'Error al generar/visualizar certificado');
    } finally {
      setDownloading(null);
    }
  };

  const handleCerrarPdfModal = () => {
    setPdfModalOpen(false);
    setPdfUrl(null);
  };

  const handleVerDetalles = (item) => {
    setItemSeleccionado(item);
    setDetalleDialogOpen(true);
  };

  const handleCerrarDetalles = () => {
    setDetalleDialogOpen(false);
    setItemSeleccionado(null);
  };

  // Para pestaña "Todos" - usar todas las inscripciones
  const inscripcionesTotales = [
    ...(Array.isArray(todasLasInscripciones?.eventos) ? todasLasInscripciones.eventos : []),
    ...(Array.isArray(todasLasInscripciones?.cursos) ? todasLasInscripciones.cursos : [])
  ];

  // Para pestañas "Aprobados" y "Reprobados" - usar solo las terminadas
  const participacionesTerminadas = [
    ...(Array.isArray(participaciones?.eventos) ? participaciones.eventos : []),
    ...(Array.isArray(participaciones?.cursos) ? participaciones.cursos : [])
  ];
  
  const participacionesAprobadas = participacionesTerminadas.filter(p => p.aprobado);
  const participacionesReprobadas = participacionesTerminadas.filter(p => p.aprobado === false);

  // Contador para inscripciones en curso (ni aprobadas ni reprobadas)
  const inscripcionesEnCurso = inscripcionesTotales.length - participacionesAprobadas.length - participacionesReprobadas.length;

  const tabs = [
    { label: `Todos (${inscripcionesTotales.length})`, data: inscripcionesTotales },
    { label: `Aprobados (${participacionesAprobadas.length})`, data: participacionesAprobadas },
    { label: `Reprobados (${participacionesReprobadas.length})`, data: participacionesReprobadas },
  ];

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Componente para mostrar una inscripción (con o sin participación)
  const CardInscripcion = ({ item }) => {
    const tipo = item.tipo || (item.evento ? 'evento' : 'curso');
    
    // Determinar si es una inscripción o una participación
    const esParticipacion = item.aprobado !== undefined;
    
    // Información específica según el tipo
    const titulo = item.evento || item.curso;
    const esAprobado = esParticipacion ? item.aprobado : null;
    const tieneCertificado = esParticipacion ? item.tiene_certificado_pdf : false;
    
    // Determinar el estado
    const esTerminada = esParticipacion && (item.aprobado !== null);
    
    // Obtener el estado del evento/curso
    const obtenerEstadoActividad = () => {
      if (esParticipacion) {
        return tipo === 'evento' ? 'ACTIVO' : 'ACTIVO';
      } else {
        return tipo === 'evento' ? (item.estado_evento || 'ACTIVO') : (item.estado_curso || 'ACTIVO');
      }
    };
    
    const estadoActividad = obtenerEstadoActividad();
    const estaCerrado = estadoActividad === 'CERRADO';
    
    // Obtener el estado de pago (solo para inscripciones)
    const estadoPago = !esParticipacion ? (tipo === 'evento' ? item.estado_pago : item.estado_pago) : null;

    return (
      <Card
        sx={{
          mb: 2,
          borderRadius: 2,
          maxWidth: 320,
          mx: 'auto',
          transition: 'all 0.3s ease',
          '&:hover': { boxShadow: 6 }
        }}
      >
        <CardContent>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Chip
              label={tipo.toUpperCase()}
              size="small"
              color={tipo === 'evento' ? 'primary' : 'secondary'}
              icon={tipo === 'evento' ? <EventIcon /> : <SchoolIcon />}
            />
            {esTerminada ? (
              <Chip
                icon={esAprobado ? <CheckCircleIcon /> : <CancelIcon />}
                label={esAprobado ? 'Aprobado' : 'Reprobado'}
                size="small"
                color={esAprobado ? 'success' : 'error'}
              />
            ) : (
              <Chip
                icon={estaCerrado ? <CheckCircleIcon /> : <PlayArrowIcon />}
                label={estaCerrado ? 'FINALIZADO' : 'EN CURSO'}
                size="small"
                color={estaCerrado ? 'error' : 'info'}
              />
            )}
          </Box>

          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            {titulo}
          </Typography>

          {esTerminada ? (
            <Typography variant="body2">
              {tipo === 'curso' && (
                <>
                  Nota Final:{' '}
                  <strong>{item.nota ?? 'N/A'}/100</strong>
                  <br />
                </>
              )}
              Asistencia:{' '}
              <strong>
                {tipo === 'evento'
                  ? item.asistencia ?? 'N/A'
                  : item.asistencia ?? 'N/A'}%
              </strong>
              <br />
              Participante: {item.usuario}
            </Typography>
          ) : (
            <Typography variant="body2">
              <strong>Estado:</strong> {estadoPago === 'APROBADO' ? 'Inscrito' : 'Pendiente de aprobación'}
              <br />
              <strong>Fecha de inscripción:</strong> {formatearFecha(item.fecha_inscripcion)}
              <br />
              {item.metodo_pago && (
                <>
                  <strong>Método de pago:</strong> {item.metodo_pago}
                  <br />
                </>
              )}
              {!item.es_gratuito && (
                <>
                  <strong>Estado de pago:</strong>{' '}
                  <Chip 
                    label={estadoPago || 'PENDIENTE'} 
                    size="small" 
                    color={estadoPago === 'APROBADO' ? 'success' : 'warning'}
                    sx={{ fontSize: '0.7rem', height: 20 }}
                  />
                  <br />
                </>
              )}
              Participante: {item.usuario}
            </Typography>
          )}

          {esTerminada && esAprobado && (
            <>
              <Typography variant="body2" color="success.main" mt={1}>
                {tieneCertificado ? 'Certificado disponible para visualización' : 'Certificado disponible para visualización'}
              </Typography>
              <Button
                variant="contained"
                color="success"
                fullWidth
                sx={{ mt: 2 }}
                startIcon={
                  downloading === item.id_participacion
                    ? <CircularProgress size={16} color="inherit" />
                    : <VisibilityIcon />
                }
                onClick={() =>
                  handleVisualizarCertificado(
                    tipo,
                    item.id_participacion,
                    item
                  )
                }
                disabled={downloading === item.id_participacion}
              >
                {downloading === item.id_participacion
                  ? 'Cargando...'
                  : 'Ver certificado'}
              </Button>
            </>
          )}

          {/* Botón Ver Detalles */}
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            startIcon={<VisibilityIcon />}
            onClick={() => handleVerDetalles(item)}
          >
            Ver detalles
          </Button>
        </CardContent>
      </Card>
    );
  };

  // Componente para el diálogo de detalles
  const DetalleDialog = () => {
    if (!itemSeleccionado) return null;

    const tipo = itemSeleccionado.tipo || (itemSeleccionado.evento ? 'evento' : 'curso');
    const titulo = itemSeleccionado.evento || itemSeleccionado.curso;
    const esParticipacion = itemSeleccionado.aprobado !== undefined;
    const estadoActividad = tipo === 'evento' 
      ? (itemSeleccionado.estado_evento || 'ACTIVO') 
      : (itemSeleccionado.estado_curso || 'ACTIVO');
    const estaCerrado = estadoActividad === 'CERRADO';

    // Función para mostrar un campo si existe
    const mostrarCampoSiExiste = (label, valor, chip = false, chipColor = 'default') => {
      if (valor === undefined || valor === null) return null;
      
      return (
        <Typography variant="body1" gutterBottom>
          <strong>{label}:</strong>{' '}
          {chip ? (
            <Chip 
              label={valor} 
              size="small" 
              color={chipColor}
            />
          ) : (
            typeof valor === 'boolean' ? (valor ? 'Sí' : 'No') : valor
          )}
        </Typography>
      );
    };

    return (
      <Dialog 
        open={detalleDialogOpen} 
        onClose={handleCerrarDetalles}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Detalles de {tipo === 'evento' ? 'Evento' : 'Curso'}: {titulo}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 2 }}>
            {/* Información general */}
            <Typography variant="h6" gutterBottom>Información General</Typography>
            
            {mostrarCampoSiExiste('Estado', estaCerrado ? 'FINALIZADO' : 'EN CURSO', true, estaCerrado ? 'error' : 'info')}
            {mostrarCampoSiExiste('Tipo', tipo === 'evento' ? 'Evento' : 'Curso')}
            {mostrarCampoSiExiste('Fecha de inicio', itemSeleccionado.fecha_inicio && formatearFecha(itemSeleccionado.fecha_inicio))}
            {mostrarCampoSiExiste('Fecha de fin', itemSeleccionado.fecha_fin && formatearFecha(itemSeleccionado.fecha_fin))}
            {mostrarCampoSiExiste('Descripción', itemSeleccionado.descripcion)}
            {mostrarCampoSiExiste('Ubicación', itemSeleccionado.ubicacion)}
            {mostrarCampoSiExiste('Duración (horas)', itemSeleccionado.duracion)}
            {mostrarCampoSiExiste('Capacidad', itemSeleccionado.capacidad)}
            {mostrarCampoSiExiste('Categoría', itemSeleccionado.categoria)}
            {mostrarCampoSiExiste('Gratuito', itemSeleccionado.es_gratuito, true, itemSeleccionado.es_gratuito ? 'success' : 'warning')}
            {mostrarCampoSiExiste('Precio', itemSeleccionado.precio && `$${itemSeleccionado.precio}`)}
            
            {/* Información de inscripción */}
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Información de Inscripción</Typography>
            
            {mostrarCampoSiExiste('Fecha de inscripción', formatearFecha(itemSeleccionado.fecha_inscripcion))}
            {mostrarCampoSiExiste('Método de pago', itemSeleccionado.metodo_pago)}
            {mostrarCampoSiExiste('Estado de pago', itemSeleccionado.estado_pago, true, 
              itemSeleccionado.estado_pago === 'APROBADO' ? 'success' : 
              itemSeleccionado.estado_pago === 'RECHAZADO' ? 'error' : 'warning'
            )}
            {mostrarCampoSiExiste('Valor pagado', itemSeleccionado.valor_pagado && `$${itemSeleccionado.valor_pagado}`)}
            {mostrarCampoSiExiste('Comprobante enviado', itemSeleccionado.tiene_comprobante, true, itemSeleccionado.tiene_comprobante ? 'success' : 'default')}
            {mostrarCampoSiExiste('Fecha de aprobación', itemSeleccionado.fecha_aprobacion && formatearFecha(itemSeleccionado.fecha_aprobacion))}
            
            {/* Información de participación (si existe) */}
            {esParticipacion && (
              <>
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Información de Participación</Typography>
                
                {mostrarCampoSiExiste('Asistencia', `${itemSeleccionado.asi_par || itemSeleccionado.asistencia_porcentaje || 'N/A'}%`)}
                
                {tipo === 'curso' && mostrarCampoSiExiste('Nota final', `${itemSeleccionado.nota_final || 'N/A'}/100`)}
                
                {mostrarCampoSiExiste('Resultado', itemSeleccionado.aprobado ? 'APROBADO' : 'REPROBADO', true, 
                  itemSeleccionado.aprobado ? 'success' : 'error'
                )}
                
                {mostrarCampoSiExiste('Certificado disponible', itemSeleccionado.tiene_certificado_pdf, true, 
                  itemSeleccionado.tiene_certificado_pdf ? 'success' : 'default'
                )}
                
                {mostrarCampoSiExiste('Fecha de certificación', itemSeleccionado.fecha_certificacion && formatearFecha(itemSeleccionado.fecha_certificacion))}
              </>
            )}
            
            {/* Información adicional (cualquier otro campo que pueda tener) */}
            {Object.entries(itemSeleccionado).filter(([key, value]) => {
              // Filtrar campos que ya mostramos y campos técnicos/internos
              const camposYaMostrados = [
                'tipo', 'evento', 'curso', 'aprobado', 'estado_evento', 'estado_curso',
                'fecha_inscripcion', 'metodo_pago', 'estado_pago', 'es_gratuito', 'precio',
                'asi_par', 'asistencia_porcentaje', 'nota_final', 'tiene_certificado_pdf',
                'fecha_certificacion', 'usuario', 'id_par', 'id_par_cur', 'id_ins', 'id_ins_cur',
                'tiene_comprobante', 'valor_pagado', 'fecha_aprobacion', 'descripcion',
                'fecha_inicio', 'fecha_fin', 'ubicacion', 'duracion', 'capacidad', 'categoria'
              ];
              
              // No mostrar campos técnicos o que ya se mostraron
              return !camposYaMostrados.includes(key) && 
                     !key.startsWith('id_') && 
                     !key.startsWith('_') &&
                     value !== undefined && 
                     value !== null;
            }).length > 0 && (
              <>
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Información Adicional</Typography>
                
                {Object.entries(itemSeleccionado).filter(([key, value]) => {
                  const camposYaMostrados = [
                    'tipo', 'evento', 'curso', 'aprobado', 'estado_evento', 'estado_curso',
                    'fecha_inscripcion', 'metodo_pago', 'estado_pago', 'es_gratuito', 'precio',
                    'asi_par', 'asistencia_porcentaje', 'nota_final', 'tiene_certificado_pdf',
                    'fecha_certificacion', 'usuario', 'id_par', 'id_par_cur', 'id_ins', 'id_ins_cur',
                    'tiene_comprobante', 'valor_pagado', 'fecha_aprobacion', 'descripcion',
                    'fecha_inicio', 'fecha_fin', 'ubicacion', 'duracion', 'capacidad', 'categoria'
                  ];
                  
                  return !camposYaMostrados.includes(key) && 
                         !key.startsWith('id_') && 
                         !key.startsWith('_') &&
                         value !== undefined && 
                         value !== null;
                }).map(([key, value]) => (
                  <Typography key={key} variant="body1" gutterBottom>
                    <strong>{key.replace(/_/g, ' ').replace(/^[a-z]/, c => c.toUpperCase())}:</strong>{' '}
                    {typeof value === 'boolean' ? (value ? 'Sí' : 'No') : value.toString()}
                  </Typography>
                ))}
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCerrarDetalles}>Cerrar</Button>
          
          {esParticipacion && itemSeleccionado.aprobado && itemSeleccionado.tiene_certificado_pdf && (
            <Button 
              color="success" 
              variant="contained"
              onClick={() =>
                handleVisualizarCertificado(
                  tipo,
                  itemSeleccionado.id_participacion,
                  itemSeleccionado
                )
              }
              disabled={downloading === itemSeleccionado.id_participacion}
              startIcon={downloading === itemSeleccionado.id_participacion ? <CircularProgress size={16} /> : <VisibilityIcon />}
            >
              {downloading === itemSeleccionado.id_participacion ? 'Cargando...' : 'Ver certificado'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 'bold',
          textAlign: 'center',
          mb: 4,
          color: 'primary.main'
        }}
      >
        Mis Inscripciones y Certificados
      </Typography>

      {/* estadísticas arriba */}
      <Grid container spacing={2} justifyContent="center" mb={3}>
        <Grid item>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold">{inscripcionesTotales.length}</Typography>
            <Typography variant="body2" color="text.secondary">Total Inscripciones</Typography>
          </Paper>
        </Grid>
        <Grid item>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" color="success.main">{participacionesAprobadas.length}</Typography>
            <Typography variant="body2" color="text.secondary">Aprobadas</Typography>
          </Paper>
        </Grid>
        <Grid item>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" color="error.main">{participacionesReprobadas.length}</Typography>
            <Typography variant="body2" color="text.secondary">Reprobadas</Typography>
          </Paper>
        </Grid>
        <Grid item>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" color="info.main">{inscripcionesEnCurso}</Typography>
            <Typography variant="body2" color="text.secondary">En Curso</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* tabs */}
      <Tabs
        value={tabValue}
        onChange={(e, val) => setTabValue(val)}
        variant="fullWidth"
        centered
        sx={{ mb: 3 }}
      >
        {tabs.map((tab, idx) => (
          <Tab key={idx} label={tab.label} />
        ))}
      </Tabs>

      {/* tarjetas */}
      <Grid container spacing={3} justifyContent="center">
        {tabs[tabValue].data.length > 0 ? (
          tabs[tabValue].data.map((item) => (
            <Grid item key={item.id_par || item.id_par_cur || item.id_ins || item.id_ins_cur}>
              <CardInscripcion item={item} />
            </Grid>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary" mt={4}>
            No hay participaciones registradas en esta categoría
          </Typography>
        )}
      </Grid>

      {/* Diálogo de detalles */}
      <DetalleDialog />

      {/* Usar DocumentViewer para visualizar certificados */}
      <DocumentViewer
        open={pdfModalOpen}
        onClose={handleCerrarPdfModal}
        pdfUrl={pdfUrl}
        title="Certificado de Participación"
      />

      {error && (
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default MisCertificados;
