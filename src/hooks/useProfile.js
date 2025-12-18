import { useState, useEffect } from 'react';
import api from '../services/api';
import { showSuccess, showError, showWarning } from '../utils/alerts';

const useProfile = (user, setUser) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [userStats, setUserStats] = useState({});

  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    bio: '',
    avatar: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
      });
      loadUserStats();
    }
  }, [user]);

  const loadUserStats = async () => {
    try {
      const response = await api.get('/stories/my-stories');
      const stories = response.data;
      
      const stats = {
        totalStories: stories.length,
        totalViews: stories.reduce((acc, story) => acc + (story.views_count || 0), 0),
        totalLikes: stories.reduce((acc, story) => acc + (story.likes_count || 0), 0),
        totalComments: stories.reduce((acc, story) => acc + (story.comments_count || 0), 0),
        publishedStories: stories.filter(story => story.status === 'published').length,
      };
      
      setUserStats(stats);
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
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

    setLoading(true);
    try {
      const { data } = await api.put('/auth/profile', profileData);
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      setIsEditing(false);
      showSuccess('Perfil actualizado correctamente');
    } catch (error) {
      showError(error.response?.data?.message || 'Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showWarning('Las contraseñas no coinciden');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showWarning('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    setPasswordLoading(true);
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

      showSuccess('Contraseña actualizada correctamente');
    } catch (error) {
      showError(error.response?.data?.message || 'Error al cambiar contraseña');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleAvatarChange = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      showWarning('Selecciona una imagen válida');
      return;
    }

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data } = await api.post('/upload/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const avatarPath = data.path;
      setProfileData((prev) => ({ ...prev, avatar: avatarPath }));

      if (!isEditing) {
        const res = await api.put('/auth/profile', { avatar: avatarPath });
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
      }

      showSuccess('Avatar actualizado correctamente');
    } catch {
      showError('Error al subir avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return {
    // Estados
    activeTab,
    isEditing,
    loading,
    uploadingAvatar,
    passwordLoading,
    userStats,
    profileData,
    passwordData,
    showPasswords,

    // Setters
    setActiveTab,
    setProfileData,
    setPasswordData,

    // Funciones
    handleEditToggle,
    handleSaveProfile,
    handleChangePassword,
    handleAvatarChange,
    togglePasswordVisibility,
    loadUserStats,
  };
};

export default useProfile;