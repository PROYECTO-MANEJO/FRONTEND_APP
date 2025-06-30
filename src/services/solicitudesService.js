import api from './api';
import { Edit, Schedule, Assignment, CheckCircle, Cancel, Build, Help } from '@mui/icons-material';

const SOLICITUDES_API_URL = '/solicitudes-cambio';

// Opciones para los tipos de cambio
const TIPOS_CAMBIO = [
  { value: 'NUEVA_FUNCIONALIDAD', label: 'Nueva Funcionalidad' },
  { value: 'MEJORA_EXISTENTE', label: 'Mejora de Funcionalidad Existente' },
  { value: 'CORRECCION_ERROR', label: 'Corrección de Error' },
  { value: 'CAMBIO_INTERFAZ', label: 'Cambio de Interfaz de Usuario' },
  { value: 'OPTIMIZACION', label: 'Optimización de Rendimiento' },
  { value: 'ACTUALIZACION_DATOS', label: 'Actualización de Datos' },
  { value: 'CAMBIO_SEGURIDAD', label: 'Cambio de Seguridad' },
  { value: 'INTEGRACION_EXTERNA', label: 'Integración Externa' },
  { value: 'OTRO', label: 'Otro' }
];

// Estados posibles de las solicitudes
const ESTADOS_SOLICITUD = [
  { value: 'BORRADOR', label: 'Borrador', color: '#9e9e9e' },
  { value: 'PENDIENTE', label: 'Pendiente', color: '#ff9800' },
  { value: 'EN_REVISION', label: 'En Revisión', color: '#2196f3' },
  { value: 'APROBADA', label: 'Aprobada', color: '#4caf50' },
  { value: 'RECHAZADA', label: 'Rechazada', color: '#f44336' },
  { value: 'CANCELADA', label: 'Cancelada', color: '#9e9e9e' },
  { value: 'EN_DESARROLLO', label: 'En Desarrollo', color: '#3f51b5' },
  { value: 'EN_TESTING', label: 'En Testing', color: '#9c27b0' },
  { value: 'EN_DESPLIEGUE', label: 'En Despliegue', color: '#ff5722' },
  { value: 'COMPLETADA', label: 'Completada', color: '#388e3c' },
  { value: 'FALLIDA', label: 'Fallida', color: '#d32f2f' },
  { value: 'CERRADA', label: 'Cerrada', color: '#424242' }
];

  // ========================================
// FUNCIONES PARA USUARIOS ÚNICAMENTE
  // ========================================
  
// Crear una nueva solicitud de cambio
export const crearSolicitud = async (datosSolicitud) => {
  try {
    console.log('📝 Creando solicitud:', datosSolicitud);
    
    const response = await api.post(`${SOLICITUDES_API_URL}/solicitud-nueva`, datosSolicitud);
    
    console.log('✅ Solicitud creada exitosamente:', response.data);
      return response.data;
    } catch (error) {
    console.error('❌ Error al crear solicitud:', error);
    throw error;
    }
};

// Obtener todas las solicitudes del usuario autenticado
export const obtenerMisSolicitudes = async (filtros = {}) => {
    try {
    console.log('📋 Obteniendo mis solicitudes con filtros:', filtros);
    
      const params = new URLSearchParams();
      
    // Agregar filtros opcionales
      if (filtros.estado) params.append('estado', filtros.estado);
      if (filtros.tipo_cambio) params.append('tipo_cambio', filtros.tipo_cambio);
      if (filtros.page) params.append('page', filtros.page);
      if (filtros.limit) params.append('limit', filtros.limit);

    const response = await api.get(`${SOLICITUDES_API_URL}/mis-solicitudes?${params}`);
    
    console.log('✅ Solicitudes obtenidas:', response.data);
      return response.data;
    } catch (error) {
    console.error('❌ Error al obtener solicitudes:', error);
    throw error;
  }
};

// Obtener una solicitud específica del usuario autenticado
export const obtenerMiSolicitud = async (id) => {
  try {
    console.log('📄 Obteniendo solicitud:', id);
    
    const response = await api.get(`${SOLICITUDES_API_URL}/mis-solicitudes/${id}`);
    
    console.log('✅ Solicitud obtenida:', response.data);
      return response.data;
    } catch (error) {
    console.error('❌ Error al obtener solicitud:', error);
    throw error;
  }
};

// Editar solicitud (solo en estado BORRADOR)
export const editarSolicitud = async (id, datosSolicitud) => {
  try {
    console.log('✏️ Editando solicitud:', id, datosSolicitud);
    
    const response = await api.put(`${SOLICITUDES_API_URL}/${id}/editar`, datosSolicitud);
    
    console.log('✅ Solicitud editada exitosamente:', response.data);
      return response.data;
    } catch (error) {
    console.error('❌ Error al editar solicitud:', error);
    throw error;
  }
};

// Enviar solicitud (BORRADOR → PENDIENTE)
export const enviarSolicitud = async (id) => {
  try {
    console.log('📤 Enviando solicitud:', id);
    
    const response = await api.put(`${SOLICITUDES_API_URL}/${id}/enviar`);
    
    console.log('✅ Solicitud enviada exitosamente:', response.data);
      return response.data;
    } catch (error) {
    console.error('❌ Error al enviar solicitud:', error);
    throw error;
  }
};

// Cancelar solicitud (solo en estado BORRADOR)
export const cancelarSolicitud = async (id) => {
  try {
    console.log('❌ Cancelando solicitud:', id);
    
    const response = await api.put(`${SOLICITUDES_API_URL}/${id}/cancelar`);
    
    console.log('✅ Solicitud cancelada exitosamente:', response.data);
      return response.data;
    } catch (error) {
    console.error('❌ Error al cancelar solicitud:', error);
    throw error;
  }
};

// Obtener estadísticas del usuario
export const obtenerEstadisticasUsuario = async () => {
  try {
    console.log('📊 Obteniendo estadísticas del usuario');
    
    const response = await api.get(`${SOLICITUDES_API_URL}/mis-estadisticas`);
    
    console.log('✅ Estadísticas obtenidas:', response.data);
      return response.data;
    } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error);
    throw error;
  }
};

// ========================================
// FUNCIONES AUXILIARES
// ========================================

// Validar si una solicitud puede ser editada por el usuario
export const puedeEditarSolicitud = (solicitud) => {
  return solicitud && solicitud.estado_sol === 'BORRADOR';
};

// Validar si una solicitud puede ser cancelada por el usuario
export const puedeCancelarSolicitud = (solicitud) => {
  return solicitud && solicitud.estado_sol === 'BORRADOR';
};

// Validar si una solicitud puede ser enviada por el usuario
export const puedeEnviarSolicitud = (solicitud) => {
  return solicitud && solicitud.estado_sol === 'BORRADOR';
};

// Obtener texto descriptivo del estado para mostrar al usuario
export const obtenerTextoEstado = (estado) => {
  const estados = {
    'BORRADOR': 'Borrador',
    'PENDIENTE': 'Pendiente de revisión',
    'EN_REVISION': 'En revisión',
    'APROBADA': 'Aprobada',
    'RECHAZADA': 'Rechazada',
    'CANCELADA': 'Cancelada',
    'EN_DESARROLLO': 'En desarrollo',
    'PLANES_PENDIENTES_APROBACION': 'Planes pendientes de aprobación',
    'LISTO_PARA_IMPLEMENTAR': 'Listo para implementar',
    'EN_TESTING': 'En pruebas',
    'EN_DESPLIEGUE': 'En despliegue',
    'COMPLETADA': 'Completada',
    'FALLIDA': 'Fallida'
  };
  
  return estados[estado] || estado;
};

// Obtener color del estado para mostrar en la UI (Material-UI colors)
export const obtenerColorEstado = (estado) => {
  const colores = {
    'BORRADOR': 'warning',
    'PENDIENTE': 'info',
    'EN_REVISION': 'primary',
    'APROBADA': 'success',
    'RECHAZADA': 'error',
    'CANCELADA': 'default',
    'EN_DESARROLLO': 'primary',
    'PLANES_PENDIENTES_APROBACION': 'warning',
    'LISTO_PARA_IMPLEMENTAR': 'info',
    'EN_TESTING': 'primary',
    'EN_DESPLIEGUE': 'primary',
    'COMPLETADA': 'success',
    'FALLIDA': 'error'
  };
  
  return colores[estado] || 'default';
};

// Función para obtener información de estado con colores distintivos
export const getEstadoInfo = (estado) => {
  const estadosInfo = {
    'BORRADOR': { color: '#9e9e9e', icon: Edit, label: 'Borrador' },
    'PENDIENTE': { color: '#ff9800', icon: Schedule, label: 'Pendiente' },
    'EN_REVISION': { color: '#2196f3', icon: Assignment, label: 'En Revisión' },
    'APROBADA': { color: '#4caf50', icon: CheckCircle, label: 'Aprobada' },
    'RECHAZADA': { color: '#f44336', icon: Cancel, label: 'Rechazada' },
    'CANCELADA': { color: '#6b7280', icon: Cancel, label: 'Cancelada' },
    'EN_DESARROLLO': { color: '#9c27b0', icon: Build, label: 'En Desarrollo' },
    'PLANES_PENDIENTES_APROBACION': { color: '#ff5722', icon: Schedule, label: 'Planes Pendientes' },
    'LISTO_PARA_IMPLEMENTAR': { color: '#00bcd4', icon: Assignment, label: 'Listo para Implementar' },
    'EN_TESTING': { color: '#ffc107', icon: Assignment, label: 'En Testing' },
    'EN_DESPLIEGUE': { color: '#e91e63', icon: Build, label: 'En Despliegue' },
    'COMPLETADA': { color: '#4caf50', icon: CheckCircle, label: 'Completada' },
    'FALLIDA': { color: '#f44336', icon: Cancel, label: 'Fallida' }
  };
  
  return estadosInfo[estado] || { color: '#9e9e9e', icon: Help, label: 'Desconocido' };
};

// Función para obtener color de prioridad con paleta distintiva
export const getPrioridadColor = (prioridad) => {
  const colores = {
    'BAJA': '#4caf50',
    'MEDIA': '#2196f3',
    'ALTA': '#ff9800',
    'CRITICA': '#d32f2f',
    'URGENTE': '#f44336'
  };
  return colores[prioridad] || '#9e9e9e';
};

// Obtener opciones de tipo de cambio para formularios
export const obtenerTiposCambio = () => [
  { value: 'NUEVA_FUNCIONALIDAD', label: 'Nueva funcionalidad' },
  { value: 'MEJORA_EXISTENTE', label: 'Mejora existente' },
  { value: 'CORRECCION_ERROR', label: 'Corrección de error' },
  { value: 'CAMBIO_INTERFAZ', label: 'Cambio de interfaz' },
  { value: 'OPTIMIZACION', label: 'Optimización' },
  { value: 'ACTUALIZACION_DATOS', label: 'Actualización de datos' },
  { value: 'CAMBIO_SEGURIDAD', label: 'Cambio de seguridad' },
  { value: 'INTEGRACION_EXTERNA', label: 'Integración externa' },
  { value: 'OTRO', label: 'Otro' }
];

// Obtener opciones de prioridad para formularios
export const obtenerPrioridades = () => [
  { value: 'BAJA', label: 'Baja' },
  { value: 'MEDIA', label: 'Media' },
  { value: 'ALTA', label: 'Alta' },
  { value: 'CRITICA', label: 'Crítica' },
  { value: 'URGENTE', label: 'Urgente' }
];

// Obtener opciones de urgencia para formularios
export const obtenerUrgencias = () => [
  { value: 'BAJA', label: 'Baja' },
  { value: 'NORMAL', label: 'Normal' },
  { value: 'ALTA', label: 'Alta' },
  { value: 'URGENTE', label: 'Urgente' },
  { value: 'CRITICA', label: 'Crítica' }
];

export default {
  crearSolicitud,
  obtenerMisSolicitudes,
  obtenerMiSolicitud,
  editarSolicitud,
  enviarSolicitud,
  cancelarSolicitud,
  obtenerEstadisticasUsuario,
  puedeEditarSolicitud,
  puedeCancelarSolicitud,
  puedeEnviarSolicitud,
  obtenerTextoEstado,
  obtenerColorEstado,
  getEstadoInfo,
  obtenerTiposCambio,
  obtenerPrioridades,
  obtenerUrgencias,
  getPrioridadColor
}; 