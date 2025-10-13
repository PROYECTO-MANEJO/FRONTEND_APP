import api from "../services/api";

export const carreraService = {
  // Obtener todas las carreras
  async getAll() {
    try {
      const response = await api.get("/carreras");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Error al obtener carreras"
      );
    }
  },

  // Obtener una carrera por ID
  async getById(id) {
    try {
      const response = await api.get(`/carreras/${id}`);
      return response.data.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Error al obtener la carrera"
      );
    }
  },

  // Crear una nueva carrera
  async create(carreraData) {
    try {
      const response = await api.post("/carreras", carreraData);
      return response.data.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Error al crear la carrera"
      );
    }
  },

  // Actualizar una carrera
  async update(id, carreraData) {
    try {
      const response = await api.put(`/carreras/${id}`, carreraData);
      return response.data.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Error al actualizar la carrera"
      );
    }
  },

  // Eliminar una carrera
  async delete(id) {
    try {
      const response = await api.delete(`/carreras/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Error al eliminar la carrera"
      );
    }
  },
};
