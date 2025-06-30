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

  // Esta función ya no es necesaria con el nuevo flujo

  // ========================================
  // GESTIÓN DE ESTADOS DE DESARROLLO
  // ========================================

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

  // Actualizar estado de la solicitud con comentarios
  actualizarEstadoSolicitud: async (id, nuevoEstado, datos = {}) => {
    try {
      const response = await api.post(`/desarrollador/solicitud/${id}/estado`, {
        estado: nuevoEstado,
        ...datos
      });
      return response.data;
    } catch (error) {
      console.error('Error actualizando estado de la solicitud:', error);
      throw error;
    }
  },

  // ========================================
  // GESTIÓN DE RAMAS Y PULL REQUESTS
  // ========================================

  // Validar estado de solicitud para crear ramas
  validarEstadoParaRamas: async (idSolicitud) => {
    try {
      const response = await api.get(`/desarrollador/solicitud/${idSolicitud}/validar-estado`);
      return response.data;
    } catch (error) {
      console.error('Error validando estado para ramas:', error);
      throw error;
    }
  },

  // Crear rama para repositorio específico
  crearRama: async (idSolicitud, repositoryType, baseBranch = 'develop') => {
    try {
      const response = await api.post(`/desarrollador/solicitud/${idSolicitud}/crear-rama`, {
        repository_type: repositoryType,
        base_branch: baseBranch
      });
      return response.data;
    } catch (error) {
      console.error(`Error creando rama ${repositoryType}:`, error);
      throw error;
    }
  },

  // Obtener ramas disponibles de un repositorio
  obtenerRamasDisponibles: async (repositoryType) => {
    try {
      const response = await api.get(`/desarrollador/ramas-disponibles/${repositoryType}`);
      return response.data;
    } catch (error) {
      console.error(`Error obteniendo ramas disponibles de ${repositoryType}:`, error);
      throw error;
    }
  },

  // Obtener ramas de una solicitud
  obtenerRamas: async (idSolicitud) => {
    try {
      const response = await api.get(`/desarrollador/solicitud/${idSolicitud}/ramas`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo ramas:', error);
      throw error;
    }
  },

  // Crear Pull Request para repositorio específico
  crearPR: async (idSolicitud, repositoryType, targetBranch = 'develop') => {
    try {
      const response = await api.post(`/desarrollador/solicitud/${idSolicitud}/crear-pr`, {
        repository_type: repositoryType,
        target_branch: targetBranch
      });
      return response.data;
    } catch (error) {
      console.error(`Error creando PR ${repositoryType}:`, error);
      throw error;
    }
  },

  // Obtener estado de PRs de una solicitud
  obtenerEstadoPRs: async (idSolicitud) => {
    try {
      const response = await api.get(`/desarrollador/solicitud/${idSolicitud}/pull-requests/estado`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo estado de PRs:', error);
      throw error;
    }
  },

  // Verificar si puede enviar a testing
  verificarParaTesting: async (idSolicitud) => {
    try {
      const response = await api.get(`/desarrollador/solicitud/${idSolicitud}/testing/verificar`);
      return response.data;
    } catch (error) {
      console.error('Error verificando para testing:', error);
      throw error;
    }
  },

  // Enviar solicitud a testing
  enviarSolicitudATesting: async (idSolicitud) => {
    try {
      const response = await api.post(`/desarrollador/solicitud/${idSolicitud}/testing/enviar`);
      return response.data;
    } catch (error) {
      console.error('Error enviando a testing:', error);
      throw error;
    }
  },

  // Enviar solicitud a testing simple (solo cambio de estado)
  enviarSolicitudATestingSimple: async (idSolicitud) => {
    try {
      const response = await api.post(`/desarrollador/solicitud/${idSolicitud}/testing/enviar-simple`);
      return response.data;
    } catch (error) {
      console.error('Error enviando a testing simple:', error);
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
      { value: 'EN_DESARROLLO', label: 'En Desarrollo', color: '#2196f3' },
      { value: 'EN_TESTING', label: 'En Testing', color: '#9c27b0' },
      { value: 'COMPLETADA', label: 'Completada', color: '#8bc34a' },
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
      'APROBADA': ['EN_DESARROLLO'],
      'EN_DESARROLLO': ['EN_TESTING'],
      'EN_TESTING': ['COMPLETADA', 'FALLIDA'],
      'COMPLETADA': [],
      'FALLIDA': []
    };

    return transicionesPermitidas[estadoActual]?.includes(estadoDestino) || false;
  },

  // Obtener acciones disponibles para un estado
  obtenerAccionesDisponibles: (estado) => {
    const acciones = {
      'APROBADA': [
        { key: 'crear_ramas', label: 'Crear Ramas', icon: 'AccountTree', color: 'primary' }
      ],
      'EN_DESARROLLO': [
        { key: 'crear_prs', label: 'Crear Pull Requests', icon: 'CallMerge', color: 'info' },
        { key: 'enviar_testing', label: 'Enviar a Testing', icon: 'BugReport', color: 'warning' },
        { key: 'agregar_comentario', label: 'Agregar Comentario', icon: 'Comment' }
      ],
      'EN_TESTING': [
        { key: 'agregar_comentario', label: 'Agregar Comentario', icon: 'Comment' }
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
  },

  // Métodos para gestión de ramas de GitHub
  obtenerRamasSolicitud: async (solicitudId) => {
    return await api.get(`/github/solicitud/${solicitudId}/ramas`);
  },

  crearRamaSolicitud: async (solicitudId, tipo) => {
    return await api.post(`/github/dev/solicitud/${solicitudId}/crear-rama`, {
      repository_type: tipo
    });
  },

  crearPRSolicitud: async (solicitudId, tipo) => {
    return await api.post(`/github/dev/solicitud/${solicitudId}/crear-pr`, {
      repository_type: tipo
    });
  }
};

export default desarrolladorService; 