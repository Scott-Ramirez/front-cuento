import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const AdminProfile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Estado del perfil
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    bio: '',
    avatar: ''
  });

  // Estado del cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Estado de información de seguridad
  const [securityInfo, setSecurityInfo] = useState(null);

  useEffect(() => {
    loadAdminProfile();
    loadSecurityInfo();
  }, []);

  const loadAdminProfile = async () => {
    try {
      const response = await api.get('/admin/profile');
      setProfile({
        username: response.data.username || '',
        email: response.data.email || '',
        bio: response.data.bio || '',
        avatar: response.data.avatar || ''
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al cargar el perfil' });
    }
  };

  const loadSecurityInfo = async () => {
    try {
      const response = await api.get('/admin/profile/security');
      setSecurityInfo(response.data);
    } catch (error) {
      console.error('Error loading security info:', error);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await api.put('/admin/profile', profile);
      updateUser(response.data);
      setMessage({ type: 'success', text: 'Perfil actualizado exitosamente' });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error al actualizar el perfil' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas nuevas no coinciden' });
      setLoading(false);
      return;
    }

    try {
      await api.post('/admin/profile/change-password', passwordData);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setMessage({ type: 'success', text: 'Contraseña cambiada exitosamente' });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error al cambiar la contraseña' 
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Configuración de Administrador
        </h1>
        <p className="text-gray-600">Gestiona tu perfil y configuraciones de seguridad</p>
      </div>

      {/* Mensaje de estado */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-700 border border-green-300'
            : 'bg-red-100 text-red-700 border border-red-300'
        }`}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'profile', name: 'Perfil', icon: '👤' },
            { id: 'password', name: 'Contraseña', icon: '🔐' },
            { id: 'security', name: 'Seguridad', icon: '🛡️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido de los tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Tab: Perfil */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Información del Perfil
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de usuario
                </label>
                <input
                  type="text"
                  value={profile.username}
                  onChange={(e) => setProfile({...profile, username: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Biografía
              </label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({...profile, bio: e.target.value})}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Cuéntanos sobre ti..."
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Actualizando...
                  </>
                ) : (
                  <>
                    💾 Guardar Cambios
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Tab: Contraseña */}
        {activeTab === 'password' && (
          <form onSubmit={handlePasswordChange} className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Cambiar Contraseña
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña actual
              </label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nueva contraseña
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar nueva contraseña
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                Requisitos de contraseña:
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Mínimo 6 caracteres</li>
                <li>• Se recomienda usar mayúsculas, minúsculas, números y símbolos</li>
                <li>• Evita usar información personal</li>
              </ul>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Cambiando...
                  </>
                ) : (
                  <>
                    🔐 Cambiar Contraseña
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Tab: Seguridad */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Información de Seguridad
            </h3>

            {securityInfo && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Información de la Cuenta</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Usuario ID:</span>
                      <span className="text-gray-900">#{securityInfo.userId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rol:</span>
                      <span className="text-blue-600 font-medium">{securityInfo.role}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cuenta creada:</span>
                      <span className="text-gray-900">{formatDate(securityInfo.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Última actualización:</span>
                      <span className="text-gray-900">{formatDate(securityInfo.updatedAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Configuraciones de Seguridad</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Autenticación de dos factores</span>
                      <span className="text-sm text-orange-600">🚧 Próximamente</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Notificaciones de seguridad</span>
                      <span className="text-sm text-green-600">✅ Activo</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Sesión segura</span>
                      <span className="text-sm text-green-600">✅ Activa</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-yellow-900 mb-2">
                📋 Recomendaciones de Seguridad:
              </h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Cambia tu contraseña regularmente (cada 3-6 meses)</li>
                <li>• No compartas tus credenciales de administrador</li>
                <li>• Mantén actualizada la información de tu perfil</li>
                <li>• Revisa periódicamente la actividad de tu cuenta</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProfile;