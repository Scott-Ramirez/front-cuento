import React from 'react';
import { Search } from 'lucide-react';
import useDashboard from '../hooks/useDashboard';

import DashboardStoriesGrid from '../components/dashboard/DashboardStoriesGrid';
import Pagination from '../components/dashboard/Pagination';

const Dashboard = () => {
  const {
    stories,
    loading,
    currentPage,
    currentStories,
    totalPages,
    searchTerm,
    setSearchTerm,
    handleDelete,
    handlePublish,
    paginate,
  } = useDashboard();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Buscador */}
      <div className="max-w-md mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por título o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
          />
        </div>
        {searchTerm && (
          <p className="mt-2 text-sm text-gray-600 text-center">
            {stories.length} resultado{stories.length !== 1 ? 's' : ''} encontrado{stories.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      <DashboardStoriesGrid
        stories={currentStories}
        loading={loading}
        onDelete={handleDelete}
        onPublish={handlePublish}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={paginate}
      />
    </div>
  );
};

export default Dashboard;
