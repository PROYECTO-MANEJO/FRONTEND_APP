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

  // Inscripciones para cursos (si se implementa en el futuro)
  inscribirseCurso: async () => {
    // Por ahora retorna un error indicando que no está implementado
    throw new Error('Las inscripciones a cursos aún no están implementadas en el backend');
  },

  obtenerMisInscripcionesCursos: async () => {
    // Por ahora retorna un array vacío
    return [];
  }
}; 