import React, { useState, useEffect } from 'react';
import { User, Calendar, Edit2, Save, X, Lock, Eye, EyeOff, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api, { API_URL } from '../services/api';
import { showSuccess, showError, showWarning } from '../utils/alerts';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  // Helper para obtener URL completa del avatar
  const getAvatarUrl = (avatar) => {
    if (!avatar) return '';
    // Si ya tiene http:// o https://, retornar tal cual
    if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
      return avatar;
    }
    // Si empieza con /, agregar la URL base
    if (avatar.startsWith('/')) {
      return `${API_URL}${avatar}`;
    }
    // En cualquier otro caso, asumir que es una ruta relativa
    return `${API_URL}/${avatar}`;
  };

  // Profile data
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    bio: '',
    avatar: '',
  });

  // Password data
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
      });
    }
  }, [user]);

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing, restore original data
      setProfileData({
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = async () => {
    if (!profileData.username.trim()) {
      showWarning('El nombre de usuario es requerido');
      return;
    }

    if (!profileData.email.trim()) {
      showWarning('El email es requerido');
      return;
    }

    setLoading(true);
    try {
      const response = await api.put('/auth/profile', profileData);
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      setIsEditing(false);
      showSuccess('Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error updating profile:', error);
      showError(error.response?.data?.message || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      showWarning('Por favor selecciona una imagen válida');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showWarning('La imagen no debe superar los 5MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/upload/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Construir URL completa de la imagen
      const avatarUrl = `${API_URL}${response.data.path}`;
      setProfileData({ ...profileData, avatar: avatarUrl });
      
      // Si no está en modo edición, guardar inmediatamente
      if (!isEditing) {
        const updateResponse = await api.put('/auth/profile', { 
          ...profileData, 
          avatar: avatarUrl 
        });
        setUser(updateResponse.data);
        showSuccess('Avatar actualizado correctamente');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      showError('Error al subir la imagen');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword) {
      showWarning('Ingresa tu contraseña actual');
      return;
    }

    if (!passwordData.newPassword) {
      showWarning('Ingresa la nueva contraseña');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showWarning('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showWarning('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setIsChangingPassword(false);
      showSuccess('Contraseña actualizada correctamente');
    } catch (error) {
      console.error('Error changing password:', error);
      showError(error.response?.data?.message || 'Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-purple-600 h-32 relative">
              <div className="absolute top-4 right-4">
                {!isEditing ? (
                  <button
                    onClick={handleEditToggle}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-primary-600 rounded-lg hover:bg-gray-100 transition-colors shadow-md"
                  >
                    <Edit2 size={18} />
                    <span>Editar Perfil</span>
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2 bg-white text-green-600 rounded-lg hover:bg-gray-100 transition-colors shadow-md disabled:opacity-50"
                    >
                      <Save size={18} />
                      <span>Guardar</span>
                    </button>
                    <button
                      onClick={handleEditToggle}
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 rounded-lg hover:bg-gray-100 transition-colors shadow-md disabled:opacity-50"
                    >
                      <X size={18} />
                      <span>Cancelar</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Profile Content */}
            <div className="px-8 pb-8">
              {/* Avatar */}
              <div className="relative -mt-16 mb-6">
                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
                  {profileData.avatar ? (
                    <img
                      src={getAvatarUrl(profileData.avatar)}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Error loading avatar:', e);
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                      <User size={48} className="text-white" />
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <label
                  htmlFor="avatar-upload"
                  className={`absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors shadow-lg cursor-pointer ${
                    uploadingAvatar ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {uploadingAvatar ? (
                    <div className="animate-spin">
                      <Camera size={20} />
                    </div>
                  ) : (
                    <Camera size={20} />
                  )}
                </label>
              </div>

              {/* User Info Form */}
              <div className="space-y-6">
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de Usuario
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.username}
                      onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Nombre de usuario"
                    />
                  ) : (
                    <p className="text-lg font-semibold text-gray-900">{profileData.username}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo Electrónico
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="correo@ejemplo.com"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.email}</p>
                  )}
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Biografía
                  </label>
                  {isEditing ? (
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                      placeholder="Cuéntanos sobre ti..."
                    />
                  ) : (
                    <p className="text-gray-700">
                      {profileData.bio || 'No has agregado una biografía aún.'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Change Password Card */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Lock size={24} className="text-primary-600" />
                Seguridad
              </h2>
              {!isChangingPassword && (
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Cambiar Contraseña
                </button>
              )}
            </div>

            {isChangingPassword && (
              <div className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña Actual
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 pr-10"
                      placeholder="Contraseña actual"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nueva Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 pr-10"
                      placeholder="Nueva contraseña (mínimo 6 caracteres)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Nueva Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 pr-10"
                      placeholder="Confirma la nueva contraseña"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleChangePassword}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Cambiando...' : 'Confirmar Cambio'}
                  </button>
                  <button
                    onClick={() => {
                      setIsChangingPassword(false);
                      setPasswordData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: '',
                      });
                    }}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Stats */}
        <div className="space-y-6">
          {/* Account Info */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Información de la Cuenta</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-700">
                <div className="bg-primary-100 p-2 rounded-lg">
                  <Calendar size={20} className="text-primary-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Miembro desde</p>
                  <p className="font-medium text-sm">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString('es-ES', { 
                      year: 'numeric', 
                      month: 'long',
                      day: 'numeric'
                    }) : 'Recientemente'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tips Card */}
          <div className="bg-gradient-to-br from-primary-50 to-purple-50 border border-primary-200 rounded-lg p-6">
            <h3 className="font-semibold text-primary-900 mb-3 flex items-center gap-2">
              💡 Consejos
            </h3>
            <ul className="text-sm text-primary-700 space-y-2">
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Usa una biografía atractiva para que otros usuarios te conozcan mejor</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Agrega un avatar personalizado para destacar tu perfil</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Cambia tu contraseña regularmente para mayor seguridad</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
