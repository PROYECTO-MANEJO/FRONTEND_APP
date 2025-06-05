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
  }
};