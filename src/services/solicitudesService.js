import api from './api';

// Opciones para los selectores
const OPCIONES_TIPO_CAMBIO = [
  { value: 'NUEVA_FUNCIONALIDAD', label: 'Nueva Funcionalidad', description: 'Agregar una característica completamente nueva' },
  { value: 'MEJORA_EXISTENTE', label: 'Mejora Existente', description: 'Mejorar una funcionalidad que ya existe' },
  { value: 'CORRECCION_ERROR', label: 'Corrección de Error', description: 'Solucionar un problema o bug' },
  { value: 'CAMBIO_INTERFAZ', label: 'Cambio de Interfaz', description: 'Modificar la interfaz de usuario' },
  { value: 'OPTIMIZACION', label: 'Optimización', description: 'Mejorar el rendimiento o eficiencia' },
  { value: 'ACTUALIZACION_DATOS', label: 'Actualización de Datos', description: 'Modificar o actualizar información' },
  { value: 'CAMBIO_SEGURIDAD', label: 'Cambio de Seguridad', description: 'Mejoras relacionadas con seguridad' },
  { value: 'MIGRACION_DATOS', label: 'Migración de Datos', description: 'Transferir o migrar información' },
  { value: 'INTEGRACION_EXTERNA', label: 'Integración Externa', description: 'Conectar con sistemas externos' },
  { value: 'OTRO', label: 'Otro', description: 'Otro tipo de cambio no especificado' }
];

const OPCIONES_PRIORIDAD = [
  { value: 'BAJA', label: 'Baja', color: '#4caf50', description: 'No es urgente, puede esperar' },
  { value: 'MEDIA', label: 'Media', color: '#ff9800', description: 'Prioridad normal' },
  { value: 'ALTA', label: 'Alta', color: '#f44336', description: 'Requiere atención pronto' },
  { value: 'CRITICA', label: 'Crítica', color: '#d32f2f', description: 'Muy importante, alta prioridad' },
  { value: 'URGENTE', label: 'Urgente', color: '#b71c1c', description: 'Máxima prioridad, inmediato' }
];

const OPCIONES_URGENCIA = [
  { value: 'BAJA', label: 'Baja', description: 'Puede esperar más de 30 días' },
  { value: 'NORMAL', label: 'Normal', description: 'Necesario en 2-4 semanas' },
  { value: 'ALTA', label: 'Alta', description: 'Necesario en 1-2 semanas' },
  { value: 'URGENTE', label: 'Urgente', description: 'Necesario esta semana' },
  { value: 'CRITICA', label: 'Crítica', description: 'Necesario inmediatamente' }
];

const OPCIONES_RIESGO = [
  { value: 'BAJO', label: 'Bajo', color: '#4caf50', description: 'Sin impacto significativo, fácil rollback' },
  { value: 'MEDIO', label: 'Medio', color: '#ff9800', description: 'Impacto limitado, rollback posible' },
  { value: 'ALTO', label: 'Alto', color: '#f44336', description: 'Impacto significativo, rollback complejo' },
  { value: 'CRITICO', label: 'Crítico', color: '#d32f2f', description: 'Alto impacto, rollback muy difícil' }
];

const OPCIONES_CATEGORIA = [
  { value: 'NORMAL', label: 'Normal', description: 'Cambio estándar con proceso normal' },
  { value: 'EXPEDITO', label: 'Expedito', description: 'Cambio urgente con proceso simplificado' },
  { value: 'EMERGENCIA', label: 'Emergencia', description: 'Cambio crítico que bypassa algunos controles' },
  { value: 'ESTANDAR', label: 'Estándar', description: 'Cambio pre-aprobado con bajo riesgo' }
];

const OPCIONES_ESTADO = [
  // Estados iniciales
  { value: 'BORRADOR', label: 'Borrador', color: '#9e9e9e' },
  { value: 'PENDIENTE', label: 'Pendiente', color: '#757575' },
  { value: 'EN_REVISION', label: 'En Revisión', color: '#2196f3' },
  
  // Estados de aprobación
  { value: 'PENDIENTE_APROBACION_TECNICA', label: 'Pend. Aprobación Técnica', color: '#ff9800' },
  { value: 'PENDIENTE_APROBACION_NEGOCIO', label: 'Pend. Aprobación Negocio', color: '#ff9800' },
  { value: 'APROBADA', label: 'Aprobada', color: '#4caf50' },
  
  // Estados de rechazo
  { value: 'RECHAZADA', label: 'Rechazada', color: '#f44336' },
  { value: 'CANCELADA', label: 'Cancelada', color: '#9e9e9e' },
  
  // Estados de implementación
  { value: 'EN_DESARROLLO', label: 'En Desarrollo', color: '#3f51b5' },
  { value: 'EN_TESTING', label: 'En Testing', color: '#9c27b0' },
  { value: 'EN_DESPLIEGUE', label: 'En Despliegue', color: '#ff5722' },
  
  // Estados finales
  { value: 'COMPLETADA', label: 'Completada', color: '#388e3c' },
  { value: 'FALLIDA', label: 'Fallida', color: '#d32f2f' },
  { value: 'CERRADA', label: 'Cerrada', color: '#424242' },
  
  // Estados especiales
  { value: 'EN_PAUSA', label: 'En Pausa', color: '#795548' },
  { value: 'ESPERANDO_INFORMACION', label: 'Esperando Información', color: '#ffc107' }
];

const solicitudesService = {
  // ========================================
  // FUNCIONES PARA USUARIOS
  // ========================================
  
  // Crear una nueva solicitud (usuarios)
  async crearSolicitud(datosFormulario) {
    try {
      const response = await api.post('/solicitudes-cambio/solicitud-nueva', datosFormulario);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al crear la solicitud');
    }
  },

  // Obtener las solicitudes del usuario autenticado
  async obtenerMisSolicitudes(filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filtros.estado) params.append('estado', filtros.estado);
      if (filtros.tipo_cambio) params.append('tipo_cambio', filtros.tipo_cambio);
      if (filtros.page) params.append('page', filtros.page);
      if (filtros.limit) params.append('limit', filtros.limit);

      const response = await api.get(`/solicitudes-cambio/mis-solicitudes?${params}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener las solicitudes');
    }
  },

  // Obtener una solicitud específica del usuario
  async obtenerMiSolicitud(id) {
    try {
      const response = await api.get(`/solicitudes-cambio/mis-solicitudes/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener la solicitud');
    }
  },

  // ========================================
  // FUNCIONES PARA ADMINISTRADORES
  // ========================================

  // Obtener todas las solicitudes (admin)
  async obtenerTodasLasSolicitudes(filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filtros.estado) params.append('estado', filtros.estado);
      if (filtros.tipo_cambio) params.append('tipo_cambio', filtros.tipo_cambio);
      if (filtros.prioridad) params.append('prioridad', filtros.prioridad);
      if (filtros.usuario) params.append('usuario', filtros.usuario);
      if (filtros.page) params.append('page', filtros.page);
      if (filtros.limit) params.append('limit', filtros.limit);

      const response = await api.get(`/solicitudes-cambio/admin/todas?${params}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener las solicitudes');
    }
  },

  // Obtener una solicitud específica (admin)
  async obtenerSolicitudAdmin(id) {
    try {
      const response = await api.get(`/solicitudes-cambio/admin/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener la solicitud');
    }
  },

  // Gestión técnica de una solicitud (admin)
  async gestionarSolicitudTecnica(id, datosGestion) {
    try {
      const response = await api.put(`/solicitudes-cambio/admin/${id}/gestion-tecnica`, datosGestion);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al gestionar la solicitud');
    }
  },

  // Responder a una solicitud (admin)
  async responderSolicitud(id, respuesta) {
    try {
      const response = await api.put(`/solicitudes-cambio/admin/${id}/responder`, respuesta);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al responder la solicitud');
    }
  },

  // Actualizar estado de una solicitud (admin)
  async actualizarEstado(id, nuevoEstado, comentarios = '') {
    try {
      const response = await api.put(`/solicitudes-cambio/admin/${id}/estado`, {
        estado_sol: nuevoEstado,
        comentarios_admin_sol: comentarios
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al actualizar el estado');
    }
  },

  // Obtener estadísticas (admin)
  async obtenerEstadisticas() {
    try {
      const response = await api.get('/solicitudes-cambio/admin/estadisticas');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener estadísticas');
    }
  },

  // ========================================
  // FUNCIONES PARA DESARROLLADORES
  // ========================================

  // Obtener solicitudes asignadas a un desarrollador específico
  async getSolicitudesAsignadas(desarrolladorId) {
    try {
      const response = await api.get(`/solicitudes-cambio/desarrollador/${desarrolladorId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener las solicitudes asignadas');
    }
  },

  // Actualizar estado de una solicitud (para desarrolladores)
  async actualizarEstadoSolicitud(solicitudId, nuevoEstado) {
    try {
      const response = await api.post(`/solicitudes-cambio/${solicitudId}/estado`, {
        estado: nuevoEstado
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al actualizar el estado de la solicitud');
    }
  },

  // Asignar desarrollador a una solicitud (para admins)
  async asignarDesarrollador(solicitudId, desarrolladorId) {
    try {
      const response = await api.post(`/solicitudes-cambio/${solicitudId}/asignar-desarrollador`, {
        desarrolladorId
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al asignar desarrollador');
    }
  },

  // Obtener una solicitud específica (desarrollador)
  async obtenerSolicitudDesarrollador(id) {
    try {
      const response = await api.get(`/solicitudes-cambio/desarrollador/solicitud/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener la solicitud');
    }
  },

  // Agregar comentario de desarrollo
  async agregarComentarioDesarrollo(solicitudId, comentario) {
    try {
      const response = await api.post(`/solicitudes-cambio/${solicitudId}/comentario-desarrollo`, {
        comentario
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al agregar comentario');
    }
  },

  // Obtener desarrolladores disponibles (para admins)
  async obtenerDesarrolladoresDisponibles() {
    try {
      const response = await api.get('/solicitudes-cambio/admin/desarrolladores/disponibles');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener desarrolladores disponibles');
    }
  },

  // Enviar solicitud (BORRADOR → PENDIENTE)
  async enviarSolicitud(solicitudId) {
    try {
      const response = await api.put(`/solicitudes-cambio/${solicitudId}/enviar`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al enviar la solicitud');
    }
  },

  // Actualizar planes técnicos (para desarrolladores)
  async actualizarPlanesTecnicos(solicitudId, planes) {
    try {
      const response = await api.put(`/developer/solicitud/${solicitudId}/planes-tecnicos`, planes);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al actualizar los planes técnicos');
    }
  },

  // Eliminar solicitud (solo BORRADOR)
  async eliminarSolicitud(solicitudId) {
    try {
      const response = await api.delete(`/solicitudes-cambio/${solicitudId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al eliminar la solicitud');
    }
  },

  // ========================================
  // FUNCIONES DE UTILIDAD
  // ========================================

  // Obtener opciones para formularios
  getOpcionesTipoCambio: () => OPCIONES_TIPO_CAMBIO,
  getOpcionesPrioridad: () => OPCIONES_PRIORIDAD,
  getOpcionesUrgencia: () => OPCIONES_URGENCIA,
  getOpcionesRiesgo: () => OPCIONES_RIESGO,
  getOpcionesCategoria: () => OPCIONES_CATEGORIA,
  getOpcionesEstado: () => OPCIONES_ESTADO,

  // Obtener color por estado
  getColorPorEstado: (estado) => {
    const opcion = OPCIONES_ESTADO.find(opt => opt.value === estado);
    return opcion?.color || '#757575';
  },

  // Obtener color por prioridad
  getColorPorPrioridad: (prioridad) => {
    const opcion = OPCIONES_PRIORIDAD.find(opt => opt.value === prioridad);
    return opcion?.color || '#757575';
  },

  // Obtener color por riesgo
  getColorPorRiesgo: (riesgo) => {
    const opcion = OPCIONES_RIESGO.find(opt => opt.value === riesgo);
    return opcion?.color || '#757575';
  },

  // Formatear fecha
  formatearFecha: (fecha) => {
    if (!fecha) return 'No especificada';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  // Formatear fecha y hora
  formatearFechaHora: (fecha) => {
    if (!fecha) return 'No especificada';
    return new Date(fecha).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // Calcular días transcurridos
  calcularDiasTranscurridos: (fechaCreacion) => {
    const ahora = new Date();
    const creacion = new Date(fechaCreacion);
    const diferencia = ahora - creacion;
    return Math.floor(diferencia / (1000 * 60 * 60 * 24));
  },

  // Validar si puede editar solicitud
  puedeEditarSolicitud: (estado) => {
    return ['PENDIENTE', 'EN_REVISION', 'ESPERANDO_INFORMACION'].includes(estado);
  },

  // Obtener próximos estados posibles
  getProximosEstados: (estadoActual) => {
    const transiciones = {
      'PENDIENTE': ['EN_REVISION', 'RECHAZADA', 'CANCELADA'],
      'EN_REVISION': ['PENDIENTE_APROBACION_TECNICA', 'PENDIENTE_APROBACION_NEGOCIO', 'APROBADA', 'RECHAZADA', 'ESPERANDO_INFORMACION'],
      'PENDIENTE_APROBACION_TECNICA': ['APROBADA', 'RECHAZADA', 'ESPERANDO_INFORMACION'],
      'PENDIENTE_APROBACION_NEGOCIO': ['APROBADA', 'RECHAZADA', 'ESPERANDO_INFORMACION'],
      'APROBADA': ['EN_DESARROLLO', 'CANCELADA'],
      'EN_DESARROLLO': ['EN_TESTING', 'EN_PAUSA', 'FALLIDA'],
      'EN_TESTING': ['EN_DESPLIEGUE', 'EN_DESARROLLO', 'FALLIDA'],
      'EN_DESPLIEGUE': ['COMPLETADA', 'FALLIDA'],
      'ESPERANDO_INFORMACION': ['EN_REVISION', 'CANCELADA'],
      'EN_PAUSA': ['EN_DESARROLLO', 'CANCELADA']
    };

    return transiciones[estadoActual] || [];
  },

  // Validar si un estado requiere aprobación Master
  requiereAprobacionMaster: (estado) => {
    const estadosQueRequierenAprobacion = ['APROBADA', 'EN_DESARROLLO', 'EN_TESTING', 'EN_DESPLIEGUE', 'COMPLETADA'];
    return estadosQueRequierenAprobacion.includes(estado);
  },

  // Validar si puede proceder a un estado (verificando aprobación Master)
  puedeProcedeAEstado: (nuevoEstado, aprobadoPorMaster) => {
    if (solicitudesService.requiereAprobacionMaster(nuevoEstado)) {
      return aprobadoPorMaster === true;
    }
    return true;
  }
};

export default solicitudesService; 