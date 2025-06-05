import api from '../services/api';

export const userService = {
  // Obtener perfil del usuario actual
  async getProfile() {
    try {
      const response = await api.get('/api/users/profile');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener el perfil');
    }
  },

  // Actualizar perfil del usuario
  async updateProfile(userData) {
    try {
      const response = await api.put('/api/users/profile', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al actualizar el perfil');
    }
  },

  // Obtener todos los usuarios (admin)
  async getAll() {
    try {
      const response = await api.get('/api/users');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener usuarios');
    }
  }
};