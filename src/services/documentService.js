import api from './api';

export const documentService = {
  uploadDocuments: async (formData) => {
    try {
      console.log('📤 Enviando FormData al servidor...');
      
      const response = await api.post('/users/upload-documents', formData, {
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
      const response = await api.get('/users/document-status');
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
      
      const response = await api.delete(`/users/delete-documents/${tipo}`);
      
      console.log('✅ Documentos eliminados:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('❌ Error eliminando documentos:', error);
      throw error;
    }
  }
};