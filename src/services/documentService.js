import api from "./api";

// ✅ RUTAS REFACTORIZADAS CON CLEAN ARCHITECTURE
const STUDENT_BASE_URL = "/student";
const ADMIN_BASE_URL = "/admin";
const LEGACY_BASE_URL = "/users"; // Para compatibilidad con funciones no refactorizadas

export const documentService = {
  // ✅ FUNCIONES PARA ESTUDIANTES (REFACTORIZADO)

  // Obtener estado de documentos del usuario actual
  getDocumentStatus: async () => {
    try {
      const response = await api.get(`${STUDENT_BASE_URL}/documents/status`);
      return response.data;
    } catch (error) {
      console.error("❌ Error obteniendo estado:", error);
      throw error;
    }
  },

  // Subir documentos (REFACTORIZADO)
  uploadDocuments: async (formData) => {
    try {
      console.log("📤 Enviando FormData al servidor...");

      const response = await api.post(
        `${STUDENT_BASE_URL}/documents/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("✅ Respuesta recibida:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error en documentService:", error);
      throw error;
    }
  },

  // Eliminar documento (LEGACY - No refactorizado aún)
  deleteDocument: async (tipo) => {
    try {
      console.log("🗑️ Eliminando documentos tipo:", tipo);

      const response = await api.delete(
        `${LEGACY_BASE_URL}/delete-documents/${tipo}`
      );

      console.log("✅ Documentos eliminados:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error eliminando documentos:", error);
      throw error;
    }
  },

  // Descargar documento del usuario actual (REFACTORIZADO)
  downloadDocument: async (tipo) => {
    try {
      const response = await api.get(
        `${STUDENT_BASE_URL}/documents/download/${tipo}`,
        {
          responseType: "blob",
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Error al descargar documento"
      );
    }
  },

  // ✅ FUNCIONES PARA ADMINISTRADORES (REFACTORIZADO)

  // Obtener usuarios con documentos pendientes de verificación
  getPendingDocuments: async () => {
    try {
      const response = await api.get(`${ADMIN_BASE_URL}/documents/pending`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Error al obtener usuarios pendientes"
      );
    }
  },

  // Descargar documento específico de un usuario (admin)
  downloadUserDocument: async (userId, documentType) => {
    try {
      const response = await api.get(
        `${ADMIN_BASE_URL}/documents/download/${userId}/${documentType}`,
        {
          responseType: "blob",
        }
      );
      return response;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Error al descargar documento"
      );
    }
  },

  // Aprobar documentos individuales (cedula, matricula o all)
  approveUserDocument: async (userId, documentType) => {
    try {
      const response = await api.put(
        `${ADMIN_BASE_URL}/documents/approve/${userId}/${documentType}`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Error al aprobar documento"
      );
    }
  },

  // Aprobar todos los documentos de forma global (botón masivo del CRUD) - LEGACY
  approveAllDocuments: async (userId) => {
    try {
      const response = await api.put(
        `${LEGACY_BASE_URL}/approve-all/${userId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          "Error al aprobar documentos globalmente"
      );
    }
  },

  // Rechazar documentos de un usuario
  rejectUserDocuments: async (userId) => {
    try {
      const response = await api.put(
        `${ADMIN_BASE_URL}/documents/reject/${userId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Error al rechazar documentos"
      );
    }
  },
};
