import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSystemAlerts } from '../context/SystemAlertsContext';
import api from '../services/api';
import {
  Users,
  BookOpen,
  Activity,
  Database,
  Settings,
  AlertTriangle,
  Power,
  PowerOff,
  RefreshCw,
  PieChart,
  BarChart3,
  Server,
  HardDrive,
  LogOut
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { addAlert } = useSystemAlerts();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    users: { total: 0, newThisMonth: 0 },
    stories: { total: 0, published: 0 },
    system: { uptime: '0h', version: '1.0.0', lastRestart: new Date() },
    storage: { totalSize: '0MB', totalFiles: 0 }
  });
  const [settings, setSettings] = useState([]);
  const [maintenance, setMaintenance] = useState({
    maintenanceActive: false,
    maintenanceWarning: false,
    maintenanceMessage: '',
    warningMessage: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tempMaintenanceMessage, setTempMaintenanceMessage] = useState('');
  const [tempWarningMessage, setTempWarningMessage] = useState('');
  const [releaseNotes, setReleaseNotes] = useState([]);
  const [showReleaseForm, setShowReleaseForm] = useState(false);
  const [editingRelease, setEditingRelease] = useState(null);
  const [releaseForm, setReleaseForm] = useState({
    title: '',
    content: '',
    version: '',
    type: 'minor',
    priority: 0,
    releaseDate: new Date().toISOString().split('T')[0],
    isPublished: false
  });

  const tabs = [
    { id: 'overview', name: 'Resumen', icon: PieChart },
    { id: 'maintenance', name: 'Mantenimiento', icon: Settings },
    { id: 'releases', name: 'Release Notes', icon: BarChart3 },
    { id: 'system', name: 'Sistema', icon: Server }
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsResponse, settingsResponse, maintenanceResponse, releaseNotesResponse] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/settings'), 
        api.get('/admin/maintenance'),
        api.get('/admin/release-notes')
      ]);

      setStats(statsResponse.data);
      setSettings(settingsResponse.data);
      setMaintenance(maintenanceResponse.data);
      setReleaseNotes(releaseNotesResponse.data);

      // Cargar mensajes guardados desde las configuraciones
      const warningMessageSetting = settingsResponse.data.find(setting => setting.key === 'warning_message');
      const maintenanceMessageSetting = settingsResponse.data.find(setting => setting.key === 'maintenance_message');
      
      if (warningMessageSetting) {
        setTempWarningMessage(warningMessageSetting.value);
        setMaintenance(prev => ({
          ...prev,
          warningMessage: warningMessageSetting.value
        }));
      }
      
      if (maintenanceMessageSetting) {
        setTempMaintenanceMessage(maintenanceMessageSetting.value);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const toggleMaintenance = async () => {
    try {
      const endpoint = maintenance.maintenanceActive ? '/admin/maintenance/disable' : '/admin/maintenance/enable';
      const message = maintenance.maintenanceActive ? '' : (tempMaintenanceMessage || 'Sistema en mantenimiento. Volveremos pronto.');
      
      await api.post(endpoint, { message });
      
      // Actualizar el estado local
      setMaintenance(prev => ({
        ...prev,
        maintenanceActive: !maintenance.maintenanceActive,
        maintenanceMessage: message
      }));
    } catch (error) {
      console.error('Error toggling maintenance mode:', error);
      setError('Error al cambiar el modo de mantenimiento');
    }
  };

  const enableMaintenanceWarning = async () => {
    try {
      // Usar el mensaje guardado del estado o el temporal si no hay uno guardado
      const message = maintenance.warningMessage || tempWarningMessage || 'Mantenimiento programado próximamente. Por favor, guarda tu trabajo.';
      await api.post('/admin/maintenance/warning', {
        message: message
      });
      
      // Actualizar el estado local
      setMaintenance(prev => ({
        ...prev,
        maintenanceWarning: true,
        warningMessage: message  // Usar warningMessage, no maintenanceMessage
      }));
    } catch (error) {
      console.error('Error enabling maintenance warning:', error);
      setError('Error al activar la advertencia de mantenimiento');
    }
  };

  const disableMaintenanceWarning = async () => {
    try {
      await api.post('/admin/maintenance/warning/disable');
      
      // Actualizar el estado local
      setMaintenance(prev => ({
        ...prev,
        maintenanceWarning: false
      }));
    } catch (error) {
      console.error('Error disabling maintenance warning:', error);
      setError('Error al desactivar la advertencia de mantenimiento');
    }
  };

  const toggleMaintenanceWarning = () => {
    if (maintenance.maintenanceWarning) {
      disableMaintenanceWarning();
    } else {
      enableMaintenanceWarning();
    }
  };

  const saveMaintenanceMessage = async () => {
    try {
      await api.post('/admin/settings', {
        key: 'maintenance_message',
        value: tempMaintenanceMessage,
        type: 'string',
        description: 'Mensaje mostrado durante el mantenimiento',
        category: 'maintenance'
      });
      
      setMaintenance(prev => ({
        ...prev,
        maintenanceMessage: tempMaintenanceMessage
      }));
      
      addAlert({
        type: 'success',
        title: 'Éxito',
        message: 'Mensaje de mantenimiento actualizado correctamente',
        duration: 3000
      });
      
    } catch (error) {
      console.error('Error saving maintenance message:', error);
      setError('Error al guardar el mensaje');
      addAlert({
        type: 'error',
        title: 'Error',
        message: 'Error al guardar el mensaje de mantenimiento',
        duration: 5000
      });
    }
  };

  const saveWarningMessage = async () => {
    try {
      await api.post('/admin/settings', {
        key: 'warning_message',
        value: tempWarningMessage,
        type: 'string',
        description: 'Mensaje mostrado en la advertencia de mantenimiento',
        category: 'maintenance'
      });
      
      setMaintenance(prev => ({
        ...prev,
        warningMessage: tempWarningMessage
      }));
      
      addAlert({
        type: 'success',
        title: 'Éxito',
        message: 'Mensaje de advertencia actualizado correctamente',
        duration: 3000
      });
      
    } catch (error) {
      console.error('Error saving warning message:', error);
      setError('Error al guardar el mensaje de advertencia');
      addAlert({
        type: 'error',
        title: 'Error',
        message: 'Error al guardar el mensaje de advertencia',
        duration: 5000
      });
    }
  };

  // Release Notes Functions
  const fetchReleaseNotes = async () => {
    try {
      const response = await api.get('/admin/release-notes');
      setReleaseNotes(response.data);
    } catch (error) {
      addAlert('Error al cargar las release notes', 'error');
    }
  };

  const handleCreateRelease = async () => {
    try {
      await api.post('/admin/release-notes', releaseForm);
      setShowReleaseForm(false);
      setReleaseForm({
        title: '',
        content: '',
        version: '',
        type: 'minor',
        priority: 0,
        releaseDate: new Date().toISOString().split('T')[0],
        isPublished: false
      });
      await fetchReleaseNotes();
      addAlert('Release note creada exitosamente', 'success');
    } catch (error) {
      addAlert('Error al crear la release note', 'error');
    }
  };

  const handleEditRelease = (release) => {
    setEditingRelease(release);
    setReleaseForm({
      title: release.title,
      content: release.content,
      version: release.version,
      type: release.type,
      priority: release.priority,
      releaseDate: release.releaseDate ? release.releaseDate.split('T')[0] : new Date().toISOString().split('T')[0],
      isPublished: release.isPublished
    });
    setShowReleaseForm(true);
  };

  const handleUpdateRelease = async () => {
    try {
      await api.patch(`/admin/release-notes/${editingRelease.id}`, releaseForm);
      setShowReleaseForm(false);
      setEditingRelease(null);
      setReleaseForm({
        title: '',
        content: '',
        version: '',
        type: 'minor',
        priority: 0,
        releaseDate: new Date().toISOString().split('T')[0],
        isPublished: false
      });
      await fetchReleaseNotes();
      addAlert('Release note actualizada exitosamente', 'success');
    } catch (error) {
      addAlert('Error al actualizar la release note', 'error');
    }
  };

  const handleTogglePublished = async (releaseId) => {
    try {
      await api.patch(`/admin/release-notes/${releaseId}/toggle-published`);
      await fetchReleaseNotes();
      addAlert('Estado de publicación actualizado', 'success');
    } catch (error) {
      addAlert('Error al cambiar el estado de publicación', 'error');
    }
  };

  const handleDeleteRelease = async (releaseId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta release note?')) {
      try {
        await api.delete(`/admin/release-notes/${releaseId}`);
        await fetchReleaseNotes();
        addAlert('Release note eliminada exitosamente', 'success');
      } catch (error) {
        addAlert('Error al eliminar la release note', 'error');
      }
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin text-indigo-600" />
          <span className="text-gray-600">Cargando panel de administración...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="md:flex md:items-center md:justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-900 rounded-full">
                    <Settings className="h-4 w-4 text-white" />
                    <span className="text-xs font-medium text-white">ADMINISTRADOR</span>
                  </div>
                </div>
                <h1 className="mt-2 text-2xl font-bold leading-7 text-white sm:text-3xl sm:truncate">
                  Panel de Administración
                </h1>
                <p className="mt-1 text-sm text-blue-100">
                  Bienvenido, {user?.username}. Gestiona y monitorea tu sistema desde aquí.
                </p>
              </div>
              <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
                <button
                  onClick={fetchDashboardData}
                  className="inline-flex items-center px-4 py-2 border border-blue-500 rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-500"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualizar
                </button>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-4 py-2 border border-red-500 rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-500"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={
                    activeTab === tab.id
                      ? 'border-white text-white whitespace-nowrap py-2 px-1 border-b-2 font-semibold text-sm flex items-center space-x-2 bg-blue-600 px-3 rounded-t-lg'
                      : 'border-transparent text-white hover:text-gray-200 hover:border-white hover:bg-blue-600 whitespace-nowrap py-2 px-3 border-b-2 font-medium text-sm flex items-center space-x-2 rounded-t-lg transition-all duration-200'
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Usuarios</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.users.total}</p>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  {stats.users.newThisMonth} nuevos este mes
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <BookOpen className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Historias</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.stories.total}</p>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  {stats.stories.published} publicadas
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Activity className="h-8 w-8 text-purple-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Uptime</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.system.uptime}</p>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Versión {stats.system.version}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Database className="h-8 w-8 text-indigo-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Almacenamiento</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.storage.totalSize}</p>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  {stats.storage.totalFiles} archivos
                </p>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Estado del Sistema</h3>
              </div>
              <div className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Estado de Mantenimiento</p>
                    <p className="text-lg text-gray-900">
                      {maintenance.maintenanceActive ? '🔴 Activo' : '🟢 Inactivo'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Último Reinicio</p>
                    <p className="text-lg text-gray-900">
                      {new Date(stats.system.lastRestart).toLocaleString()}
                    </p>
                  </div>
                </div>
                {maintenance.maintenanceMessage && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-500">Mensaje de Mantenimiento</p>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded">
                      {maintenance.maintenanceMessage}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Control de Mantenimiento</h3>
              </div>
              <div className="px-6 py-6 space-y-6">
                
                {/* Controls with Toggle Switches */}
                <div className="space-y-6">
                  {/* Maintenance Warning Control */}
                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-900">Advertencia de Mantenimiento</h4>
                      <p className="text-sm text-gray-600 mt-1">Muestra una advertencia a los usuarios sobre mantenimiento próximo</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`text-sm font-medium ${
                        maintenance.maintenanceWarning ? 'text-yellow-700' : 'text-gray-500'
                      }`}>
                        {maintenance.maintenanceWarning ? 'Activa' : 'Inactiva'}
                      </span>
                      <button
                        onClick={toggleMaintenanceWarning}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 ${
                          maintenance.maintenanceWarning ? 'bg-yellow-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            maintenance.maintenanceWarning ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Maintenance Mode Control */}
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-900">Modo de Mantenimiento</h4>
                      <p className="text-sm text-gray-600 mt-1">Activa el modo de mantenimiento del sistema</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`text-sm font-medium ${
                        maintenance.maintenanceActive ? 'text-red-700' : 'text-gray-500'
                      }`}>
                        {maintenance.maintenanceActive ? 'Activo' : 'Inactivo'}
                      </span>
                      <button
                        onClick={toggleMaintenance}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                          maintenance.maintenanceActive ? 'bg-red-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            maintenance.maintenanceActive ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Message Configuration */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-gray-900 mb-4">Configurar Mensajes</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mensaje de Advertencia
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          placeholder="Mantenimiento programado próximamente. Por favor, guarda tu trabajo."
                          value={tempWarningMessage}
                          onChange={(e) => setTempWarningMessage(e.target.value)}
                        />
                        <button
                          onClick={saveWarningMessage}
                          className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                        >
                          Actualizar
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mensaje de Mantenimiento
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                          placeholder="Sistema en mantenimiento. Volveremos pronto."
                          value={tempMaintenanceMessage}
                          onChange={(e) => setTempMaintenanceMessage(e.target.value)}
                        />
                        <button
                          onClick={saveMaintenanceMessage}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                          Actualizar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Current Status Display */}
                {(maintenance.maintenanceWarning || maintenance.maintenanceActive) && (
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <h4 className="font-medium text-gray-900 mb-2">Vista Previa del Mensaje</h4>
                    {maintenance.maintenanceWarning && (
                      <div className="mb-2 p-3 bg-yellow-100 border border-yellow-400 rounded">
                        <div className="flex">
                          <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                          <span className="text-yellow-800">{maintenance.warningMessage || tempWarningMessage || 'Mantenimiento programado próximamente.'}</span>
                        </div>
                      </div>
                    )}
                    {maintenance.maintenanceActive && (
                      <div className="p-3 bg-red-100 border border-red-400 rounded">
                        <div className="flex">
                          <PowerOff className="h-5 w-5 text-red-600 mr-2" />
                          <span className="text-red-800">{maintenance.maintenanceMessage || tempMaintenanceMessage || 'Sistema en mantenimiento. Volveremos pronto.'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'releases' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Gestión de Release Notes</h3>
                <button
                  onClick={() => setShowReleaseForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Nueva Release Note
                </button>
              </div>
              
              {showReleaseForm && (
                <div className="px-6 py-6 border-b border-gray-200 bg-gray-50">
                  <h4 className="font-medium text-gray-900 mb-4">
                    {editingRelease ? 'Editar Release Note' : 'Nueva Release Note'}
                  </h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                        <input
                          type="text"
                          value={releaseForm.title}
                          onChange={(e) => setReleaseForm({...releaseForm, title: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Título de la release note"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Versión</label>
                        <input
                          type="text"
                          value={releaseForm.version}
                          onChange={(e) => setReleaseForm({...releaseForm, version: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="v1.0.0"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                        <select
                          value={releaseForm.type}
                          onChange={(e) => setReleaseForm({...releaseForm, type: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="minor">Minor</option>
                          <option value="major">Major</option>
                          <option value="patch">Patch</option>
                          <option value="security">Security</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Prioridad</label>
                        <input
                          type="number"
                          value={releaseForm.priority}
                          onChange={(e) => setReleaseForm({...releaseForm, priority: parseInt(e.target.value)})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de lanzamiento</label>
                        <input
                          type="date"
                          value={releaseForm.releaseDate}
                          onChange={(e) => setReleaseForm({...releaseForm, releaseDate: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Contenido</label>
                      <textarea
                        value={releaseForm.content}
                        onChange={(e) => setReleaseForm({...releaseForm, content: e.target.value})}
                        rows={6}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Describe los cambios, nuevas características, mejoras..."
                      />
                    </div>
                    
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={releaseForm.isPublished}
                          onChange={(e) => setReleaseForm({...releaseForm, isPublished: e.target.checked})}
                          className="mr-2"
                        />
                        <span className="text-sm font-medium text-gray-700">Publicar inmediatamente</span>
                      </label>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={editingRelease ? handleUpdateRelease : handleCreateRelease}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                      >
                        {editingRelease ? 'Actualizar' : 'Crear'}
                      </button>
                      <button
                        onClick={() => {
                          setShowReleaseForm(false);
                          setEditingRelease(null);
                          setReleaseForm({
                            title: '',
                            content: '',
                            version: '',
                            type: 'minor',
                            priority: 0,
                            releaseDate: new Date().toISOString().split('T')[0],
                            isPublished: false
                          });
                        }}
                        className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="px-6 py-6">
                {releaseNotes.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No hay release notes creadas</p>
                ) : (
                  <div className="space-y-4">
                    {releaseNotes.map((release) => (
                      <div key={release.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-medium text-gray-900">{release.title}</h4>
                              <span className="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded">
                                {release.version}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                release.type === 'major' ? 'bg-red-100 text-red-800' :
                                release.type === 'security' ? 'bg-orange-100 text-orange-800' :
                                release.type === 'minor' ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {release.type}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                release.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {release.isPublished ? 'Publicada' : 'Borrador'}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-2">{release.content}</p>
                            <p className="text-xs text-gray-500">
                              Creada: {new Date(release.createdAt).toLocaleDateString('es-ES')} | 
                              Prioridad: {release.priority}
                            </p>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => handleEditRelease(release)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleTogglePublished(release.id)}
                              className="text-green-600 hover:text-green-800 text-sm"
                            >
                              {release.isPublished ? 'Ocultar' : 'Publicar'}
                            </button>
                            <button
                              onClick={() => handleDeleteRelease(release.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Configuración del Sistema</h3>
              </div>
              <div className="px-6 py-6">
                <div className="space-y-4">
                  {settings.map((setting) => (
                    <div key={setting.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                      <div>
                        <p className="font-medium text-gray-900">{setting.key}</p>
                        <p className="text-sm text-gray-500">{setting.description}</p>
                        <span className={
                          setting.category === 'maintenance'
                            ? 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800'
                            : setting.category === 'system'
                            ? 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'
                            : 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800'
                        }>
                          {setting.category}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          {setting.value}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{setting.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;