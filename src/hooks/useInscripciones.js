import { useState, useEffect, useCallback } from 'react';
import { inscripcionService } from '../services/inscripcionService';
import { useAuth } from '../context/AuthContext';

export const useInscripciones = () => {
  const [inscripcionesEventos, setInscripcionesEventos] = useState([]);
  const [inscripcionesCursos, setInscripcionesCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isAuthenticated } = useAuth();

  // Función para obtener inscripciones
  const cargarInscripciones = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setInscripcionesEventos([]);
      setInscripcionesCursos([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [eventosData, cursosData] = await Promise.all([
        inscripcionService.obtenerMisInscripcionesEventos().catch(() => []),
        inscripcionService.obtenerMisInscripcionesCursos().catch(() => [])
      ]);

      setInscripcionesEventos(eventosData || []);
      setInscripcionesCursos(cursosData || []);
    } catch (err) {
      console.error('Error al cargar inscripciones:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  // Cargar inscripciones al montar el hook o cuando cambie el usuario
  useEffect(() => {
    cargarInscripciones();
  }, [cargarInscripciones]);

  // Función para verificar si el usuario está inscrito en un evento
  const estaInscritoEnEvento = useCallback((eventoId) => {
    return inscripcionesEventos.find(inscripcion => 
      inscripcion.evento?.id_eve === eventoId || inscripcion.id_eve_ins === eventoId
    );
  }, [inscripcionesEventos]);

  // Función para verificar si el usuario está inscrito en un curso
  const estaInscritoEnCurso = useCallback((cursoId) => {
    return inscripcionesCursos.find(inscripcion => 
      inscripcion.curso?.id_cur === cursoId || inscripcion.id_cur_ins === cursoId
    );
  }, [inscripcionesCursos]);

  // Función para obtener el estado de inscripción de un evento
  const obtenerEstadoEvento = useCallback((eventoId) => {
    const inscripcion = estaInscritoEnEvento(eventoId);
    if (!inscripcion) return null;

    return {
      inscrito: true,
      estado: inscripcion.estado_pago || 'PENDIENTE',
      fechaInscripcion: inscripcion.fec_ins,
      metodoPago: inscripcion.met_pag_ins,
      valorPagado: inscripcion.val_ins,
      enlacePago: inscripcion.enl_ord_pag_ins,
      tieneComprobante: !!inscripcion.comprobante_pago_pdf,
      nombreComprobante: inscripcion.comprobante_filename,
      fechaSubidaComprobante: inscripcion.fec_subida_comprobante,
      fechaAprobacion: inscripcion.fec_aprobacion,
      inscripcion: inscripcion
    };
  }, [estaInscritoEnEvento]);

  // Función para obtener el estado de inscripción de un curso
  const obtenerEstadoCurso = useCallback((cursoId) => {
    const inscripcion = estaInscritoEnCurso(cursoId);
    if (!inscripcion) return null;

    return {
      inscrito: true,
      estado: inscripcion.estado_pago || 'PENDIENTE',
      fechaInscripcion: inscripcion.fec_ins,
      metodoPago: inscripcion.met_pag_ins,
      valorPagado: inscripcion.val_ins,
      enlacePago: inscripcion.enl_ord_pag_ins,
      tieneComprobante: !!inscripcion.comprobante_pago_pdf,
      nombreComprobante: inscripcion.comprobante_filename,
      fechaSubidaComprobante: inscripcion.fec_subida_comprobante,
      fechaAprobacion: inscripcion.fec_aprobacion,
      inscripcion: inscripcion
    };
  }, [estaInscritoEnCurso]);

  // Función para determinar si se puede inscribir (solo si no está inscrito o fue rechazado)
  const puedeInscribirse = useCallback((eventoId, esEvento = true) => {
    const estado = esEvento ? obtenerEstadoEvento(eventoId) : obtenerEstadoCurso(eventoId);
    
    if (!estado) return true; // No está inscrito, puede inscribirse
    
    // Solo puede volver a inscribirse si fue rechazado
    return estado.estado === 'RECHAZADO';
  }, [obtenerEstadoEvento, obtenerEstadoCurso]);

  return {
    inscripcionesEventos,
    inscripcionesCursos,
    loading,
    error,
    cargarInscripciones,
    estaInscritoEnEvento,
    estaInscritoEnCurso,
    obtenerEstadoEvento,
    obtenerEstadoCurso,
    puedeInscribirse
  };
}; 