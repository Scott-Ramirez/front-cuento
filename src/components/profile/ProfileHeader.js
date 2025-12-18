import React from 'react';
import { Calendar } from 'lucide-react';
import ProfileAvatar from './ProfileAvatar';
import UserStats from './UserStats';

const ProfileHeader = ({ 
  profileData, 
  userStats, 
  user, 
  uploadingAvatar, 
  onAvatarChange 
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
          <ProfileAvatar
            avatar={profileData.avatar}
            uploading={uploadingAvatar}
            onAvatarChange={onAvatarChange}
          />

          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{profileData.username}</h1>
            <p className="text-gray-600 mb-2">{profileData.email}</p>
            <p className="text-sm text-gray-500 flex items-center justify-center sm:justify-start gap-1">
              <Calendar size={16} />
              Miembro desde {formatDate(user.created_at)}
            </p>
            {profileData.bio && (
              <p className="mt-3 text-gray-700 max-w-md">{profileData.bio}</p>
            )}
          </div>
        </div>

        <div className="w-full lg:w-auto">
          <UserStats stats={userStats} />
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;