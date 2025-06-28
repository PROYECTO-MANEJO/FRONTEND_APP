import api from './api';

const desarrolladorService = {
  // Base URL para las APIs del desarrollador
  BASE_URL: '/desarrollador',

  // ========================================
  // OBTENER SOLICITUDES Y DETALLES
  // ========================================
  
  // Obtener solicitudes asignadas al desarrollador autenticado
  obtenerSolicitudesAsignadas: async (desarrolladorId, filtros = {}) => {
    try {
      // Construir query string para filtros
      const queryParams = new URLSearchParams();
      Object.keys(filtros).forEach(key => {
        if (filtros[key] !== undefined && filtros[key] !== '') {
          queryParams.append(key, filtros[key]);
        }
      });
      const queryString = queryParams.toString();
      
      const url = `/desarrollador/solicitudes/${desarrolladorId}${queryString ? `?${queryString}` : ''}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo solicitudes asignadas:', error);
      throw error;
    }
  },

  // Obtener una solicitud específica
  obtenerSolicitudEspecifica: async (id) => {
    try {
      const response = await api.get(`/desarrollador/solicitud/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo solicitud específica:', error);
      throw error;
    }
  },

  // Obtener estadísticas del desarrollador
  obtenerEstadisticas: async (desarrolladorId) => {
    try {
      const response = await api.get(`/desarrollador/estadisticas/${desarrolladorId}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  },

  // ========================================
  // GESTIÓN DE PLANES TÉCNICOS
  // ========================================

  // Actualizar planes técnicos
  actualizarPlanesTecnicos: async (id, planes) => {
    try {
      const response = await api.put(`/desarrollador/solicitud/${id}/planes-tecnicos`, planes);
      return response.data;
    } catch (error) {
      console.error('Error actualizando planes técnicos:', error);
      throw error;
    }
  },

  // Enviar planes a revisión del MASTER
  enviarPlanesARevision: async (id) => {
    try {
      const response = await api.post(`/desarrollador/solicitud/${id}/enviar-planes`);
      return response.data;
    } catch (error) {
      console.error('Error enviando planes a revisión:', error);
      throw error;
    }
  },

  // ========================================
  // GESTIÓN DE ESTADOS DE DESARROLLO
  // ========================================

  // Iniciar desarrollo (LISTO_PARA_IMPLEMENTAR → EN_DESARROLLO)
  iniciarDesarrollo: async (id) => {
    try {
      const response = await api.post(`/desarrollador/solicitud/${id}/iniciar-desarrollo`);
      return response.data;
    } catch (error) {
      console.error('Error iniciando desarrollo:', error);
      throw error;
    }
  },

  // Pasar a testing (EN_DESARROLLO → EN_TESTING)
  pasarATesting: async (id, comentarios = '') => {
    try {
      const response = await api.post(`/desarrollador/solicitud/${id}/pasar-testing`, {
        comentarios: comentarios
      });
      return response.data;
    } catch (error) {
      console.error('Error pasando a testing:', error);
      throw error;
    }
  },

  // Pasar a despliegue (EN_TESTING → EN_DESPLIEGUE)
  pasarADespliegue: async (id, comentarios = '') => {
    try {
      const response = await api.post(`/desarrollador/solicitud/${id}/pasar-despliegue`, {
        comentarios: comentarios
      });
      return response.data;
    } catch (error) {
      console.error('Error pasando a despliegue:', error);
      throw error;
    }
  },

  // Completar solicitud (EN_DESPLIEGUE → COMPLETADA/FALLIDA)
  completarSolicitud: async (id, datos) => {
    try {
      const response = await api.post(`/desarrollador/solicitud/${id}/completar`, {
        exito_implementacion: datos.exito_implementacion,
        comentarios_tecnicos_sol: datos.comentarios_tecnicos_sol,
        tiempo_real_horas_sol: datos.tiempo_real_horas_sol
      });
      return response.data;
    } catch (error) {
      console.error('Error completando solicitud:', error);
      throw error;
    }
  },

  // Actualizar estado general (método genérico)
  actualizarEstado: async (id, nuevoEstado, comentarios = '') => {
    try {
      const response = await api.post(`/desarrollador/solicitud/${id}/estado`, {
        estado: nuevoEstado,
        comentarios: comentarios
      });
      return response.data;
    } catch (error) {
      console.error('Error actualizando estado:', error);
      throw error;
    }
  },

  // Agregar comentario de desarrollo
  agregarComentario: async (id, comentario) => {
    try {
      const response = await api.post(`/desarrollador/solicitud/${id}/comentario`, {
        comentarios_tecnicos_sol: comentario
      });
      return response.data;
    } catch (error) {
      console.error('Error agregando comentario:', error);
      throw error;
    }
  },

  // Enviar a testing con comentarios
  enviarATesting: async (id, comentarios) => {
    try {
      const response = await api.post(`/desarrollador/solicitud/${id}/enviar-testing`, {
        comentarios_tecnicos_sol: comentarios
      });
      return response.data;
    } catch (error) {
      console.error('Error enviando a testing:', error);
      throw error;
    }
  },

  // ========================================
  // UTILIDADES Y HELPERS
  // ========================================

  // Obtener estados disponibles para desarrollador
  obtenerEstadosDesarrollador: () => {
    return [
      { value: 'APROBADA', label: 'Aprobada', color: '#4caf50' },
      { value: 'PLANES_PENDIENTES_APROBACION', label: 'Planes en Revisión', color: '#ff9800' },
      { value: 'LISTO_PARA_IMPLEMENTAR', label: 'Listo para Implementar', color: '#2196f3' },
      { value: 'EN_DESARROLLO', label: 'En Desarrollo', color: '#9c27b0' },
      { value: 'EN_TESTING', label: 'En Testing', color: '#ff5722' },
      { value: 'EN_DESPLIEGUE', label: 'En Despliegue', color: '#795548' },
      { value: 'COMPLETADA', label: 'Completada', color: '#4caf50' },
      { value: 'FALLIDA', label: 'Fallida', color: '#f44336' }
    ];
  },

  // Obtener información del estado
  obtenerInfoEstado: (estado) => {
    const estados = desarrolladorService.obtenerEstadosDesarrollador();
    return estados.find(e => e.value === estado) || { 
      value: estado, 
      label: 'Desconocido', 
      color: '#9e9e9e' 
    };
  },

  // Verificar si se puede cambiar de estado
  puedeTransicionarA: (estadoActual, estadoDestino) => {
    const transicionesPermitidas = {
      'APROBADA': ['PLANES_PENDIENTES_APROBACION'],
      'PLANES_PENDIENTES_APROBACION': [], // Solo el MASTER puede cambiar desde aquí
      'LISTO_PARA_IMPLEMENTAR': ['EN_DESARROLLO'],
      'EN_DESARROLLO': ['EN_TESTING'],
      'EN_TESTING': ['EN_DESPLIEGUE'],
      'EN_DESPLIEGUE': ['COMPLETADA', 'FALLIDA'],
      'COMPLETADA': [],
      'FALLIDA': []
    };

    return transicionesPermitidas[estadoActual]?.includes(estadoDestino) || false;
  },

  // Obtener acciones disponibles para un estado
  obtenerAccionesDisponibles: (estado) => {
    const acciones = {
      'APROBADA': [
        { key: 'crear_planes', label: 'Crear Planes Técnicos', icon: 'EditNote' }
      ],
      'PLANES_PENDIENTES_APROBACION': [
        { key: 'esperar', label: 'Esperando Aprobación del MASTER', icon: 'HourglassEmpty', disabled: true }
      ],
      'LISTO_PARA_IMPLEMENTAR': [
        { key: 'iniciar_desarrollo', label: 'Iniciar Desarrollo', icon: 'PlayArrow', color: 'primary' }
      ],
      'EN_DESARROLLO': [
        { key: 'pasar_testing', label: 'Pasar a Testing', icon: 'BugReport', color: 'warning' },
        { key: 'agregar_comentario', label: 'Agregar Comentario', icon: 'Comment' }
      ],
      'EN_TESTING': [
        { key: 'pasar_despliegue', label: 'Pasar a Despliegue', icon: 'Rocket', color: 'info' },
        { key: 'agregar_comentario', label: 'Agregar Comentario', icon: 'Comment' }
      ],
      'EN_DESPLIEGUE': [
        { key: 'completar_exitoso', label: 'Marcar como Completada', icon: 'CheckCircle', color: 'success' },
        { key: 'completar_fallido', label: 'Marcar como Fallida', icon: 'Error', color: 'error' }
      ],
      'COMPLETADA': [
        { key: 'ver_resumen', label: 'Ver Resumen', icon: 'Summarize' }
      ],
      'FALLIDA': [
        { key: 'ver_analisis', label: 'Ver Análisis de Falla', icon: 'Analytics' }
      ]
    };

    return acciones[estado] || [];
  },

  // Validar que los planes técnicos estén completos
  validarPlanesCompletos: (planes) => {
    const requeridos = ['plan_implementacion_sol', 'plan_rollout_sol', 'plan_backout_sol', 'plan_testing_sol'];
    const faltantes = requeridos.filter(campo => !planes[campo] || planes[campo].trim() === '');
    
    return {
      valido: faltantes.length === 0,
      faltantes: faltantes,
      mensaje: faltantes.length > 0 ? 
        `Faltan completar: ${faltantes.map(f => f.replace('_sol', '').replace('plan_', '')).join(', ')}` : 
        'Todos los planes están completos'
    };
  }
};

export default desarrolladorService; 