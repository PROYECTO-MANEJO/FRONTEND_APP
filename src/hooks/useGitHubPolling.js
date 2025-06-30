import { useEffect, useCallback, useRef } from 'react';
import githubService from '../services/githubService';
import { useAuth } from '../context/AuthContext';

const useGitHubPolling = (interval = 180000) => { // 3 minutos por defecto
  const intervalRef = useRef(null);
  const { user } = useAuth();

  const detectarPRs = useCallback(async () => {
    try {
      // Solo hacer polling si el usuario es MASTER o ADMIN
      if (!user || !['MASTER', 'ADMINISTRADOR'].includes(user.rol)) {
        return;
      }

      console.log('[GitHub Polling] Detectando PRs automáticamente...');
      const response = await githubService.detectarPullRequests();
      
      if (response.success && response.data.solicitudesActualizadas?.length > 0) {
        console.log(`[GitHub Polling] ${response.data.solicitudesActualizadas.length} solicitudes actualizadas con nuevos PRs`);
        
        // Aquí podrías agregar una notificación o callback
        // onPRsDetectados?.(response.data.solicitudesActualizadas);
      }
    } catch (error) {
      console.warn('[GitHub Polling] Error detectando PRs:', error);
    }
  }, [user]);

  const verificarMerges = useCallback(async () => {
    try {
      // Solo hacer polling si el usuario es MASTER o ADMIN
      if (!user || !['MASTER', 'ADMINISTRADOR'].includes(user.rol)) {
        return;
      }

      console.log('[GitHub Polling] Verificando merges automáticamente...');
      const response = await githubService.verificarMerges();
      
      if (response.success) {
        const mergeados = response.data.filter(item => item.merged);
        if (mergeados.length > 0) {
          console.log(`[GitHub Polling] ${mergeados.length} PRs fueron mergeados y actualizados a COMPLETADA`);
          
          // Aquí podrías agregar una notificación o callback
          // onMergesDetectados?.(mergeados);
        }
      }
    } catch (error) {
      console.warn('[GitHub Polling] Error verificando merges:', error);
    }
  }, [user]);

  const ejecutarPolling = useCallback(async () => {
    await Promise.all([
      detectarPRs(),
      verificarMerges()
    ]);
  }, [detectarPRs, verificarMerges]);

  const iniciarPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Ejecutar inmediatamente una vez
    ejecutarPolling();

    // Luego ejecutar cada 'interval' milisegundos
    intervalRef.current = setInterval(ejecutarPolling, interval);
    
    console.log(`[GitHub Polling] Iniciado con intervalo de ${interval/1000} segundos`);
  }, [ejecutarPolling, interval]);

  const detenerPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      console.log('[GitHub Polling] Detenido');
    }
  }, []);

  useEffect(() => {
    // Solo iniciar polling si el usuario es MASTER o ADMIN
    if (user && ['MASTER', 'ADMINISTRADOR'].includes(user.rol)) {
      iniciarPolling();
    } else {
      detenerPolling();
    }

    // Cleanup al desmontar el componente
    return () => {
      detenerPolling();
    };
  }, [user, iniciarPolling, detenerPolling]);

  return {
    iniciarPolling,
    detenerPolling,
    ejecutarPolling
  };
};

export default useGitHubPolling; 