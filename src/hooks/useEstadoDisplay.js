import { useMemo } from 'react';

/**
 * Hook personalizado para calcular y obtener el estado de visualización de un curso o evento
 * @param {Object} item - El curso o evento
 * @param {string} tipo - 'curso' o 'evento'
 * @returns {Object} - Estado y color para mostrar
 */
export const useEstadoDisplay = (item, tipo) => {
  const estado = useMemo(() => {
    // Si está cerrado, siempre mostrar FINALIZADO
    if (item?.estado === 'CERRADO') {
      return 'FINALIZADO';
    }

    const hoy = new Date();
    const inicio = new Date(tipo === 'curso' ? item?.fec_ini_cur : item?.fec_ini_eve);
    const fin = new Date(tipo === 'curso' ? item?.fec_fin_cur : item?.fec_fin_eve);

    // Si está activo pero ya pasó la fecha fin, mostrar FINALIZADO
    if (hoy > fin) {
      return 'FINALIZADO';
    }

    // Si aún no llega la fecha de inicio, mostrar PRÓXIMAMENTE
    if (hoy < inicio) {
      return 'PRÓXIMAMENTE';
    }

    // Si está entre las fechas y está activo, mostrar EN CURSO
    if (hoy >= inicio && hoy <= fin && item?.estado === 'ACTIVO') {
      return 'EN CURSO';
    }

    // Por defecto, mostrar FINALIZADO
    return 'FINALIZADO';
  }, [item, tipo]);

  const color = useMemo(() => {
    switch (estado) {
      case 'PRÓXIMAMENTE':
        return 'info';
      case 'EN CURSO':
        return 'success';
      case 'FINALIZADO':
        return 'error';
      default:
        return 'default';
    }
  }, [estado]);

  return { estado, color };
}; 