import { useEffect, useCallback, useRef } from 'react';
import { useSystemAlerts } from '../context/SystemAlertsContext';

// Version del frontend - actualizar cuando haya cambios importantes
const CURRENT_VERSION = process.env.REACT_APP_VERSION || '0.0.1';

const useUpdateDetector = () => {
  const { showUpdateAlert, showMaintenanceAlert } = useSystemAlerts();
  const isCheckingRef = useRef(false);

  // Verificar si hay nueva versión disponible
  const checkForUpdates = useCallback(async () => {
    if (isCheckingRef.current) return; // Prevenir múltiples verificaciones simultáneas
    
    isCheckingRef.current = true;
    try {
      // Opción 1: Verificar contra un endpoint del backend
      const response = await fetch('http://localhost:3000/version');
      if (response.ok) {
        const { version, maintenance } = await response.json();
        
        if (maintenance) {
          showMaintenanceAlert(
            'El sistema estará en mantenimiento. Algunos servicios podrían no estar disponibles.',
            { duration: 0 }
          );
        }
        
        if (version && version !== CURRENT_VERSION) {
          showUpdateAlert(
            `Nueva versión ${version} disponible. Actualiza para obtener las últimas mejoras y correcciones.`,
            { duration: 0 }
          );
        }
      }
    } catch (error) {
      console.warn('No se pudo verificar actualizaciones:', error);
    } finally {
      isCheckingRef.current = false;
    }
  }, [showUpdateAlert, showMaintenanceAlert]);

  // Verificar si el código cambió (desarrollo)
  const checkForCodeChanges = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      // Verificar cada 30 segundos en desarrollo
      const interval = setInterval(() => {
        fetch(window.location.href, { 
          cache: 'no-cache',
          method: 'HEAD'
        }).catch(() => {
          // Si hay error, probablemente hay cambios
          showUpdateAlert(
            'Se detectaron cambios en la aplicación.',
            { duration: 0 }
          );
          clearInterval(interval);
        });
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [showUpdateAlert]);

  // Manual trigger para mostrar alertas de actualización
  const triggerUpdateAlert = useCallback((message) => {
    showUpdateAlert(message || 'Nueva versión disponible');
  }, [showUpdateAlert]);

  const triggerMaintenanceAlert = useCallback((message) => {
    showMaintenanceAlert(
      message || 'Mantenimiento programado en curso'
    );
  }, [showMaintenanceAlert]);

  useEffect(() => {
    // Verificar actualizaciones al cargar (con delay para evitar duplicados)
    const initialDelay = setTimeout(() => {
      checkForUpdates();
    }, 1000);
    
    // Configurar detección de cambios en desarrollo
    const cleanup = checkForCodeChanges();
    
    // Verificar periódicamente (cada 15 minutos)
    const interval = setInterval(checkForUpdates, 15 * 60 * 1000);
    
    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
      if (cleanup) cleanup();
    };
  }, [checkForUpdates, checkForCodeChanges]);

  return {
    triggerUpdateAlert,
    triggerMaintenanceAlert,
    checkForUpdates
  };
};

export default useUpdateDetector;