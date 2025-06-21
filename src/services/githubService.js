import api from './api';

// Servicio para integración con GitHub
class GitHubService {
  // Obtener estado de configuración de GitHub
  async obtenerEstadoConfiguracion() {
    try {
      const response = await api.get('/github/configuracion');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo configuración de GitHub:', error);
      throw error;
    }
  }

  // Sincronizar una solicitud con GitHub (búsqueda automática en todos los repos)
  async sincronizarSolicitud(solicitudId) {
    try {
      const response = await api.post(`/github/solicitud/${solicitudId}/sincronizar`);
      return response.data;
    } catch (error) {
      console.error('Error sincronizando con GitHub:', error);
      throw error;
    }
  }

  // Sincronizar una solicitud en un repositorio específico
  async sincronizarSolicitudEnRepo(solicitudId, repoType) {
    try {
      const response = await api.post(`/github/solicitud/${solicitudId}/sincronizar-repo`, {
        repoType
      });
      return response.data;
    } catch (error) {
      console.error('Error sincronizando repositorio específico:', error);
      throw error;
    }
  }

  // Obtener información de GitHub para una solicitud
  async obtenerInfoGitHub(solicitudId) {
    try {
      const response = await api.get(`/github/solicitud/${solicitudId}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo información de GitHub:', error);
      throw error;
    }
  }

  // Asociar manualmente un branch a una solicitud
  async asociarBranch(solicitudId, branchName, repoUrl = null) {
    try {
      const response = await api.put(`/github/solicitud/${solicitudId}/branch`, {
        branchName,
        repoUrl
      });
      return response.data;
    } catch (error) {
      console.error('Error asociando branch:', error);
      throw error;
    }
  }

  // Asociar manualmente un Pull Request a una solicitud
  async asociarPullRequest(solicitudId, prNumber, prUrl = null) {
    try {
      const response = await api.put(`/github/solicitud/${solicitudId}/pull-request`, {
        prNumber,
        prUrl
      });
      return response.data;
    } catch (error) {
      console.error('Error asociando Pull Request:', error);
      throw error;
    }
  }

  // Generar nombre de branch sugerido
  async generarNombreBranch(solicitudId) {
    try {
      const response = await api.get(`/github/solicitud/${solicitudId}/branch-sugerido`);
      return response.data;
    } catch (error) {
      console.error('Error generando nombre de branch:', error);
      throw error;
    }
  }

  // Validar formato de URL de GitHub
  validarUrlGitHub(url) {
    if (!url) return false;
    const githubUrlPattern = /^https:\/\/github\.com\/[\w\-.]+\/[\w\-.]+/;
    return githubUrlPattern.test(url);
  }

  // Extraer información de una URL de GitHub
  extraerInfoUrl(url) {
    if (!this.validarUrlGitHub(url)) return null;
    
    try {
      const match = url.match(/https:\/\/github\.com\/([\w\-.]+)\/([\w\-.]+)/);
      if (match) {
        return {
          owner: match[1],
          repo: match[2],
          fullName: `${match[1]}/${match[2]}`
        };
      }
    } catch (error) {
      console.error('Error extrayendo información de URL:', error);
    }
    
    return null;
  }

  // Extraer número de PR de una URL
  extraerNumeroPR(url) {
    if (!url) return null;
    
    try {
      const match = url.match(/\/pull\/(\d+)/);
      return match ? parseInt(match[1]) : null;
    } catch (error) {
      console.error('Error extrayendo número de PR:', error);
      return null;
    }
  }

  // Formatear información de commits para mostrar
  formatearCommits(commits) {
    if (!commits || !Array.isArray(commits)) return [];
    
    return commits.map(commit => ({
      ...commit,
      shortSha: commit.sha ? commit.sha.substring(0, 7) : '',
      shortMessage: commit.message ? 
        (commit.message.length > 60 ? commit.message.substring(0, 60) + '...' : commit.message) : '',
      formattedDate: commit.date ? new Date(commit.date).toLocaleDateString('es-ES') : ''
    }));
  }

  // Crear un nuevo branch para una solicitud
  async crearBranch(solicitudId, repoType = 'main', baseBranch = 'main') {
    try {
      const response = await api.post(`/github/solicitud/${solicitudId}/crear-branch`, {
        repoType,
        baseBranch
      });
      return response.data;
    } catch (error) {
      console.error('Error creando branch:', error);
      throw error;
    }
  }

  // Crear Pull Request para una solicitud
  async crearPullRequest(solicitudId, branchName, repoType = 'main', baseBranch = 'main') {
    try {
      const response = await api.post(`/github/solicitud/${solicitudId}/crear-pull-request`, {
        branchName,
        repoType,
        baseBranch
      });
      return response.data;
    } catch (error) {
      console.error('Error creando Pull Request:', error);
      throw error;
    }
  }

  // Obtener información detallada de un branch
  async obtenerInfoBranch(branchName, repoType = 'main') {
    try {
      const response = await api.get(`/github/branch/${repoType}/${encodeURIComponent(branchName)}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo información del branch:', error);
      throw error;
    }
  }

  // Obtener estado de sincronización (texto descriptivo)
  obtenerEstadoSincronizacion(lastSync) {
    if (!lastSync) return 'Nunca sincronizado';
    
    const ahora = new Date();
    const ultimaSync = new Date(lastSync);
    const diferencia = ahora - ultimaSync;
    
    const minutos = Math.floor(diferencia / (1000 * 60));
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    
    if (minutos < 1) return 'Recién sincronizado';
    if (minutos < 60) return `Sincronizado hace ${minutos} minuto${minutos > 1 ? 's' : ''}`;
    if (horas < 24) return `Sincronizado hace ${horas} hora${horas > 1 ? 's' : ''}`;
    return `Sincronizado hace ${dias} día${dias > 1 ? 's' : ''}`;
  }
}

const githubService = new GitHubService();
export default githubService; 