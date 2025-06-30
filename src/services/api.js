import axios from 'axios';

// Configuración base de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Si es un 401, redirigir al login
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
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

export default api; 