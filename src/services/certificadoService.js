import api, { getBaseUrl } from './api';

const CERTIFICATES_BASE_URL = '/certificates';

/**
 * Visualizar certificado (método mejorado)
 */
export const visualizarCertificado = async (tipo, idParticipacion) => {
  try {
    console.log('🔍 Solicitando certificado para visualizar:', { tipo, idParticipacion });
    
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('❌ No hay token de autenticación');
      throw new Error('No se encontró token de autenticación');
    }
    
    // Primero generar el certificado (siempre, para asegurar que esté actualizado)
    console.log(`🔄 Generando certificado de ${tipo}...`);
    if (tipo === 'evento') {
      await generarCertificadoEventoPorParticipacion(idParticipacion);
    } else {
      await generarCertificadoCursoPorParticipacion(idParticipacion);
    }
    
    // Obtener la URL base de manera segura
    const baseURL = getBaseUrl();
    
    // Crear URL para iframe con token incluido
    const urlCertificado = `${baseURL}/certificados/visualizar-${tipo}/${idParticipacion}?token=${encodeURIComponent(token)}`;
    
    console.log('🔗 URL para visualización de certificado:', urlCertificado);
    
    // Verificar que la URL sea accesible
    try {
      const testResponse = await fetch(urlCertificado, {
        method: 'HEAD',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!testResponse.ok) {
        console.error('❌ Error al verificar certificado:', testResponse.status);
        throw new Error(`Error al verificar certificado: ${testResponse.status}`);
      }
      
      return urlCertificado;
    } catch (fetchError) {
      console.error('❌ Error de conexión al verificar certificado:', fetchError);
      
      // Si hay un error de conexión, intentamos devolver la URL de todas formas
      // ya que el certificado ya fue generado previamente
      return urlCertificado;
    }
  } catch (error) {
    console.error('❌ Error al preparar visualización de certificado:', error);
    throw error;
  }
};

/**
 * Obtener todos los certificados del usuario
 */
export const obtenerMisCertificados = async () => {
  try {
    const response = await api.get(`${CERTIFICATES_BASE_URL}/my-certificates`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener certificados:', error);
    throw error;
  }
};

/**
 * Obtener participaciones terminadas del usuario (incluyendo reprobadas)
 */
export const obtenerParticipacionesTerminadas = async () => {
  try {
    const response = await api.get(`${CERTIFICATES_BASE_URL}/participaciones-terminadas`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener participaciones:', error);
    
    // Si es error de autenticación, proporcionar mensaje más específico
    if (error.response?.status === 401) {
      throw new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
    }
    
    // Si es error 404, el endpoint no existe
    if (error.response?.status === 404) {
      throw new Error('El servicio de certificados no está disponible. Contacta al administrador.');
    }
    
    throw error;
  }
};

/**
 * Descargar certificado
 */
export const descargarCertificado = async (tipo, idParticipacion) => {
  try {
    const response = await api.get(
      `${CERTIFICATES_BASE_URL}/download/${tipo}/${idParticipacion}`,
      {
        responseType: 'blob', // Importante para archivos
      }
    );

    // Crear URL del blob
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);

    // Crear enlace temporal para descarga
    const link = document.createElement('a');
    link.href = url;
    link.download = `certificado_${tipo}_${idParticipacion}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Limpiar URL del blob
    window.URL.revokeObjectURL(url);

    return { success: true, message: 'Certificado descargado exitosamente' };
  } catch (error) {
    console.error('Error al descargar certificado:', error);
    throw error;
  }
};

/**
 * Generar certificado manualmente
 */
export const generarCertificadoEvento = async (idEvento, idInscripcion) => {
  try {
    const response = await api.post(`${CERTIFICATES_BASE_URL}/evento/${idEvento}/${idInscripcion}`);
    return response.data;
  } catch (error) {
    console.error('Error al generar certificado de evento:', error);
    throw error;
  }
};

/**
 * Generar certificado de curso manualmente
 */
export const generarCertificadoCurso = async (idCurso, idInscripcion) => {
  try {
    const response = await api.post(`${CERTIFICATES_BASE_URL}/curso/${idCurso}/${idInscripcion}`);
    return response.data;
  } catch (error) {
    console.error('Error al generar certificado de curso:', error);
    throw error;
  }
};

/**
 * Generar certificado de curso usando solo ID de participación
 */
export const generarCertificadoCursoPorParticipacion = async (idParticipacion) => {
  try {
    const response = await api.post(`${CERTIFICATES_BASE_URL}/generar-curso/${idParticipacion}`);
    return response.data;
  } catch (error) {
    console.error('Error al generar certificado de curso por participación:', error);
    throw error;
  }
};

/**
 * Generar certificado de evento usando solo ID de participación
 */
export const generarCertificadoEventoPorParticipacion = async (idParticipacion) => {
  try {
    const response = await api.post(`${CERTIFICATES_BASE_URL}/generar-evento/${idParticipacion}`);
    return response.data;
  } catch (error) {
    console.error('Error al generar certificado de evento por participación:', error);
    throw error;
  }
}; 

/**
 * Obtener participaciones completas (solo las que tienen registro de participación)
 */
export const obtenerParticipacionesCompletas = async () => {
  try {
    const response = await api.get(`${CERTIFICATES_BASE_URL}/mis-certificados/participaciones-completas`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener participaciones completas:', error);
    throw error;
  }
};

/**
 * Obtener TODAS las inscripciones del usuario (incluyendo las que no tienen participación)
 */
export const obtenerTodasLasInscripciones = async () => {
  try {
    // Obtener inscripciones a eventos
    const inscripcionesEventos = await api.get('/inscriptions/my-events');
    
    // Obtener inscripciones a cursos
    const inscripcionesCursos = await api.get('/inscriptions/my-courses');
    
    // Debug: Mostrar datos recibidos
    console.log('DEBUG - Datos de eventos recibidos:', inscripcionesEventos.data);
    console.log('DEBUG - Datos de cursos recibidos:', inscripcionesCursos.data);
    
    // Verificar que los datos existen y son arrays
    const eventosData = inscripcionesEventos.data?.data || [];
    const cursosData = inscripcionesCursos.data?.data || [];
    
    // Formatear eventos
    const eventos = eventosData.map(inscripcion => ({
      id_ins: inscripcion.id_ins,
      evento: inscripcion.evento?.nom_eve || 'Sin nombre',
      estado_evento: inscripcion.evento?.estado || 'ACTIVO',
      fecha_inscripcion: inscripcion.fec_ins,
      metodo_pago: inscripcion.met_pag_ins,
      estado_pago: inscripcion.estado_pago,
      usuario: `${inscripcion.usuario?.nom_usu1 || ''} ${inscripcion.usuario?.ape_usu1 || ''}`.trim(),
      es_gratuito: inscripcion.evento?.es_gratuito,
      precio: inscripcion.evento?.precio,
      tipo: 'evento'
    }));
    
    // Formatear cursos
    const cursos = cursosData.map(inscripcion => ({
      id_ins_cur: inscripcion.id_ins_cur,
      curso: inscripcion.curso?.nom_cur || 'Sin nombre',
      estado_curso: inscripcion.curso?.estado || 'ACTIVO',
      fecha_inscripcion: inscripcion.fec_ins_cur,
      metodo_pago: inscripcion.met_pag_ins_cur,
      estado_pago: inscripcion.estado_pago_cur,
      usuario: `${inscripcion.usuario?.nom_usu1 || ''} ${inscripcion.usuario?.ape_usu1 || ''}`.trim(),
      es_gratuito: inscripcion.curso?.es_gratuito,
      precio: inscripcion.curso?.precio,
      tipo: 'curso'
    }));
    
    // Debug: Mostrar datos mapeados
    console.log('DEBUG - Eventos mapeados:', eventos);
    console.log('DEBUG - Cursos mapeados:', cursos);
    
    return {
      success: true,
      data: {
        eventos,
        cursos
      }
    };
  } catch (error) {
    console.error('Error al obtener todas las inscripciones:', error);
    // Devolver estructura vacía en caso de error
    return {
      success: false,
      data: {
        eventos: [],
        cursos: []
      },
      error: error.message
    };
  }
};