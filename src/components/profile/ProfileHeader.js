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
    <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-6">
          <ProfileAvatar
            avatar={profileData.avatar}
            uploading={uploadingAvatar}
            onAvatarChange={onAvatarChange}
          />

          <div>
            <h1 className="text-3xl font-bold text-gray-900">{profileData.username}</h1>
            <p className="text-gray-600 mb-2">{profileData.email}</p>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Calendar size={16} />
              Miembro desde {formatDate(user.created_at)}
            </p>
            {profileData.bio && (
              <p className="mt-3 text-gray-700 max-w-md">{profileData.bio}</p>
            )}
          </div>
        </div>

        <UserStats stats={userStats} />
      </div>
    </div>
  );
};

export default ProfileHeader;