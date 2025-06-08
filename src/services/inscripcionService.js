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

  obtenerMisInscripcionesEventos: async () => {
    try {
      const response = await api.get('/inscripciones/evento/mis-inscripciones');
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener inscripciones de eventos:', error);
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

  obtenerMisInscripcionesCursos: async () => {
    try {
      const response = await api.get('/inscripcionesCursos/curso/mis-inscripciones');
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener inscripciones de cursos:', error);
      throw error;
    }
  }
}; 