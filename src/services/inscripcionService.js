import api, { getBaseUrl } from './api';
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
      
      // Usar la URL base validada
      const baseURL = getBaseUrl();
      
      // Usar axios directamente para evitar problemas con la URL base
      const response = await axios.post(`${baseURL}/inscripciones`, formData, {
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

  // Función auxiliar para crear PDF de error
  crearPDFError: (titulo, mensaje) => {
    const pdfContent = `%PDF-1.4
1 0 obj
<</Type /Catalog /Pages 2 0 R>>
endobj
2 0 obj
<</Type /Pages /Kids [3 0 R] /Count 1>>
endobj
3 0 obj
<</Type /Page /Parent 2 0 R /Resources 4 0 R /MediaBox [0 0 595 842] /Contents 6 0 R>>
endobj
4 0 obj
<</Font <</F1 5 0 R>>>>
endobj
5 0 obj
<</Type /Font /Subtype /Type1 /BaseFont /Helvetica>>
endobj
6 0 obj
<</Length 90>>
stream
BT
/F1 24 Tf
100 742 Td
(${titulo}) Tj
/F1 12 Tf
0 -30 Td
(${mensaje}) Tj
ET
endstream
endobj
xref
0 7
0000000000 65535 f
0000000009 00000 n
0000000056 00000 n
0000000111 00000 n
0000000212 00000 n
0000000250 00000 n
0000000317 00000 n
trailer
<</Size 7 /Root 1 0 R>>
startxref
456
%%EOF`;
    return new Blob([pdfContent], { type: 'application/pdf' });
  },

  // Visualizar comprobante de pago de evento (método mejorado)
  visualizarComprobantePagoEvento: async (inscripcionId) => {
    try {
      console.log('🔍 Solicitando comprobante de evento para visualizar:', inscripcionId);
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ No hay token de autenticación');
        throw new Error('No se encontró token de autenticación');
      }
      
      // Obtener la URL base de manera segura
      const baseURL = getBaseUrl();
      
      // Crear URL para iframe con token incluido
      const urlComprobante = `${baseURL}/inscripciones/evento/comprobante/${inscripcionId}?token=${encodeURIComponent(token)}`;
      
      console.log('🔗 URL para visualización:', urlComprobante);
      
      // Verificar que la URL sea accesible
      try {
        const testResponse = await fetch(urlComprobante, {
          method: 'HEAD',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!testResponse.ok) {
          console.error('❌ Error al verificar comprobante:', testResponse.status);
          throw new Error(`Error al verificar comprobante: ${testResponse.status}`);
        }
        
        return urlComprobante;
      } catch (fetchError) {
        console.error('❌ Error de conexión al verificar comprobante:', fetchError);
        
        // Si hay un error de conexión, intentar con blob como fallback
        const blob = await inscripcionService.descargarComprobantePagoEvento(inscripcionId);
        if (blob instanceof Blob) {
          const blobUrl = URL.createObjectURL(blob);
          console.log('✅ Fallback: URL de blob creada:', blobUrl);
          return blobUrl;
        }
        
        throw new Error('No se pudo acceder al comprobante. Verifique su conexión.');
      }
    } catch (error) {
      console.error('❌ Error al preparar visualización de comprobante:', error);
      throw error;
    }
  },

  // Visualizar comprobante de pago de curso (método mejorado)
  visualizarComprobantePagoCurso: async (inscripcionId) => {
    try {
      console.log('🔍 Solicitando comprobante de curso para visualizar:', inscripcionId);
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ No hay token de autenticación');
        throw new Error('No se encontró token de autenticación');
      }
      
      // Obtener la URL base de manera segura
      const baseURL = getBaseUrl();
      
      // Crear URL para iframe con token incluido
      const urlComprobante = `${baseURL}/inscripcionesCursos/curso/comprobante/${inscripcionId}?token=${encodeURIComponent(token)}`;
      
      console.log('🔗 URL para visualización:', urlComprobante);
      
      // Verificar que la URL sea accesible
      try {
        const testResponse = await fetch(urlComprobante, {
          method: 'HEAD',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!testResponse.ok) {
          console.error('❌ Error al verificar comprobante:', testResponse.status);
          throw new Error(`Error al verificar comprobante: ${testResponse.status}`);
        }
        
        return urlComprobante;
      } catch (fetchError) {
        console.error('❌ Error de conexión al verificar comprobante:', fetchError);
        
        // Si hay un error de conexión, intentar con blob como fallback
        const blob = await inscripcionService.descargarComprobantePagoCurso(inscripcionId);
        if (blob instanceof Blob) {
          const blobUrl = URL.createObjectURL(blob);
          console.log('✅ Fallback: URL de blob creada:', blobUrl);
          return blobUrl;
        }
        
        throw new Error('No se pudo acceder al comprobante. Verifique su conexión.');
      }
    } catch (error) {
      console.error('❌ Error al preparar visualización de comprobante:', error);
      throw error;
    }
  },

  // Descargar comprobante de pago de evento (solo admin)
  descargarComprobantePagoEvento: async (inscripcionId) => {
    try {
      console.log('📥 Solicitando comprobante de evento:', inscripcionId);
      
      const baseURL = getBaseUrl();
      const response = await axios.get(`${baseURL}/inscripciones/evento/comprobante/${inscripcionId}`, {
        responseType: 'arraybuffer',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('📄 Respuesta recibida:', {
        status: response.status,
        contentType: response.headers['content-type'],
        dataSize: response.data?.byteLength || 'N/A'
      });
      
      // Verificar si la respuesta es un PDF válido
      const contentType = response.headers['content-type'];
      if (contentType && contentType.includes('application/pdf')) {
        // Crear un blob con los datos recibidos
        const blob = new Blob([response.data], { type: 'application/pdf' });
        console.log('✅ Blob PDF creado correctamente:', blob.size, 'bytes');
        return blob;
      } else {
        // Intentar interpretar como JSON (mensaje de error)
        try {
          const decoder = new TextDecoder('utf-8');
          const text = decoder.decode(response.data);
          let errorMsg = 'Error desconocido';
          
          try {
            const jsonResponse = JSON.parse(text);
            errorMsg = jsonResponse.message || 'Error al obtener el comprobante';
            console.error('❌ Error en formato JSON:', jsonResponse);
          } catch {
            errorMsg = text || 'Error al obtener el comprobante';
            console.error('❌ Error en formato texto:', text);
          }
          
          return inscripcionService.crearPDFError('Error en el servidor', errorMsg);
        } catch (decodeError) {
          console.error('❌ Error al decodificar respuesta:', decodeError);
          return inscripcionService.crearPDFError('Error al procesar la respuesta', 'No se pudo interpretar la respuesta del servidor');
        }
      }
    } catch (error) {
      console.error('❌ Error al descargar comprobante de evento:', error);
      return inscripcionService.crearPDFError(
        'Error al cargar comprobante', 
        error.response?.data?.message || error.message || 'No se pudo conectar con el servidor'
      );
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
      
      // Usar la URL base validada
      const baseURL = getBaseUrl();
      
      // Usar axios directamente para evitar problemas con la URL base
      const response = await axios.post(`${baseURL}/inscripcionesCursos`, formData, {
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
      console.log('📥 Solicitando comprobante de curso:', inscripcionId);
      
      const baseURL = getBaseUrl();
      const response = await axios.get(`${baseURL}/inscripcionesCursos/curso/comprobante/${inscripcionId}`, {
        responseType: 'arraybuffer',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('📄 Respuesta recibida:', {
        status: response.status,
        contentType: response.headers['content-type'],
        dataSize: response.data?.byteLength || 'N/A'
      });
      
      // Verificar si la respuesta es un PDF válido
      const contentType = response.headers['content-type'];
      if (contentType && contentType.includes('application/pdf')) {
        // Crear un blob con los datos recibidos
        const blob = new Blob([response.data], { type: 'application/pdf' });
        console.log('✅ Blob PDF creado correctamente:', blob.size, 'bytes');
        return blob;
      } else {
        // Intentar interpretar como JSON (mensaje de error)
        try {
          const decoder = new TextDecoder('utf-8');
          const text = decoder.decode(response.data);
          let errorMsg = 'Error desconocido';
          
          try {
            const jsonResponse = JSON.parse(text);
            errorMsg = jsonResponse.message || 'Error al obtener el comprobante';
            console.error('❌ Error en formato JSON:', jsonResponse);
          } catch {
            errorMsg = text || 'Error al obtener el comprobante';
            console.error('❌ Error en formato texto:', text);
          }
          
          return inscripcionService.crearPDFError('Error en el servidor', errorMsg);
        } catch (decodeError) {
          console.error('❌ Error al decodificar respuesta:', decodeError);
          return inscripcionService.crearPDFError('Error al procesar la respuesta', 'No se pudo interpretar la respuesta del servidor');
        }
      }
    } catch (error) {
      console.error('❌ Error al descargar comprobante de curso:', error);
      return inscripcionService.crearPDFError(
        'Error al cargar comprobante', 
        error.response?.data?.message || error.message || 'No se pudo conectar con el servidor'
      );
    }
  }
}; 