import React from 'react';
import useDashboard from '../hooks/useDashboard';

import DashboardStoriesGrid from '../components/dashboard/DashboardStoriesGrid';
import Pagination from '../components/dashboard/Pagination';

const Dashboard = ({ searchTerm: externalSearchTerm, setSearchTerm: externalSetSearchTerm }) => {
  const {
    loading,
    currentPage,
    currentStories,
    totalPages,
    setSearchTerm: internalSetSearchTerm,
    handleDelete,
    handlePublish,
    paginate,
  } = useDashboard();

  // Sync external search with internal hook
  React.useEffect(() => {
    if (externalSearchTerm !== undefined && internalSetSearchTerm) {
      internalSetSearchTerm(externalSearchTerm);
    }
  }, [externalSearchTerm, internalSetSearchTerm]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
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
