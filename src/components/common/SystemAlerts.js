import React from 'react';
import { X, RefreshCw, AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';
import { useSystemAlerts } from '../../context/SystemAlertsContext';

const SystemAlerts = () => {
  const { alerts, removeAlert, handleUpdateNow } = useSystemAlerts();

  if (alerts.length === 0) return null;

  const getAlertStyles = (type) => {
    const styles = {
      info: {
        bg: 'bg-blue-50 border-blue-200',
        text: 'text-blue-800',
        icon: Info,
        iconColor: 'text-blue-600'
      },
      success: {
        bg: 'bg-green-50 border-green-200',
        text: 'text-green-800',
        icon: CheckCircle,
        iconColor: 'text-green-600'
      },
      warning: {
        bg: 'bg-yellow-50 border-yellow-200',
        text: 'text-yellow-800',
        icon: AlertTriangle,
        iconColor: 'text-yellow-600'
      },
      error: {
        bg: 'bg-red-50 border-red-200',
        text: 'text-red-800',
        icon: XCircle,
        iconColor: 'text-red-600'
      },
      update: {
        bg: 'bg-purple-50 border-purple-200',
        text: 'text-purple-800',
        icon: RefreshCw,
        iconColor: 'text-purple-600'
      }
    };
    return styles[type] || styles.info;
  };

  const renderModalAlert = (alert) => {
    const styles = getAlertStyles(alert.type);
    const Icon = styles.icon;
    
    return (
      <div
        key={alert.id}
        className="fixed inset-0 z-50 flex items-center justify-center"
      >
        {/* Overlay oscuro */}
        <div 
          className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={() => removeAlert(alert.id)}
        ></div>
        
        {/* Modal */}
        <div className={`relative ${styles.bg} border rounded-lg p-6 shadow-2xl max-w-md w-full mx-4 z-10`}>
          <div className="flex items-start gap-4">
            <Icon className={`${styles.iconColor} flex-shrink-0 mt-1`} size={24} />
            
            <div className="flex-1 min-w-0">
              {alert.title && (
                <div className={`${styles.text} font-bold text-lg mb-3`}>
                  {alert.title}
                </div>
              )}
              <div className={`${styles.text} text-sm leading-relaxed whitespace-pre-line`}>
                {alert.message}
              </div>
            </div>

            <button
              onClick={() => removeAlert(alert.id)}
              className={`${styles.iconColor} hover:opacity-70 transition-opacity flex-shrink-0`}
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderTopRightAlert = (alert) => {
    const styles = getAlertStyles(alert.type);
    const Icon = styles.icon;
    
    return (
      <div
        key={alert.id}
        className={`${styles.bg} border rounded-lg p-4 shadow-lg transition-all duration-300 ease-in-out`}
      >
        <div className="flex items-start gap-3">
          <Icon className={`${styles.iconColor} flex-shrink-0 mt-0.5`} size={20} />
          
          <div className="flex-1 min-w-0">
            {alert.title && (
              <div className={`${styles.text} font-semibold text-sm mb-1`}>
                {alert.title}
              </div>
            )}
            <div className={`${styles.text} text-sm leading-relaxed whitespace-pre-line`}>
              {alert.message}
            </div>

            {/* Action buttons for update alerts */}
            {alert.type === 'update' && (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={handleUpdateNow}
                  className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors flex items-center gap-1"
                >
                  <RefreshCw size={14} />
                  Actualizar ahora
                </button>
                <button
                  onClick={() => removeAlert(alert.id)}
                  className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300 transition-colors"
                >
                  Más tarde
                </button>
              </div>
            )}
          </div>

          {alert.dismissible && (
            <button
              onClick={() => removeAlert(alert.id)}
              className={`${styles.iconColor} hover:opacity-70 transition-opacity flex-shrink-0`}
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Modales centrados para alertas especiales */}
      {alerts
        .filter(alert => alert.isModal)
        .map(renderModalAlert)
      }
      
      {/* Alertas normales en la esquina superior derecha */}
      <div className="fixed top-4 right-4 z-40 space-y-2 max-w-md">
        {alerts
          .filter(alert => !alert.isModal)
          .map(renderTopRightAlert)
        }
      </div>
    </>
  );
};

export default SystemAlerts;