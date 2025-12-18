import React from 'react';
import { useAuth } from '../context/AuthContext';
import useProfile from '../hooks/useProfile';

import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileTabs from '../components/profile/ProfileTabs';
import PersonalInfoForm from '../components/profile/PersonalInfoForm';
import SecurityForm from '../components/profile/SecurityForm';
import DeleteAccountForm from '../components/profile/DeleteAccountForm';

const Profile = () => {
  const { user, setUser } = useAuth();
  
  const {
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
  } = useProfile(user, setUser);

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <ProfileHeader
        profileData={profileData}
        userStats={userStats}
        user={user}
        uploadingAvatar={uploadingAvatar}
        onAvatarChange={handleAvatarChange}
      />

      <div className="bg-white rounded-lg shadow-lg mb-6">
        <ProfileTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className="p-4 sm:p-6">
          {activeTab === 'profile' && (
            <PersonalInfoForm
              profileData={profileData}
              setProfileData={setProfileData}
              isEditing={isEditing}
              onEditToggle={handleEditToggle}
              onSave={handleSaveProfile}
              loading={loading}
            />
          )}

          {activeTab === 'security' && (
            <SecurityForm
              passwordData={passwordData}
              setPasswordData={setPasswordData}
              showPasswords={showPasswords}
              onTogglePasswordVisibility={togglePasswordVisibility}
              onChangePassword={handleChangePassword}
              loading={passwordLoading}
            />
          )}

          {activeTab === 'delete' && (
            <DeleteAccountForm
              user={user}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
