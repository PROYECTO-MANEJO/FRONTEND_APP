import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DeveloperRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Verificar que el usuario tenga rol de DESARROLLADOR
  if (user?.rol !== 'DESARROLLADOR') {
    // Redirigir según el rol del usuario
    if (user?.rol === 'ADMINISTRADOR' || user?.rol === 'MASTER') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default DeveloperRoute; 