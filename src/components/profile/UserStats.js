import React from 'react';

const UserStats = ({ stats }) => {
  const statsData = [
    {
      value: stats.totalStories || 0,
      label: 'Cuentos',
      color: 'text-primary-600'
    },
    {
      value: stats.totalViews || 0,
      label: 'Vistas',
      color: 'text-green-600'
    },
    {
      value: stats.totalLikes || 0,
      label: 'Likes',
      color: 'text-red-600'
    },
    {
      value: stats.totalComments || 0,
      label: 'Comentarios',
      color: 'text-blue-600'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-2 gap-3 sm:gap-4 text-center">
      {statsData.map((stat, index) => (
        <div key={index} className="bg-gray-50 rounded-lg p-2 sm:p-3">
          <div className={`text-lg sm:text-2xl font-bold ${stat.color}`}>
            {stat.value}
          </div>
          <div className="text-xs sm:text-sm text-gray-600">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserStats;