import api from './api';

const solicitudesService = {
  // ==================
  // FUNCIONES PARA USUARIOS
  // ==================

  // Crear una nueva solicitud de cambio
  async crearSolicitud(solicitudData) {
    try {
      const response = await api.post('/solicitudes-cambio/solicitud-nueva', solicitudData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Error al crear la solicitud';
      throw new Error(message);
    }
  },

  // Obtener las solicitudes del usuario autenticado
  async obtenerMisSolicitudes(filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      // Solo agregar parámetros que no estén vacíos
      if (filtros.estado && filtros.estado !== '') params.append('estado', filtros.estado);
      if (filtros.tipo_cambio && filtros.tipo_cambio !== '') params.append('tipo_cambio', filtros.tipo_cambio);
      if (filtros.page) params.append('page', filtros.page);
      if (filtros.limit) params.append('limit', filtros.limit);

      const response = await api.get(`/solicitudes-cambio/mis-solicitudes?${params}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Error al obtener las solicitudes';
      throw new Error(message);
    }
  },

  // Obtener una solicitud específica del usuario
  async obtenerMiSolicitud(id) {
    try {
      const response = await api.get(`/solicitudes-cambio/mis-solicitudes/${id}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Error al obtener la solicitud';
      throw new Error(message);
    }
  },

  // ==================
  // FUNCIONES PARA ADMINISTRADORES
  // ==================

  // Obtener todas las solicitudes (solo administradores)
  async obtenerTodasLasSolicitudes(filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      // Solo agregar parámetros que no estén vacíos
      if (filtros.estado && filtros.estado !== '') params.append('estado', filtros.estado);
      if (filtros.tipo_cambio && filtros.tipo_cambio !== '') params.append('tipo_cambio', filtros.tipo_cambio);
      if (filtros.prioridad && filtros.prioridad !== '') params.append('prioridad', filtros.prioridad);
      if (filtros.page) params.append('page', filtros.page);
      if (filtros.limit) params.append('limit', filtros.limit);

      const response = await api.get(`/solicitudes-cambio/admin/todas?${params}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Error al obtener las solicitudes';
      throw new Error(message);
    }
  },

  // Responder a una solicitud (aprobar/rechazar)
  async responderSolicitud(id, respuesta) {
    try {
      const response = await api.put(`/solicitudes-cambio/admin/${id}/responder`, respuesta);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Error al responder la solicitud';
      throw new Error(message);
    }
  },

  // Actualizar el estado de una solicitud
  async actualizarEstadoSolicitud(id, estado) {
    try {
      const response = await api.put(`/solicitudes-cambio/admin/${id}/estado`, { estado_sol: estado });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Error al actualizar el estado';
      throw new Error(message);
    }
  },

  // Obtener estadísticas de solicitudes
  async obtenerEstadisticas() {
    try {
      const response = await api.get('/solicitudes-cambio/admin/estadisticas');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Error al obtener las estadísticas';
      throw new Error(message);
    }
  },

  // Obtener solicitud específica por ID (admin)
  async obtenerSolicitudAdmin(id) {
    try {
      const response = await api.get(`/solicitudes-cambio/admin/${id}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Error al obtener la solicitud';
      throw new Error(message);
    }
  },

  // Editar una solicitud (admin)
  async editarSolicitud(id, datos) {
    try {
      console.log('Datos id: '+id);
      const response = await api.put(`/solicitudes-cambio/admin/${id}/editar`, datos);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Error al editar la solicitud';
      throw new Error(message);
    }
  },

  // ==================
  // UTILIDADES
  // ==================

  // Obtener las opciones disponibles para los formularios
  getOpcionesTipoCambio() {
    return [
      { value: 'FUNCIONALIDAD_NUEVA', label: 'Nueva Funcionalidad' },
      { value: 'MEJORA_EXISTENTE', label: 'Mejora Existente' },
      { value: 'CORRECCION_ERROR', label: 'Corrección de Error' },
      { value: 'CAMBIO_INTERFAZ', label: 'Cambio de Interfaz' },
      { value: 'OPTIMIZACION', label: 'Optimización' },
      { value: 'OTRO', label: 'Otro' }
    ];
  },

  getOpcionesPrioridad() {
    return [
      { value: 'BAJA', label: 'Baja', color: '#10b981' },
      { value: 'MEDIA', label: 'Media', color: '#f59e0b' },
      { value: 'ALTA', label: 'Alta', color: '#ef4444' },
      { value: 'CRITICA', label: 'Crítica', color: '#dc2626' }
    ];
  },

  getOpcionesEstado() {
    return [
      { value: 'PENDIENTE', label: 'Pendiente', color: '#6b7280' },
      { value: 'EN_REVISION', label: 'En Revisión', color: '#3b82f6' },
      { value: 'APROBADA', label: 'Aprobada', color: '#10b981' },
      { value: 'RECHAZADA', label: 'Rechazada', color: '#ef4444' },
      { value: 'EN_DESARROLLO', label: 'En Desarrollo', color: '#8b5cf6' },
      { value: 'COMPLETADA', label: 'Completada', color: '#059669' }
    ];
  },

  // Obtener color para un estado específico
  getColorEstado(estado) {
    const opciones = this.getOpcionesEstado();
    const opcion = opciones.find(o => o.value === estado);
    return opcion ? opcion.color : '#6b7280';
  },

  // Obtener color para una prioridad específica
  getColorPrioridad(prioridad) {
    const opciones = this.getOpcionesPrioridad();
    const opcion = opciones.find(o => o.value === prioridad);
    return opcion ? opcion.color : '#6b7280';
  },

  // Formatear fecha para mostrar
  formatearFecha(fecha) {
    if (!fecha) return 'No especificada';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

export default solicitudesService; 