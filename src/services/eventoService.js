import api from "./api";

export const eventoService = {
  getAll: async () => {
    try {
      const response = await api.get("/events");
      return response.data.data?.eventos || [];
    } catch (error) {
      console.error("Error fetching eventos:", error);
      throw error;
    }
  },

  // Obtener solo eventos disponibles para inscribirse (excluyendo los que ya tienes inscripción)
  getEventosDisponibles: async () => {
    try {
      const response = await api.get("/events/available");
      return response.data.data?.eventos || [];
    } catch (error) {
      console.error("Error fetching eventos disponibles:", error);
      throw error;
    }
  },

  // Obtener mis eventos (donde estoy inscrito)
  getMisEventos: async () => {
    try {
      const response = await api.get("/events/my-events");
      return response.data.data?.eventos || [];
    } catch (error) {
      console.error("Error fetching mis eventos:", error);
      throw error;
    }
  },

  inscribirse: async (inscripcionData) => {
    try {
      const response = await api.post("/inscriptions/events", inscripcionData);
      return response.data;
    } catch (error) {
      console.error("Error al inscribirse en evento:", error);
      throw error;
    }
  },

  obtenerMisInscripciones: async () => {
    try {
      const response = await api.get("/inscriptions/my-events");
      return response.data.data;
    } catch (error) {
      console.error("Error al obtener inscripciones:", error);
      throw error;
    }
  },
};
