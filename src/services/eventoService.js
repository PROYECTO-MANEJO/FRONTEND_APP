import api from './api';

export const eventoService = {
  getAll: async () => {
    try {
      const response = await api.get('/eventos');
      return response.data.eventos;
    } catch (error) {
      console.error('Error fetching eventos:', error);
      throw error;
    }
  },

  inscribirse: async (inscripcionData) => {
    try {
      const response = await api.post('/inscripciones/eventos', inscripcionData);
      return response.data;
    } catch (error) {
      console.error('Error al inscribirse en evento:', error);
      throw error;
    }
  },

  obtenerMisInscripciones: async () => {
    try {
      const response = await api.get('/inscripciones/evento/mis-inscripciones');
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener inscripciones:', error);
      throw error;
    }
  }
};