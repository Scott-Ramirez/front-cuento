import React, { createContext, useContext, useState, useCallback } from 'react';

const SystemAlertsContext = createContext();

export const useSystemAlerts = () => {
  const context = useContext(SystemAlertsContext);
  if (!context) {
    throw new Error('useSystemAlerts must be used within a SystemAlertsProvider');
  }
  return context;
};

export const SystemAlertsProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  const removeAlert = useCallback((id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  const addAlert = useCallback((alert) => {
    const id = Date.now() + Math.random();
    const newAlert = {
      id,
      type: 'info', // info, warning, error, success, update
      title: '',
      message: '',
      duration: 5000, // 5 seconds default
      dismissible: true,
      ...alert
    };

    setAlerts(prev => [...prev, newAlert]);

    // Auto dismiss after duration
    if (newAlert.duration > 0) {
      setTimeout(() => {
        removeAlert(id);
      }, newAlert.duration);
    }

    return id;
  }, [removeAlert]);

  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Specific methods for different alert types
  const showMaintenanceAlert = useCallback((message, options = {}) => {
    // Verificar si ya hay una alerta de mantenimiento activa
    const hasMaintenanceAlert = alerts.some(alert => alert.type === 'warning' && alert.title.includes('Mantenimiento'));
    if (hasMaintenanceAlert) {
      return; // No mostrar alertas duplicadas
    }
    
    return addAlert({
      type: 'warning',
      title: '⚠️ Mantenimiento programado',
      message,
      duration: 0,
      ...options
    });
  }, [addAlert, alerts]);

  const showInfoAlert = useCallback((message, options = {}) => {
    return addAlert({
      type: 'info',
      title: 'ℹ️ Información',
      message,
      ...options
    });
  }, [addAlert]);

  const showSuccessAlert = useCallback((message, options = {}) => {
    return addAlert({
      type: 'success',
      title: '✅ Éxito',
      message,
      ...options
    });
  }, [addAlert]);

  const showWarningAlert = useCallback((message, options = {}) => {
    return addAlert({
      type: 'warning',
      title: '⚠️ Advertencia',
      message,
      ...options
    });
  }, [addAlert]);

  const showErrorAlert = useCallback((message, options = {}) => {
    return addAlert({
      type: 'error',
      title: '❌ Error',
      message,
      ...options
    });
  }, [addAlert]);

  const handleUpdateNow = useCallback(() => {
    // Limpiar alertas de actualización
    setAlerts(prev => prev.filter(alert => alert.type !== 'update'));
    
    // Recargar la página para obtener la nueva versión
    window.location.reload();
  }, []);

  const value = {
    alerts,
    addAlert,
    removeAlert,
    clearAllAlerts,
    showMaintenanceAlert,
    showInfoAlert,
    showSuccessAlert,
    showWarningAlert,
    showErrorAlert,
    handleUpdateNow
  };

  return (
    <SystemAlertsContext.Provider value={value}>
      {children}
    </SystemAlertsContext.Provider>
  );
};