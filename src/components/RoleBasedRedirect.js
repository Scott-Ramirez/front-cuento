import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleBasedRedirect = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Si no está autenticado, mostrar Home normal
    return <Navigate to="/home" replace />;
  }

  if (isAdmin()) {
    // Si es admin, ir al panel de admin
    return <Navigate to="/admin" replace />;
  } else {
    // Si es usuario normal, ir al dashboard
    return <Navigate to="/dashboard" replace />;
  }
};

export default RoleBasedRedirect;