import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Heart, MessageCircle, Eye, Book } from 'lucide-react';
import api from '../services/api';

const Explore = () => {
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [sortBy, setSortBy] = useState('recent'); // recent, popular, liked
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [allTags, setAllTags] = useState([]);

  useEffect(() => {
    fetchStories();
    fetchTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedTag, sortBy, page]);

  const fetchStories = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 12,
        search: searchTerm || undefined,
        tag: selectedTag || undefined,
        sortBy,
      };

      const response = await api.get('/stories/explore', { params });
      setStories(response.data.stories || response.data);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await api.get('/stories/tags');
      setAllTags(response.data);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleTagFilter = (tag) => {
    setSelectedTag(tag === selectedTag ? '' : tag);
    setPage(1);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    setPage(1);
  };

  const openBookReader = (storyId) => {
    navigate(`/read/${storyId}`);
  };

  if (loading && stories.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Explorar Cuentos</h1>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar cuentos por título o descripción..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-4 items-center">
          {/* Sort Options */}
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Ordenar:</span>
            <div className="flex gap-2">
              <button
                onClick={() => handleSortChange('recent')}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  sortBy === 'recent'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Recientes
              </button>
              <button
                onClick={() => handleSortChange('popular')}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  sortBy === 'popular'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Populares
              </button>
              <button
                onClick={() => handleSortChange('liked')}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  sortBy === 'liked'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Más Gustados
              </button>
            </div>
          </div>
        </div>

        {/* Tag Filters */}
        {allTags.length > 0 && (
          <div>
            <span className="text-sm font-medium text-gray-700 mb-2 block">Filtrar por tags:</span>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagFilter(tag)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedTag === tag
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
              {selectedTag && (
                <button
                  onClick={() => setSelectedTag('')}
                  className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-700 hover:bg-red-200"
                >
                  Limpiar filtro
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Stories Grid */}
      {stories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No se encontraron cuentos</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {stories.map((story) => (
              <div
                key={story.id}
                className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => openBookReader(story.id)}
              >
                {/* Cover Image con overlay */}
                <div className="relative h-80 bg-gray-200 overflow-hidden">
                  {story.cover_image ? (
                    <img
                      src={`http://localhost:3000${story.cover_image}`}
                      alt={story.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-400 to-primary-600">
                      <Book size={64} className="text-white opacity-50" />
                    </div>
                  )}
                  
                  {/* Overlay oscuro al hacer hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-100 group-hover:opacity-90 transition-opacity duration-300"></div>

                  {/* Autor en la parte superior izquierda */}
                  <div className="absolute top-3 left-3">
                    <p className="text-white text-xs bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full">
                      {story.user?.username || 'Anónimo'}
                    </p>
                  </div>

                  {/* Stats en la parte superior derecha */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2">
                    <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-white text-xs">
                      <Eye size={14} />
                      <span>{story.views || 0}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-white text-xs">
                      <Heart size={14} />
                      <span>{story.likes_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-white text-xs">
                      <MessageCircle size={14} />
                      <span>{story.comments_count || 0}</span>
                    </div>
                  </div>

                  {/* Título en la parte inferior */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-white font-bold text-lg mb-1 line-clamp-2 drop-shadow-lg">
                      {story.title}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="px-4 py-2 text-gray-700">
                Página {page} de {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default Explore;
