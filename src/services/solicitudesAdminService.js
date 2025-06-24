import api from './api';

// URL base para las API de admin
const ADMIN_SOLICITUDES_API_URL = '/solicitudes-cambio/admin';

// ========================================
// FUNCIONES PARA ADMIN MASTER
// ========================================

/**
 * Obtener todas las solicitudes (para admin/master) con filtros
 */
export const obtenerTodasLasSolicitudes = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    
    // Agregar filtros a los parámetros
    Object.keys(filtros).forEach(key => {
      if (filtros[key] !== undefined && filtros[key] !== null && filtros[key] !== '') {
        params.append(key, filtros[key]);
      }
    });

    const response = await api.get(`${ADMIN_SOLICITUDES_API_URL}/todas?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener todas las solicitudes:', error);
    throw error;
  }
};

/**
 * Obtener una solicitud específica (para admin/master)
 */
export const obtenerSolicitudParaAdmin = async (id) => {
  try {
    const response = await api.get(`${ADMIN_SOLICITUDES_API_URL}/solicitud/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener solicitud para admin:', error);
    throw error;
  }
};

/**
 * Actualizar solicitud con campos de admin/master
 */
export const actualizarSolicitudMaster = async (id, datos) => {
  try {
    const response = await api.put(`${ADMIN_SOLICITUDES_API_URL}/${id}/actualizar`, datos);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar solicitud master:', error);
    throw error;
  }
};

/**
 * Poner solicitud en revisión (PENDIENTE → EN_REVISION)
 */
export const ponerEnRevision = async (id) => {
  try {
    const response = await api.put(`${ADMIN_SOLICITUDES_API_URL}/${id}/poner-revision`);
    return response.data;
  } catch (error) {
    console.error('Error al poner en revisión:', error);
    throw error;
  }
};

/**
 * Aprobar solicitud (EN_REVISION → APROBADA)
 */
export const aprobarSolicitud = async (id, comentarios = '') => {
  try {
    const datos = comentarios ? { comentarios_admin_sol: comentarios } : {};
    const response = await api.put(`${ADMIN_SOLICITUDES_API_URL}/${id}/aprobar`, datos);
    return response.data;
  } catch (error) {
    console.error('Error al aprobar solicitud:', error);
    throw error;
  }
};

/**
 * Rechazar solicitud (EN_REVISION → RECHAZADA)
 */
export const rechazarSolicitud = async (id, comentarios = '', motivoRechazo = '') => {
  try {
    const datos = {};
    if (comentarios) datos.comentarios_admin_sol = comentarios;
    if (motivoRechazo) datos.motivo_rechazo = motivoRechazo;
    
    const response = await api.put(`${ADMIN_SOLICITUDES_API_URL}/${id}/rechazar`, datos);
    return response.data;
  } catch (error) {
    console.error('Error al rechazar solicitud:', error);
    throw error;
  }
};



/**
 * Obtener estadísticas generales (para admin/master)
 */
export const obtenerEstadisticasAdmin = async () => {
  try {
    const response = await api.get(`${ADMIN_SOLICITUDES_API_URL}/estadisticas`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener estadísticas admin:', error);
    throw error;
  }
};

/**
 * Obtener desarrolladores disponibles (para admin/master)
 */
export const obtenerDesarrolladores = async () => {
  try {
    const response = await api.get(`${ADMIN_SOLICITUDES_API_URL}/desarrolladores`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener desarrolladores:', error);
    throw error;
  }
};

// ========================================
// FUNCIONES HELPER
// ========================================

/**
 * Obtener opciones para impactos y riesgos
 */
export const obtenerOpcionesImpactosRiesgos = () => {
  return [
    { value: 'BAJO', label: 'Bajo' },
    { value: 'MEDIO', label: 'Medio' },
    { value: 'ALTO', label: 'Alto' },
    { value: 'CRITICO', label: 'Crítico' }
  ];
};

/**
 * Obtener opciones para categorías de cambio
 */
export const obtenerCategoriasCambio = () => {
  return [
    { value: 'NORMAL', label: 'Normal' },
    { value: 'EXPEDITO', label: 'Expedito' },
    { value: 'EMERGENCIA', label: 'Emergencia' },
    { value: 'ESTANDAR', label: 'Estándar' }
  ];
};

/**
 * Validar si admin puede realizar acción en solicitud
 */
export const puedeAdminActuar = (estado, accion) => {
  const reglas = {
    'poner_revision': ['PENDIENTE'],
    'actualizar': ['PENDIENTE', 'EN_REVISION', 'APROBADA'],
    'aprobar': ['EN_REVISION'],
    'rechazar': ['EN_REVISION']
  };
  
  return reglas[accion]?.includes(estado) || false;
};

/**
 * Obtener información de estado para mostrar en UI
 */
export const getEstadoInfoAdmin = (estado) => {
  const estadosInfo = {
    'BORRADOR': { color: '#9e9e9e', label: 'Borrador' },
    'PENDIENTE': { color: '#b91c1c', label: 'Pendiente' },
    'EN_REVISION': { color: '#dc2626', label: 'En Revisión' },
    'APROBADA': { color: '#991b1b', label: 'Aprobada' },
    'RECHAZADA': { color: '#ef4444', label: 'Rechazada' },
    'CANCELADA': { color: '#6b7280', label: 'Cancelada' },
    'EN_DESARROLLO': { color: '#7c2d12', label: 'En Desarrollo' },
    'PLANES_PENDIENTES_APROBACION': { color: '#ea580c', label: 'Planes Pendientes' },
    'LISTO_PARA_IMPLEMENTAR': { color: '#6d1313', label: 'Listo para Implementar' },
    'EN_TESTING': { color: '#f97316', label: 'En Testing' },
    'EN_DESPLIEGUE': { color: '#be185d', label: 'En Despliegue' },
    'COMPLETADA': { color: '#059669', label: 'Completada' },
    'FALLIDA': { color: '#dc2626', label: 'Fallida' }
  };
  
  return estadosInfo[estado] || { color: '#9e9e9e', label: 'Desconocido' };
};

/**
 * Obtener prioridad del estado para ordenamiento
 */
export const getPrioridadEstado = (estado) => {
  const prioridades = {
    'PENDIENTE': 1,
    'EN_REVISION': 2,
    'PLANES_PENDIENTES_APROBACION': 3,
    'APROBADA': 4,
    'EN_DESARROLLO': 5,
    'LISTO_PARA_IMPLEMENTAR': 6,
    'EN_TESTING': 7,
    'EN_DESPLIEGUE': 8,
    'BORRADOR': 9,
    'COMPLETADA': 10,
    'RECHAZADA': 11,
    'CANCELADA': 12,
    'FALLIDA': 13
  };
  
  return prioridades[estado] || 999;
};

// Función para obtener color de prioridad con paleta roja
export const getPrioridadColor = (prioridad) => {
  const colores = {
    'BAJA': '#9e9e9e',
    'MEDIA': '#b91c1c',
    'ALTA': '#dc2626',
    'CRITICA': '#ef4444',
    'URGENTE': '#f87171'
  };
  return colores[prioridad] || '#9e9e9e';
};

const solicitudesAdminService = {
  obtenerTodasLasSolicitudes,
  obtenerSolicitudParaAdmin,
  actualizarSolicitudMaster,
  ponerEnRevision,
  aprobarSolicitud,
  rechazarSolicitud,
  obtenerEstadisticasAdmin,
  obtenerDesarrolladores,
  obtenerOpcionesImpactosRiesgos,
  obtenerCategoriasCambio,
  puedeAdminActuar,
  getEstadoInfoAdmin,
  getPrioridadEstado,
  getPrioridadColor
};

export default solicitudesAdminService; 