import api from '../services/api';

export const carreraService = {
  // Obtener todas las carreras
  async getAll() {
    try {
      const response = await api.get('/api/carreras');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener carreras');
    }
  },

  // Obtener una carrera por ID
  async getById(id) {
    try {
      const response = await api.get(`/api/carreras/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener la carrera');
    }
  }
};