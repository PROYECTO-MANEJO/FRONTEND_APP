import api from './api';

export const cursoService = {
  getAll: async () => {
    try {
      const response = await api.get('/cursos');
      return response.data.cursos;
    } catch (error) {
      console.error('Error fetching cursos:', error);
      throw error;
    }
  },

  // Obtener solo cursos disponibles para inscribirse (excluyendo los que ya tienes inscripción)
  getCursosDisponibles: async () => {
    try {
      const response = await api.get('/cursos/disponibles');
      return response.data.cursos;
    } catch (error) {
      console.error('Error fetching cursos disponibles:', error);
      throw error;
    }
  },

  // Obtener mis cursos (donde estoy inscrito)
  getMisCursos: async () => {
    try {
      const response = await api.get('/cursos/mis-cursos');
      return response.data.cursos;
    } catch (error) {
      console.error('Error fetching mis cursos:', error);
      throw error;
    }
  },

  inscribirse: async (inscripcionData) => {
    try {
      const response = await api.post('/inscripcionesCursos/curso', inscripcionData);
      return response.data;
    } catch (error) {
      console.error('Error al inscribirse en curso:', error);
      throw error;
    }
  },

  obtenerMisInscripciones: async () => {
    try {
      const response = await api.get('/inscripcionesCursos/curso/mis-inscripciones');
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener inscripciones:', error);
      throw error;
    }
  }
};