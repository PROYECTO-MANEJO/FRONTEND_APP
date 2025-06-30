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
        console.log('🚀 Iniciando obtenerInfoGitHub para solicitud:', solicitudId);
        
        // Log antes de hacer la petición
        console.log('📡 Realizando petición a:', `/github/dev/solicitud/${solicitudId}`);
        
        const response = await api.get(`/github/dev/solicitud/${solicitudId}`);
        
        // Log de la respuesta completa
        console.log('📥 Respuesta completa:', {
            status: response.status,
            headers: response.headers,
            data: response.data
        });

        // Log específico de los datos de GitHub
        if (response.data.success) {
            console.log('✅ Datos de GitHub obtenidos:', {
                branch: response.data.data?.github_branch_name,
                prNumber: response.data.data?.github_pr_number,
                prUrl: response.data.data?.github_pr_url,
                lastSync: response.data.data?.github_last_sync
            });
        } else {
            console.log('⚠️ Respuesta sin éxito:', response.data);
        }

        return response.data;
    } catch (error) {
        // Log detallado del error
        console.error('❌ Error en obtenerInfoGitHub:', {
            mensaje: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            responseData: error.response?.data,
            config: {
                url: error.config?.url,
                method: error.config?.method,
                headers: error.config?.headers
            }
        });
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
  async crearBranch(solicitudId, repoType = 'frontend', baseBranch = 'main') {
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
  async crearPullRequest(solicitudId, branchName, repoType = 'frontend', baseBranch = 'main') {
    try {
      const response = await api.post(`/github/dev/solicitud/${solicitudId}/crear-pull-request`, {
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
  async obtenerInfoBranch(branchName, repoType = 'frontend') {
    try {
      const response = await api.get(`/github/branch/${repoType}/${encodeURIComponent(branchName)}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo información del branch:', error);
      throw error;
    }
  }

  // Formatear tiempo de manera legible
  formatearTiempo(fechaISO) {
    if (!fechaISO) return 'Fecha no disponible';
    
    const fecha = new Date(fechaISO);
    const ahora = new Date();
    const diferencia = ahora - fecha;
    
    const minutos = Math.floor(diferencia / (1000 * 60));
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    
    if (minutos < 1) return 'Hace un momento';
    if (minutos < 60) return `Hace ${minutos} minuto${minutos > 1 ? 's' : ''}`;
    if (horas < 24) return `Hace ${horas} hora${horas > 1 ? 's' : ''}`;
    if (dias < 30) return `Hace ${dias} día${dias > 1 ? 's' : ''}`;
    
    // Para fechas más antiguas, mostrar fecha formateada
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  // ===================================
  // NUEVAS FUNCIONALIDADES PARA DESARROLLADORES
  // ===================================

  // Crear branch con GitFlow
  async crearBranchGitFlow(solicitudId, branchType, baseBranch, repoType) {
    try {
      const response = await api.post(`/github/dev/solicitud/${solicitudId}/crear-branch-gitflow`, {
        branchType,
        baseBranch,
        repoType
      });
      return response.data;
    } catch (error) {
      console.error('Error creando branch GitFlow:', error);
      throw error;
    }
  }

  // Crear Pull Request para desarrolladores
  async crearPullRequestDesarrollador(solicitudId, branchName, repoType, baseBranch) {
    try {
      const response = await api.post(`/github/dev/solicitud/${solicitudId}/crear-pull-request`, {
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

  // Obtener tipos GitFlow disponibles
  async obtenerTiposGitFlow() {
    try {
      const response = await api.get('/github/dev/gitflow-types');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo tipos GitFlow:', error);
      
      // Si es error 503 (GitHub no configurado), lanzar error específico
      if (error.response?.status === 503) {
        const configError = new Error('GitHub no está configurado en el servidor');
        configError.code = 'GITHUB_NOT_CONFIGURED';
        configError.suggestion = error.response.data.suggestion;
        throw configError;
      }
      
      throw error;
    }
  }

  // Obtener branches disponibles en repositorio
  async obtenerBranchesRepositorio(repoType) {
    try {
      const response = await api.get(`/github/dev/branches/${repoType}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo branches:', error);
      
      // Si es error 503 (GitHub no configurado), lanzar error específico
      if (error.response?.status === 503) {
        const configError = new Error('GitHub no está configurado en el servidor');
        configError.code = 'GITHUB_NOT_CONFIGURED';
        configError.suggestion = error.response.data.suggestion;
        throw configError;
      }
      
      throw error;
    }
  }

  // Detectar PRs automáticamente (para polling)
  async detectarPullRequests() {
    try {
      const response = await api.post('/github/detectar-prs');
      return response.data;
    } catch (error) {
      console.error('Error detectando PRs:', error);
      throw error;
    }
  }

  // Verificar merges (para polling)
  async verificarMerges() {
    try {
      const response = await api.post('/github/verificar-merges');
      return response.data;
    } catch (error) {
      console.error('Error verificando merges:', error);
      throw error;
    }
  }

  // Formatear nombre de branch para mostrar
  formatearNombreBranch(branchName) {
    if (!branchName) return 'Sin branch';
    
    // Extraer información del nombre del branch GitFlow
    const parts = branchName.split('/');
    if (parts.length >= 2) {
      const type = parts[0];
      const name = parts[1];
      return {
        tipo: type,
        nombre: name,
        completo: branchName,
        tipoFormateado: this.formatearTipoBranch(type)
      };
    }
    
    return {
      tipo: 'custom',
      nombre: branchName,
      completo: branchName,
      tipoFormateado: 'Personalizado'
    };
  }

  // Formatear tipo de branch para mostrar
  formatearTipoBranch(tipo) {
    const tipos = {
      'feature': 'Funcionalidad',
      'hotfix': 'Corrección Urgente',
      'bugfix': 'Corrección de Bug',
      'release': 'Versión'
    };
    return tipos[tipo] || tipo;
  }

  // Obtener icono para tipo de branch
  obtenerIconoTipoBranch(tipo) {
    const iconos = {
      'feature': '🔧',
      'hotfix': '🚨',
      'bugfix': '🐛',
      'release': '🚀'
    };
    return iconos[tipo] || '📝';
  }

  // Validar si un branch name es válido para GitFlow
  validarNombreBranchGitFlow(branchName) {
    if (!branchName) return false;
    
    const gitFlowPattern = /^(feature|hotfix|bugfix|release)\/[a-zA-Z0-9_-]+$/;
    return gitFlowPattern.test(branchName);
  }

  // Generar sugerencias de nombres de branch
  generarSugerenciasNombreBranch(solicitud, tipoSelected) {
    if (!solicitud || !tipoSelected) return [];
    
    const shortId = solicitud.id_sol.substring(0, 5);
    const cleanTitle = solicitud.titulo_sol
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 25);
    
    const sugerencias = [
      `${tipoSelected}/${shortId}_${cleanTitle}`,
      `${tipoSelected}/${shortId}_fix`,
      `${tipoSelected}/${shortId}_update`,
      `${tipoSelected}/${shortId}_improvement`
    ];
    
    return sugerencias.filter((s, i, arr) => arr.indexOf(s) === i); // Remover duplicados
  }

  // Validar token personal de GitHub
  async validarTokenPersonal(token) {
    try {
      const response = await api.post('/github/dev/validate-token', { token });
      return response.data;
    } catch (error) {
      console.error('Error validando token personal:', error);
      throw error;
    }
  }

  // Obtener información completa de un Pull Request para revisión del MASTER
  async obtenerInformacionCompletaPR(prNumber, repoUrl) {
    try {
      // Codificar la URL del repositorio para que sea segura en la URL
      const encodedRepoUrl = encodeURIComponent(repoUrl);
      
      const response = await api.get(`/github/master/pr/${prNumber}/repo/${encodedRepoUrl}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo información completa del PR:', error);
      throw error;
    }
  }

  // Función helper para formatear información de commits del PR
  formatearCommitsPR(commits) {
    if (!commits || !Array.isArray(commits)) return [];
    
    return commits.map(commit => ({
      ...commit,
      formattedDate: new Date(commit.date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      shortMessage: commit.message && commit.message.length > 80 
        ? commit.message.substring(0, 80) + '...' 
        : commit.message
    }));
  }

  // Función helper para formatear archivos modificados del PR
  formatearArchivosPR(files) {
    if (!files || !Array.isArray(files)) return [];
    
    return files.map(file => ({
      ...file,
      statusLabel: this.obtenerEtiquetaEstadoArchivo(file.status),
      statusColor: this.obtenerColorEstadoArchivo(file.status),
      extension: this.obtenerExtensionArchivo(file.filename)
    }));
  }

  // Helper para obtener etiqueta de estado de archivo
  obtenerEtiquetaEstadoArchivo(status) {
    const statusMap = {
      'added': 'Agregado',
      'modified': 'Modificado', 
      'removed': 'Eliminado',
      'renamed': 'Renombrado'
    };
    return statusMap[status] || status;
  }

  // Helper para obtener color de estado de archivo
  obtenerColorEstadoArchivo(status) {
    const colorMap = {
      'added': '#22c55e',
      'modified': '#3b82f6',
      'removed': '#ef4444',
      'renamed': '#f59e0b'
    };
    return colorMap[status] || '#6b7280';
  }

  // Helper para obtener extensión de archivo
  obtenerExtensionArchivo(filename) {
    if (!filename) return '';
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1] : '';
  }

  // Hacer merge automático de un Pull Request
  async mergePullRequestAutomatico(prNumber, repoType = 'frontend', mergeMethod = 'merge') {
    try {
      const response = await api.post('/github/master/merge-pr', {
        prNumber,
        repoType,
        mergeMethod
      });
      return response.data;
    } catch (error) {
      console.error('Error en merge automático:', error);
      throw error;
    }
  }
}

const githubService = new GitHubService();
export default githubService; 