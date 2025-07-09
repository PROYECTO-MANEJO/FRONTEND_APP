import api from './api';

const BASE_URL = '/users';

export const documentService = {
  // ✅ FUNCIONES PARA USUARIOS

  // Obtener estado de documentos del usuario actual
  getDocumentStatus: async () => {
    try {
      const response = await api.get(`${BASE_URL}/document-status`);
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo estado:', error);
      throw error;
    }
  },

  // Subir documentos
  uploadDocuments: async (formData) => {
    try {
      console.log('📤 Enviando FormData al servidor...');

      const response = await api.post(`${BASE_URL}/upload-documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      console.log('✅ Respuesta recibida:', response.data);
      return response.data;

    } catch (error) {
      console.error('❌ Error en documentService:', error);
      throw error;
    }
  },

  // Eliminar documento
  deleteDocument: async (tipo) => {
    try {
      console.log('🗑️ Eliminando documentos tipo:', tipo);

      const response = await api.delete(`${BASE_URL}/delete-documents/${tipo}`);

      console.log('✅ Documentos eliminados:', response.data);
      return response.data;

    } catch (error) {
      console.error('❌ Error eliminando documentos:', error);
      throw error;
    }
  },

  // Descargar documento del usuario actual
  downloadDocument: async (tipo) => {
    try {
      const response = await api.get(`${BASE_URL}/my-document/${tipo}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al descargar documento');
    }
  },

  // ✅ FUNCIONES PARA ADMINISTRADORES

  // Obtener usuarios con documentos pendientes de verificación
  getPendingDocuments: async () => {
    try {
      const response = await api.get(`${BASE_URL}/pending-documents`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener usuarios pendientes');
    }
  },

  // Descargar documento específico de un usuario (admin)
  downloadUserDocument: async (userId, documentType) => {
    try {
      const response = await api.get(`${BASE_URL}/download-document/${userId}/${documentType}`, {
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al descargar documento');
    }
  },

  // Aprobar documentos individuales (cedula, matricula o all)
  approveUserDocument: async (userId, documentType) => {
    try {
      const response = await api.put(`${BASE_URL}/approve-documents/${userId}/${documentType}`);
      return response.data; 
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al aprobar documento');
    }
  },

  // Aprobar todos los documentos de forma global (botón masivo del CRUD)
  approveAllDocuments: async (userId) => {
    try {
      const response = await api.put(`${BASE_URL}/approve-all/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al aprobar documentos globalmente');
    }
  },

  // Rechazar documentos de un usuario
  rejectUserDocuments: async (userId) => {
    try {
      const response = await api.put(`${BASE_URL}/reject-documents/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al rechazar documentos');
    }
  }
};
