import React from 'react';
import { User, Shield } from 'lucide-react';

const ProfileTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      id: 'profile',
      label: 'Información Personal',
      icon: User
    },
    {
      id: 'security',
      label: 'Seguridad',
      icon: Shield
    }
  ];

  return (
    <div className="border-b border-gray-200">
      <nav className="flex">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="inline mr-2" size={16} />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default ProfileTabs;