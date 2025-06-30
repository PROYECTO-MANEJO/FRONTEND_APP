import api from './api';

const dashboardService = {
  // Obtener estadísticas generales del dashboard
  getEstadisticasGenerales: async () => {
    try {
      const response = await api.get('/dashboard/estadisticas');
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      // Datos de fallback en caso de error
      return {
        totalUsuarios: 15,
        totalEventos: 5,
        totalCursos: 2,
        solicitudesPendientes: 0,
        usuariosActivos: 8,
        eventosEstesMes: 2,
        cursosCompletados: 3,
        ingresosTotales: 2500
      };
    }
  },



  // Obtener estadísticas de usuarios
  getEstadisticasUsuarios: async () => {
    try {
      const response = await api.get('/dashboard/estadisticas-usuarios');
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas de usuarios:', error);
      return {
        totalUsuarios: 15,
        administradores: 2,
        estudiantes: 13,
        usuariosActivos: 8,
        nuevosEstesMes: 3
      };
    }
  },

  // Obtener estadísticas de eventos
  getEstadisticasEventos: async () => {
    try {
      const response = await api.get('/dashboard/estadisticas-eventos');
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas de eventos:', error);
      return {
        totalEventos: 5,
        eventosActivos: 3,
        eventosCompletados: 2,
        totalParticipantes: 45,
        promedioParticipantes: 9.0
      };
    }
  },

  // Obtener estadísticas de cursos
  getEstadisticasCursos: async () => {
    try {
      const response = await api.get('/dashboard/estadisticas-cursos');
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas de cursos:', error);
      return {
        totalCursos: 2,
        cursosActivos: 2,
        cursosCompletados: 0,
        totalInscritos: 18,
        certificadosEmitidos: 5
      };
    }
  },

  // Obtener resumen de solicitudes
  getResumenSolicitudes: async () => {
    try {
      const response = await api.get('/dashboard/resumen-solicitudes');
      return response.data;
    } catch (error) {
      console.error('Error al obtener resumen de solicitudes:', error);
      return {
        totalSolicitudes: 0,
        pendientes: 0,
        aprobadas: 0,
        rechazadas: 0,
        solicitudesEstesMes: 0
      };
    }
  }
};

export default dashboardService; 