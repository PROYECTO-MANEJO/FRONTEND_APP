import api from './api';

const CERTIFICATES_BASE_URL = '/certificados';

/**
 * Obtener todos los certificados del usuario
 */
export const obtenerMisCertificados = async () => {
  try {
    const response = await api.get(`${CERTIFICATES_BASE_URL}/mis-certificados`);
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
      `${CERTIFICATES_BASE_URL}/descargar/${tipo}/${idParticipacion}`,
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

export const obtenerParticipacionesCompletas = async () => {
  try {
    const response = await api.get(`${CERTIFICATES_BASE_URL}/mis-certificados/participaciones-completas`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener participaciones completas:', error);
    throw error;
  }
};