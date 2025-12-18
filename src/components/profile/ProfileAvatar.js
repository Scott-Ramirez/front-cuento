import React from 'react';
import { User, Camera } from 'lucide-react';
import { getMediaUrl } from '../../utils/media';

const ProfileAvatar = ({ avatar, uploading, onAvatarChange }) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onAvatarChange(file);
    }
  };

  return (
    <div className="relative">
      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
        {avatar ? (
          <img
            src={getMediaUrl(avatar)}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-primary-500 flex items-center justify-center">
            <User size={32} className="text-white" />
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
          </div>
        )}
      </div>
      
      <label className="absolute bottom-0 right-0 bg-primary-600 hover:bg-primary-700 p-2 rounded-full cursor-pointer transition-colors">
        <Camera className="text-white" size={14} />
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />
      </label>
    </div>
  );
};

export default ProfileAvatar;