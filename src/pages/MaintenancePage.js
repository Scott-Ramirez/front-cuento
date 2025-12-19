import React from 'react';
import { Settings, Clock, AlertTriangle, Wrench } from 'lucide-react';

const MaintenancePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-4">
            <Settings className="w-10 h-10 text-orange-600 animate-spin" style={{animationDuration: '3s'}} />
          </div>
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Wrench className="w-5 h-5 text-orange-600" />
            <h1 className="text-2xl font-bold text-gray-900">Sistema en Mantenimiento</h1>
          </div>
        </div>

        {/* Main Message */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-orange-500 mr-2" />
            <span className="text-orange-600 font-semibold">Temporalmente fuera de servicio</span>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Estamos mejorando para ti
          </h2>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            Estamos realizando actualizaciones importantes para mejorar tu experiencia. 
            El servicio volverá a estar disponible en breve.
          </p>

          {/* Status */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              <span>Tiempo estimado: 15-30 minutos</span>
            </div>
            
            <div className="mt-3 flex justify-center">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            ¿Necesitas ayuda urgente?{' '}
            <a 
              href="mailto:support@scottsoft.uk" 
              className="text-orange-600 hover:text-orange-700 font-medium"
            >
              Contáctanos
            </a>
          </p>
        </div>

        {/* Auto-refresh notice */}
        <div className="text-center mt-4">
          <p className="text-xs text-gray-400">
            Esta página se actualizará automáticamente cuando el servicio esté disponible
          </p>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;