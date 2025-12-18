import { useEffect, useState } from 'react';
import api from '../services/api';
import { showConfirm, showSuccess, showError } from '../utils/alerts';

const useDashboard = () => {
  const [allStories, setAllStories] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  
  const storiesPerPage = 3;

  useEffect(() => {
    fetchMyStories();
    const interval = setInterval(() => {
      fetchMyStories();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter stories based on search term
  useEffect(() => {
    const filtered = allStories.filter(story => 
      story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (story.description && story.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setStories(filtered);
    setCurrentPage(1);
  }, [searchTerm, allStories]);

  const fetchMyStories = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);

    try {
      const response = await api.get('/stories/my-stories');
      const storiesData = Array.isArray(response.data) ? response.data : [];

      setAllStories(storiesData);
      const storiesWithStats = await Promise.all(
        storiesData.map(async (story) => {
          try {
            const [likesRes, commentsRes] = await Promise.all([
              api.get(`/stories/${story.id}/likes/count`),
              api.get(`/stories/${story.id}/comments`)
            ]);

            return {
              ...story,
              likes_count: likesRes.data.count || 0,
              comments_count: Array.isArray(commentsRes.data) ? commentsRes.data.length : 0
            };
          } catch (error) {
            console.error(`Error fetching stats for story ${story.id}:`, error);
            return { ...story, likes_count: 0, comments_count: 0 };
          }
        })
      );

      setStories(storiesWithStats);
      setLastUpdate(new Date());

      if (isManualRefresh) showSuccess('Datos actualizados correctamente');
    } catch (error) {
      console.error('Error fetching stories:', error);
      setStories([]);
      if (isManualRefresh) showError('Error al cargar tus cuentos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => fetchMyStories(true);

  const handleDelete = async (id) => {
    const result = await showConfirm(
      'Esta acción no se puede deshacer. Se eliminará el cuento y todos sus capítulos, comentarios y likes.',
      '¿Estás seguro de eliminar este cuento?'
    );
    if (!result.isConfirmed) return;

    try {
      await api.delete(`/stories/${id}`);
      showSuccess('El cuento ha sido eliminado exitosamente');
      fetchMyStories();
    } catch (error) {
      console.error('Error deleting story:', error);
      showError('Error al eliminar el cuento');
    }
  };

  const handlePublish = async (id, currentStatus) => {
    try {
      await api.patch(`/stories/${id}/publish`);
      const action = currentStatus === 'published' ? 'despublicado' : 'publicado';
      showSuccess(`El cuento ha sido ${action} exitosamente`);
      fetchMyStories();
    } catch (error) {
      console.error('Error publishing/unpublishing story:', error);
      showError('Error al cambiar el estado del cuento');
    }
  };

  // Pagination logic
  const indexOfLastStory = currentPage * storiesPerPage;
  const indexOfFirstStory = indexOfLastStory - storiesPerPage;
  const currentStories = stories.slice(indexOfFirstStory, indexOfLastStory);
  const totalPages = Math.ceil(stories.length / storiesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return {
    stories,
    allStories,
    currentStories,
    loading,
    refreshing,
    lastUpdate,
    currentPage,
    totalPages,
    storiesPerPage,
    searchTerm,
    setSearchTerm,
    handleRefresh,
    handleDelete,
    handlePublish,
    paginate,
    fetchMyStories,
  };
};

export default useDashboard;