import { useEffect, useCallback, useRef } from 'react';
import { useSystemAlerts } from '../context/SystemAlertsContext';
import { useAuth } from '../context/AuthContext';

const useUpdateDetector = () => {
  const { showMaintenanceAlert, showInfoAlert } = useSystemAlerts();
  const { user } = useAuth(); // Verificar si el usuario está logueado
  const isCheckingRef = useRef(false);

  // Verificar si ya se vio esta release note
  const hasSeenReleaseNote = useCallback((releaseId) => {
    if (!releaseId) return false;
    const seenReleases = JSON.parse(localStorage.getItem('seenReleaseNotes') || '[]');
    return seenReleases.includes(releaseId);
  }, []);

  // Marcar release note como vista
  const markReleaseNoteSeen = useCallback((releaseId) => {
    if (!releaseId) return;
    const seenReleases = JSON.parse(localStorage.getItem('seenReleaseNotes') || '[]');
    if (!seenReleases.includes(releaseId)) {
      seenReleases.push(releaseId);
      localStorage.setItem('seenReleaseNotes', JSON.stringify(seenReleases));
    }
  }, []);

  // Verificar estado de mantenimiento y release notes
  const checkForUpdates = useCallback(async () => {
    if (isCheckingRef.current) return; // Prevenir múltiples verificaciones simultáneas
    
    // Solo verificar si el usuario está logueado
    if (!user) return;
    
    // No mostrar alertas de mantenimiento si el usuario es admin
    if (user.role === 'admin') return;
    
    isCheckingRef.current = true;
    try {
      // Usar variable de entorno para la URL del API
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/version`);
      if (response.ok) {
        const { maintenanceWarning, maintenanceActive, maintenanceMessage, releaseNotes, releaseId, releaseTitle } = await response.json();
        
        // No mostrar alertas si está en mantenimiento activo
        if (maintenanceActive) {
          return;
        }
        
        if (maintenanceWarning) {
          showMaintenanceAlert(
            maintenanceMessage || 'El sistema estará en mantenimiento próximamente. Guarda tu trabajo.',
            { duration: 0 }
          );
        }

        // Mostrar release notes solo si están disponibles y no se han visto antes
        if (releaseNotes && releaseNotes.trim() && releaseId && !hasSeenReleaseNote(releaseId)) {
          // Usar el título personalizado de la base de datos o uno por defecto
          const alertTitle = releaseTitle || '✨ ¡Nuevas mejoras disponibles!';
          showInfoAlert(
            releaseNotes,
            { duration: 0, title: alertTitle, isModal: true }
          );
          // Marcar como vista después de mostrarla
          markReleaseNoteSeen(releaseId);
        }
      }
    } catch (error) {
      console.warn('No se pudo verificar actualizaciones:', error);
    } finally {
      isCheckingRef.current = false;
    }
  }, [showMaintenanceAlert, showInfoAlert, user, hasSeenReleaseNote, markReleaseNoteSeen]);

  // Manual trigger para mostrar alertas
  const triggerMaintenanceAlert = useCallback((message) => {
    showMaintenanceAlert(
      message || 'Mantenimiento programado en curso'
    );
  }, [showMaintenanceAlert]);

  const triggerReleaseNotesAlert = useCallback((message) => {
    showInfoAlert(
      message,
      { duration: 0, title: '✨ ¡Nuevas mejoras disponibles!' }
    );
  }, [showInfoAlert]);

  useEffect(() => {
    // Verificar actualizaciones al cargar (con delay para evitar duplicados)
    const initialDelay = setTimeout(() => {
      checkForUpdates();
    }, 1000);
    
    // Verificar periódicamente (cada 30 segundos para mantenimiento)
    const interval = setInterval(checkForUpdates, 30000);
    
    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, [checkForUpdates]);

  return {
    checkForUpdates,
    triggerMaintenanceAlert,
    triggerReleaseNotesAlert
  };
};

export default useUpdateDetector;