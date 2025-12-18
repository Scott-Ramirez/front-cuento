import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Heart,
  MessageCircle,
  Eye,
  Book,
} from 'lucide-react';
import api from '../services/api';
import { getMediaUrl } from '../utils/media';

const Explore = () => {
  const navigate = useNavigate();

  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [page, setPage] = useState(1);
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

      const { data } = await api.get('/stories/explore', { params });

      setStories(data.stories || data);
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const { data } = await api.get('/stories/tags');
      setAllTags(data);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const openBookReader = (id) => {
    navigate(`/read/${id}`);
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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Explorar Cuentos
      </h1>

      {/* Search */}
      <div className="relative mb-6">
        <Search
          size={20}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Buscar cuentos..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Sort */}
      <div className="flex items-center gap-2 mb-6">
        <Filter size={18} />
        {['recent', 'popular', 'liked'].map((type) => (
          <button
            key={type}
            onClick={() => {
              setSortBy(type);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg text-sm ${sortBy === type
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
              }`}
          >
            {type === 'recent'
              ? 'Recientes'
              : type === 'popular'
                ? 'Populares'
                : 'Más Gustados'}
          </button>
        ))}
      </div>

      {/* Tags */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                setSelectedTag(tag === selectedTag ? '' : tag);
                setPage(1);
              }}
              className={`px-3 py-1 rounded-full text-sm ${selectedTag === tag
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
                }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {stories.length === 0 ? (
        <p className="text-center text-gray-500">
          No se encontraron cuentos
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {stories.map((story) => (
            <div
              key={story.id}
              onClick={() => openBookReader(story.id)}
              className="bg-white rounded-lg shadow hover:shadow-xl cursor-pointer overflow-hidden"
            >
              <div className="relative h-80 bg-gray-200">
                {story.cover_image ? (
                  <img
                    src={getMediaUrl(story.cover_image)}
                    alt={story.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-400 to-primary-600">
                    <Book size={56} className="text-white opacity-60" />
                  </div>
                )}

                <div className="absolute top-3 left-3 text-white text-xs bg-black/60 px-3 py-1 rounded-full">
                  {story.user?.username || 'Anónimo'}
                </div>

                <div className="absolute top-3 right-3 flex flex-col gap-1 text-white text-xs">
                  <span className="flex items-center gap-1 bg-black/60 px-2 py-1 rounded">
                    <Eye size={14} /> {story.views || 0}
                  </span>
                  <span className="flex items-center gap-1 bg-black/60 px-2 py-1 rounded">
                    <Heart size={14} /> {story.likes_count || 0}
                  </span>
                  <span className="flex items-center gap-1 bg-black/60 px-2 py-1 rounded">
                    <MessageCircle size={14} /> {story.comments_count || 0}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-white font-bold text-lg line-clamp-2">
                    {story.title}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Explore;
