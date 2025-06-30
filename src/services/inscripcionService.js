import api from './api';

export const inscripcionService = {
  // Inscripciones para eventos
  inscribirseEvento: async (inscripcionData) => {
    try {
      const response = await api.post('/inscripciones/eventos', inscripcionData);
      return response.data;
    } catch (error) {
      console.error('Error al inscribirse en evento:', error);
      throw error;
    }
  },

  // Inscripción en evento con archivo PDF
  inscribirseEventoConArchivo: async (formData) => {
    try {
      const response = await api.post('/inscripciones/eventos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error al inscribirse en evento con archivo:', error);
      throw error;
    }
  },

  obtenerMisInscripcionesEventos: async () => {
    try {
      const response = await api.get('/inscripciones/evento/mis-inscripciones');
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener inscripciones de eventos:', error);
      throw error;
    }
  },

  // Descargar comprobante de pago de evento (solo admin)
  descargarComprobantePagoEvento: async (inscripcionId) => {
    try {
      const response = await api.get(`/inscripciones/evento/comprobante/${inscripcionId}`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error al descargar comprobante de evento:', error);
      throw error;
    }
  },

  // Inscripciones para cursos
  inscribirseCurso: async (inscripcionData) => {
    try {
      const response = await api.post('/inscripcionesCursos/curso', inscripcionData);
      return response.data;
    } catch (error) {
      console.error('Error al inscribirse en curso:', error);
      throw error;
    }
  },

  // Inscripción en curso con archivo PDF
  inscribirseCursoConArchivo: async (formData) => {
    try {
      const response = await api.post('/inscripcionesCursos/curso', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error al inscribirse en curso con archivo:', error);
      throw error;
    }
  },

  obtenerMisInscripcionesCursos: async () => {
    try {
      const response = await api.get('/inscripcionesCursos/curso/mis-inscripciones');
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener inscripciones de cursos:', error);
      throw error;
    }
  },

  // Descargar comprobante de pago de curso (solo admin)
  descargarComprobantePagoCurso: async (inscripcionId) => {
    try {
      const response = await api.get(`/inscripcionesCursos/curso/comprobante/${inscripcionId}`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error al descargar comprobante de curso:', error);
      throw error;
    }
  }
}; 