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
  }
};