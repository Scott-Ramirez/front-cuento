import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import StoryDashboardCard from './StoryDashboardCard';

const DashboardStoriesGrid = ({ 
  stories, 
  loading, 
  onDelete, 
  onPublish 
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-200 animate-pulse rounded-xl h-96"></div>
        ))}
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen size={64} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          No tienes cuentos aún
        </h3>
        <p className="text-gray-600">
          ¡Comienza creando tu primer cuento y comparte tu creatividad con el mundo!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stories.map((story) => (
        <StoryDashboardCard
          key={story.id}
          story={story}
          onDelete={onDelete}
          onPublish={onPublish}
        />
      ))}
    </div>
  );
};

export default DashboardStoriesGrid;