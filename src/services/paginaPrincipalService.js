import api from './api';

class PaginaPrincipalService {
  // Obtener contenido de la página principal
  async obtenerContenido() {
    try {
      const response = await api.get('/pagina-principal/contenido');
      return response.data;
    } catch (error) {
      console.error('Error al obtener contenido de página principal:', error);
      throw error;
    }
  }

  // Actualizar contenido de la página principal
  async actualizarContenido(data) {
    try {
      const response = await api.put('/pagina-principal/contenido', data);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar contenido de página principal:', error);
      throw error;
    }
  }

  // Subir imagen
  async subirImagen(tipoImagen, file) {
    try {
      const formData = new FormData();
      formData.append('imagen', file);

      const response = await api.post(`/pagina-principal/imagen/${tipoImagen}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error al subir imagen:', error);
      throw error;
    }
  }

  // Obtener imagen (URL para mostrar)
  getImagenUrl(tipoImagen) {
    return `${api.defaults.baseURL}/pagina-principal/imagen/${tipoImagen}?t=${Date.now()}`;
  }

  // Verificar si una URL es de imagen del servidor
  isServerImageUrl(url) {
    return url && url.includes('/api/pagina-principal/imagen/');
  }

  // Convertir URL del servidor a URL completa
  getFullImageUrl(url) {
    if (!url) return null;
    if (url.startsWith('http')) return url; // Ya es URL completa
    if (url.startsWith('/api/')) {
      return `${api.defaults.baseURL.replace('/api', '')}${url}`;
    }
    return url; // Es una URL externa (Unsplash, etc.)
  }
}

export const paginaPrincipalService = new PaginaPrincipalService();
export default paginaPrincipalService; 