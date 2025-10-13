import api from "./api";

export const cursoService = {
  getAll: async () => {
    try {
      const response = await api.get("/courses");
      return response.data.data?.cursos || [];
    } catch (error) {
      console.error("Error fetching cursos:", error);
      throw error;
    }
  },

  // Obtener solo cursos disponibles para inscribirse (excluyendo los que ya tienes inscripción)
  getCursosDisponibles: async () => {
    try {
      const response = await api.get("/courses/available");
      return response.data.data?.cursos || [];
    } catch (error) {
      console.error("Error fetching cursos disponibles:", error);
      throw error;
    }
  },

  // Obtener mis cursos (donde estoy inscrito)
  getMisCursos: async () => {
    try {
      const response = await api.get("/courses/my-courses");
      return response.data.data?.cursos || [];
    } catch (error) {
      console.error("Error fetching mis cursos:", error);
      throw error;
    }
  },

  inscribirse: async (inscripcionData) => {
    try {
      const response = await api.post("/inscriptions/courses", inscripcionData);
      return response.data;
    } catch (error) {
      console.error("Error al inscribirse en curso:", error);
      throw error;
    }
  },

  obtenerMisInscripciones: async () => {
    try {
      const response = await api.get("/inscriptions/my-courses");
      return response.data.data;
    } catch (error) {
      console.error("Error al obtener inscripciones:", error);
      throw error;
    }
  },
};
