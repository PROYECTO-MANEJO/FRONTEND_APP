import React, { useState, useEffect } from 'react';
import githubService from '../../services/githubService';
import { useAuth } from '../../context/AuthContext';

const GitHubSection = ({ solicitud, onSolicitudUpdate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [tiposGitFlow, setTiposGitFlow] = useState([]);
  const [branchesDisponibles, setBranchesDisponibles] = useState({
    frontend: [],
    backend: []
  });
  const [infoGitHub, setInfoGitHub] = useState(null);
  const [tokenValidation, setTokenValidation] = useState(null);
  const [validatingToken, setValidatingToken] = useState(false);
  const [githubConfigError, setGithubConfigError] = useState(false);
  
  // Estados para formularios
  const [formCrearBranch, setFormCrearBranch] = useState({
    branchType: 'feature',
    baseBranch: '',
    repoType: 'frontend'
  });
  
  const [formCrearPR, setFormCrearPR] = useState({
    branchName: '',
    repoType: 'frontend',
    baseBranch: 'main'
  });

  const [showCrearBranch, setShowCrearBranch] = useState(false);
  const [showCrearPR, setShowCrearPR] = useState(false);

  useEffect(() => {
    cargarDatosIniciales();
  }, [solicitud?.id_sol]);

  const cargarDatosIniciales = async () => {
    try {
      setLoading(true);
      
      // Cargar tipos GitFlow
      try {
        const tiposResponse = await githubService.obtenerTiposGitFlow();
        if (tiposResponse.success) {
          setTiposGitFlow(tiposResponse.data);
          if (tiposResponse.data.length > 0) {
            setFormCrearBranch(prev => ({
              ...prev,
              baseBranch: tiposResponse.data[0].defaultBase
            }));
          }
        }
      } catch (error) {
        console.warn('Error cargando tipos GitFlow:', error);
        
        // Detectar si es error de configuración de GitHub
        if (error.code === 'GITHUB_NOT_CONFIGURED' || error.response?.status === 503) {
          setGithubConfigError(true);
        }
        
        // Valores por defecto si no se puede cargar
        setTiposGitFlow([
          { type: 'feature', defaultBase: 'develop', description: 'Nueva funcionalidad' },
          { type: 'hotfix', defaultBase: 'main', description: 'Corrección urgente' },
          { type: 'bugfix', defaultBase: 'develop', description: 'Corrección de errores' }
        ]);
        setFormCrearBranch(prev => ({ ...prev, baseBranch: 'develop' }));
      }

      // Cargar branches disponibles
      await cargarBranchesDisponibles();
      
      // Cargar información actual de GitHub
      await cargarInfoGitHub();
      
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarBranchesDisponibles = async () => {
    try {
      const [frontendResponse, backendResponse] = await Promise.all([
        githubService.obtenerBranchesRepositorio('frontend').catch(e => ({ success: false, error: e.message })),
        githubService.obtenerBranchesRepositorio('backend').catch(e => ({ success: false, error: e.message }))
      ]);

      setBranchesDisponibles({
        frontend: frontendResponse.success ? frontendResponse.data : [
          { name: 'main', protected: true },
          { name: 'develop', protected: false }
        ],
        backend: backendResponse.success ? backendResponse.data : [
          { name: 'main', protected: true },
          { name: 'develop', protected: false }
        ]
      });
    } catch (error) {
      console.error('Error cargando branches:', error);
      // Valores por defecto
      setBranchesDisponibles({
        frontend: [{ name: 'main', protected: true }, { name: 'develop', protected: false }],
        backend: [{ name: 'main', protected: true }, { name: 'develop', protected: false }]
      });
    }
  };

  const cargarInfoGitHub = async () => {
    try {
      const response = await githubService.obtenerInfoGitHub(solicitud.id_sol);
      if (response.success) {
        setInfoGitHub(response.data);
        
        // Actualizar formulario de PR con datos existentes
        if (response.data.github_branch_name) {
          setFormCrearPR(prev => ({
            ...prev,
            branchName: response.data.github_branch_name
          }));
        }
      }
    } catch (error) {
      console.warn('Error cargando info GitHub:', error);
      // No cargar info de GitHub si no está configurado, pero no romper el componente
      setInfoGitHub(null);
    }
  };

  const handleTipoBranchChange = (branchType) => {
    const tipoSeleccionado = tiposGitFlow.find(t => t.type === branchType);
    setFormCrearBranch(prev => ({
      ...prev,
      branchType,
      baseBranch: tipoSeleccionado?.defaultBase || 'main'
    }));
  };

  const handleCrearBranch = async () => {
    try {
      setLoading(true);
      
      const response = await githubService.crearBranchGitFlow(
        solicitud.id_sol,
        formCrearBranch.branchType,
        formCrearBranch.baseBranch,
        formCrearBranch.repoType
      );

      if (response.success) {
        alert(`Branch ${response.data.branch.alreadyExists ? 'ya existía' : 'creado exitosamente'}: ${response.data.branch.branchName}`);
        await cargarInfoGitHub();
        setShowCrearBranch(false);
        onSolicitudUpdate?.(response.data.solicitud);
      }
    } catch (error) {
      console.error('Error creando branch:', error);
      alert('Error creando branch: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCrearPR = async () => {
    try {
      setLoading(true);
      
      const response = await githubService.crearPullRequestDesarrollador(
        solicitud.id_sol,
        formCrearPR.branchName,
        formCrearPR.repoType,
        formCrearPR.baseBranch
      );

      if (response.success) {
        alert(`Pull Request creado exitosamente: #${response.data.pullRequest.number}`);
        await cargarInfoGitHub();
        setShowCrearPR(false);
        onSolicitudUpdate?.(response.data.solicitud);
      }
    } catch (error) {
      console.error('Error creando PR:', error);
      alert('Error creando Pull Request: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handlePasarAEsperandoAprobacion = async () => {
    if (!window.confirm('¿Estás seguro de que quieres marcar esta solicitud como lista para revisión?')) {
      return;
    }

    try {
      setLoading(true);
      
      const response = await githubService.cambiarAEsperandoAprobacion(solicitud.id_sol);

      if (response.success) {
        alert('Estado actualizado a ESPERANDO_APROBACION');
        onSolicitudUpdate?.(response.data);
      }
    } catch (error) {
      console.error('Error cambiando estado:', error);
      alert('Error cambiando estado: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const validarTokenPersonal = async () => {
    if (!user?.github_token) {
      alert('No tienes un token GitHub configurado en tu perfil.');
      return;
    }

    try {
      setValidatingToken(true);
      
      const response = await githubService.validarTokenPersonal(user.github_token);
      
      if (response.success) {
        setTokenValidation(response.data);
        
        if (response.data.valid) {
          alert(`Token válido ✅\nUsuario: ${response.data.user.login}\nNombre: ${response.data.user.name || 'No especificado'}`);
        } else {
          alert(`Token inválido ❌\n${response.data.error}`);
        }
      }
    } catch (error) {
      console.error('Error validando token:', error);
      alert('Error validando token: ' + (error.response?.data?.message || error.message));
    } finally {
      setValidatingToken(false);
    }
  };



  if (loading && !infoGitHub) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            Gestión de GitHub
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={validarTokenPersonal}
              className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 transition-colors"
              disabled={validatingToken || !user?.github_token}
              title={!user?.github_token ? 'Configura tu token GitHub en el perfil' : 'Validar token GitHub personal'}
            >
              {validatingToken ? 'Validando...' : '🔑 Token'}
            </button>
            <button
              onClick={() => setShowCrearBranch(!showCrearBranch)}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
              disabled={loading}
            >
              Crear Branch
            </button>
            <button
              onClick={() => setShowCrearPR(!showCrearPR)}
              className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
              disabled={loading}
            >
              Crear PR
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Alerta de configuración de GitHub */}
        {githubConfigError && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2">⚠️ GitHub No Configurado</h4>
            <p className="text-yellow-700 text-sm mb-3">
              El servidor no tiene configuración de GitHub o hay problemas de conectividad. 
              Puedes seguir trabajando con funcionalidad limitada:
            </p>
            <ul className="text-yellow-700 text-sm space-y-1 ml-4">
              <li>• Los formularios están disponibles para testing</li>
              <li>• No se pueden crear branches/PRs automáticamente</li>
              <li>• Contacta al administrador para configurar GitHub</li>
            </ul>
          </div>
        )}

        {/* Información de Token GitHub */}
        {tokenValidation && (
          <div className={`rounded-lg p-4 border ${tokenValidation.valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <h4 className="font-medium mb-3 flex items-center">
              {tokenValidation.valid ? '✅ Token GitHub Válido' : '❌ Token GitHub Inválido'}
            </h4>
            {tokenValidation.valid && tokenValidation.user && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Usuario:</span>
                  <div className="font-mono text-xs">{tokenValidation.user.login}</div>
                </div>
                <div>
                  <span className="text-gray-600">Nombre:</span>
                  <div className="text-xs">{tokenValidation.user.name || 'No especificado'}</div>
                </div>
                {tokenValidation.permissions && (
                  <div className="md:col-span-2">
                    <span className="text-gray-600">Permisos en repositorios:</span>
                    <div className="mt-1 flex space-x-2">
                      {Object.entries(tokenValidation.permissions).map(([repo, perms]) => (
                        <span
                          key={repo}
                          className={`px-2 py-1 text-xs rounded ${perms.push ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                        >
                          {repo}: {perms.push ? 'Push ✓' : 'Solo lectura'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {!tokenValidation.valid && (
              <div className="text-red-700 text-sm">
                {tokenValidation.error}
              </div>
            )}
          </div>
        )}

        {/* Estado actual */}
        {infoGitHub && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Estado Actual</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {infoGitHub.github_branch_name && (
                <div>
                  <span className="text-gray-600">Branch:</span>
                  <div className="mt-1">
                    <span className="font-mono text-xs bg-gray-200 px-2 py-1 rounded">
                      {infoGitHub.github_branch_name}
                    </span>
                  </div>
                </div>
              )}
              
              {infoGitHub.github_pr_number && (
                <div>
                  <span className="text-gray-600">Pull Request:</span>
                  <div className="mt-1">
                    <a
                      href={infoGitHub.github_pr_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      #{infoGitHub.github_pr_number}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Formulario crear branch */}
        {showCrearBranch && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-4">Crear Nuevo Branch</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Branch
                </label>
                <select
                  value={formCrearBranch.branchType}
                  onChange={(e) => handleTipoBranchChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  {tiposGitFlow.map(tipo => (
                    <option key={tipo.type} value={tipo.type}>
                      {tipo.type} - {tipo.description}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch Base
                </label>
                <select
                  value={formCrearBranch.baseBranch}
                  onChange={(e) => setFormCrearBranch(prev => ({ ...prev, baseBranch: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  {branchesDisponibles[formCrearBranch.repoType]?.map(branch => (
                    <option key={branch.name} value={branch.name}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Repositorio
                </label>
                <select
                  value={formCrearBranch.repoType}
                  onChange={(e) => setFormCrearBranch(prev => ({ ...prev, repoType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="frontend">Frontend</option>
                  <option value="backend">Backend</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setShowCrearBranch(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                onClick={handleCrearBranch}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                disabled={loading}
              >
                {loading ? 'Creando...' : 'Crear Branch'}
              </button>
            </div>
          </div>
        )}

        {/* Formulario crear PR */}
        {showCrearPR && (
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <h4 className="font-medium text-green-900 mb-4">Crear Pull Request</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Branch
                </label>
                <input
                  type="text"
                  value={formCrearPR.branchName}
                  onChange={(e) => setFormCrearPR(prev => ({ ...prev, branchName: e.target.value }))}
                  placeholder="feature/12345_mi_branch"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch Base
                </label>
                <select
                  value={formCrearPR.baseBranch}
                  onChange={(e) => setFormCrearPR(prev => ({ ...prev, baseBranch: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  {branchesDisponibles[formCrearPR.repoType]?.map(branch => (
                    <option key={branch.name} value={branch.name}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Repositorio
                </label>
                <select
                  value={formCrearPR.repoType}
                  onChange={(e) => setFormCrearPR(prev => ({ ...prev, repoType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="frontend">Frontend</option>
                  <option value="backend">Backend</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setShowCrearPR(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                onClick={handleCrearPR}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                disabled={loading || !formCrearPR.branchName}
              >
                {loading ? 'Creando...' : 'Crear Pull Request'}
              </button>
            </div>
          </div>
        )}

        {/* Botón pasar a esperando aprobación */}
        {solicitud.estado_sol === 'EN_DESARROLLO' && infoGitHub?.github_pr_number && (
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-yellow-900">¿Terminaste el desarrollo?</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Marca la solicitud como lista para revisión cuando hayas completado todos los cambios.
                </p>
              </div>
              <button
                onClick={handlePasarAEsperandoAprobacion}
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                disabled={loading}
              >
                {loading ? 'Actualizando...' : 'Listo para Revisión'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GitHubSection; 