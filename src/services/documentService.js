import api from './api';

const BASE_URL = '/users';

export const documentService = {
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

  getDocumentStatus: async () => {
    try {
      const response = await api.get(`${BASE_URL}/document-status`);
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo estado:', error);
      throw error;
    }
  },

  // ✅ NUEVA FUNCIÓN: Eliminar documentos
  deleteDocuments: async (tipo) => {
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

  // ✅ NUEVAS FUNCIONES PARA VERIFICACIÓN DE DOCUMENTOS
  // Obtener usuarios con documentos pendientes de verificación
  getPendingDocuments: async () => {
    const response = await api.get(`${BASE_URL}/pending-documents`);
    return response.data;
  },

  // Descargar documento específico de un usuario
  downloadUserDocument: async (userId, documentType) => {
    const response = await api.get(`${BASE_URL}/download-document/${userId}/${documentType}`, {
      responseType: 'blob'
    });
    return response;
  },

  // Aprobar documentos de un usuario
  approveUserDocuments: async (userId) => {
    const response = await api.put(`${BASE_URL}/approve-documents/${userId}`);
    return response.data;
  },

  // Rechazar documentos de un usuario
  rejectUserDocuments: async (userId) => {
    const response = await api.put(`${BASE_URL}/reject-documents/${userId}`);
    return response.data;
  }
};