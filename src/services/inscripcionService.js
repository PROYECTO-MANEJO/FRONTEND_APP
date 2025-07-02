import api from './api';
import axios from 'axios';

export const inscripcionService = {
  // Inscripciones para eventos
  inscribirseEvento: async (inscripcionData) => {
    try {
      const response = await api.post('/inscripciones/eventos', inscripcionData);
      return response.data;
    } catch (error) {
      console.error('Error al inscribirse en evento:', error);
      throw error;
    }
  },

  // Inscripción en evento con archivo PDF
  inscribirseEventoConArchivo: async (formData) => {
    try {
      console.log('📤 Enviando inscripción de evento...');
      
      // Usar axios directamente para evitar problemas con la URL base
      const response = await axios.post('http://localhost:3000/api/inscripciones', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });
      
      console.log('✅ Respuesta del servidor:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error en inscripción evento:', error);
      throw error;
    }
  },

  obtenerMisInscripcionesEventos: async () => {
    try {
      const response = await api.get('/inscripciones/evento/mis-inscripciones');
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener inscripciones de eventos:', error);
      throw error;
    }
  },

  // Descargar comprobante de pago de evento (solo admin)
  descargarComprobantePagoEvento: async (inscripcionId) => {
    try {
      const response = await api.get(`/inscripciones/evento/comprobante/${inscripcionId}`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error al descargar comprobante de evento:', error);
      throw error;
    }
  },

  // Inscripciones para cursos
  inscribirseCurso: async (inscripcionData) => {
    try {
      const response = await api.post('/inscripcionesCursos/curso', inscripcionData);
      return response.data;
    } catch (error) {
      console.error('Error al inscribirse en curso:', error);
      throw error;
    }
  },

  // Inscripción en curso con archivo PDF
  inscribirseCursoConArchivo: async (formData) => {
    try {
      console.log('📤 Enviando inscripción de curso...');
      
      // Usar axios directamente para evitar problemas con la URL base
      const response = await axios.post('http://localhost:3000/api/inscripcionesCursos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });
      
      console.log('✅ Respuesta del servidor:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error en inscripción curso:', error);
      throw error;
    }
  },

  obtenerMisInscripcionesCursos: async () => {
    try {
      const response = await api.get('/inscripcionesCursos/curso/mis-inscripciones');
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener inscripciones de cursos:', error);
      throw error;
    }
  },

  // Descargar comprobante de pago de curso (solo admin)
  descargarComprobantePagoCurso: async (inscripcionId) => {
    try {
      const response = await api.get(`/inscripcionesCursos/curso/comprobante/${inscripcionId}`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error al descargar comprobante de curso:', error);
      throw error;
    }
  }
}; 