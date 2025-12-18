import React from 'react';
import { useSystemAlerts } from '../context/SystemAlertsContext';

const SystemAlertDemo = () => {
  const { 
    showInfoAlert, 
    showSuccessAlert, 
    showWarningAlert, 
    showErrorAlert, 
    showUpdateAlert, 
    showMaintenanceAlert 
  } = useSystemAlerts();

  const demoAlerts = [
    {
      name: 'Info Alert',
      action: () => showInfoAlert('Esta es una alerta informativa del sistema.'),
      color: 'blue'
    },
    {
      name: 'Success Alert', 
      action: () => showSuccessAlert('¡Operación completada exitosamente!'),
      color: 'green'
    },
    {
      name: 'Warning Alert',
      action: () => showWarningAlert('Advertencia: Verifique sus configuraciones.'),
      color: 'yellow'
    },
    {
      name: 'Error Alert',
      action: () => showErrorAlert('Error: No se pudo completar la operación.'),
      color: 'red'
    },
    {
      name: 'Update Alert',
      action: () => showUpdateAlert('Nueva versión 2.1.0 disponible con mejoras importantes.'),
      color: 'purple'
    },
    {
      name: 'Maintenance Alert',
      action: () => showMaintenanceAlert('Mantenimiento programado: El sistema estará fuera de línea por 30 minutos.', { duration: 0 }),
      color: 'orange'
    }
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Sistema de Alertas - Demo
      </h3>
      <p className="text-sm text-gray-600 mb-6">
        Haz clic en los botones para probar diferentes tipos de alertas del sistema.
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {demoAlerts.map((alert, index) => (
          <button
            key={index}
            onClick={alert.action}
            className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
              alert.color === 'blue' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
              alert.color === 'green' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
              alert.color === 'yellow' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
              alert.color === 'red' ? 'bg-red-100 text-red-800 hover:bg-red-200' :
              alert.color === 'purple' ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' :
              'bg-orange-100 text-orange-800 hover:bg-orange-200'
            }`}
          >
            {alert.name}
          </button>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <h4 className="font-medium text-gray-900 mb-2">Uso en Producción:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Las alertas de actualización se muestran automáticamente</li>
          <li>• Las alertas se pueden configurar para auto-desaparecer</li>
          <li>• El sistema verifica actualizaciones cada 15 minutos</li>
          <li>• Se puede activar modo de mantenimiento desde variables de entorno</li>
        </ul>
      </div>
    </div>
  );
};

export default SystemAlertDemo;