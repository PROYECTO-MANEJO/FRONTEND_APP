import api from './api';

class AuthService {
  // Login de usuario
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', {
        email,
        password
      });

      if (response.data.success) {
        // Guardar token y datos del usuario en localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return response.data;
      }
      
      throw new Error(response.data.message || 'Error en el login');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error de conexión');
    }
  }

  // Registro de usuario normal
  async register(userData) {
    try {
      const response = await api.post('/auth/createUser', {
        email: userData.email,
        password: userData.password,
        nombre: userData.nombre,
        nombre2: userData.nombre2 || '',
        apellido: userData.apellido,
        apellido2: userData.apellido2 || '',
        ced_usu: userData.cedula,
        carrera_id: userData.carrera_id || null
      });

      if (response.data.success) {
        // Guardar token y datos del usuario en localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return response.data;
      }
      
      throw new Error(response.data.message || 'Error en el registro');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error de conexión');
    }
  }

  // Crear usuario administrador
  async createAdmin(adminData) {
    try {
      const response = await api.post('/auth/createAdmin', {
        ced_usu: adminData.cedula,
        nom_usu1: adminData.nombre,
        nom_usu2: adminData.nombre2 || '',
        ape_usu1: adminData.apellido,
        ape_usu2: adminData.apellido2 || '',
        fec_nac_usu: adminData.fechaNacimiento,
        num_tel_usu: adminData.telefono,
        pas_usu: adminData.password,
        id_car_per: adminData.cargoId || null,
        cor_cue: adminData.email
      });

      if (response.data.success) {
        return response.data;
      }
      
      throw new Error(response.data.message || 'Error al crear administrador');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error de conexión');
    }
  }

  // Verificar token
  async checkToken() {
    try {
      const response = await api.get('/auth/check-token');
      
      if (response.data.success) {
        // Actualizar datos del usuario
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.token);
        return response.data;
      }
      
      throw new Error('Token inválido');
    } catch {
      this.logout();
      throw new Error('Sesión expirada');
    }
  }

  // Logout
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Obtener usuario actual
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Verificar si está autenticado
  isAuthenticated() {
    return !!localStorage.getItem('token');
  }

  // Verificar si es administrador
  isAdmin() {
    const user = this.getCurrentUser();
    return user?.rol === 'ADMINISTRADOR' || user?.rol === 'MASTER';
  }

  // Obtener token
  getToken() {
    return localStorage.getItem('token');
  }

  // Solicitar recuperación de contraseña
  async forgotPassword(email) {
    try {
      const response = await api.post('/recovery/forgot-password', {
        email
      });

      if (response.data.success) {
        return response.data;
      }
      
      throw new Error(response.data.message || 'Error al enviar el correo de recuperación');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error de conexión');
    }
  }

  // Restablecer contraseña
  async resetPassword(token, password) {
    try {
      const response = await api.post('/recovery/reset-password', {
        token,
        password
      });

      if (response.data.success) {
        return response.data;
      }
      
      throw new Error(response.data.message || 'Error al restablecer la contraseña');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error de conexión');
    }
  }

  // Verificar token de recuperación
  async verifyResetToken(token) {
    try {
      const response = await api.post('/recovery/verify-reset-token', {
        token
      });

      if (response.data.success) {
        return response.data;
      }
      
      throw new Error(response.data.message || 'Token de recuperación inválido');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Token inválido o expirado');
    }
  }
}

export default new AuthService();