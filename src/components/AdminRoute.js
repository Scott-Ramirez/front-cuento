import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin()) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <h3 className="font-bold">Acceso Denegado</h3>
            <p>No tienes permisos de administrador para acceder a esta página.</p>
            <p className="text-sm mt-2">Tu rol actual: {user?.role || 'usuario'}</p>
          </div>
          <button
            onClick={() => window.history.back()}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminRoute;