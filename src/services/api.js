import axios from 'axios';

// Configuración base de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Crear instancia de axios
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a las peticiones
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Si es un 401, solo limpiar el localStorage
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    
    // Para solicitudes de aprobar/rechazar planes, manejar 500 como posible éxito
    if (error.config?.url?.includes('aprobar-rechazar-planes')) {
      if (error.response?.status === 500 && error.response?.data) {
        // Si tiene data con success=true o mensaje de "ya fueron", convertir a respuesta exitosa
        const data = error.response.data;
        if (data.success || (data.message && (data.message.includes('ya fueron') || data.message.includes('anteriormente')))) {
          console.log('🔄 Convirtiendo error 500 a respuesta exitosa para aprobar-rechazar-planes');
          // Crear una respuesta exitosa falsa
          return {
            data: data,
            status: 200,
            statusText: 'OK',
            headers: error.response.headers,
            config: error.config
          };
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Verificar y cerrar automáticamente cursos/eventos vencidos
const verificarYCerrarAutomaticamente = async (tipo, id) => {
  const response = await axiosInstance.post(`/${tipo}s/${id}/verificar-estado`);
  return response.data;
};

// Exportar todas las funciones de la API
const api = {
  get: (url) => axiosInstance.get(url),
  post: (url, data) => axiosInstance.post(url, data),
  put: (url, data) => axiosInstance.put(url, data),
  delete: (url) => axiosInstance.delete(url),
  verificarYCerrarAutomaticamente,
};

export default api; 