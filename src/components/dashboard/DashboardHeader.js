import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, RefreshCw } from 'lucide-react';

const DashboardHeader = ({ 
  username, 
  storiesCount, 
  onRefresh, 
  refreshing, 
  lastUpdate 
}) => {
  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Hola, {username}!
          </h1>
          <p className="text-gray-600 flex items-center gap-2">
            <BookOpen size={20} />
            Tienes {storiesCount} {storiesCount === 1 ? 'cuento' : 'cuentos'}
            {lastUpdate && (
              <span className="text-sm text-gray-500">
                • Actualizado a las {formatTime(lastUpdate)}
              </span>
            )}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 rounded-lg transition-colors"
          >
            <RefreshCw 
              size={16} 
              className={refreshing ? 'animate-spin' : ''} 
            />
            {refreshing ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;