import { useState, useEffect } from 'react';

const useMaintenanceCheck = () => {
  const [isMaintenanceActive, setIsMaintenanceActive] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkMaintenanceStatus = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/version`);
      
      if (response.ok) {
        const { maintenanceActive } = await response.json();
        setIsMaintenanceActive(maintenanceActive || false);
      }
    } catch (error) {
      console.warn('No se pudo verificar estado de mantenimiento:', error);
      // En caso de error, asumir que no hay mantenimiento para no bloquear la app
      setIsMaintenanceActive(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Verificar estado inicial
    checkMaintenanceStatus();

    // Verificar cada 30 segundos durante mantenimiento
    const interval = setInterval(checkMaintenanceStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  return { isMaintenanceActive, loading, checkMaintenanceStatus };
};

export default useMaintenanceCheck;