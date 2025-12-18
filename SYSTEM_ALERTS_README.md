# Sistema de Alertas del Sistema

## Descripción
Sistema completo de alertas para mostrar notificaciones importantes a los usuarios, incluyendo actualizaciones, mantenimiento y mensajes del sistema.

## Componentes

### 1. SystemAlertsContext
**Ubicación:** `src/context/SystemAlertsContext.js`

Maneja el estado global de las alertas con las siguientes características:
- Múltiples tipos de alerta (info, success, warning, error, update, maintenance)
- Auto-dismiss configurable
- Stack de alertas múltiples
- Acciones específicas para alertas de actualización

### 2. SystemAlerts 
**Ubicación:** `src/components/SystemAlerts.js`

Componente visual que muestra las alertas:
- Posicionamiento fijo en la parte superior
- Iconos específicos por tipo
- Botones de acción para alertas de actualización
- Animaciones de entrada/salida
- Dismissible manualmente

### 3. useUpdateDetector
**Ubicación:** `src/hooks/useUpdateDetector.js`

Hook para detección automática de actualizaciones:
- Verificación contra endpoint del backend
- Detección de cambios en desarrollo
- Verificación periódica (cada 15 minutos)
- Triggers manuales para testing

### 4. VersionController (Backend)
**Ubicación:** `src/presentation/controllers/version.controller.ts`

API endpoint que proporciona:
- Versión actual de la aplicación
- Estado de mantenimiento
- Lista de características
- Timestamp de última actualización

## Uso

### Básico
```jsx
import { useSystemAlerts } from '../context/SystemAlertsContext';

const Component = () => {
  const { showUpdateAlert, showMaintenanceAlert } = useSystemAlerts();
  
  const handleUpdate = () => {
    showUpdateAlert('Nueva versión disponible');
  };
  
  return <button onClick={handleUpdate}>Check Update</button>;
};
```

### Configuración Avanzada
```jsx
// Alerta con duración personalizada
showUpdateAlert('Mensaje', { duration: 10000 });

// Alerta permanente (no se auto-cierra)
showMaintenanceAlert('Mantenimiento', { duration: 0 });
```

### Tipos de Alertas Disponibles
- `showInfoAlert(message, options)` - Información general
- `showSuccessAlert(message, options)` - Operaciones exitosas
- `showWarningAlert(message, options)` - Advertencias
- `showErrorAlert(message, options)` - Errores
- `showUpdateAlert(message, options)` - Actualizaciones disponibles
- `showMaintenanceAlert(message, options)` - Modo mantenimiento

## Configuración del Backend

### Variables de Entorno
```env
# Activar modo mantenimiento
MAINTENANCE_MODE=true
```

### Endpoint de Versión
```
GET /api/version

Response:
{
  "version": "1.0.0",
  "name": "app-name",
  "maintenance": false,
  "lastUpdate": "2024-01-15T10:00:00Z",
  "features": ["feature1", "feature2"]
}
```

## Integración en App.js
```jsx
import { SystemAlertsProvider } from './context/SystemAlertsContext';
import SystemAlerts from './components/SystemAlerts';
import useUpdateDetector from './hooks/useUpdateDetector';

const AppContent = () => {
  useUpdateDetector(); // Detecta actualizaciones automáticamente
  return <Routes>...</Routes>;
};

function App() {
  return (
    <SystemAlertsProvider>
      <AppContent />
      <SystemAlerts />
    </SystemAlertsProvider>
  );
}
```

## Demo
Un componente de demostración está disponible en `src/components/SystemAlertDemo.js` y se puede ver en el Dashboard para probar todos los tipos de alertas.

## Características Técnicas

### Detección Automática
- Verifica actualizaciones al cargar la app
- Polling cada 15 minutos en producción
- Detección de cambios cada 30 segundos en desarrollo

### Persistencia
- Las alertas se mantienen hasta ser dismissadas
- Estado global compartido entre componentes
- No persiste entre recargas (por diseño de seguridad)

### Responsive
- Diseño móvil optimizado
- Posicionamiento adaptativo
- Animaciones suaves

### Accesibilidad
- Roles ARIA apropiados
- Colores con contraste adecuado
- Navegación por teclado

## Casos de Uso

### Actualizaciones de Aplicación
```jsx
// Automático al detectar nueva versión
// Usuario ve: "Nueva versión 2.1.0 disponible"
// Botón: "Actualizar Ahora"
```

### Mantenimiento Programado
```jsx
showMaintenanceAlert(
  'Mantenimiento programado: 30 minutos de inactividad',
  { duration: 0 }
);
```

### Notificaciones del Sistema
```jsx
showInfoAlert('Nueva funcionalidad disponible en el perfil');
```

### Errores del Sistema
```jsx
showErrorAlert('Error temporal del servidor. Reintentando...');
```

## Próximas Mejoras
- [ ] Persistencia de preferencias de usuario
- [ ] Alertas push browser
- [ ] Integración con Service Workers
- [ ] Alertas programadas
- [ ] Analytics de visualización de alertas