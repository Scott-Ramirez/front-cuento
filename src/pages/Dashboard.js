import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Heart, MessageCircle, Trash2, BookOpen, RefreshCw } from 'lucide-react';
import api from '../services/api';
import { getMediaUrl } from '../utils/media';
import { useAuth } from '../context/AuthContext';
import { showConfirm, showSuccess, showError } from '../utils/alerts';

const Dashboard = () => {
  const { user } = useAuth();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const storiesPerPage = 4; // 4 cuentos por página (1 fila x 4 columnas)

  useEffect(() => {
    fetchMyStories();
    const interval = setInterval(() => {
      fetchMyStories();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchMyStories = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);

    try {
      const response = await api.get('/stories/my-stories');

      const storiesWithStats = await Promise.all(
        response.data.map(async (story) => {
          try {
            const [likesRes, commentsRes] = await Promise.all([
              api.get(`/stories/${story.id}/likes/count`),
              api.get(`/stories/${story.id}/comments`)
            ]);

            return {
              ...story,
              likes_count: likesRes.data.count || 0,
              comments_count: commentsRes.data.length || 0
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

  const indexOfLastStory = currentPage * storiesPerPage;
  const indexOfFirstStory = indexOfLastStory - storiesPerPage;
  const currentStories = stories.slice(indexOfFirstStory, indexOfLastStory);
  const totalPages = Math.ceil(stories.length / storiesPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Cuentos</h1>
          <p className="text-gray-600">Bienvenido, {user?.username}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            <span>Actualizar</span>
          </button>
          {lastUpdate && (
            <span className="text-xs text-gray-500">
              Última actualización: {lastUpdate.toLocaleTimeString('es-ES')}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Historias */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <BookOpen size={32} className="opacity-80" />
              <div className="text-right">
                <p className="text-3xl font-bold">{stories.length}</p>
                <p className="text-sm opacity-80">Historias</p>
              </div>
            </div>
            <div className="h-1 bg-white bg-opacity-30 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>
        </div>

        {/* Vistas Totales */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <Eye size={32} className="opacity-80" />
              <div className="text-right">
                <p className="text-3xl font-bold">
                  {stories.reduce((acc, s) => acc + (s.views_count || 0), 0)}
                </p>
                <p className="text-sm opacity-80">Vistas</p>
              </div>
            </div>
            <div className="h-1 bg-white bg-opacity-30 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>
        </div>

        {/* Likes Recibidos */}
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <Heart size={32} className="opacity-80" />
              <div className="text-right">
                <p className="text-3xl font-bold">
                  {stories.reduce((acc, s) => acc + (s.likes_count || 0), 0)}
                </p>
                <p className="text-sm opacity-80">Likes</p>
              </div>
            </div>
            <div className="h-1 bg-white bg-opacity-30 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>

        {/* Comentarios */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <MessageCircle size={32} className="opacity-80" />
              <div className="text-right">
                <p className="text-3xl font-bold">
                  {stories.reduce((acc, s) => acc + (s.comments_count || 0), 0)}
                </p>
                <p className="text-sm opacity-80">Comentarios</p>
              </div>
            </div>
            <div className="h-1 bg-white bg-opacity-30 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Mis Publicaciones</h2>
        <span className="text-gray-600">{stories.length} {stories.length === 1 ? 'cuento' : 'cuentos'}</span>
      </div>

      {stories.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <BookOpen className="mx-auto mb-4 text-gray-400" size={64} />
          <p className="text-gray-500 text-lg mb-4">No has creado ningún cuento todavía</p>
          <Link
            to="/create"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Crea tu primer cuento
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {currentStories.map((story) => (
              <div key={story.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                <div className="h-48 bg-gradient-to-r from-primary-400 to-primary-600 flex items-center justify-center relative">
                  {story.cover_image ? (
                    <img
                      src={getMediaUrl(story.cover_image)}
                      alt={story.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-6xl">📖</span>
                  )}
                  <div className={`absolute top-2 right-2 text-white text-xs px-2 py-1 rounded-full font-semibold ${story.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'
                    }`}>
                    {story.status === 'published' ? 'Publicado' : 'Borrador'}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 min-h-[3.5rem]">
                    {story.title}
                  </h3>

                  <div className="flex items-center justify-around text-sm text-gray-600 mb-4 py-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-1">
                      <Eye size={16} className="text-blue-500" />
                      <span>{story.views_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart size={16} className="text-red-500" />
                      <span>{story.likes_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle size={16} className="text-green-500" />
                      <span>{story.comments_count || 0}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
                    <span className="text-sm font-medium text-gray-700">
                      {story.status === 'published' ? 'Publicado' : 'Borrador'}
                    </span>
                    <button
                      onClick={() => handlePublish(story.id, story.status)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${story.status === 'published' ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      title={story.status === 'published' ? 'Despublicar' : 'Publicar'}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${story.status === 'published' ? 'translate-x-6' : 'translate-x-1'
                          }`}
                      />
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      to={`/stories/${story.id}`}
                      className="flex-1 text-center px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                    >
                      Ver
                    </Link>
                    <button
                      onClick={() => handleDelete(story.id)}
                      className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>

              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => paginate(index + 1)}
                  className={`px-4 py-2 rounded-lg ${currentPage === index + 1
                      ? 'bg-primary-600 text-white'
                      : 'bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  {index + 1}
                </button>
              ))}

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
