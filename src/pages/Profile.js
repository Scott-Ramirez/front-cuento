import React, { useState, useEffect } from 'react';
import {
  User,
  Calendar,
  Edit2,
  Save,
  X,
  Lock,
  Eye,
  EyeOff,
  Camera,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { getMediaUrl } from '../utils/media';
import { showSuccess, showError, showWarning } from '../utils/alerts';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

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
      showSuccess('Perfil actualizado');
    } catch (error) {
      showError(error.response?.data?.message || 'Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
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

      // ⬅️ SOLO PATH
      const avatarPath = data.path;

      setProfileData((prev) => ({ ...prev, avatar: avatarPath }));

      if (!isEditing) {
        const res = await api.put('/auth/profile', { avatar: avatarPath });
        setUser(res.data);
      }

      showSuccess('Avatar actualizado');
    } catch {
      showError('Error al subir avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow p-8">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden border">
              {profileData.avatar ? (
                <img
                  src={getMediaUrl(profileData.avatar)}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary-500 flex items-center justify-center">
                  <User size={48} className="text-white" />
                </div>
              )}
            </div>

            <label className="absolute bottom-0 right-0 bg-primary-600 p-2 rounded-full cursor-pointer">
              <Camera className="text-white" size={18} />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>

          <div>
            <h2 className="text-2xl font-bold">{profileData.username}</h2>
            <p className="text-gray-600">{profileData.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
